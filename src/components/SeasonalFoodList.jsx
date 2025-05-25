/**
 * 旬の食材リストコンポーネント
 */
import { useState } from 'react';
import { foodData, monthNames } from '../data.js';
import { getThumbnail, generateIngredientCookpadUrl } from '../utils/helpers.js';

const SeasonalFoodList = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12の月
  const [expandedCategories, setExpandedCategories] = useState({});

  // 食材クリック時の処理
  const handleIngredientClick = async (ingredientName) => {
    try {
      const cookpadUrl = await generateIngredientCookpadUrl(ingredientName);
      window.open(cookpadUrl, '_blank', 'noopener,noreferrer');
      console.log('🍳 食材クリック:', ingredientName, '-> URL:', cookpadUrl);
    } catch (error) {
      console.error('⚠️ 食材クリックエラー:', error);
    }
  };

  // カテゴリの展開/折りたたみを切り替える
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // コンパクトな一覧表示用のレンダリング関数
  const renderCompactCategory = (category, title, icon) => {
    const items = foodData[category][currentMonth] || [];
    const isExpanded = expandedCategories[category];
    const displayItems = isExpanded ? items : items.slice(0, 6);
    
    return (
      <div className="compact-category">
        <h3 className="compact-title">
          <span className="compact-icon">{icon}</span>
          {title}
          {isExpanded && (
            <span className="total-count">（全{items.length}種類）</span>
          )}
        </h3>
        <div className={`compact-grid ${isExpanded ? 'expanded' : ''}`}>
          {displayItems.map((item, index) => (
            <div 
              key={index} 
              className="compact-item clickable ingredient-item"
              onClick={() => handleIngredientClick(item)}
              title={`${item}のレシピを見る`}
            >
              <span className="compact-thumbnail">{getThumbnail(item, category)}</span>
              <span className="compact-name">{item}</span>
            </div>
          ))}
          {items.length > 6 && (
            <div 
              className="compact-item more-items clickable"
              onClick={() => toggleCategory(category)}
            >
              <span className="compact-thumbnail">{isExpanded ? '📁' : '📋'}</span>
              <span className="compact-name">
                {isExpanded ? '表示を減らす' : `他 ${items.length - 6}種類`}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="today-content">
      <h2 className="section-title">
        🌿 {monthNames[currentMonth - 1]}の旬の食材
      </h2>
      
      <div className="compact-sections">
        {renderCompactCategory('fish', '旬の魚', '🐟')}
        {renderCompactCategory('vegetable', '旬の野菜', '🥬')}
      </div>
    </div>
  );
};

export default SeasonalFoodList;
