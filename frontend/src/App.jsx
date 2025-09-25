import {useState,useEffect} from 'react';
import {uploadBase64,getStatus,getResults} from './api';

function App(){
  const [jobId,setJobId]=useState(null);
  const [status,setStatus]=useState(null);
  const [result,setResult]=useState(null);

  async function onFile(e){
    const f = e.target.files[0];
    const b64 = await toBase64(f);
    const {job_id} = await uploadBase64({ image: b64.split(',')[1], filename: f.name, content_type: f.type });
    setJobId(job_id); setStatus('uploaded');
  }

  useEffect(()=>{
    if (!jobId) return;
    const id=setInterval(async()=>{
      const s = await getStatus(jobId);
      setStatus(s.status);
      if (s.status==='done'){
        const res = await getResults(jobId);
        if (res){ setResult(res); clearInterval(id); }
      }
    }, 2500);
    return ()=>clearInterval(id);
  },[jobId]);

  return (
    <div>
      <input type="file" accept=".jpg,.jpeg,.png,.dcm" onChange={onFile} />
      {status && <div>Status: {status}</div>}
      {result && <Findings result={result} />}
    </div>
  );
}
function toBase64(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
function Findings({result}){
  const f = result.ai_analysis;
  const color = f.findings==='normal'?'#1a7f37':f.findings==='urgent_finding'?'#d1242f':'#a97900';
  return (
    <div>
      <h3>AI Findings</h3>
      <div style={{borderLeft:`6px solid ${color}`, paddingLeft:12}}>
        <div>Findings: <b>{f.findings}</b> ({Math.round(f.confidence*100)}%)</div>
        <div>Model: {f.model_version}</div>
        <div>Processing: {f.processing_time}</div>
      </div>
      <h3>Clinical Summary</h3>
      <pre style={{whiteSpace:'pre-wrap'}}>{result.clinical_summary.clinical_summary}</pre>
      <small>{result.clinical_summary.model_used} • {result.clinical_summary.generated_at}</small>
    </div>
  );
}
export default App;
