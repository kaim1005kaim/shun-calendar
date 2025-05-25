// 日付ベースの安定した料理選択システム

// 日付から一意のシード値を生成
const getDateSeed = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // 年月日を組み合わせてユニークな数値を作成
  return year * 10000 + month * 100 + day;
};

// シード値を基にした擬似ランダム関数（Linear Congruential Generator）
const seededRandom = (seed) => {
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);
  return ((a * seed + c) % m) / m;
};

// 日付ベースで安定した料理選択
const getStableDishForDate = (weatherData, seasonalDishes, date = new Date()) => {
  const seed = getDateSeed(date);
  
  // 既存のAIアルゴリズムでスコア計算
  const dishScores = seasonalDishes.map(dish => {
    // ... 既存のスコア計算ロジック
    return { dish, score: totalScore };
  });
  
  // スコアでソート
  dishScores.sort((a, b) => b.score - a.score);
  
  // 上位3位から日付ベースで安定選択
  const topDishes = dishScores.slice(0, 3);
  const randomValue = seededRandom(seed);
  const selectedIndex = Math.floor(randomValue * topDishes.length);
  
  return topDishes[selectedIndex];
};

// 使用例
export const getDailyRecommendation = (weatherData, seasonalDishes) => {
  const today = new Date();
  return getStableDishForDate(weatherData, seasonalDishes, today);
};

// 日付が変わったかチェック
export const hasDateChanged = () => {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem('lastRecommendationDate');
  
  if (lastDate !== today) {
    localStorage.setItem('lastRecommendationDate', today);
    return true;
  }
  return false;
};
