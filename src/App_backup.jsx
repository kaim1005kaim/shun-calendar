// 食材ベースのクックパッドURL生成関数import { useState, useEffect } from 'react'
import { foodData, monthNames, categoryNames } from './data.js'
import './index.css'

// クックパッドで料理が見つかるかチェックする関数
const checkCookpadRecipe = async (dishName, cookpadKeyword = null) => {
  try {
    // 最初のキーワードで検索
    const initialKeyword = cookpadKeyword || dishName;
    let searchUrl = `https://cookpad.com/search/${encodeURIComponent(initialKeyword)}`;
    
    // より広い検索範囲のフォールバックキーワードを生成
    const fallbackKeywords = generateFallbackKeywords(dishName);
    
    // 簡易的なチェック（実際のAPIアクセスではなく、キーワードの最適化を行う）
    console.log('🔍 クックパッド検索キーワード確認:', {
      初期キーワード: initialKeyword,
      フォールバックキーワード: fallbackKeywords
    });
    
    return {
      found: true,
      keyword: initialKeyword,
      fallbackKeywords: fallbackKeywords,
      url: searchUrl
    };
  } catch (error) {
    console.log('⚠️ クックパッド検索エラー:', error);
    return {
      found: false,
      keyword: dishName,
      fallbackKeywords: [],
      url: `https://cookpad.com/search/${encodeURIComponent(dishName)}`
    };
  }
};

// フォールバックキーワードを生成する関数（改善版）
const generateFallbackKeywords = (dishName) => {
  const keywords = [];
  
  // 料理名から検索しやすいキーワードを抽出
  if (dishName.includes('の')) {
    const parts = dishName.split('の');
    keywords.push(parts[0]); // メイン食材
    if (parts[1]) keywords.push(parts[1]); // 調理法
  }
  
  if (dishName.includes('と')) {
    const parts = dishName.split('と');
    keywords.push(parts[0]);
    if (parts[1]) keywords.push(parts[1]);
  }
  
  // 調理法キーワードの抽出（優先度順）
  const cookingMethods = ['スープ', '鍋', '焼き', '煮', '炒め', '揚げ', '蒸し', '茹で', '漬け', '和え', '刺身', 'サラダ'];
  cookingMethods.forEach(method => {
    if (dishName.includes(method)) {
      keywords.push(method);
    }
  });
  
  // 食材キーワードの抽出（より一般的な形を優先）
  const ingredients = [
    'じゃがいも',  // 新じゃがいもよりも一般的
    'アスパラ', 'アスパラガス', 
    'トマト', 'なす', 'きゅうり', 'ピーマン', 'オクラ', '枝豆', 'とうもろこし', 
    '玉ねぎ', '人参', 'ごぼう', 'れんこん', 'ほうれん草', '小松菜', 'ネギ',
    '鰤', '鱈', '鮭', '鯖', '鰻', '大根', '白菜', 'かぼちゃ', 'さつまいも', 'きのこ'
  ];
  
  ingredients.forEach(ingredient => {
    if (dishName.includes(ingredient)) {
      keywords.push(ingredient);
    }
  });
  
  // 重複を除去し、短い順にソート（より一般的なキーワードを優先）
  const uniqueKeywords = [...new Set(keywords)];
  uniqueKeywords.sort((a, b) => a.length - b.length);
  
  // 最大3つのキーワードに絞る（検索効率向上）
  return uniqueKeywords.slice(0, 3);
};

