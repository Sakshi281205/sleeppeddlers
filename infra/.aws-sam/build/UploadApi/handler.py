import os, json, base64, uuid, boto3, time, re
from common.log import log
from common.resp import ok, bad_request

s3 = boto3.client('s3')
BUCKET = os.environ['BUCKET_NAME']
ALLOWED = re.compile(r'^(image/(jpeg|png)|application/dicom)$')

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body') or '{}')
        for f in ('image','filename','content_type'):
            if f not in body: return bad_request({"error":f"missing_{f}"})
        content_type = body['content_type']
        if not ALLOWED.match(content_type): return bad_request({"error":"unsupported_content_type"})

        data = base64.b64decode(body['image'])
        if len(data) > 10*1024*1024: return bad_request({"error":"file_too_large"})

        job_id = str(uuid.uuid4())
        image_key = f"uploads/{job_id}"
        s3.put_object(Bucket=BUCKET, Key=image_key, Body=data, ContentType=content_type)

        job_doc = {
          "job_id": job_id, "status":"uploaded",
          "timestamp": _now(), "image_key": image_key,
          "content_type": content_type, "size_bytes": len(data)
        }
        s3.put_object(Bucket=BUCKET, Key=f"jobs/{job_id}.json",
                      Body=json.dumps(job_doc).encode("utf-8"),
                      ContentType="application/json")
        log("upload_ok", job_id=job_id, size=len(data), ctype=content_type)
        return ok({"job_id": job_id, "status":"uploaded"})
    except Exception as e:
        log("upload_error", error=str(e))
        return bad_request({"error": "invalid_request"})
def _now(): return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
