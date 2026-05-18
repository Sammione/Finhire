import asyncio
import httpx
import sys

sys.stdout.reconfigure(encoding='utf-8')
import httpx

async def get_schema():
    url = "https://api.apify.com/v2/acts/dev_fusion~linkedin-profile-scraper/builds/default/openapi.json"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        print(response.text)

if __name__ == "__main__":
    asyncio.run(get_schema())
