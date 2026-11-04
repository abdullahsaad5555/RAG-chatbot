import requests

url = "https://jsonplaceholder.typicode.com/users"

result = requests.get(url,verify=False)

result=result.json()
for ent in result:
    print(ent['username'])