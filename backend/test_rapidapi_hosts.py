import asyncio
import httpx
import sys

sys.stdout.reconfigure(encoding='utf-8')

async def test_rapidapi():
    key = "116e6051c4msh2b13d03634bb08ep11c8c1jsn38ad87ec9622"
    url = "https://www.linkedin.com/in/williamhgates"
    
    hosts_to_try = [
        ("linkedin-api8.p.rapidapi.com", "https://linkedin-api8.p.rapidapi.com/get-profile-data-by-url"),
        ("linkedin-data-api.p.rapidapi.com", "https://linkedin-data-api.p.rapidapi.com/get-profile-data-by-url"),
        ("real-time-linkedin-scraper-api.p.rapidapi.com", "https://real-time-linkedin-scraper-api.p.rapidapi.com/get-profile-data-by-url"),
        ("linkedin-data-scraper.p.rapidapi.com", "https://linkedin-data-scraper.p.rapidapi.com/person"),
        ("fresh-linkedin-profile-data.p.rapidapi.com", "https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile")
    ]
    
    async with httpx.AsyncClient() as client:
        for host, endpoint in hosts_to_try:
            print(f"Testing host: {host}")
            try:
                params = {"linkedin_url": url, "url": url, "profile_url": url}
                response = await client.get(
                    endpoint,
                    headers={
                        "x-rapidapi-key": key,
                        "x-rapidapi-host": host
                    },
                    params=params,
                    timeout=10.0
                )
                print(f"Status: {response.status_code}")
                if response.status_code == 200:
                    data = response.json()
                    print(data)
                    if data.get("success") == False or "We are no longer providing this service" in str(data):
                        print("Service deprecated. Continuing...")
                        continue
                    print("SUCCESS!")
                    break
            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_rapidapi())