// レコメンデーションカードコンポーネント（食材ベース）
const RecommendationCard = ({ dishName, ingredient, aiDetails }) => {
  const [cookpadUrl, setCookpadUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);
  
  useEffect(() => {
    const getCookpadUrl = async () => {
      try {
        setIsLoadingUrl(true);
        // 食材名をベースにしたクックパッド検索URLを生成
        const searchKeyword = ingredient?.name || dishName;
        const url = await generateIngredientCookpadUrl(searchKeyword);
        setCookpadUrl(url);
      } catch (error) {
        console.log('⚠️ URL生成エラー:', error);
        // フォールバック処理
        const fallbackKeyword = ingredient?.name || dishName;
        const fallbackUrl = `https://cookpad.com/search/${encodeURIComponent(fallbackKeyword)}`;
        setCookpadUrl(fallbackUrl);
      } finally {
        setIsLoadingUrl(false);
      }
    };
    
    if (dishName || ingredient) {
      getCookpadUrl();
    }
  }, [dishName, ingredient]);
  
  return (
    <div className="recommendation-card">
      <a 
        href={cookpadUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="recommendation-link"
      >
        <div className="recommendation-content">
          <div className="recommendation-thumbnail">
            {ingredient ? getThumbnail(ingredient.name, ingredient.category) : getThumbnail(dishName, 'dish')}
          </div>
          <div className="recommendation-info">
            {ingredient && (
              <div className="featured-ingredient">
                <span className="ingredient-label">今日の旬食材</span>
                <span className="ingredient-name">{ingredient.name}</span>
              </div>
            )}
            <h3 className="recommendation-dish">{dishName}</h3>
            {aiDetails && (
              <>
                <p className="recommendation-reason">
                  {aiDetails.reasoning}
                </p>
              </>
            )}
            <div className="recipe-link">
              {isLoadingUrl ? '🔄 レシピ検索中...' : `🔗 ${ingredient?.name || dishName}のレシピを見る`}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

// 今日の旬の食材を1つ選択する関数（日付ベースで安定選択）
const selectTodaysIngredient = (weatherData) => {
  const currentMonth = new Date().getMonth() + 1;
  const seasonalFish = foodData.fish[currentMonth] || [];
  const seasonalVegetables = foodData.vegetable[currentMonth] || [];
  const timeOfDay = getTimeOfDay();
  const feelsLike = weatherData.feelsLike || weatherData.temperature;
  
  // 全ての旬の食材をまとめる
  const allIngredients = [
    ...seasonalFish.map(item => ({ name: item, category: 'fish' })),
    ...seasonalVegetables.map(item => ({ name: item, category: 'vegetable' }))
  ];
  
  if (allIngredients.length === 0) {
    return null;
  }
  
  // 天気と気温に基づいて食材を重み付け
  const weightedIngredients = allIngredients.map(ingredient => {
    let score = 1;
    
    // 気温による重み付け
    if (feelsLike <= 15) {
      // 寒い時は温かい料理向きの食材を優先
      if (ingredient.category === 'fish') {
        if (ingredient.name.includes('鰤') || ingredient.name.includes('鱈') || 
            ingredient.name.includes('鮟鱇') || ingredient.name.includes('金目鯛')) {
          score += 2;
        }
      } else {
        if (ingredient.name.includes('大根') || ingredient.name.includes('白菜') || 
            ingredient.name.includes('ごぼう') || ingredient.name.includes('れんこん')) {
          score += 2;
        }
      }
    } else if (feelsLike >= 25) {
      // 暑い時はさっぱり系の食材を優先
      if (ingredient.category === 'fish') {
        if (ingredient.name.includes('鯵') || ingredient.name.includes('鯖') || 
            ingredient.name.includes('鮎') || ingredient.name.includes('鱧')) {
          score += 2;
        }
      } else {
        if (ingredient.name.includes('トマト') || ingredient.name.includes('きゅうり') || 
            ingredient.name.includes('なす') || ingredient.name.includes('オクラ')) {
          score += 2;
        }
      }
    }
    
    // 時間帯による重み付け
    if (timeOfDay === 'morning') {
      if (ingredient.category === 'vegetable') {
        score += 1; // 朝は野菜を優先
      }
    }
    
    return { ...ingredient, score };
  });
  
  // スコアでソート
  weightedIngredients.sort((a, b) => b.score - a.score);
  
  // 上位3つから日付ベースで安定選択
  const topIngredients = weightedIngredients.slice(0, 3);
  const seed = getDateSeed();
  const randomValue = seededRandom(seed);
  const selectedIndex = Math.floor(randomValue * topIngredients.length);
  
  return topIngredients[selectedIndex] || weightedIngredients[0]; // フォールバック
};

// 選択された食材を使った料理をAIが提案する関数
const getIngredientBasedRecommendation = async (ingredient, weatherData, location) => {
  const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
  const GROQ_TOKEN = "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";
  
  const currentTime = new Date();
  const timeOfDay = getTimeOfDay();
  const season = getCurrentSeason();
  
  const prompt = `あなたは家庭料理に詳しい親しみやすい料理の先生です。今日の天気と指定された旬の食材を使って、家庭で作りやすい美味しい料理を一品推薦してください。

——— 今日の情報 ———
日時: ${currentTime.toLocaleDateString('ja-JP')} (${timeOfDay === 'morning' ? '朝食時間' : timeOfDay === 'lunch' ? '昼食時間' : timeOfDay === 'dinner' ? '夕食時間' : '昼間'})
地域: ${location?.cityName || '東京'}
天気: ${weatherData.description} (${weatherData.condition})
気温: ${weatherData.temperature}℃
体感温度: ${weatherData.feelsLike}℃
湿度: ${weatherData.humidity}%
季節: ${season}

——— 今日の旬の食材 ———
【メイン食材】${ingredient.name}

——— ミッション ———
上記の「${ingredient.name}」をメインに使った、今日の天気・気温・時間帯に最適な家庭料理を推薦してください。

重要なポイント:
• ${ingredient.name}を必ずメインに使用する
• ${weatherData.temperature}℃の気温と${weatherData.condition}の天気にぴったり
• ${timeOfDay === 'dinner' ? '夕食' : timeOfDay === 'lunch' ? '昼食' : '朝食'}にふさわしい一品
• 家庭で作りやすい料理
• 一般的で親しみやすい料理名（詩的な表現は避ける）
• 家庭でよく作られる定番料理を優先
• 料理名の例：「${ingredient.name}の煮物」「${ingredient.name}の炒め物」「${ingredient.name}の味噌汁」など
• 食べたくなる魅力的で温かみのある推薦理由
• 親しみやすい優しい敬語で
• 必ず日本語で回答する

必ず以下のJSON形式で日本語回答してください：
{
  "dish": "推薦料理名（${ingredient.name}を使った一般的で親しみやすい名前・日本語）",
  "reason": "食べたくなる魅力的な推薦理由（60文字以内・優しい敬語・日本語）",
  "ingredient": "${ingredient.name}"
}`;

  console.log('📝 食材ベース推薦プロンプト:', prompt);

  try {
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
            role: "system",
            content: "あなたは温かみのある親しみやすい家庭料理の先生です。指定された旬の食材をメインに使った、一般的で作りやすい美味しい料理を、食べたくなるような魅力的で優しい敬語で推薦してください。必ず日本語でJSON形式で回答し、英語は一切使わないでください。料理名は一般的で親しみやすい名前で、詩的な表現や過度におしゃれな表現は避けてください。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });
    
    const responseText = await response.text();
    console.log('🔍 食材ベースAIレスポンス:', responseText);
    
    if (!response.ok) {
      throw new Error(`Groq APIエラー: ${response.status} - ${responseText}`);
    }
    
    const data = JSON.parse(responseText);
    const aiResponse = data.choices[0].message.content;
    
    // JSONレスポンスをパース
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        
        console.log('✅ 食材ベースAI推薦成功:', parsedResponse);
        return {
          dish: parsedResponse.dish,
          reasoning: parsedResponse.reason,
          ingredient: ingredient.name,
          ingredientCategory: ingredient.category,
          source: 'groq_ingredient',
          score: 0.95
        };
      } else {
        throw new Error('JSONフォーマットが見つかりません');
      }
    } catch (parseError) {
      console.log('😵 JSONパースエラー:', parseError);
      
      // フォールバック
      return {
        dish: `${ingredient.name}の煮物`,
        reasoning: `旬の${ingredient.name}を使った、体に優しい家庭料理です`,
        ingredient: ingredient.name,
        ingredientCategory: ingredient.category,
        source: 'fallback',
        score: 0.75
      };
    }
  } catch (error) {
    console.error('😱 食材ベースAI完全失敗:', error);
    return null;
  }
};
  const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
  const GROQ_TOKEN = "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";
  
  const currentTime = new Date();
  const timeOfDay = getTimeOfDay();
  const season = getCurrentSeason();
  const currentMonth = currentTime.getMonth() + 1;
  
  // 旬の食材を取得
  const seasonalFish = foodData.fish[currentMonth] || [];
  const seasonalVegetables = foodData.vegetable[currentMonth] || [];
  
  const prompt = `あなたは家庭料理に詳しい親しみやすい料理の先生です。今日の天気と旬の食材を使って、家庭で作りやすい美味しい料理を一品推薦してください。

——— 今日の情報 ———
日時: ${currentTime.toLocaleDateString('ja-JP')} (${timeOfDay === 'morning' ? '朝食時間' : timeOfDay === 'lunch' ? '昼食時間' : timeOfDay === 'dinner' ? '夕食時間' : '昼間'})
地域: ${location?.cityName || '東京'}
天気: ${weatherData.description} (${weatherData.condition})
気温: ${weatherData.temperature}℃
体感温度: ${weatherData.feelsLike}℃
湿度: ${weatherData.humidity}%
風速: ${weatherData.windSpeed?.toFixed(1) || 0} m/s
季節: ${season}

——— 今月の旬の食材 ———
【旬の魚】
${seasonalFish.join('、')}

【旬の野菜】
${seasonalVegetables.join('、')}

——— ミッション ———
上記の旬の食材を使って、今日の天気・気温・時間帯に最適な家庭料理を推薦してください。

重要なポイント:
• ${weatherData.temperature}℃の気温と${weatherData.condition}の天気にぴったり
• ${timeOfDay === 'dinner' ? '夕食' : timeOfDay === 'lunch' ? '昼食' : '朝食'}にふさわしい一品
• 旬の食材の美味しさを最大限に活かす
• 家庭で作りやすい料理
• 湿度${weatherData.humidity}%も考慮した調理法
• 一般的で親しみやすい料理名（詩的な表現は避ける）
• 家庭でよく作られる定番料理を優先
• 料理名の例：「新じゃがいもの煮物」「アスパラガスの胡麻和え」「大根と人参の味噴汁」など
• 避ける表現の例：「春の風の香り入り」「翔のような」「魅惑の」など
• 食べたくなる魅力的で温かみのある推薦理由
• 親しみやすい優しい敬語で
• 必ず日本語で回答する

必ず以下のJSON形式で日本語回答してください：
{
  "dish": "推薦料理名（一般的で親しみやすい名前・日本語）",
  "reason": "食べたくなる魅力的な推薦理由（60文字以内・優しい敬語・日本語）",
  "cookpadKeyword": "クックパッド検索キーワード（日本語）"
}`;

  console.log('📝 Groqに送信するプロンプト:', prompt);

  try {
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
            role: "system",
            content: "あなたは温かみのある親しみやすい家庭料理の先生です。季節・天気・時間に合わせた一般的で作りやすい美味しい料理を、食べたくなるような魅力的で優しい敬語で推薦してください。必ず日本語でJSON形式で回答し、英語は一切使わないでください。料理名は一般的で親しみやすい名前で、詩的な表現や過度におしゃれな表現は避けてください。推薦理由は食欲をそそる温かみのある表現で、親しみやすい敬語でお書きください。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });
    
    const responseText = await response.text();
    console.log('🔍 Groq APIレスポンスステータス:', response.status);
    console.log('💬 Groq APIレスポンス内容:', responseText);
    
    if (!response.ok) {
      throw new Error(`Groq APIエラー: ${response.status} - ${responseText}`);
    }
    
    const data = JSON.parse(responseText);
    const aiResponse = data.choices[0].message.content;
    
    console.log('🤖 AI的推薦レスポンス:', aiResponse);
    
    // JSONレスポンスをパース
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        
        console.log('✅ Groq AI推薦成功:', parsedResponse);
        return {
          dish: parsedResponse.dish,
          reasoning: parsedResponse.reason,
          cookpadKeyword: parsedResponse.cookpadKeyword,
          source: 'groq',
          score: 0.95
        };
      } else {
        throw new Error('JSONフォーマットが見つかりません');
      }
    } catch (parseError) {
      console.log('😵 JSONパースエラー:', parseError);
      return {
        dish: '季節の家庭料理',
        reasoning: '今日の天気にぴったりな温かい一品です',
        cookpadKeyword: '家庭料理',
        source: 'groq_fallback',
        score: 0.75
      };
    }
  } catch (error) {
    console.error('😱 Groq API完全失敗:', error);
    return null;
  }
};

