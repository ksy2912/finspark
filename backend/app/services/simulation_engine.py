from app.mock_apis.kyc import kyc_v1, kyc_v2


def run_simulation(config):
    logs = []

    try:
        result = kyc_v2(config)
        logs.append("KYC v2 success")
        return {"status": "success", "result": result, "logs": logs}

    except Exception:
        logs.append("KYC v2 failed → fallback triggered")

        fallback = kyc_v1(config)

        return {"status": "fallback", "result": fallback, "logs": logs}

