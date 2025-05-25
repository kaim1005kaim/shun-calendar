// 料理選択用のランダム関数（リロードごとに変更）
const getRandomDish = (ingredient, weatherData) => {
  const timeOfDay = getTimeOfDay();
  const feelsLike = weatherData.feelsLike || weatherData.temperature;
  
  let cookingMethods = [];
  
  if (ingredient.category === 'fish') {
    if (feelsLike <= 15) {
      // 寒い日は温かい料理を優先
      cookingMethods = [
        '煮付け', '味噌煮', '煮', '汁', '鍋', '蒸し焼き', '照り焼き'
      ];
    } else if (feelsLike >= 25) {
      // 暑い日はさっぱり系を優先
      cookingMethods = [
        '刺身', '南蛮漬け', 'カルパッチョ', 'マリネ', 'たたき', '酢締め'
      ];
    } else {
      // 温和な日はバランス良く（多様な選択肢）
      cookingMethods = [
        '塩焼き', 'ムニエル', 'ソテー', 'フライ', '天ぷら', '竜田揚げ', '煮付け'
      ];
    }
  } else {
    if (feelsLike <= 15) {
      cookingMethods = [
        '煮物', '炒め物', 'グラタン', '味噌汁', '蒸し物'
      ];
    } else if (feelsLike >= 25) {
      cookingMethods = [
        'サラダ', '胡麻和え', '浅漬け', '酢の物', 'マリネ'
      ];
    } else {
      cookingMethods = [
        '炒め物', '天ぷら', 'ソテー', 'きんぴら', '和え物'
      ];
    }
  }
  
  // 完全にランダムに選択（日付に依存しない）
  const randomIndex = Math.floor(Math.random() * cookingMethods.length);
  const selectedMethod = cookingMethods[randomIndex];
  
  return `${ingredient.name}の${selectedMethod}`;
};// フォールバック時の料理パターンを多様化（ランダム）
const getFallbackDish = (ingredient, weatherData) => {
  return getRandomDish(ingredient, weatherData);
};/**
 * AI推薦システム
 */
import { foodData } from '../data.js';
import { getCurrentSeason } from './weatherService.js';

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_TOKEN = import.meta.env.VITE_GROQ_API_KEY || "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";

// 時間帯を取得
export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 18) return 'afternoon';
  return 'dinner';
};

// 日付ベースの安定した料理選択（より多様性を持たせる）
export const getDateSeed = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // 更にバリエーションを持たせるために異なる乗数を使用
  return (year * 13 + month * 31 + day * 7) % 999983;
};

// シード値を基にした擬似ランダム関数
export const seededRandom = (seed) => {
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);
  return ((a * seed + c) % m) / m;
};

// 今日の旬の食材を1つ選択する関数（日付ベースで安定選択）
export const selectTodaysIngredient = (weatherData) => {
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
  
  // 日付ベースでより多様な選択を行う
  const seed = getDateSeed();
  const randomValue = seededRandom(seed);
  
  // 全食材から選択（重み付けを考慮した確率的選択）
  const totalScore = weightedIngredients.reduce((sum, item) => sum + item.score, 0);
  let cumulativeScore = 0;
  const targetScore = randomValue * totalScore;
  
  for (const ingredient of weightedIngredients) {
    cumulativeScore += ingredient.score;
    if (cumulativeScore >= targetScore) {
      return ingredient;
    }
  }
};