// 食材ベースのクックパッドURL生成関数
const generateIngredientCookpadUrl = async (ingredientName) => {
  try {
    // 食材名をクリーンアップ（括弧内の読み方を除去など）
    const cleanIngredient = ingredientName
      .replace(/（.*?）/g, '') // 括弧内の読み方を除去
      .replace(/[()]/g, '') // 英語括弧も除去
      .trim();
    
    console.log('🍳 食材ベースクックパッド検索:', {
      元の食材名: ingredientName,
      検索キーワード: cleanIngredient
    });
    
    return `https://cookpad.com/search/${encodeURIComponent(cleanIngredient)}`;
  } catch (error) {
    console.log('⚠️ 食材URL生成エラー:', error);
    return `https://cookpad.com/search/${encodeURIComponent(ingredientName)}`;
  }
};

// クックパッドのURLを生成する関数（AI推薦用・改善版）
const generateCookpadUrl = async (dishName, cookpadKeyword = null) => {
  try {
    // クックパッド検索の確認とフォールバックキーワード生成
    const cookpadCheck = await checkCookpadRecipe(dishName, cookpadKeyword);
    
    // フォールバック処理：スペース区切りAND検索を優先
    const fallbackKeywords = cookpadCheck.fallbackKeywords;
    
    if (fallbackKeywords.length > 0) {
      // キーワードをスペースで区切ってAND検索
      const searchQuery = fallbackKeywords.join(' ');
      console.log('✅ クックパッド検索URL生成（AND検索）:', {
        料理名: dishName,
        分解キーワード: fallbackKeywords,
        検索クエリ: searchQuery
      });
      return `https://cookpad.com/search/${encodeURIComponent(searchQuery)}`;
    } else {
      // 基本のキーワードを使用
      const basicKeyword = cookpadKeyword || dishName
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/の/g, ' ')
        .replace(/と/g, ' ')
        .trim();
      
      console.log('🔄 基本キーワードでクックパッド検索:', basicKeyword);
      return `https://cookpad.com/search/${encodeURIComponent(basicKeyword)}`;
    }
  } catch (error) {
    console.log('⚠️ クックパッドURL生成エラー、デフォルト処理:', error);
    const defaultKeyword = dishName
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/の/g, ' ')
      .replace(/と/g, ' ')
      .trim();
    return `https://cookpad.com/search/${encodeURIComponent(defaultKeyword)}`;
  }
};

// 実際のOpenWeatherMap APIを使用した天気情報取得
const getWeatherInfo = async (lat, lon) => {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      console.log('APIキーが設定されていません。モックデータを使用します。');
      return getMockWeatherData();
    }
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`
    );
    
    if (!response.ok) {
      throw new Error(`APIエラー: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      cloudiness: data.clouds?.all || 0,
      visibility: data.visibility || 10000,
      uvIndex: data.uvi || null,
      cityName: data.name,
      country: data.sys.country,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      isMockData: false
    };
  } catch (error) {
    console.log('天気情報の取得に失敗しました。モックデータを使用します。', error);
    return getMockWeatherData();
  }
};

// モックデータ生成関数
const getMockWeatherData = () => {
  const hour = new Date().getHours();
  const season = getCurrentSeason();
  const month = new Date().getMonth() + 1;
  
  let mockTemp, mockFeelsLike, mockCondition, mockHumidity;
  
  // 季節と時刻に基づいたリアルなモックデータ
  if (season === 'winter') {
    mockTemp = hour < 6 || hour > 18 ? 
      Math.random() * 8 - 2 :  // -2から8℃
      Math.random() * 12 + 2;  // 2から14℃
    mockCondition = Math.random() > 0.6 ? '曇り' : '晴れ';
    mockHumidity = 50 + Math.random() * 20; // 50-70%
  } else if (season === 'summer') {
    mockTemp = hour < 6 || hour > 18 ? 
      Math.random() * 10 + 20 : // 20-30℃ 
      Math.random() * 15 + 25;  // 25-40℃
    mockCondition = hour > 12 && hour < 16 && Math.random() > 0.7 ? '雨' : '晴れ';
    mockHumidity = 60 + Math.random() * 30; // 60-90%
  } else {
    mockTemp = hour < 6 || hour > 18 ? 
      Math.random() * 10 + 8 :  // 8-18℃
      Math.random() * 12 + 12; // 12-24℃ 
    mockCondition = Math.random() > 0.7 ? '曇り' : '晴れ';
    mockHumidity = 55 + Math.random() * 25; // 55-80%
  }
  
  mockFeelsLike = mockTemp + (Math.random() - 0.5) * 4; // 体感温度
  
  return {
    temperature: Math.round(mockTemp),
    feelsLike: Math.round(mockFeelsLike),
    humidity: Math.round(mockHumidity),
    pressure: 1013 + Math.random() * 20 - 10,
    windSpeed: Math.random() * 5,
    windDirection: Math.random() * 360,
    condition: mockCondition,
    description: mockCondition === '晴れ' ? '清々しい一日' : '曇り空',
    icon: mockCondition === '晴れ' ? '01d' : '03d',
    cloudiness: mockCondition === '晴れ' ? 20 : 70,
    visibility: 10000,
    uvIndex: season === 'summer' ? 8 : 4,
    cityName: '東京',
    country: 'JP',
    sunrise: new Date(),
    sunset: new Date(),
    isMockData: true
  };
};

// 日付ベースの安定した料理選択
const getDateSeed = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year * 10000 + month * 100 + day;
};

// シード値を基にした擬似ランダム関数
const seededRandom = (seed) => {
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);
  return ((a * seed + c) % m) / m;
};

// 日付が変わったかチェック（メモリベース）
let lastRecommendationDate = null;
const hasDateChanged = () => {
  const today = new Date().toDateString();
  
  if (lastRecommendationDate !== today) {
    lastRecommendationDate = today;
    return true;
  }
  return false;
};

// 現在の季節を取得
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

// 体感温度を計算（風速と湿度を考慮）
const calculateFeelsLikeTemperature = (temp, humidity, windSpeed) => {
  // 簡単化した体感温度計算
  let feelsLike = temp;
  
  // 湿度の影響（暑い時は湿度が高いとより暑く感じる）
  if (temp > 25) {
    feelsLike += (humidity - 50) * 0.1;
  }
  
  // 風速の影響（風が強いと涼しく感じる）
  feelsLike -= windSpeed * 0.5;
  
  return feelsLike;
};

// 時闓帯を取得
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 18) return 'afternoon';
  return 'dinner';
};

