import json
import os


def lambda_handler(event, context):
    """
    Minimal placeholder for LLM processing Lambda.
    Ensures a non-empty deployment package and provides a simple passthrough.
    """
    # Echo input and indicate the function is reachable
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "message": "LLM processing function placeholder executed",
            "input_sample": event if isinstance(event, (dict, list)) else str(event),
            "function_name": os.environ.get("AWS_LAMBDA_FUNCTION_NAME", "unknown"),
        }),
    }


