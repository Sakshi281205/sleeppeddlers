import os
import sys
import json
import requests
from datetime import datetime

# -------------------
# Config (replace with your values)
# -------------------
API_KEY = os.environ["IBM_API_KEY"]
PROJECT_ID = os.environ["IBM_PROJECT_ID"]      # from Watsonx project
BASE_URL = "https://us-south.ml.cloud.ibm.com"
MODEL_ID = "ibm/granite-13b-chat-v2"

# -------------------
# Step 1: Get IAM Token
# -------------------
def get_iam_token(api_key):
    url = "https://iam.cloud.ibm.com/identity/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "apikey": api_key,
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey"
    }
    r = requests.post(url, headers=headers, data=data)
    print("DEBUG (token) status:", r.status_code)
    r.raise_for_status()
    return r.json()["access_token"]

# -------------------
# Step 2: Call Granite LLM
# -------------------
def call_watsonx(ai_findings, token, project_id):
    url = f"{BASE_URL}/ml/v1/text/chat?version=2023-05-29"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    prompt_text = (
        "You are an expert radiologist assistant. "
        "Summarize the following findings for emergency physicians:\n\n"
        f"{json.dumps(ai_findings)}\n\n"
        "Please provide:\n"
        "1. KEY FINDINGS (2–3 sentences)\n"
        "2. CLINICAL SIGNIFICANCE (Critical/Moderate/Low)\n"
        "3. RECOMMENDED ACTIONS (Immediate steps)\n"
        "4. FOLLOW-UP (If needed)\n"
    )

    payload = {
        "model_id": MODEL_ID,
        "project_id": project_id,
        "input": [
            {
                "role": "user",
                "content": [{"text": prompt_text}]
            }
        ],
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 250,
            "temperature": 0.3,
            "top_p": 0.9
        }
    }

    r = requests.post(url, headers=headers, json=payload)
    print("DEBUG (watsonx) status:", r.status_code)
    print("DEBUG (watsonx) response:", r.text[:300])
    r.raise_for_status()
    return r.json()

# -------------------
# Step 3: Fallback template
# -------------------
def fallback_summary(ai_findings):
    findings = ai_findings.get("findings", "unknown")
    if "hemorrhage" in findings.lower() or "urgent" in findings.lower():
        return (
            "KEY FINDINGS: Potential urgent abnormality detected. "
            "CLINICAL SIGNIFICANCE: HIGH – immediate physician review required. "
            "RECOMMENDED ACTIONS: Emergency evaluation and specialist consult. "
            "FOLLOW-UP: Formal radiology interpretation within 1 hour."
        )
    else:
        return (
            "KEY FINDINGS: No acute abnormalities detected on initial AI screening. "
            "CLINICAL SIGNIFICANCE: Low. "
            "RECOMMENDED ACTIONS: Routine clinical correlation recommended. "
            "FOLLOW-UP: As needed."
        )

# -------------------
# Step 4: Summarize Findings
# -------------------
def summarize_findings(ai_findings):
    try:
        token = get_iam_token(API_KEY)
        resp = call_watsonx(ai_findings, token, PROJECT_ID)

        # Extract Granite’s generated text
        text = resp["results"][0]["generated_text"]
        return {
            "summary": text,
            "model_used": MODEL_ID,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        print("ERROR: Watsonx call failed, using fallback. Details:", str(e))
        return {
            "summary": fallback_summary(ai_findings),
            "model_used": "fallback_template",
            "generated_at": datetime.utcnow().isoformat()
        }

# -------------------
# Main
# -------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ibm_summarizer.py <input-json>")
        sys.exit(1)

    fn = sys.argv[1]
    with open(fn, "r") as f:
        ai = json.load(f)

    out = summarize_findings(ai)
    print("\n=== Final Clinical Summary ===\n")
    print(out["summary"])
    print(f"\n(model: {out['model_used']} at {out['generated_at']})")