// 料理の時闓スコアを計算
const getTimeScore = (dish, timeOfDay) => {
  const timeScores = {
    morning: {
      '粥': 0.9, '雑煮': 0.8, 'サラダ': 0.7, '卵': 0.8
    },
    lunch: {
      'ご飯': 0.9, '焼き': 0.8, 'どんぶり': 0.8, 'そば': 0.7
    },
    afternoon: {
      '甘い': 0.6, 'おやつ': 0.5
    },
    dinner: {
      '鍋': 0.9, '煮物': 0.8, '焼き': 0.8, '重': 0.7
    }
  };
  
  const scores = timeScores[timeOfDay] || {};
  
  for (const [keyword, score] of Object.entries(scores)) {
    if (dish.includes(keyword)) {
      return score;
    }
  }
  
  return 0.5; // デフォルトスコア
};

// 季節スコアを計算
const getSeasonScore = (dish, season) => {
  const seasonKeywords = {
    spring: ['新', '若', '春', '菜の花', '筍', 'そらまめ'],
    summer: ['冷', '野菜', 'サラダ', 'そうめん', 'ゴーヤ', 'トマト'],
    autumn: ['栗', 'きのこ', 'さつまいも', '秋刀魚', '里芋'],
    winter: ['鍋', '汁', '煮', '蒸し', 'おでん', '雑煮', '温']
  };
  
  const keywords = seasonKeywords[season] || [];
  
  for (const keyword of keywords) {
    if (dish.includes(keyword)) {
      return 0.9;
    }
  }
  
  return 0.6;
};

// 強化版アルゴリズム: 日付ベースで安定した総合スコアで料理を選択
const getAdvancedRecommendedDish = (weatherData, seasonalDishes) => {
  const timeOfDay = getTimeOfDay();
  const season = getCurrentSeason();
  const feelsLike = weatherData.feelsLike || 
    calculateFeelsLikeTemperature(weatherData.temperature, weatherData.humidity, weatherData.windSpeed);
  
  // 各料理にスコアを付ける
  const dishScores = seasonalDishes.map(dish => {
    let totalScore = 0;
    
    // 1. 気温スコア (40%)
    const temperatureScore = getTemperatureScore(dish, feelsLike);
    totalScore += temperatureScore * 0.4;
    
    // 2. 季節スコア (25%)
    const seasonScore = getSeasonScore(dish, season);
    totalScore += seasonScore * 0.25;
    
    // 3. 時闓スコア (20%)
    const timeScore = getTimeScore(dish, timeOfDay);
    totalScore += timeScore * 0.2;
    
    // 4. 天気スコア (10%)
    const weatherScore = getWeatherScore(dish, weatherData);
    totalScore += weatherScore * 0.1;
    
    // 5. 湿度スコア (5%)
    const humidityScore = getHumidityScore(dish, weatherData.humidity);
    totalScore += humidityScore * 0.05;
    
    return {
      dish,
      score: totalScore,
      breakdown: {
        temperature: temperatureScore,
        season: seasonScore,
        time: timeScore,
        weather: weatherScore,
        humidity: humidityScore
      }
    };
  });
  
  // スコアでソート
  dishScores.sort((a, b) => b.score - a.score);
  
  // 上位3位から日付ベースで安定選択
  const topDishes = dishScores.slice(0, 3);
  const seed = getDateSeed();
  const randomValue = seededRandom(seed);
  const selectedIndex = Math.floor(randomValue * topDishes.length);
  const selectedDish = topDishes[selectedIndex];
  
  console.log('🤖 AIレコメンデーションシステム', {
    選択された料理: selectedDish.dish,
    総合スコア: selectedDish.score.toFixed(3),
    スコア内訳: selectedDish.breakdown,
    現在の時刻: timeOfDay,
    体感温度: feelsLike + '℃',
    季節: season,
    日付シード: seed
  });
  
  return {
    dish: selectedDish.dish,
    score: selectedDish.score,
    reasoning: generateReasoning(selectedDish, weatherData, timeOfDay)
  };
};

// 気温スコアを計算
const getTemperatureScore = (dish, feelsLike) => {
  // 極寒 (-5℃以下)
  if (feelsLike <= -5) {
    if (dish.includes('鍋') || dish.includes('汁') || dish.includes('蒸し')) return 1.0;
    if (dish.includes('煮') || dish.includes('雑煮')) return 0.9;
    if (dish.includes('焼き')) return 0.6;
    return 0.3;
  }
  // 寒い (5℃以下)
  else if (feelsLike <= 5) {
    if (dish.includes('鍋') || dish.includes('汁')) return 0.95;
    if (dish.includes('煮') || dish.includes('蒸し')) return 0.9;
    if (dish.includes('焼き') || dish.includes('炒め')) return 0.7;
    return 0.4;
  }
  // 涼しい (15℃以下)
  else if (feelsLike <= 15) {
    if (dish.includes('焼き') || dish.includes('炒め')) return 0.9;
    if (dish.includes('煮') || dish.includes('ご飯')) return 0.8;
    if (dish.includes('鍋') || dish.includes('汁')) return 0.7;
    if (dish.includes('冷')) return 0.4;
    return 0.7;
  }
  // 温暖 (25℃以下)
  else if (feelsLike <= 25) {
    if (dish.includes('焼き') || dish.includes('炒め') || dish.includes('ご飯')) return 0.9;
    if (dish.includes('天ぷら') || dish.includes('たたき')) return 0.8;
    if (dish.includes('サラダ') || dish.includes('酢の物')) return 0.7;
    if (dish.includes('冷')) return 0.6;
    return 0.6;
  }
  // 暑い (35℃以下)
  else if (feelsLike <= 35) {
    if (dish.includes('冷') || dish.includes('酢の物') || dish.includes('サラダ')) return 1.0;
    if (dish.includes('そうめん') || dish.includes('刺身')) return 0.9;
    if (dish.includes('ゴーヤ') || dish.includes('きゅうり')) return 0.8;
    if (dish.includes('鍋') || dish.includes('汁')) return 0.1;
    return 0.5;
  }
  // 猶暑 (35℃以上)
  else {
    if (dish.includes('冷') || dish.includes('氷')) return 1.0;
    if (dish.includes('酢の物') || dish.includes('そうめん')) return 0.9;
    if (dish.includes('サラダ') || dish.includes('刺身')) return 0.8;
    if (dish.includes('鍋') || dish.includes('汁') || dish.includes('蒸し')) return 0.05;
    return 0.4;
  }
};

// 天気スコアを計算
const getWeatherScore = (dish, weatherData) => {
  const condition = weatherData.condition;
  const cloudiness = weatherData.cloudiness || 0;
  
  // 雨の日
  if (condition.includes('雨') || condition.includes('Rain')) {
    if (dish.includes('鍋') || dish.includes('汁') || dish.includes('蒸し')) return 1.0;
    if (dish.includes('煮') || dish.includes('温')) return 0.9;
    if (dish.includes('冷') || dish.includes('サラダ')) return 0.3;
    return 0.7;
  }
  // 曇りの日
  else if (condition.includes('曇') || condition.includes('Cloud') || cloudiness > 70) {
    if (dish.includes('焼き') || dish.includes('炒め')) return 0.8;
    if (dish.includes('煮') || dish.includes('ご飯')) return 0.8;
    return 0.7;
  }
  // 晴れの日
  else {
    if (dish.includes('サラダ') || dish.includes('酢の物')) return 0.9;
    if (dish.includes('天ぷら') || dish.includes('焼き')) return 0.8;
    return 0.7;
  }
};

