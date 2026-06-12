import { apiFetch } from './lib/api.js';

async function run() {
  const token = 'YOUR_TOKEN'; // We don't have the token.
  try {
    const resAll = await apiFetch('/api/v1/organisation/timeslot', { headers: { 'Authorization': `Bearer ${token}` } });
    console.log("ALL:", JSON.stringify(resAll).substring(0, 200));
  } catch (e) { console.error("ALL error", e.message); }
}
run();
