import json, os, time, uuid
LEVELS = {"DEBUG":10,"INFO":20,"WARN":30,"ERROR":40}
CUR = LEVELS.get(os.getenv("LOG_LEVEL","INFO"),20)

def log(evt, **fields):
    if LEVELS["INFO"] < CUR: return
    rec = {"evt":evt, **fields, "ts":time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    print(json.dumps(rec))
