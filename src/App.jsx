import { useAppData } from './hooks/useAppData.js';
import WeatherHeader from './components/WeatherHeader.jsx';
import RecommendationSection from './components/RecommendationSection.jsx';
import SeasonalFoodList from './components/SeasonalFoodList.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import './index.css';

function App() {
  const {
    weather,
    recommendedDish,
    selectedIngredient,
    loading,
    aiDetails
  } = useAppData();

  if (loading) {
    return <LoadingSpinner message="今日の旬の情報を取得中..." />;
  }

  return (
    <div className="app">
      <WeatherHeader weather={weather} />

      <RecommendationSection 
        selectedIngredient={selectedIngredient}
        aiDetails={aiDetails}
        weather={weather}
      />

      <SeasonalFoodList />
    </div>
  );
}

export default App;
