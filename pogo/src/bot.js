const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { fetchLatestArticle } = require('./checker');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const CHANNEL_ID = process.env.CHANNEL_ID;
const TOKEN = process.env.BOT_TOKEN;

let storage = { lastUrl: null };

if (fs.existsSync('./src/storage.json')) {
  storage = JSON.parse(fs.readFileSync('./src/storage.json', 'utf8'));
}

async function checkUpdate() {
  const latest = await fetchLatestArticle();
  if (!latest) return;

  if (latest.url !== storage.lastUrl) {
    storage.lastUrl = latest.url;
    fs.writeFileSync('./src/storage.json', JSON.stringify(storage, null, 2));

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle(latest.title)
      .setURL(latest.url)
      .setDescription('🆕 Pokémon GO公式ニュースが更新されました！')
      .setTimestamp();

    if (latest.thumbnail) {
      embed.setThumbnail(latest.thumbnail);
    }

    const channel = await client.channels.fetch(CHANNEL_ID);
    await channel.send({ embeds: [embed] });
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  setInterval(checkUpdate, 60 * 60 * 1000); // 1時間おき
});

client.login(TOKEN);
