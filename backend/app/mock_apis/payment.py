import random
import time


def payment_v1(data):
    time.sleep(1)
    if random.random() < 0.8:
        return {"status": "success", "txn_id": "TXN123"}
    else:
        return {"status": "failed"}

