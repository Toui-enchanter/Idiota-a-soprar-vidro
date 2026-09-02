# Pokémon GO News Watcher Bot

Pokémon GO公式ニュースページを監視し、更新があれば Discord に Embed 形式で通知するBotです。

## 環境変数

BOT_TOKEN=Discord Bot Token
CHANNEL_ID=通知先チャンネルID

コード

## 起動
npm install
node src/bot.js

コード

## 機能

- https://pokemongo.com/ja/news/ を1時間ごとにチェック
- 最新記事のURLが変わったら通知
- Embed形式でタイトル・URL・サムネイルを表示
- `storage.json` に最後のURLを保存
- 
