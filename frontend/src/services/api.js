const BASE_URL = "http://127.0.0.1:8000";

export const parseRequirements = async (text) => {
  const res = await fetch(`${BASE_URL}/parse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  return res.json();
};

export const generateConfig = async (data) => {
  const res = await fetch(`${BASE_URL}/generate-config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const runSimulation = async (config) => {
  const res = await fetch(`${BASE_URL}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });
  return res.json();
};

