def ok(body, headers=None): return _r(200, body, headers)
def accepted(body, headers=None): return _r(202, body, headers)
def not_found(body, headers=None): return _r(404, body, headers)
def bad_request(body, headers=None): return _r(400, body, headers)

def _r(code, body, headers):
    h = {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}
    if headers: h.update(headers)
    import json
    return {"statusCode":code,"body":json.dumps(body),"headers":h}