// 湿度スコアを計算
const getHumidityScore = (dish, humidity) => {
  // 高湿度 (70%以上)
  if (humidity >= 70) {
    if (dish.includes('冷') || dish.includes('酢の物') || dish.includes('サラダ')) return 0.9;
    if (dish.includes('あっさり') || dish.includes('さっぱり')) return 0.8;
    if (dish.includes('鍋') || dish.includes('汁')) return 0.4;
    return 0.6;
  }
  // 低湿度 (30%以下)
  else if (humidity <= 30) {
    if (dish.includes('汁') || dish.includes('鍋') || dish.includes('蒸し')) return 0.9;
    if (dish.includes('煮') || dish.includes('湯')) return 0.8;
    return 0.6;
  }
  // 適度な湿度
  else {
    return 0.7;
  }
};

// 推薦理由を生成（魅力的で親しみやすい文章に改善）
const generateReasoning = (selectedDish, weatherData, timeOfDay) => {
  const reasons = [];
  const feelsLike = weatherData.feelsLike || weatherData.temperature;
  
  // 気温による理由（より魅力的に）
  if (feelsLike <= 5) {
    const warmReasons = [
      '寒い日にはほっこり温まる一品がいちばんですね',
      '体の芯から温まって、心もほっとするお料理です',
      '冷えた体にじんわり染み渡る温かさが嬉しいですね'
    ];
    reasons.push(warmReasons[Math.floor(Math.random() * warmReasons.length)]);
  } else if (feelsLike >= 28) {
    const coolReasons = [
      '暑い日にはさっぱりと食べられるのが何よりですね',
      '食欲が落ちがちな暑さでも、これなら美味しくいただけます',
      '暑さを忘れるような爽やかな一品で気分もリフレッシュ'
    ];
    reasons.push(coolReasons[Math.floor(Math.random() * coolReasons.length)]);
  } else {
    const mildReasons = [
      '過ごしやすい気候に合う、バランスの取れた優しいお味です',
      'こんな日には、体に優しくて美味しい料理がぴったりですね',
      '穏やかな気候を楽しみながら、ゆっくり味わえる一品です'
    ];
    reasons.push(mildReasons[Math.floor(Math.random() * mildReasons.length)]);
  }
  
  // 時間帯による理由（より親しみやすく）
  if (timeOfDay === 'morning') {
    const morningReasons = [
      '朝の元気な一日のスタートにぴったりです',
      '体に優しくて、朝から幸せな気分になれますね'
    ];
    reasons.push(morningReasons[Math.floor(Math.random() * morningReasons.length)]);
  } else if (timeOfDay === 'dinner') {
    const dinnerReasons = [
      '一日お疲れさまでした。ゆっくりお楽しみください',
      '今日の締めくくりに、心温まる一品はいかがでしょう'
    ];
    reasons.push(dinnerReasons[Math.floor(Math.random() * dinnerReasons.length)]);
  }
  
  return reasons.join('♪ ') + '🍴✨';
};

// 食材のサムネイル絵文字を取得する関数
const getThumbnail = (item, category) => {
  const thumbnails = {
    dish: {
      'おでん': '🍢', '鍋料理': '🍲', '湯豆腐': '🍲', '粕汁': '🍲', '雑煮': '🍜', '七草粥': '🍚',
      '鰤大根': '🐟', '蒸し牡蠣': '🦪', '河豚ちり': '🐡', '金目鯛の煮付け': '🐟',
      '恵方巻': '🍣', 'ちらし寿司': '🍣', '鰤の照り焼き': '🐟', '牡蠣フライ': '🦪',
      '筍ご飯': '🍚', '桜餅': '🌸', '蛤のお吸い物': '🍲', '菜の花のおひたし': '🥬',
      '山菜の天ぷら': '🍤', 'そらまめご飯': '🍚', '鰆の塩焼き': '🐟', '初鰹のたたき': '🐟',
      '鮎の塩焼き': '🐟', '鱧の湯引き': '🐟', '冷奴': '🧊', '冷やし中華': '🍜',
      'きゅうりの酢の物': '🥒', 'トマトサラダ': '🍅', '枝豆': '🫛', 'とうもろこしご飯': '🌽',
      'アスパラガスとベーコンの炒め物': '🥓', '新たまねぎのサラダ': '🧅', '新じゃがの味噌汁': '🍲', 
      'アスパラガスの胡麻和え': '🥒', '鰹の刺身': '🐟', '鰎の天ぷら': '🍤',
      '鰻の蒲焼き': '🐟', '冷やしそうめん': '🍜', 'ゴーヤチャンプルー': '🥬',
      '秋刀魚の塩焼き': '🐟', '戻り鰹のたたき': '🐟', '栗ご飯': '🌰', 'きのこご飯': '🍄',
      'さつまいもの天ぷら': '🍠', '里芋の煮っころがし': '🥔', 'かぼちゃの煮物': '🎃',
      '松茸の土瓶蒸し': '🍄', '鮭のちゃんちゃん焼き': '🐟', 'なすの味噌炒め': '🍆',
      '鮭の塩焼き': '🐟', '鰯の梅煮': '🐟', '牡蠣鍋': '🦪', '年越しそば': '🍜'
    },
    fish: {
      '鰤（ぶり）': '🐟', '鱈（たら）': '🐟', '牡蠣（かき）': '🦪', '河豚（ふぐ）': '🐡',
      '鮟鱇（あんこう）': '🐟', '金目鯛（きんめだい）': '🐟', 'ヒラメ': '🐟', 'ハマチ': '🐟',
      'マグロ': '🐟', '甘海老': '🦐', '真鯛（まだい）': '🐟', '桜鯛（さくらだい）': '🐟',
      '蛤（はまぐり）': '🐚', '白魚（しらうお）': '🐟', '鰆（さわら）': '🐟', 'メバル': '🐟',
      'カレイ': '🐟', 'スズキ': '🐟', 'ひじき': '🌿', '初鰹（はつがつお）': '🐟',
      '鯵（あじ）': '🐟', 'アサリ': '🐚', '鰈（かれい）': '🐟', '鱚（きす）': '🐟',
      '鮎（あゆ）': '🐟', 'カンパチ': '🐟', 'ホタテ': '🐚', 'イサキ': '🐟',
      '太刀魚（たちうお）': '🐟', '鱧（はも）': '🐟', '鰻（うなぎ）': '🐟', 'アナゴ': '🐟',
      'イワシ': '🐟', 'キス': '🐟', '穴子（あなご）': '🐟', '鯖（さば）': '🐟',
      'アジ': '🐟', '蛸（たこ）': '🐙', '鮪（まぐろ）': '🐟', '鯛（たい）': '🐟',
      'カマス': '🐟', '秋刀魚（さんま）': '🐟', '戻り鰹（もどりがつお）': '🐟',
      '鮭（さけ）': '🐟', 'ハゼ': '🐟', '鰯（いわし）': '🐟', 'サンマ': '🐟',
      'ししゃも': '🐟', 'ハタハタ': '🐟', 'スルメイカ': '🦑', 'ズワイガニ': '🦀',
      'ホタルイカ': '🦑', 'ワカサギ': '🐟', 'ヤリイカ': '🦑'
    },
    vegetable: {
      '白菜': '🥬', '大根': '🥕', '人参': '🥕', 'ごぼう': '🪴', 'れんこん': '🪴',
      '春菊': '🥬', 'ほうれん草': '🥬', '小松菜': '🥬', 'ネギ': '🌿', '水菜': '🥬',
      'カブ': '🪴', 'セリ': '🌿', 'ブロッコリー': '🥦', 'カリフラワー': '🥦',
      'キャベツ': '🥬', '菜の花': '🌼', '春キャベツ': '🥬', '新玉ねぎ': '🧅',
      'ふき': '🌿', 'たらの芽': '🌿', 'わらび': '🌿', '筍（たけのこ）': '🎋',
      'そらまめ': '🫛', '新じゃがいも': '🥔', 'アスパラガス': '🥒', '三つ葉': '🌿',
      '新人参': '🥕', 'レタス': '🥬', 'セロリ': '🥬', '山菜': '🌿',
      'スナップエンドウ': '🫛', 'グリーンピース': '🫛', '新ごぼう': '🪴',
      'きゅうり': '🥒', 'トマト': '🍅', 'なす': '🍆', 'ピーマン': '🌶️',
      'いんげん': '🫛', 'オクラ': '🌿', 'ズッキーニ': '🥒', '枝豆': '🫛',
      'とうもろこし': '🌽', '新生姜': '🫚', 'らっきょう': '🧅', 'みょうが': '🌿',
      'かぼちゃ': '🎃', 'ゴーヤ': '🥒', 'シソ': '🌿', '冬瓜': '🥒',
      'さつまいも': '🍠', '里芋': '🥔', '栗': '🌰', 'きのこ類': '🍄',
      '新米': '🌾', 'チンゲン菜': '🥬', '長ネギ': '🌿', '生姜': '🫚',
      'ナス': '🍆', '柿': '🟠'
    }
  };
  
  return thumbnails[category]?.[item] || (category === 'dish' ? '🍽️' : category === 'fish' ? '🐟' : '🥬');
};

