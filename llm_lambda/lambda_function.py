import os
import json
import boto3
import requests
from datetime import datetime

# -------------------
# Config (read from env variables set in Lambda console)
# -------------------
API_KEY = os.environ["IBM_API_KEY"]
PROJECT_ID = os.environ["IBM_PROJECT_ID"]
BASE_URL = "https://us-south.ml.cloud.ibm.com"
MODEL_ID = "ibm/granite-13b-chat-v2"

s3 = boto3.client("s3")

# -------------------
# Helpers
# -------------------
def get_iam_token(api_key):
    url = "https://iam.cloud.ibm.com/identity/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {"apikey": api_key, "grant_type": "urn:ibm:params:oauth:grant-type:apikey"}
    r = requests.post(url, headers=headers, data=data)
    r.raise_for_status()
    return r.json()["access_token"]

def call_watsonx(ai_findings, token, project_id):
    url = f"{BASE_URL}/ml/v1/text/chat?version=2023-05-29"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    prompt_text = (
        "You are an expert radiologist assistant. Summarize the following findings:\n\n"
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
        "input": {
            "messages": [
                {"role": "system", "content": "You are a helpful medical assistant."},
                {"role": "user", "content": prompt_text}
            ]
        },
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 250,
            "temperature": 0.3
        }
    }

    r = requests.post(url, headers=headers, json=payload)
    print("Watsonx DEBUG:", r.status_code, r.text)
    r.raise_for_status()
    return r.json()

def fallback_summary(ai_findings):
    findings = ai_findings.get("findings", "unknown")
    if "hemorrhage" in findings.lower() or "urgent" in findings.lower():
        return "KEY FINDINGS: Urgent abnormality detected. CLINICAL SIGNIFICANCE: HIGH. ACTIONS: Immediate review."
    else:
        return "KEY FINDINGS: No acute abnormalities detected. CLINICAL SIGNIFICANCE: Low. ACTIONS: Routine follow-up."

# -------------------
# Lambda handler
# -------------------
def lambda_handler(event, context):
    print("Event:", event)
    bucket = event["bucket"]
    ai_results_key = event["ai_results_key"]
    job_key = event["job_key"]

    # 1. Download AI results from S3
    resp = s3.get_object(Bucket=bucket, Key=ai_results_key)
    ai_results = json.loads(resp["Body"].read().decode("utf-8"))

    # 2. Call Watsonx (with fallback if error)
    try:
        token = get_iam_token(API_KEY)
        resp = call_watsonx(ai_results, token, PROJECT_ID)
        summary = resp["output"][0]["content"][0]["text"]
        model_used = MODEL_ID
    except Exception as e:
        print("Watsonx failed:", e)
        summary = fallback_summary(ai_results)
        model_used = "fallback_template"

    # 3. Save result back to S3
    job_id = job_key.replace("jobs/", "").replace(".json", "")
    out_key = f"results/{job_id}.json"
    result_block = {
        "ai_analysis": ai_results,
        "clinical_summary": summary,
        "model_used": model_used,
        "generated_at": datetime.utcnow().isoformat()
    }
    s3.put_object(
        Bucket=bucket,
        Key=out_key,
        Body=json.dumps(result_block).encode("utf-8"),
        ContentType="application/json"
    )
    print(f"Saved final results to {bucket}/{out_key}")
    return {"statusCode": 200, "results_key": out_key}

