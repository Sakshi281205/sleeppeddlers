const API_BASE = import.meta.env.VITE_API_BASE;
const API_KEY = import.meta.env.VITE_API_KEY;

export async function uploadBase64({ image, filename, content_type }) {
  const r = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, filename, content_type })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getStatus(job_id) {
  const r = await fetch(`${API_BASE}/status/${job_id}`, { headers: { 'x-api-key': API_KEY }});
  if (r.status === 202) return { job_id, status: 'processing' };
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getResults(job_id) {
  const r = await fetch(`${API_BASE}/results/${job_id}`, { headers: { 'x-api-key': API_KEY }});
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
