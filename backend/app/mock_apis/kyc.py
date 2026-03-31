import random
import time


def kyc_v2(data):
    time.sleep(1)
    if random.random() < 0.7:
        return {"status": "verified", "confidence": 0.95}
    else:
        raise Exception("KYC v2 failed")


def kyc_v1(data):
    time.sleep(1)
    return {"status": "verified (fallback)", "confidence": 0.85}

