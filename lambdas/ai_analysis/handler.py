import os, json, time, boto3, hashlib
lambda_client = boto3.client('lambda'); s3 = boto3.client('s3')
BUCKET = os.environ['BUCKET_NAME']; LLM_LAMBDA = os.environ['LLM_LAMBDA_NAME']

CLASSES = ["normal","potential_abnormality","urgent_finding","unknown"]

def lambda_handler(event, context):
    bucket = event['bucket']; image_key = event['image_key']
    job_id = event['job_id']; job_key = event['job_key']

    # "Run inference" – produce deterministic class based on hash of key
    start = time.time()
    h = hashlib.sha256(image_key.encode()).hexdigest()
    idx = int(h[:2], 16) % len(CLASSES)
    finding = CLASSES[idx]
    conf = round(((int(h[2:4],16) % 50) + 50) / 100.0, 2)  # 0.50–0.99
    proc = f"{round(time.time()-start+0.3, 2)} seconds"

    ai = {
      "findings": finding,
      "confidence": conf,
      "image_key": image_key,
      "model_version": "v0.1-stub",
      "processing_time": proc
    }

    s3.put_object(Bucket=BUCKET, Key=f"ai-results/{job_id}.json",
                  Body=json.dumps({"job_id":job_id,"ai_analysis":ai}).encode('utf-8'),
                  ContentType="application/json")

    # update job status
    job = {"job_id": job_id, "status":"ai_complete", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
           "image_key": image_key}
    s3.put_object(Bucket=BUCKET, Key=job_key,
                  Body=json.dumps(job).encode("utf-8"),
                  ContentType="application/json")

    # kick LLM
    lambda_client.invoke(FunctionName=LLM_LAMBDA, InvocationType='Event',
                         Payload=json.dumps({
                             "bucket": BUCKET,
                             "ai_results_key": f"ai-results/{job_id}.json",
                             "job_key": job_key,
                             "job_id": job_id
                         }).encode('utf-8'))
