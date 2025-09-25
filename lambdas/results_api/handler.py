import os, json, boto3
from botocore.exceptions import ClientError
from common.resp import ok
s3=boto3.client('s3'); BUCKET=os.environ['BUCKET_NAME']

def lambda_handler(event, context):
    job_id = event['pathParameters']['job_id']
    try:
        obj=s3.get_object(Bucket=BUCKET, Key=f"results/{job_id}.json")
        return ok(json.loads(obj['Body'].read()))
    except ClientError:
        return {"statusCode":404,"body":json.dumps({"error":"not_found"}),"headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}
