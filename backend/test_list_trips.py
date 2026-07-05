import requests

def test():
    login_data = {"username": "test@example.com", "password": "password123"}
    try:
        res = requests.post("http://localhost:8000/api/v1/auth/login/access-token", data=login_data)
        if res.status_code == 200:
            token = res.json()["access_token"]
            print("Logged in successfully.")
            
            headers = {"Authorization": f"Bearer {token}"}
            trips_res = requests.get("http://localhost:8000/api/v1/trip", headers=headers)
            print("Trips response code:", trips_res.status_code)
            print("Trips count returned:", len(trips_res.json()))
            for t in trips_res.json():
                print(f"Trip ID: {t.get('id')}, Title: {t.get('title')}, User ID: {t.get('user_id')}")
        else:
            print("Login failed:", res.text)
    except Exception as e:
        print("Error connecting to server:", e)

if __name__ == "__main__":
    test()
