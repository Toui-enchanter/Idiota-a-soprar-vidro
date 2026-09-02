const axios = require('axios');
const cheerio = require('cheerio');

const TARGET_URL = 'https://pokemongo.com/ja/news/';

async function fetchLatestArticle() {
  const res = await axios.get(TARGET_URL);
  const $ = cheerio.load(res.data);

  const firstArticle = $('a.news-item').first();
  const title = firstArticle.find('.title').text().trim();
  const url = firstArticle.attr('href');
  const thumbnail = firstArticle.find('img').attr('src');

  if (!url) return null;

  return {
    title,
    url: `https://pokemongo.com${url}`,
    thumbnail: thumbnail ? `https://pokemongo.com${thumbnail}` : null
  };
}

module.exports = { fetchLatestArticle };
