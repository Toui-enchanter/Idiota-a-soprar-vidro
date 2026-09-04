const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { fetchLatestArticle } = require('./checker');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.BOT_TOKEN;
const NEWS_CHANNEL_ID = process.env.NEWS_CHANNEL_ID || process.env.CHANNEL_ID;
const ADMIN_CHANNEL_ID = process.env.ADMIN_CHANNEL_ID;
const HEARTBEAT_INTERVAL_MIN = Number(process.env.HEARTBEAT_INTERVAL_MIN || '180'); // default 180 minutes

// use paths relative to this file to avoid cwd problems
const STORAGE_PATH = path.join(__dirname, 'storage.json');

let storage = { lastUrl: null, lastTitle: null, lastCheckedAt: null };

if (fs.existsSync(STORAGE_PATH)) {
  try {
    storage = JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf8'));
  } catch (err) {
    console.error('Failed to parse storage.json, using defaults:', err);
  }
}

async function checkUpdate() {
  try {
    const latest = await fetchLatestArticle();
    storage.lastCheckedAt = new Date().toISOString();

    if (!latest) {
      // save lastCheckedAt even if nothing found
      try { fs.writeFileSync(STORAGE_PATH, JSON.stringify(storage, null, 2)); } catch (e) { console.error('Failed to write storage:', e); }
      return;
    }

    // normalize url
    const latestUrl = latest.url;

    if (latestUrl !== storage.lastUrl) {
      storage.lastUrl = latestUrl;
      storage.lastTitle = latest.title;

      try { fs.writeFileSync(STORAGE_PATH, JSON.stringify(storage, null, 2)); } catch (e) { console.error('Failed to write storage:', e); }

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle(latest.title)
        .setURL(latest.url)
        .setDescription('🆕 Pokémon GO公式ニュースが更新されました！')
        .setTimestamp();

      if (latest.thumbnail) embed.setThumbnail(latest.thumbnail);

      if (NEWS_CHANNEL_ID) {
        try {
          const channel = await client.channels.fetch(NEWS_CHANNEL_ID);
          await channel.send({ embeds: [embed] });
          console.log('Posted news to channel', NEWS_CHANNEL_ID);
        } catch (err) {
          console.error('Failed to send news embed:', err);
        }
      } else {
        console.warn('No NEWS_CHANNEL_ID configured; skipping news post.');
      }
    }
  } catch (err) {
    console.error('checkUpdate failed:', err);
  }
}

function formatHeartbeatEmbed() {
  const uptimeSec = Math.floor(process.uptime());
  const uptimeMin = Math.floor(uptimeSec / 60);

  const fields = [
    { name: 'Status', value: 'yakumonochigiri', inline: true },
    { name: 'Uptime', value: `${uptimeMin} min`, inline: true },
    { name: 'Last checked', value: storage.lastCheckedAt || 'never', inline: false },
    { name: 'Last article', value: storage.lastUrl ? `[${storage.lastTitle || 'link'}](${storage.lastUrl})` : 'none', inline: false }
  ];

  const embed = new EmbedBuilder()
    .setTitle('Bot Heartbeat')
    .setColor(0xFAA61A)
    .setTimestamp()
    .addFields(fields);

  return embed;
}

async function sendHeartbeat() {
  if (!ADMIN_CHANNEL_ID) return;
  try {
    const channel = await client.channels.fetch(ADMIN_CHANNEL_ID);
    const embed = formatHeartbeatEmbed();
    await channel.send({ embeds: [embed] });
    console.log('Sent heartbeat to', ADMIN_CHANNEL_ID);
  } catch (err) {
    console.error('Failed to send heartbeat:', err);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  // run an immediate check on startup
  checkUpdate().catch(console.error);

  // send immediate heartbeat on startup
  sendHeartbeat().catch(console.error);

  // schedule periodic jobs
  setInterval(checkUpdate, 60 * 60 * 1000); // news check: 1 hour
  setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MIN * 60 * 1000); // heartbeat: configured minutes
});

if (!TOKEN) {
  console.error('BOT_TOKEN is not set. Aborting login.');
} else {
  client.login(TOKEN).catch(err => console.error('Login failed:', err));
}
