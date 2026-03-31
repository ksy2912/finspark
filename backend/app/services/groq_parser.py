import json
import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

PROMPT_TEMPLATE = """
Extract structured data from this requirement:

{text}

Return ONLY valid JSON:
{{
  "services": [
    {{"name": "KYC", "mandatory": true}},
    {{"name": "Payment", "mandatory": true}},
    {{"name": "Email", "mandatory": false}},
    {{"name": "Audit", "mandatory": true}},
    {{"name": "Fraud", "mandatory": false}}
  ],
  "fields": ["name", "aadhaar", "email", "phone"]
}}
"""


def _normalize_payload(payload: dict) -> dict:
    services = payload.get("services", [])
    fields = payload.get("fields", [])

    if not isinstance(services, list) or not isinstance(fields, list):
        raise ValueError("Invalid payload shape")

    normalized_services = []
    for item in services:
        if not isinstance(item, dict):
            raise ValueError("Service item must be an object")
        name = item.get("name")
        mandatory = item.get("mandatory")
        if not isinstance(name, str) or not isinstance(mandatory, bool):
            raise ValueError("Service item fields are invalid")
        normalized_services.append({"name": name, "mandatory": mandatory})

    normalized_fields = [field for field in fields if isinstance(field, str)]
    return {"services": normalized_services, "fields": normalized_fields}


def parse_with_groq(text: str):
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set")

    print("Calling GROQ API...")
    client = Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": PROMPT_TEMPLATE.format(text=text)}],
        temperature=0,
    )
    raw_content = response.choices[0].message.content or ""
    print(f"Groq raw response: {raw_content}")

    try:
        parsed = json.loads(raw_content)
    except Exception as exc:
        raise ValueError(f"Invalid JSON from Groq: {exc}") from exc

    return _normalize_payload(parsed)


def fallback_parser(text: str):
    text = text.lower()

    services = []
    fields = []

    if "kyc" in text:
        services.append({"name": "KYC", "mandatory": True})

    if "payment" in text:
        services.append({"name": "Payment", "mandatory": True})

    if "email" in text:
        services.append({"name": "Email", "mandatory": False})

    if "audit" in text:
        services.append({"name": "Audit", "mandatory": True})

    if "fraud" in text:
        services.append({"name": "Fraud", "mandatory": False})

    for field in ("name", "aadhaar", "email", "phone"):
        if field in text:
            fields.append(field)

    return {"services": services, "fields": fields}