// 選択された食材の魅力的な説明をAIが生成する関数
export const getIngredientDescription = async (ingredient, weatherData, location) => {
  const currentTime = new Date();
  const timeOfDay = getTimeOfDay();
  const season = getCurrentSeason();
  
  const prompt = `あなたは食材に関する正確な知識を持つ、親しみやすい食の情報提供者です。指定された旬の食材について、その基本的な特徴や味わいを伝える客観的かつ簡潔な説明文を作成してください。

——— 今日の情報 ———
日時: ${currentTime.toLocaleDateString('ja-JP')} (${timeOfDay === 'morning' ? '朝' : timeOfDay === 'lunch' ? '昼' : timeOfDay === 'dinner' ? '夕方' : '昼間'})
地域: ${location?.cityName || '東京'}
天気: ${weatherData.description} (${weatherData.condition})
気温: ${weatherData.temperature}℃
体感温度: ${weatherData.feelsLike}℃
季節: ${season}

——— 今日の旬の食材 ———
【食材】${ingredient.name}
【カテゴリー】${ingredient.category === 'fish' ? '魚' : '野菜'}

——— ミッション ———
上記の「${ingredient.name}」について、ユーザーがその食材を理解し、調理や選択の参考にできるような説明文を作成してください。

重要なポイント:
• ${ingredient.name}が旬の時期であることと、その際の一般的な特徴を記述してください（例：脂ののり、甘みが増す等）
• 食材の主な特徴（見た目、種類など）、代表的な味わい、食感、香りを客観的かつ具体的に表現してください
• 詩的な表現や過度な情緒的表現は避け、事実に即した情報を提供してください
• 親しみやすい丁寧な言葉遣いを心がけてください
• 必ず日本語で回答してください
• 今の季節（旬）と食材の状態を結びつけて説明してください
• （可能であれば）一般的な調理法や食べ方の代表例を1つか2つ、簡潔に含めてください

【説明文の構成要素（これらの情報を参考に、簡潔にまとめてください）】
• 食材の簡単な紹介（例：アジ科の回遊魚、アブラナ科の緑黄色野菜など）
• 旬の時期と、その時期ならではの美味しさ（例：冬が旬で、寒くなると脂がのり旨味が増します。／夏が旬で、太陽をたっぷり浴びて甘くみずみずしくなります。）
• 代表的な味の特徴（例：上品な白身で、淡白ながらも深い旨味があります。／特有の甘みとほどよい酸味のバランスが絶妙です。）
• 代表的な食感（例：加熱すると身がふっくらと柔らかくなります。／シャキシャキとした心地よい歯ざわりが楽しめます。）
• 香りの特徴（例：磯の香りが豊かです。／爽やかな香りが特徴です。）
• 代表的な食べ方（例：刺身や塩焼き、煮付けなどに向いています。／サラダや炒め物、スープなど幅広く活用できます。）

必ず以下のJSON形式で日本語回答してください（説明文は80～120文字程度で、食材の基本情報が伝わるようにまとめてください）：
{
  "description": "食材の客観的で分かりやすい説明文。簡単な紹介、旬と特徴、味わい、食感、代表的な調理法などを含む。",
  "ingredient": "${ingredient.name}"
}`;

  console.log('📝 食材説明プロンプト:', prompt);

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
            content: "あなたは食材に関する正確な知識を持ち、親しみやすい丁寧な言葉遣いで食材情報を提供するエキスパートです。指定された旬の食材について、その基本的な特徴、味わい、食感、代表的な調理法などを含む客観的で分かりやすい説明文を作成してください。必ず日本語でJSON形式で回答し、英語は一切使わないでください。過度な情緒的表現や詩的な表現は避け、事実に基づいた有用な情報を提供し、食材の特徴や活用方法が理解できるように説明してください。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 250,
        temperature: 0.7
      })
    });
    
    const responseText = await response.text();
    console.log('🔍 食材説明AIレスポンス:', responseText);
    
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
        
        console.log('✅ 食材説明AI成功:', parsedResponse);
        return {
          description: parsedResponse.description,
          ingredient: ingredient.name,
          ingredientCategory: ingredient.category,
          source: 'groq_ingredient_description',
          score: 0.95
        };
      } else {
        throw new Error('JSONフォーマットが見つかりません');
      }
    } catch (parseError) {
      console.log('😵 JSONパースエラー:', parseError);
      
      // フォールバック：客観的な食材説明を使用
      const fallbackDescriptions = {
        fish: [
          `${ingredient.name}は今が旬の時期で、脂がのって旨味が増しています。上品な白身で、刺身や塩焼き、煮付けなど様々な調理法でお楽しみいただけます。`,
          `旬の${ingredient.name}は身がしっかりとしており、深い旨味と程よい甘みが特徴です。新鮮な状態では特に美味しく、多様な料理に活用できます。`,
          `${ingredient.name}は清涼な海で育った魚で、淡白でありながらもコクのある味わいが楽しめます。今の季節は身が特に美味しく、おすすめです。`
        ],
        vegetable: [
          `${ingredient.name}は今が旬の時期で、水分をたっぷり含んでシャキシャキとした食感が特徴です。サラダや炒め物、スープなど様々な料理に向いています。`,
          `旬の${ingredient.name}は栄養価が高く、自然な甘みと程よい苦みのバランスが絶妙です。今の時期は柔らかく、美味しくいただけます。`,
          `${ingredient.name}は色鮮やかで香りがよく、旬の今の時期は特に美味しい状態です。生食や加熱調理のどちらでもお楽しみいただけます。`
        ]
      };
      
      const descriptions = fallbackDescriptions[ingredient.category] || fallbackDescriptions.fish;
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      return {
        description: randomDescription,
        ingredient: ingredient.name,
        ingredientCategory: ingredient.category,
        source: 'fallback_description',
        score: 0.75
      };
    }
  } catch (error) {
    console.error('😱 食材説明AI完全失敗:', error);
    return null;
  }
};
