// 新しい食材・料理追加用のサンプルデータ

export const additionalFoodData = {
  // 冬の追加データ（12-2月）
  winter: {
    fish: ['寒鰤', '真鱈', '白子', 'カワハギ', 'シロサバフグ', '活け牡蠣', 'ケガニ', 'タラバガニ', 'ウニ', 'イクラ'],
    vegetable: ['雪菜', '京菜', '九条ネギ', '聖護院大根', '金時人参', '海老芋', '千枚漬け', 'すぐき菜'],
    dish: ['鰤しゃぶ', '寄せ鍋', '石狩鍋', '白子ポン酢', '牡蠣グラタン', '筑前煮', 'カニ鍋', 'ウニ丼']
  },
  
  // 春の追加データ（3-5月）
  spring: {
    fish: ['桜鯛', '春子鯛', '白魚', 'コウナゴ', 'メバル', 'ドジョウ', 'ワカサギ'],
    vegetable: ['ふきのとう', 'こごみ', 'ぜんまい', '木の芽', 'うど', 'つくし', '行者にんにく'],
    dish: ['桜鯛の刺身', '若竹煮', 'ふきのとう味噌', '山菜おこわ', '鰆の西京焼き', '菜の花のからし和え']
  },
  
  // 夏の追加データ（6-8月）
  summer: {
    fish: ['キス', 'アジ', 'イワシ', 'スズキ', 'カツオ', 'マナガツオ'],
    vegetable: ['モロヘイヤ', 'つるむらさき', '空心菜', 'バジル', 'パクチー', 'レモングラス'],
    dish: ['アジのなめろう', 'イワシの梅煮', '冷やし茶碗蒸し', 'ガスパチョ', '冷製パスタ', 'かき氷']
  },
  
  // 秋の追加データ（9-11月）
  autumn: {
    fish: ['ハゼ', 'シシャモ', 'ハタハタ', 'アンコウ', 'キンキ', 'ノドグロ'],
    vegetable: ['銀杏', '柿', 'りんご', '新そば', 'むかご', 'すだち'],
    dish: ['松茸ご飯', '栗おこわ', '芋煮', '月見そば', '新そば', '銀杏の素揚げ']
  }
};

// 地域特産品データ
export const regionalSpecialties = {
  hokkaido: {
    fish: ['毛ガニ', '花咲ガニ', '時鮭', 'ホタテ', 'ウニ', 'イクラ'],
    dish: ['ちゃんちゃん焼き', '石狩鍋', '海鮮丼', 'ルイベ', 'ジンギスカン']
  },
  
  kansai: {
    vegetable: ['九条ネギ', '聖護院大根', '金時人参', '賀茂茄子', '万願寺とうがらし'],
    dish: ['湯豆腐', '京漬物', '懐石料理', 'おばんざい', '京風うどん']
  },
  
  kyushu: {
    fish: ['関あじ', '関さば', '明太子', 'フグ', '車海老'],
    dish: ['もつ鍋', '水炊き', '辛子明太子', 'ちゃんぽん', '皿うどん']
  }
};

// 絵文字マッピング（新規追加分）
export const newThumbnails = {
  dish: {
    '鰤しゃぶ': '🍲', '寄せ鍋': '🍲', '石狩鍋': '🍲', '白子ポン酢': '🐟', 
    '牡蠣グラタン': '🦪', '筑前煮': '🥕', 'カニ鍋': '🦀', 'ウニ丼': '🍚',
    '桜鯛の刺身': '🐟', '若竹煮': '🎋', 'ふきのとう味噌': '🌿', '山菜おこわ': '🍚',
    'アジのなめろう': '🐟', '冷やし茶碗蒸し': '🥚', 'ガスパチョ': '🍅',
    '松茸ご飯': '🍄', '栗おこわ': '🌰', '芋煮': '🥔', '月見そば': '🍜'
  },
  fish: {
    '寒鰤': '🐟', '白子': '🐟', 'カワハギ': '🐟', 'ケガニ': '🦀', 
    'タラバガニ': '🦀', '毛ガニ': '🦀', '花咲ガニ': '🦀', '時鮭': '🐟',
    'コウナゴ': '🐟', 'ドジョウ': '🐟', 'キス': '🐟', 'マナガツオ': '🐟',
    'ハゼ': '🐟', 'シシャモ': '🐟', 'ハタハタ': '🐟', 'キンキ': '🐟', 'ノドグロ': '🐟'
  },
  vegetable: {
    '雪菜': '🥬', '京菜': '🥬', '九条ネギ': '🌿', '聖護院大根': '🥕', 
    '金時人参': '🥕', '海老芋': '🥔', 'ふきのとう': '🌿', 'こごみ': '🌿',
    'ぜんまい': '🌿', '木の芽': '🌿', 'うど': '🌿', 'つくし': '🌿',
    'モロヘイヤ': '🥬', 'つるむらさき': '🥬', '空心菜': '🥬', 'バジル': '🌿',
    '銀杏': '🌰', '柿': '🟠', 'りんご': '🍎', 'むかご': '🥔', 'すだち': '🍊'
  }
};

// 使用方法の例
export const howToUse = {
  step1: "src/data.js の該当月の配列に新しい食材・料理を追加",
  step2: "src/App.jsx の getThumbnail 関数に新しい絵文字を追加", 
  step3: "アプリを再起動して動作確認",
  
  example: `
  // data.js の例（1月の料理を拡張）
  1: [
    'おでん', '鍋料理', '湯豆腐', '粕汁', '雑煮', '七草粥', 
    '鰤大根', '蒸し牡蠣', '河豚ちり', '金目鯛の煮付け',
    // 新規追加分
    '鮟鱇鍋', '石狩鍋', 'キムチ鍋', 'すき焼き', 'しゃぶしゃぶ'
  ]
  `
};
