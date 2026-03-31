import os

import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def parse_with_groq(text: str):
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama3-70b-8192",
                "messages": [
                    {
                        "role": "user",
                        "content": f"""
Extract structured JSON from this requirement:

{text}

Return JSON:
services, mandatory, fields
""",
                    }
                ],
            },
            timeout=30,
        )

        return response.json()["choices"][0]["message"]["content"]

    except Exception:
        return None


def fallback_parser(text: str):
    text = text.lower()

    services = []
    mandatory = []
    fields = []

    if "kyc" in text:
        services.append("KYC")
        mandatory.append("KYC")

    if "payment" in text:
        services.append("Payment")

    if "aadhaar" in text:
        fields.append("aadhaar")

    if "name" in text:
        fields.append("name")

    return {"services": services, "mandatory": mandatory, "fields": fields}

