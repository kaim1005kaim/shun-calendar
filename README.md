# 🍣 旬の食材カレンダー

日本の季節の食材と天気情報をもとに、AI が今日おすすめの料理を提案するReactアプリケーションです。

## ✨ 特徴

- **🌤️ リアルタイム天気情報**: OpenWeatherMap APIを使用した現在地の天気取得
- **🐟 旬の食材データベース**: 月別の日本の旬の魚・野菜データ
- **🤖 AI料理推薦**: Groq APIを使用した天気と食材に基づく料理提案
- **📱 レスポンシブデザイン**: モバイル・デスクトップ対応
- **🔗 クックパッド連携**: 推薦料理のレシピ検索リンク

## 🛠️ 技術スタック

- **フロントエンド**: React 18.2.0 + Vite
- **API統合**: 
  - OpenWeatherMap API (天気情報)
  - Groq AI API (料理推薦)
- **スタイリング**: CSS3 (グラデーション・ガラスモーフィズム)

## 📁 プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── LoadingSpinner.jsx
│   ├── RecommendationCard.jsx
│   ├── RecommendationSection.jsx
│   ├── SeasonalFoodList.jsx
│   ├── WeatherDetails.jsx
│   └── WeatherHeader.jsx
├── hooks/              # カスタムフック
│   └── useAppData.js
├── services/           # API・ビジネスロジック
│   ├── aiRecommendationService.js
│   └── weatherService.js
├── utils/              # ユーティリティ関数
│   └── helpers.js
├── App.jsx            # メインアプリケーション
├── data.js            # 旬の食材データ
├── index.css          # グローバルスタイル
└── main.jsx           # エントリーポイント
```

## 🚀 セットアップ

### 必要な環境
- Node.js (16.0.0以上)
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone [リポジトリURL]
cd calendar
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
`.env`ファイルを作成し、以下を設定：
```
VITE_OPENWEATHER_API_KEY=your_openweathermap_api_key
VITE_ENV=development
```

4. 開発サーバーを起動
```bash
npm run dev
```

## 🔧 主要機能

### 1. 天気情報取得
- 位置情報APIで現在地を取得
- OpenWeatherMap APIで詳細な天気情報を取得
- APIが利用できない場合は季節に応じたモックデータを使用

### 2. AI料理推薦システム
- 今日の旬の食材を日付ベースで安定選択
- 天気・温度・湿度・時間帯を考慮した重み付け
- Groq AIによる自然言語での料理提案

### 3. レスポンシブUI
- モバイルファースト設計
- ガラスモーフィズムデザイン
- 直感的なカード型レイアウト

## 🎯 使用方法

1. アプリを開くと自動的に位置情報と天気を取得
2. 今日の旬食材から1つを自動選択
3. AIが天気と食材に基づいて料理を推薦
4. 推薦カードをクリックでクックパッドのレシピページへ移動

## 🔑 API設定

### OpenWeatherMap API
1. [OpenWeatherMap](https://openweathermap.org/api)でアカウント作成
2. APIキーを取得
3. `.env`の`VITE_OPENWEATHER_API_KEY`に設定

### Groq AI API
現在はハードコードされたAPIキーを使用していますが、本番環境では環境変数での管理を推奨します。

## 📊 データ構造

### 旬の食材データ (`data.js`)
```javascript
export const foodData = {
  fish: {
    1: ['鰤（ぶり）', '鱈（たら）', ...], // 1月の旬の魚
    // ... 12ヶ月分
  },
  vegetable: {
    1: ['白菜', '大根', ...], // 1月の旬の野菜
    // ... 12ヶ月分
  }
};
```

## 🐛 トラブルシューティング

### よくある問題

1. **位置情報が取得できない**
   - ブラウザの位置情報許可を確認
   - HTTPSでのアクセスが必要（localhostは除く）

2. **天気情報が表示されない**
   - OpenWeatherMap APIキーの設定を確認
   - APIの利用制限を確認

3. **AI推薦が機能しない**
   - ネットワーク接続を確認
   - Groq APIの利用状況を確認

## 🚀 デプロイ

### Vercel
```bash
npm run build
# VercelなどのホスティングサービスでViteプロジェクトとしてデプロイ
```

### 環境変数の設定
本番環境では以下の環境変数を設定：
- `VITE_OPENWEATHER_API_KEY`

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📝 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照

## 🙏 謝辞

- [OpenWeatherMap](https://openweathermap.org/) - 天気情報API
- [Groq](https://groq.com/) - AI推薦システム
- [クックパッド](https://cookpad.com/) - レシピ検索連携

---

**作成日**: 2025年5月24日  
**最終更新**: 2025年5月24日
