# 🤖 無料LLM API比較 - 料理提案用途

## 🆓 主要な無料LLM APIサービス

### 1. **Hugging Face Inference API** ⭐⭐⭐⭐⭐
```javascript
// 設定例
const HUGGINGFACE_API = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";
const HF_TOKEN = "your_huggingface_token"; // 無料アカウントで取得

const getHuggingFaceRecommendation = async (prompt) => {
  const response = await fetch(HUGGINGFACE_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_length: 100,
        temperature: 0.7
      }
    })
  });
  return await response.json();
};
```

**特徴**:
- ✅ 完全無料（レート制限あり）
- ✅ 日本語対応モデルあり
- ✅ 簡単なセットアップ
- ❌ レスポンス速度やや遅い

---

### 2. **Cohere API** ⭐⭐⭐⭐
```javascript
// 設定例
const COHERE_API = "https://api.cohere.ai/v1/generate";
const COHERE_TOKEN = "your_cohere_token"; // 無料枠: 月100回

const getCohereRecommendation = async (prompt) => {
  const response = await fetch(COHERE_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${COHERE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: 50,
      temperature: 0.5
    })
  });
  return await response.json();
};
```

**特徴**:
- ✅ 高品質な出力
- ✅ 月100回無料
- ❌ 日本語やや弱い
- ❌ 回数制限が厳しい

---

### 3. **Groq API (Llama 3)** ⭐⭐⭐⭐⭐
```javascript
// 設定例
const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_TOKEN = "your_groq_token"; // 無料枠: 日6000回

const getGroqRecommendation = async (prompt) => {
  const response = await fetch(GROQ_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    })
  });
  return await response.json();
};
```

**特徴**:
- ✅ 非常に高速
- ✅ 日6000回無料
- ✅ 高品質な出力
- ⚠️ 日本語はやや限定的

---

### 4. **Google Gemini API** ⭐⭐⭐⭐
```javascript
// 設定例
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const GEMINI_KEY = "your_gemini_api_key"; // 月60回無料

const getGeminiRecommendation = async (prompt) => {
  const response = await fetch(`${GEMINI_API}?key=${GEMINI_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7
      }
    })
  });
  return await response.json();
};
```

**特徴**:
- ✅ 優秀な日本語対応
- ✅ 高品質な出力
- ❌ 月60回と制限が厳しい

---

## 🏆 推奨ランキング（料理提案用途）

### 1位: **Groq (Llama 3)** 
- **理由**: 高速・大容量無料枠・安定性
- **用途**: リアルタイム料理提案

### 2位: **Hugging Face**
- **理由**: 完全無料・日本語対応
- **用途**: コスト重視・実験用途

### 3位: **Google Gemini**
- **理由**: 最高の日本語品質
- **用途**: 高品質が必要な場合

---

## 💡 実装例：料理提案システム

```javascript
// 統合された料理提案関数
const getLLMDishRecommendation = async (weatherData, seasonalDishes) => {
  const prompt = `
今日の天気: ${weatherData.condition}
気温: ${weatherData.temperature}℃
湿度: ${weatherData.humidity}%

以下の旬の料理から、天気と気温に最適な1つを選んで、理由と共に30文字以内で提案してください：
${seasonalDishes.join('、')}

形式: 「○○○（理由）」
`;

  try {
    // Groq APIを使用（最も安定）
    const recommendation = await getGroqRecommendation(prompt);
    return recommendation.choices[0].message.content;
  } catch (error) {
    console.log('LLM API失敗、既存アルゴリズムにフォールバック');
    // 既存のAIアルゴリズムをフォールバックとして使用
    return getAdvancedRecommendedDish(weatherData, seasonalDishes);
  }
};
```

---

## 📊 利用量試算

**月間1000回アクセスの場合**:
- Groq: 無料枠内 ✅
- Hugging Face: 無料枠内 ✅  
- Cohere: 有料必要 ❌
- Gemini: 有料必要 ❌

**推奨**: **Groq API**から開始し、制限に達したらHugging Faceに自動切り替え
