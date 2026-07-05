import requests

def test():
    login_data = {"username": "test@example.com", "password": "password123"}
    try:
        res = requests.post("http://localhost:8000/api/v1/auth/login/access-token", data=login_data)
        if res.status_code == 200:
            token = res.json()["access_token"]
            print("Logged in successfully.")
            
            headers = {"Authorization": f"Bearer {token}"}
            
            # Post to non-slash prefix path
            conv_res = requests.post("http://localhost:8000/api/v1/conversations", json={"title": "Test Thread"}, headers=headers)
            print("Conversations POST (no slash) status:", conv_res.status_code)
            if conv_res.status_code in [200, 201]:
                print("Conversations POST (no slash) details:", conv_res.json())
            else:
                print("Conversations POST (no slash) error:", conv_res.text)

            # Post to slash prefix path
            conv_res_slash = requests.post("http://localhost:8000/api/v1/conversations/", json={"title": "Test Thread 2"}, headers=headers)
            print("Conversations POST (with slash) status:", conv_res_slash.status_code)
            if conv_res_slash.status_code in [200, 201]:
                print("Conversations POST (with slash) details:", conv_res_slash.json())
        else:
            print("Login failed:", res.text)
    except Exception as e:
        print("Error connecting to server:", e)

if __name__ == "__main__":
    test()
