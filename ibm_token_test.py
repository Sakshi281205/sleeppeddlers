import requests

API_KEY = "c5DelgicCyGihx2uhO_mMHbd947T8thCryH0gpmJPj7t"

url = "https://iam.cloud.ibm.com/identity/token"
headers = {"Content-Type": "application/x-www-form-urlencoded"}
data = {
    "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
    "apikey": API_KEY
}

r = requests.post(url, headers=headers, data=data)
print("Status:", r.status_code)
print("Response:", r.text)
