/**
 * レコメンデーションセクションコンポーネント
 */
import RecommendationCard from './RecommendationCard.jsx';
import WeatherDetails from './WeatherDetails.jsx';

const RecommendationSection = ({ selectedIngredient, aiDetails, weather }) => {
  if (!selectedIngredient) return null;

  return (
    <div className="recommendation-section">
      <h2 className="recommendation-title">
        🌿 今日の旬食材：{selectedIngredient.name}
      </h2>
      <RecommendationCard 
        ingredient={selectedIngredient}
        aiDetails={aiDetails}
      />
      
      <WeatherDetails weather={weather} />
    </div>
  );
};

export default RecommendationSection;
