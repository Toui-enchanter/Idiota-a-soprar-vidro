# Pokémon GO News Watcher Bot

Pokémon GO公式ニュースページを監視し、更新があれば Discord に Embed 形式で通知する Bot です。

## 機能

- 🔍 1時間ごとに https://pokemongo.com/ja/news/ をチェック
- 📢 最新記事が更新されたら Discord に通知
- 🖼️ Embed 形式でタイトル・URL・サムネイルを表示
- 💾 最後にチェックした記事情報を `storage.json` に保存
- 📝 実行ログを `logs/` ディレクトリに日ごとに保存
- ⚠️ 詳細なエラーハンドリングとロギング機能

## 必要な環境

- Node.js 16.0 以上
- npm または yarn
- Discord Bot Token
- Discord Channel ID

## セットアップ

### 1. 依存パッケージをインストール

```bash
npm install
```

### 2. 環境変数を設定

`.env.example` をコピーして `.env` ファイルを作成します：

```bash
cp .env.example .env
```

`.env` ファイルを編集して、以下の情報を入力します：

```env
BOT_TOKEN=your_discord_bot_token
CHANNEL_ID=your_discord_channel_id
LOG_LEVEL=info
```

**環境変数の取得方法:**

- **BOT_TOKEN**: [Discord Developer Portal](https://discord.com/developers/applications) で Bot を作成して取得
- **CHANNEL_ID**: Discord で通知を受け取りたいチャンネルを右クリック → "チャンネルID をコピー" で取得

### 3. 起動

開発モード（詳細ログ表示）:
```bash
npm run dev
```

本番モード（通常ログ）:
```bash
npm start
```

## ファイル構成

```
pogo/
├── src/
│   ├── bot.js         # メインファイル（Bot 初期化・チェック処理）
│   ├── checker.js     # ニュース取得ロジック
│   └── logger.js      # ロギング機能
├── logs/              # ログファイル（自動作成）
├── storage.json       # 最後のチェック情報（自動作成）
├── package.json       # 依存パッケージ情報
├── .env               # 環境変数（Git から除外）
├── .env.example       # 環境変数テンプレート
├── .gitignore         # Git 除外ファイル
└── README.md          # このファイル
```

## ログについて

- ログは `logs/` ディレクトリに日ごとのファイルで保存されます
- ファイル形式: `bot-YYYY-MM-DD.log`
- ログレベル: `error`, `warn`, `info`, `debug`
- `LOG_LEVEL=debug` で詳細ログを表示

ログ例:
```
[2024-01-15T10:30:45.123Z] [INFO] Bot logged in as PokemonBot#1234
[2024-01-15T10:30:46.456Z] [DEBUG] Fetching articles from https://pokemongo.com/ja/news/
[2024-01-15T10:30:47.789Z] [INFO] Notification sent: New Event Announced!
```

## サーバーでの運用

### systemd サービス化（Linux）

`/etc/systemd/system/pokemon-bot.service` を作成：

```ini
[Unit]
Description=Pokemon News Watcher Bot
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/pogo
EnvironmentFile=/path/to/pogo/.env
ExecStart=/usr/bin/node src/bot.js
Restart=always
RestartSec=10
StandardOutput=append:/path/to/pogo/logs/systemd.log
StandardError=append:/path/to/pogo/logs/systemd-error.log

[Install]
WantedBy=multi-user.target
```

起動:
```bash
sudo systemctl start pokemon-bot
sudo systemctl enable pokemon-bot
```

ステータス確認:
```bash
sudo systemctl status pokemon-bot
```

### Docker での運用

`Dockerfile` の例：

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src ./src

ENV LOG_LEVEL=info

CMD ["node", "src/bot.js"]
```

ビルド・実行:
```bash
docker build -t pokemon-bot .
docker run -d --name pokemon-bot --env-file .env pokemon-bot
```

## トラブルシューティング

### 環境変数が見つからないエラー
- `.env` ファイルが存在することを確認
- `BOT_TOKEN` と `CHANNEL_ID` が正しく設定されているか確認

### Discord に接続できない
- Bot Token が有効か確認
- Bot に必要な権限があるか確認
- ネットワーク接続を確認

### 記事が取得できない
- Pokémon GO 公式サイトの HTML 構造が変わった可能性
- `checker.js` のセレクタをアップデートが必要な場合があります
- ログの詳細を確認: `LOG_LEVEL=debug`

## 注意事項

- ⚠️ **環境変数は GitHub に絶対にプッシュしないでください**
- `.env` ファイルは `.gitignore` で除外されています
- Bot Token は第三者と共有しないでください
- 定期的にログファイルを削除して容量を管理してください

## 今後の改善予定

- [ ] 複数チャンネルへの通知対応
- [ ] 記事フィルタリング機能
- [ ] データベース対応（複数記事の履歴管理）
- [ ] 通知スケジュール設定
- [ ] Web ダッシュボード

## ライセンス

MIT

## サポート

問題が発生した場合は、GitHub Issues で報告してください。
