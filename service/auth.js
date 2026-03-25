// auth.js — One-time OAuth flow to get Twitch user access + refresh tokens.
// Run once before starting the service: npm run auth
require('dotenv').config();
const http = require('http');

const CLIENT_ID     = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI  = 'http://localhost:3000';
const SCOPES = [
  'user:write:chat',
  'channel:manage:broadcast',
  'clips:edit',
].join(' ');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\nERROR: CLIENT_ID and CLIENT_SECRET must be set in twitch/.env first.');
  console.error('Copy .env.example to .env and fill in your app credentials.\n');
  process.exit(1);
}

const authUrl =
  `https://id.twitch.tv/oauth2/authorize` +
  `?client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}`;

console.log('\nOpen this URL in your browser:\n');
console.log(authUrl);
console.log('\nWaiting for OAuth callback on http://localhost:3000...\n');

const server = http.createServer(async (req, res) => {
  const url  = new URL(req.url, 'http://localhost:3000');
  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400);
    res.end('Missing code — something went wrong.');
    return;
  }

  try {
    // Exchange authorization code for access + refresh tokens
    const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type:    'authorization_code',
        redirect_uri:  REDIRECT_URI,
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error(JSON.stringify(tokens));

    // Fetch the user's numeric ID and display name
    const userRes = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Client-Id':     CLIENT_ID,
      },
    });
    const userData = await userRes.json();
    const { id: userId, login } = userData.data[0];

    console.log(`Authenticated as: ${login} (ID: ${userId})\n`);
    console.log('Add these lines to your twitch/.env file:\n');
    console.log(`ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`BROADCASTER_ID=${userId}`);
    console.log(`SENDER_ID=${userId}`);
    console.log('');

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
      `<h2>Auth successful!</h2>` +
      `<p>Authenticated as <b>${login}</b>.</p>` +
      `<p>Check your terminal for the tokens to add to <code>.env</code>. You can close this tab.</p>`
    );
  } catch (err) {
    console.error('Auth failed:', err.message);
    res.writeHead(500);
    res.end('Auth failed — check terminal for details.');
  }

  server.close();
});

server.listen(3000);
