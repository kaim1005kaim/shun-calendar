/**
 * レコメンデーションカードコンポーネント
 */
import { useState, useEffect } from 'react';
import { getThumbnail, generateIngredientCookpadUrl } from '../utils/helpers.js';

const RecommendationCard = ({ ingredient, aiDetails }) => {
  const [cookpadUrl, setCookpadUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);
  
  // デバッグ用ログ
  console.log('🌿 RecommendationCard rendered with ingredient:', ingredient, 'aiDetails:', aiDetails);
  
  useEffect(() => {
    const getCookpadUrl = async () => {
      try {
        setIsLoadingUrl(true);
        // 食材名をベースにしたクックパッド検索URLを生成
        const searchKeyword = ingredient?.name;
        const url = await generateIngredientCookpadUrl(searchKeyword);
        setCookpadUrl(url);
      } catch (error) {
        console.log('⚠️ URL生成エラー:', error);
        // フォールバック処理
        const fallbackKeyword = ingredient?.name;
        const fallbackUrl = `https://cookpad.com/search/${encodeURIComponent(fallbackKeyword)}`;
        setCookpadUrl(fallbackUrl);
      } finally {
        setIsLoadingUrl(false);
      }
    };
    
    if (ingredient?.name) {
      getCookpadUrl();
    }
  }, [ingredient]);
  
  if (!ingredient) {
    return null;
  }
  
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
            {getThumbnail(ingredient.name, ingredient.category)}
          </div>
          <div className="recommendation-info">
            {aiDetails && (
              <p className="ingredient-description">
                {aiDetails.reasoning}
              </p>
            )}
            <div className="recipe-link-center">
              {isLoadingUrl ? '🔄 レシピ検索中...' : `🔗 ${ingredient.name}のレシピを見る`}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default RecommendationCard;
