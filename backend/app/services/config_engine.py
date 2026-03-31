def generate_config(name, aadhaar):
    mapping = {"name": "full_name", "aadhaar": "aadhaar_number"}

    config = {"full_name": name, "aadhaar_number": aadhaar, "dob": None}

    return {"mapping": mapping, "config": config, "version": "v2"}

