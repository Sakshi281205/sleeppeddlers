import os, json, boto3
from botocore.exceptions import ClientError
from common.resp import ok, accepted
s3 = boto3.client('s3'); BUCKET=os.environ['BUCKET_NAME']

def lambda_handler(event, context):
    job_id = event['pathParameters']['job_id']
    job = _get(f"jobs/{job_id}.json")
    res = _get(f"results/{job_id}.json")
    if res:
        return ok({"job_id": job_id, "status":"done", "updated_at": res.get("timestamp")})
    if job:
        st = job.get("status","processing")
        return (accepted if st=="processing" else ok)({"job_id": job_id, "status": st, "updated_at": job.get("timestamp")})
    return {"statusCode":404,"body":json.dumps({"error":"not_found"}),"headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}

def _get(key):
    try:
        obj=s3.get_object(Bucket=BUCKET, Key=key)
        return json.loads(obj['Body'].read())
    except ClientError: return None
