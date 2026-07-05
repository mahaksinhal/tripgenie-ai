import axios from "axios"

// Base API instance configured with context prefix
export const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tripgenie-access-token")
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Auto-refresh tokens on 401 Unauthorized
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token)
    } else {
      prom.reject(error)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const isUserNotFoundError = error.response?.status === 404 && error.response?.data?.detail === "User not found";
    if ((error.response?.status === 401 || isUserNotFoundError) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem("tripgenie-refresh-token")
      if (!refreshToken) {
        isRefreshing = false
        // Redirect to login if no refresh token exists
        window.location.href = "/login"
        return Promise.reject(error)
      }

      try {
        // Send refresh token request (bypass api interceptors to avoid loops)
        const response = await axios.post("/api/v1/auth/refresh", {
          refresh_token: refreshToken,
        })

        const { access_token, refresh_token: newRefreshToken } = response.data

        localStorage.setItem("tripgenie-access-token", access_token)
        localStorage.setItem("tripgenie-refresh-token", newRefreshToken)

        api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`
        originalRequest.headers.Authorization = `Bearer ${access_token}`

        processQueue(null, access_token)
        isRefreshing = false

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        // Clear auth and redirect on validation fail
        localStorage.removeItem("tripgenie-access-token")
        localStorage.removeItem("tripgenie-refresh-token")
        localStorage.removeItem("tripgenie-user")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
