require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const BASE_URL = 'https://api.twitch.tv/helix';
const ENV_PATH = path.join(__dirname, '.env');

function headers() {
  return {
    'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
    'Client-Id':     process.env.CLIENT_ID,
    'Content-Type':  'application/json',
  };
}

// Wraps fetch with automatic token refresh on 401.
async function apiFetch(url, options) {
  let res = await fetch(url, { ...options, headers: headers() });

  if (res.status === 401) {
    console.log('Access token expired — refreshing...');
    await refreshAccessToken();
    res = await fetch(url, { ...options, headers: headers() });
  }

  return res;
}

async function refreshAccessToken() {
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type:    'refresh_token',
      refresh_token: process.env.REFRESH_TOKEN,
    }),
  });

  if (!res.ok) throw new Error('Token refresh failed — re-run: npm run auth');

  const data = await res.json();
  process.env.ACCESS_TOKEN = data.access_token;
  if (data.refresh_token) process.env.REFRESH_TOKEN = data.refresh_token;

  // Persist updated tokens back to .env
  let env = fs.readFileSync(ENV_PATH, 'utf8');
  env = env.replace(/^ACCESS_TOKEN=.*/m, `ACCESS_TOKEN=${data.access_token}`);
  if (data.refresh_token) {
    env = env.replace(/^REFRESH_TOKEN=.*/m, `REFRESH_TOKEN=${data.refresh_token}`);
  }
  fs.writeFileSync(ENV_PATH, env);
  console.log('Token refreshed and saved to .env');
}

// POST /helix/chat/messages
async function postChatMessage(message) {
  const res = await apiFetch(`${BASE_URL}/chat/messages`, {
    method: 'POST',
    body: JSON.stringify({
      broadcaster_id: process.env.BROADCASTER_ID,
      sender_id:      process.env.SENDER_ID,
      message,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Chat message failed: ${JSON.stringify(err)}`);
  }
}

// POST /helix/streams/markers — bookmarks the current VOD timestamp
async function createStreamMarker() {
  const res = await apiFetch(`${BASE_URL}/streams/markers`, {
    method: 'POST',
    body: JSON.stringify({
      user_id:     process.env.BROADCASTER_ID,
      description: 'MacroPad marker',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stream marker failed: ${JSON.stringify(data)}`);
  const m = data.data?.[0];
  if (m) console.log(`  [marker] id=${m.id} pos=${m.position_seconds}s`);
  else    console.log(`  [marker] response:`, JSON.stringify(data));
}

// POST /helix/channels/commercial — starts an ad break
async function startCommercial(length = 30) {
  const res = await apiFetch(`${BASE_URL}/channels/commercial`, {
    method: 'POST',
    body: JSON.stringify({
      broadcaster_id: process.env.BROADCASTER_ID,
      length,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Commercial failed: ${JSON.stringify(err)}`);
  }
}

module.exports = { postChatMessage, createStreamMarker, startCommercial };
