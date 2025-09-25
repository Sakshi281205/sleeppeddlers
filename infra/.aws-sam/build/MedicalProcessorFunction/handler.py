import os, json, boto3, time
from common.log import log

s3 = boto3.client('s3')
lambda_client = boto3.client('lambda')
cloudwatch = boto3.client('cloudwatch')
BUCKET = os.environ['BUCKET_NAME']
AI_LAMBDA = os.environ['AI_LAMBDA_NAME']
NAMESPACE = "MedicalImaging"

def lambda_handler(event, context):
    for r in event.get('Records', []):
        bucket = r['s3']['bucket']['name']
        key = r['s3']['object']['key']
        if not key.startswith("uploads/"): continue
        job_id = key.split('/')[1]

        head = s3.head_object(Bucket=bucket, Key=key)
        size = head['ContentLength']; ctype = head.get('ContentType','application/octet-stream')
        if size > 10*1024*1024:
            _write_job(job_id, "error", key, ctype, size, "file_too_large")
            continue

        _write_job(job_id, "processing", key, ctype, size)
        cloudwatch.put_metric_data(Namespace=NAMESPACE, MetricData=[{"MetricName":"ImagesUploaded","Value":1,"Unit":"Count"}])

        payload = {"bucket": bucket, "image_key": key, "job_id": job_id, "job_key": f"jobs/{job_id}.json"}
        lambda_client.invoke(FunctionName=AI_LAMBDA, InvocationType='Event', Payload=json.dumps(payload).encode('utf-8'))
        log("medical_processor_invoked_ai", job_id=job_id)

def _write_job(job_id, status, image_key, content_type, size, error=None):
    doc = {"job_id":job_id,"status":status,"timestamp":_now(),"image_key":image_key,"content_type":content_type,"size_bytes":size}
    if error: doc["error"]=error
    s3.put_object(Bucket=BUCKET, Key=f"jobs/{job_id}.json", Body=json.dumps(doc).encode("utf-8"), ContentType="application/json")
def _now(): return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
