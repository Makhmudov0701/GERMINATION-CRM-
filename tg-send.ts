const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { chat_id, text } = await req.json();
    const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!token) return json({ ok: false, error: 'TELEGRAM_BOT_TOKEN sozlanmagan' }, 500);
    if (!chat_id || !text) return json({ ok: false, error: 'chat_id va text kerak' }, 400);
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: String(text).slice(0, 4000) }),
    });
    const j = await r.json();
    return json(j, r.ok ? 200 : 400);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});