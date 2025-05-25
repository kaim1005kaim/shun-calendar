// クックパッド検索のテスト

// フォールバックキーワードを生成する関数のテスト
const generateFallbackKeywords = (dishName) => {
  const keywords = [];
  
  // 料理名から検索しやすいキーワードを抽出
  if (dishName.includes('の')) {
    // "〇〇の△△" → "〇〇" と "△△" に分割
    const parts = dishName.split('の');
    keywords.push(parts[0]); // メイン食材
    if (parts[1]) keywords.push(parts[1]); // 調理法
  }
  
  if (dishName.includes('と')) {
    // "〇〇と△△" → "〇〇" と "△△" に分割
    const parts = dishName.split('と');
    keywords.push(parts[0]);
    if (parts[1]) keywords.push(parts[1]);
  }
  
  // 調理法キーワードの抽出
  const cookingMethods = ['焼き', '煮', '炒め', '揚げ', '蒸し', '茹で', '漬け', '和え', '刺身', 'サラダ', 'スープ', '鍋'];
  cookingMethods.forEach(method => {
    if (dishName.includes(method)) {
      keywords.push(method);
    }
  });
  
  // 食材キーワードの抽出（より詳細に）
  const ingredients = [
    '鰤', '鱈', '鮭', '鯖', '鰻', '大根', '白菜', 'かぼちゃ', 'さつまいも', 'きのこ',
    'じゃがいも', '新じゃがいも', 'アスパラガス', 'アスパラ', 'トマト', 'なす', 'ナス',
    'きゅうり', 'ピーマン', 'オクラ', '枝豆', 'とうもろこし', '玉ねぎ', '新玉ねぎ',
    '人参', 'ごぼう', 'れんこん', 'ほうれん草', '小松菜', 'ネギ', '長ネギ'
  ];
  ingredients.forEach(ingredient => {
    if (dishName.includes(ingredient)) {
      keywords.push(ingredient);
    }
  });
  
  // 重複を除去してスペース区切りで結合
  const uniqueKeywords = [...new Set(keywords)];
  return uniqueKeywords;
};

// テストケース
console.log('=== クックパッド検索キーワード変換テスト ===');

const testDishes = [
  '新じゃがいもとアスパラガスのスープ',
  '鰤大根',
  '筍ご飯',
  '鰻の蒲焼き',
  'トマトサラダ',
  'アスパラガスとベーコンの炒め物',
  '秋刀魚の塩焼き',
  'かぼちゃの煮物'
];

testDishes.forEach(dish => {
  const keywords = generateFallbackKeywords(dish);
  const searchQuery = keywords.join(' ');
  const cookpadUrl = `https://cookpad.com/search/${encodeURIComponent(searchQuery)}`;
  
  console.log(`\n料理名: ${dish}`);
  console.log(`分解キーワード: [${keywords.join(', ')}]`);
  console.log(`検索クエリ: "${searchQuery}"`);
  console.log(`クックパッドURL: ${cookpadUrl}`);
});

// 特別なテストケース: 新じゃがいもとアスパラガスのスープ
console.log('\n=== 特別テスト: 新じゃがいもとアスパラガスのスープ ===');
const specialDish = '新じゃがいもとアスパラガスのスープ';
const specialKeywords = generateFallbackKeywords(specialDish);
const specialQuery = specialKeywords.join(' ');

console.log(`元の料理名: ${specialDish}`);
console.log(`分解後キーワード: [${specialKeywords.join(', ')}]`);
console.log(`AND検索クエリ: "${specialQuery}"`);
console.log(`元のURL: https://cookpad.com/search/${encodeURIComponent(specialDish)}`);
console.log(`改善後URL: https://cookpad.com/search/${encodeURIComponent(specialQuery)}`);
console.log(`\n期待結果: "じゃがいも アスパラガス スープ" でAND検索`);