function App() {
  const today = new Date()
  const currentMonth = today.getMonth() + 1 // 1-12の月
  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState(null)
  const [recommendedDish, setRecommendedDish] = useState(null)
  const [selectedIngredient, setSelectedIngredient] = useState(null) // 新しい状態：選択された食材
  const [loading, setLoading] = useState(true)
  const [aiDetails, setAiDetails] = useState(null)
  
  useEffect(() => {
    // 位置情報と天気を取得し、新しいUXで食材ベース推薦を実行
    const getLocationAndWeather = async () => {
      try {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              setLocation({ lat: latitude, lon: longitude })
              
              const weatherInfo = await getWeatherInfo(latitude, longitude)
              setWeather(weatherInfo)
              
              // 🎆 新しいUX: 食材ベースの推薦システム
              await processIngredientBasedRecommendation(weatherInfo, { lat: latitude, lon: longitude, cityName: weatherInfo.cityName })
              
              setLoading(false)
            },
            async (error) => {
              console.log('位置情報の取得に失敗しました。デフォルト情報を使用します。')
              const defaultWeather = getMockWeatherData()
              setWeather(defaultWeather)
              
              // デフォルト位置での食材ベース推薦
              await processIngredientBasedRecommendation(defaultWeather, { cityName: '東京' })
              
              setLoading(false)
            }
          )
        } else {
          // Geolocationが利用できない場合
          const defaultWeather = getMockWeatherData()
          setWeather(defaultWeather)
          
          // デフォルト位置での食材ベース推薦
          await processIngredientBasedRecommendation(defaultWeather, { cityName: '東京' })
          
          setLoading(false)
        }
      } catch (error) {
        console.error('初期化エラー:', error)
        setLoading(false)
      }
    }
    
    // 食材ベースの推薦処理関数
    const processIngredientBasedRecommendation = async (weatherInfo, locationInfo) => {
      try {
        console.log('🌿 新しいUX: 食材ベースの推薦システムを開始')
        
        // ステップ1: 今日の旬の食材を1つ選択
        const todayIngredient = selectTodaysIngredient(weatherInfo)
        if (!todayIngredient) {
          console.log('⚠️ 今日の旬の食材が見つかりません')
          return
        }
        
        console.log('🎯 今日の選択食材:', todayIngredient)
        setSelectedIngredient(todayIngredient)
        
        // ステップ2: 選択された食材を使った料理をAIが提案
        const ingredientRecommendation = await getIngredientBasedRecommendation(
          todayIngredient, 
          weatherInfo, 
          locationInfo
        )
        
        if (ingredientRecommendation) {
          console.log('✨ 食材ベースAI推薦成功:', ingredientRecommendation)
          setRecommendedDish(ingredientRecommendation.dish)
          setAiDetails({
            score: ingredientRecommendation.score,
            reasoning: ingredientRecommendation.reasoning,
            source: ingredientRecommendation.source,
            ingredient: todayIngredient.name,
            ingredientCategory: todayIngredient.category
          })
        } else {
          // フォールバック: 簡単な食材料理名生成
          const fallbackDish = `${todayIngredient.name}の煮物`
          console.log('🔄 フォールバック料理:', fallbackDish)
          setRecommendedDish(fallbackDish)
          setAiDetails({
            score: 0.7,
            reasoning: `旬の${todayIngredient.name}を使った、体に優しい家庭料理です`,
            source: 'fallback',
            ingredient: todayIngredient.name,
            ingredientCategory: todayIngredient.category
          })
        }
        
      } catch (error) {
        console.error('🚨 食材ベース推薦エラー:', error)
      }
    }
    
    getLocationAndWeather()
  }, [])
  
  // 日付をフォーマット
  const formatDate = (date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }
  
  // 天気アイコンを取得
  const getWeatherIcon = (condition) => {
    const icons = {
      '晴れ': '☀️',
      'Clear': '☀️',
      '曇り': '☁️',
      'Clouds': '☁️',
      '雨': '🌧️',
      'Rain': '🌧️',
      '雪': '❄️',
      'Snow': '❄️',
      '霧': '🌫️',
      'Mist': '🌫️'
    }
    return icons[condition] || '☀️'
  }

  // コンパクトな一覧表示用のレンダリング関数
  const renderCompactCategory = (category, title, icon) => {
    const items = foodData[category][currentMonth] || []
    
    return (
      <div className="compact-category">
        <h3 className="compact-title">
          <span className="compact-icon">{icon}</span>
          {title}
        </h3>
        <div className="compact-grid">
          {items.slice(0, 6).map((item, index) => (
            <div key={index} className="compact-item">
              <span className="compact-thumbnail">{getThumbnail(item, category)}</span>
              <span className="compact-name">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>今日の旬の情報を取得中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="today-header">
        <div className="date-section">
          <p className="today-date">{formatDate(today)}</p>
        </div>
        
        {weather && (
          <div className="weather-section">
            <div className="weather-info">
              <span className="weather-icon">{getWeatherIcon(weather.condition)}</span>
              <div className="weather-details">
                <span className="temperature">{weather.temperature}℃</span>
                <span className="condition">{weather.description}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {recommendedDish && (
        <div className="recommendation-section">
          <h2 className="recommendation-title">
            🍣 今日の旬おすすめ料理
          </h2>
          <RecommendationCard 
            dishName={recommendedDish}
            ingredient={selectedIngredient}
            aiDetails={aiDetails}
          />
          
          {weather && (
            <div className="weather-details-expanded">
              <h3>📊 今日の詳細天気</h3>
              <div className="weather-grid">
                <div className="weather-item">
                  <span className="weather-label">体感温度</span>
                  <span className="weather-value">{weather.feelsLike}℃</span>
                </div>
                <div className="weather-item">
                  <span className="weather-label">湿度</span>
                  <span className="weather-value">{weather.humidity}%</span>
                </div>
                <div className="weather-item">
                  <span className="weather-label">風速</span>
                  <span className="weather-value">{weather.windSpeed?.toFixed(1) || 0} m/s</span>
                </div>
                <div className="weather-item">
                  <span className="weather-label">雲量</span>
                  <span className="weather-value">{weather.cloudiness || 0}%</span>
                </div>
                {weather.cityName && (
                  <div className="weather-item">
                    <span className="weather-label">地域</span>
                    <span className="weather-value">{weather.cityName}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="today-content">
        <h2 className="section-title">
          🌿 {monthNames[currentMonth - 1]}の旬の食材
        </h2>
        
        <div className="compact-sections">
          {renderCompactCategory('fish', '旬の魚', '🐟')}
          {renderCompactCategory('vegetable', '旬の野菜', '🥬')}
        </div>
      </div>
    </div>
  );
}

export default App鰈（かれい）': '🐟', '鱚（きす）': '🐟',
      '鮎（あゆ）': '🐟', 'カンパチ': '🐟', 'ホタテ': '🐚', 'イサキ': '🐟',
      '太刀魚（たちうお）': '🐟', '鱧（はも）': '🐟', '鰻（うなぎ）': '🐟', 'アナゴ': '🐟',
      'イワシ': '🐟', 'キス': '🐟', '穴子（あなご）': '🐟', '鯖（さば）': '🐟',
      'アジ': '🐟', '蛸（たこ）': '🐙', '鮪（まぐろ）': '🐟', '鯛（たい）': '🐟',
      'カマス': '🐟', '秋刀魚（さんま）': '🐟', '戻り鰹（もどりがつお）': '🐟',
      '鮭（さけ）': '🐟', 'ハゼ': '🐟', '鰯（いわし）': '🐟', 'サンマ': '🐟',
      'ししゃも': '🐟', 'ハタハタ': '🐟', 'スルメイカ': '🦑', 'ズワイガニ': '🦀',
      'ホタルイカ': '🦑', 'ワカサギ': '🐟', 'ヤリイカ': '🦑'
    },
    vegetable: {
      '白菜': '🥬', '大根': '🥕', '人参': '🥕', 'ごぼう': '🪴', 'れんこん': '🪴',
      '春菊': '🥬', 'ほうれん草': '🥬', '小松菜': '🥬', 'ネギ': '🌿', '水菜': '🥬',
      'カブ': '🪴', 'セリ': '🌿', 'ブロッコリー': '🥦', 'カリフラワー': '🥦',
      'キャベツ': '🥬', '菜の花': '🌼', '春キャベツ': '🥬', '新玉ねぎ': '🧅',
      'ふき': '🌿', 'たらの芽': '🌿', 'わらび': '🌿', '筍（たけのこ）': '🎋',
      'そらまめ': '🫛', '新じゃがいも': '🥔', 'アスパラガス': '🥒', '三つ葉': '🌿',
      '新人参': '🥕', 'レタス': '🥬', 'セロリ': '🥬', '山菜': '🌿',
      'スナップエンドウ': '🫛', 'グリーンピース': '🫛', '新ごぼう': '🪴',
      'きゅうり': '🥒', 'トマト': '🍅', 'なす': '🍆', 'ピーマン': '🌶️',
      'いんげん': '🫛', 'オクラ': '🌿', 'ズッキーニ': '🥒', '枝豆': '🫛',
      'とうもろこし': '🌽', '新生姜': '🫚', 'らっきょう': '🧅', 'みょうが': '🌿',
      'かぼちゃ': '🎃', 'ゴーヤ': '🥒', 'シソ': '🌿', '冬瓜': '🥒',
      'さつまいも': '🍠', '里芋': '🥔', '栗': '🌰', 'きのこ類': '🍄',
      '新米': '🌾', 'チンゲン菜': '🥬', '長ネギ': '🌿', '生姜': '🫚',
      'ナス': '🍆', '柿': '🟠'
    }
  };
  
  return thumbnails[category]?.[item] || (category === 'dish' ? '🍽️' : category === 'fish' ? '🐟' : '🥬');
};

function App() {
  const today = new Date()
  const currentMonth = today.getMonth() + 1 // 1-12の月
  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState(null)
  const [recommendedDish, setRecommendedDish] = useState(null)
  const [selectedIngredient, setSelectedIngredient] = useState(null) // 新しい状態：選択された食材
  const [loading, setLoading] = useState(true)
  const [aiDetails, setAiDetails] = useState(null)
  
  useEffect(() => {
    // 位置情報と天気を取得し、新しいUXで食材ベース推薦を実行
    const getLocationAndWeather = async () => {
      try {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              setLocation({ lat: latitude, lon: longitude })
              
              const weatherInfo = await getWeatherInfo(latitude, longitude)
              setWeather(weatherInfo)
              
              // 🎆 新しいUX: 食材ベースの推薦システム
              await processIngredientBasedRecommendation(weatherInfo, { lat: latitude, lon: longitude, cityName: weatherInfo.cityName })
              
              setLoading(false)
            },
            async (error) => {
              console.log('位置情報の取得に失敗しました。デフォルト情報を使用します。')
              const defaultWeather = getMockWeatherData()
              setWeather(defaultWeather)
              
              // デフォルト位置での食材ベース推薦
              await processIngredientBasedRecommendation(defaultWeather, { cityName: '東京' })
              
              setLoading(false)
            }
          )
        } else {
          // Geolocationが利用できない場合
          const defaultWeather = getMockWeatherData()
          setWeather(defaultWeather)
          
          // デフォルト位置での食材ベース推薦
          await processIngredientBasedRecommendation(defaultWeather, { cityName: '東京' })
          
          setLoading(false)
        }
      } catch (error) {
        console.error('初期化エラー:', error)
        setLoading(false)
      }
    }
    
    // 食材ベースの推薦処理関数
    const processIngredientBasedRecommendation = async (weatherInfo, locationInfo) => {
      try {
        console.log('🌿 新しいUX: 食材ベースの推薦システムを開始')
        
        // ステップ1: 今日の旬の食材を1つ選択
        const todayIngredient = selectTodaysIngredient(weatherInfo)
        if (!todayIngredient) {
          console.log('⚠️ 今日の旬の食材が見つかりません')
          return
        }
        
        console.log('🎯 今日の選択食材:', todayIngredient)
        setSelectedIngredient(todayIngredient)
        
        // ステップ2: 選択された食材を使った料理をAIが提案
        const ingredientRecommendation = await getIngredientBasedRecommendation(
          todayIngredient, 
          weatherInfo, 
          locationInfo
        )
        
        if (ingredientRecommendation) {
          console.log('✨ 食材ベースAI推薦成功:', ingredientRecommendation)
          setRecommendedDish(ingredientRecommendation.dish)
          setAiDetails({
            score: ingredientRecommendation.score,
            reasoning: ingredientRecommendation.reasoning,
            source: ingredientRecommendation.source,
            ingredient: todayIngredient.name,
            ingredientCategory: todayIngredient.category
          })
        } else {
          // フォールバック: 簡単な食材料理名生成
          const fallbackDish = `${todayIngredient.name}の煮物`
          console.log('🔄 フォールバック料理:', fallbackDish)
          setRecommendedDish(fallbackDish)
          setAiDetails({
            score: 0.7,
            reasoning: `旬の${todayIngredient.name}を使った、体に優しい家庭料理です`,
            source: 'fallback',
            ingredient: todayIngredient.name,
            ingredientCategory: todayIngredient.category
          })
        }
        
      } catch (error) {
        console.error('🚨 食材ベース推薦エラー:', error)
      }
    }
    
    getLocationAndWeather()
  }, [])
  
  // 日付をフォーマット
  const formatDate = (date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }
  
  // 天気アイコンを取得
  const getWeatherIcon = (condition) => {
    const icons = {
      '晴れ': '☀️',
      'Clear': '☀️',
      '曇り': '☁️',
      'Clouds': '☁️',
      '雨': '🌧️',
      'Rain': '🌧️',
      '雪': '❄️',
      'Snow': '❄️',
      '霧': '🌫️',
      'Mist': '🌫️'
    }
    return icons[condition] || '☀️'
  }

  // コンパクトな一覧表示用のレンダリング関数
  const renderCompactCategory = (category, title, icon) => {
    const items = foodData[category][currentMonth] || []
    
    return (
      <div className="compact-category">
        <h3 className="compact-title">
          <span className="compact-icon">{icon}</span>
          {title}
        </h3>
        <div className="compact-grid">
          {items.slice(0, 6).map((item, index) => (
            <div key={index} className="compact-item">
              <span className="compact-thumbnail">{getThumbnail(item, category)}</span>
              <span className="compact-name">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>今日の旬の情報を取得中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="today-header">
        <div className="date-section">
          <p className="today-date">{formatDate(today)}</p>
        </div>
        
        {weather && (
          <div className="weather-section">
            <div className="weather-info">
              <span className="weather-icon">{getWeatherIcon(weather.condition)}</span>
              <div className="weather-details">
                <span className="temperature">{weather.temperature}℃</span>
                <span className="condition">{weather.description}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {recommendedDish && (
        <div className="recommendation-section">
          <h2 className="recommendation-title">
            🍣 今日の旬おすすめ料理
          </h2>
          <RecommendationCard 
            dishName={recommendedDish}
            ingredient={selectedIngredient}
            aiDetails={aiDetails}
          />
          
          {weather && (
            <div className="weather-details-expanded">
              <h3>📊 今日の詳細天気</h3>
              <div className="weather-grid">
                <div className="weather-item">
                  <span className="weather-label">体感温度</span>
                  <span className="weather-value">{weather.feelsLike}℃</span>
                </div>
                <div className="weather-item">
                  <span className="weather-label">湿度</span>
                  <span className="weather-value">{weather.humidity}%</span>
                </div>
                <div className="weather-item">
                  <span className="weather-label">風速</span>
                  <span className="weather-value">{weather.windSpeed?.toFixed(1) || 0} m/s</span>
                </div>
                <div className="weather-item">
                  <span className="weather-label">雲量</span>
                  <span className="weather-value">{weather.cloudiness || 0}%</span>
                </div>
                {weather.cityName && (
                  <div className="weather-item">
                    <span className="weather-label">地域</span>
                    <span className="weather-value">{weather.cityName}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="today-content">
        <h2 className="section-title">
          🌿 {monthNames[currentMonth - 1]}の旬の食材
        </h2>
        
        <div className="compact-sections">
          {renderCompactCategory('fish', '旬の魚', '🐟')}
          {renderCompactCategory('vegetable', '旬の野菜', '🥬')}
        </div>
      </div>
    </div>
  );
}

export default App位置での食材ベース推薦
              await processIngredientBasedRecommendation(defaultWeather, { cityName: '東京' })
              
              setLoading(false)
            }
          )
        } else {
          // Geolocationが利用できない場合
          const defaultWeather = getMockWeatherData()
          setWeather(defaultWeather)
          
          // デフォルト位置での食材ベース推薦
          await processIngredientBasedRecommendation(defaultWeather, { cityName: '東京' })
          
          setLoading(false)
        }
      } catch (error) {
        console.error('初期化エラー:', error)
        setLoading(false)
      }
    }
    
    // 食材ベースの推薦処理関数
    const processIngredientBasedRecommendation = async (weatherInfo, locationInfo) => {
      try {
        console.log('🌿 新しいUX: 食材ベースの推薦システムを開始')
        
        // ステップ1: 今日の旬の食材を1つ選択
        const todayIngredient = selectTodaysIngredient(weatherInfo)
        if (!todayIngredient) {
          console.log('⚠️ 今日の旬の食材が見つかりません')
          return
        }
        
        console.log('🎯 今日の選択食材:', todayIngredient)
        setSelectedIngredient(todayIngredient)
        
        // ステップ2: 選択された食材を使った料理をAIが提案
        const ingredientRecommendation = await getIngredientBasedRecommendation(
          todayIngredient, 
          weatherInfo, 
          locationInfo
        )
        
        if (ingredientRecommendation) {
          console.log('✨ 食材ベースAI推薦成功:', ingredientRecommendation)
          setRecommendedDish(ingredientRecommendation.dish)
          setAiDetails({
            score: ingredientRecommendation.score,
            reasoning: ingredientRecommendation.reasoning,
            source: ingredientRecommendation.source,
            ingredient: todayIngredient.name,
            ingredientCategory: todayIngredient.category
          })
        } else {
          // フォールバック: 簡単な食材料理名生成
          const fallbackDish = `${todayIngredient.name}の煮物`
          console.log('🔄 フォールバック料理:', fallbackDish)
          setRecommendedDish(fallbackDish)
          setAiDetails({
            score: 0.7,
            reasoning: `旬の${todayIngredient.name}を使った、体に優しい家庭料理です`,
            source: 'fallback',
            ingredient: todayIngredient.name,
            ingredientCategory: todayIngredient.category
          })
        }
        
      } catch (error) {
        console.error('🚨 食材ベース推薦エラー:', error)
      }
    }
    
    getLocationAndWeather()
  }, [])
  
  // 日付をフォーマット
  const formatDate = (date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }
  
  // 天気アイコンを取得
  const getWeatherIcon = (condition) => {
    const icons = {
      '晴れ': '☀️',
      'Clear': '☀️',
      '曇り': '☁️',
      'Clouds': '☁️',
      '雨': '🌧️',
      'Rain': '🌧️',
      '雪': '❄️',
      'Snow': '❄️',
      '霊': '🌫️',
      'Mist': '🌫️'
    }
    return icons[condition] || '☀️'
  }

  // コンパクトな一覧表示用のレンダリング関数
  const renderCompactCategory = (category, title, icon) => {
    const items = foodData[category][currentMonth] || []
    
    return (
      <div className="compact-category">
        <h3 className="compact-title">
          <span className="compact-icon">{icon}</span>
          {title}
        </h3>
        <div className="compact-grid">
          {items.slice(0, 6).map((item, index) => (
            <div key={index} className="compact-item">
              <span className="compact-thumbnail">{getThumbnail(item, category)}</span>
              <span className="compact-name">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>今日の旬の情報を取得中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="today-header">
        <div className="date-section">
          <p className="today-date">{formatDate(today)}</p>
        </div>
        
        {weather && (
          <div className="weather-section">
            <div className="weather-info">
              <span className="weather-icon">{getWeatherIcon(weather.condition)}</span>
              <div className="weather-details">
                <span className="temperature">{weather.temperature}℃</span>
                <span className="condition">{weather.description}</span>

              </div>
            </div>
          </div>
        )}
      </header>

      {recommendedDish && (
        <div className="recommendation-section">
          <h2 className="recommendation-title">
            🍣 今日の旬おすすめ料理
          </h2>
          <RecommendationCard 
            dishName={recommendedDish}
            ingredient={selectedIngredient}
            aiDetails={aiDetails}
          />
          
          {weather && (
            <div className="weather-details-expanded">
              <h3>📊 今日の詳細天気</h3>
              <div className="weather-grid">
                <div className="weather-item">
                  <span className="weather-label">体感温度</span>
                  <span className="weather-value">{weather.feelsLike}℃</span>
                </div>
                <div className="weather-item">
                  <span className="weather-label">湿度</span>
                  <span className="weather-value">{weather.humidity}%</span>
                </div>
                <div className="weather-item">
                  <span className="weather-label">風速</span>
                  <span className="weather-value">{weather.windSpeed?.toFixed(1) || 0} m/s</span>
                </div>
                <div className="weather-item">
                  <span className="weather-label">雲量</span>
                  <span className="weather-value">{weather.cloudiness || 0}%</span>
                </div>
                {weather.cityName && (
                  <div className="weather-item">
                    <span className="weather-label">地域</span>
                    <span className="weather-value">{weather.cityName}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="today-content">
        <h2 className="section-title">
          🌿 {monthNames[currentMonth - 1]}の旬の食材
        </h2>
        
        <div className="compact-sections">
          {renderCompactCategory('fish', '旬の魚', '🐟')}
          {renderCompactCategory('vegetable', '旬の野菜', '🥬')}
        </div>
      </div>
    </div>
  );
}

export default App
