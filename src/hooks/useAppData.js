/**
 * アプリデータを管理するカスタムフック
 */
import { useState, useEffect } from 'react';
import { getWeatherInfo, getMockWeatherData } from '../services/weatherService.js';
import { selectTodaysIngredient, getIngredientDescription } from '../services/aiRecommendationService.js';

export const useAppData = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [recommendedDish, setRecommendedDish] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiDetails, setAiDetails] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setLocation({ lat: latitude, lon: longitude });
              
              const weatherInfo = await getWeatherInfo(latitude, longitude);
              setWeather(weatherInfo);
              
              // 食材ベースの推薦システム
              await processIngredientBasedRecommendation(weatherInfo, { 
                lat: latitude, 
                lon: longitude, 
                cityName: weatherInfo.cityName 
              });
              
              setLoading(false);
            },
            async (error) => {
              console.log('位置情報の取得に失敗しました。デフォルト情報を使用します。');
              const defaultWeather = getMockWeatherData();
              setWeather(defaultWeather);
              
              // デフォルト位置での食材ベース推薦
              await processIngredientBasedRecommendation(defaultWeather, { cityName: '東京' });
              
              setLoading(false);
            }
          );
        } else {
          // Geolocationが利用できない場合
          const defaultWeather = getMockWeatherData();
          setWeather(defaultWeather);
          
          // デフォルト位置での食材ベース推薦
          await processIngredientBasedRecommendation(defaultWeather, { cityName: '東京' });
          
          setLoading(false);
        }
      } catch (error) {
        console.error('初期化エラー:', error);
        setLoading(false);
      }
    };

    // 食材ベースの推薦処理関数
    const processIngredientBasedRecommendation = async (weatherInfo, locationInfo) => {
      try {
        console.log('🌿 新しいUX: 食材ベースの推薦システムを開始');
        
        // ステップ1: 今日の旬の食材を1つ選択
        const todayIngredient = selectTodaysIngredient(weatherInfo);
        if (!todayIngredient) {
          console.log('⚠️ 今日の旬の食材が見つかりません');
          return;
        }
        
        console.log('🎯 今日の選択食材:', todayIngredient);
        setSelectedIngredient(todayIngredient);
        
        // ステップ2: 選択された食材の魅力的な説明をAIが生成
        const ingredientDescription = await getIngredientDescription(
          todayIngredient, 
          weatherInfo, 
          locationInfo
        );
        
        if (ingredientDescription) {
          console.log('✨ 食材説明AI成功:', ingredientDescription);
          setRecommendedDish(null); // 料理推薦は削除
          setAiDetails({
            reasoning: ingredientDescription.description,
            ingredient: todayIngredient.name,
            ingredientCategory: todayIngredient.category
          });
        } else {
          // フォールバック：魅力的な食材説明を使用
          setRecommendedDish(null); // 料理推薦は削除
          
          // フォールバック用の魅力的な説明文
          const fallbackDescriptions = {
            fish: [
              `旬の${todayIngredient.name}は今が一番美味しい時期！ふっくらとした身の甘みと豊かな旨みを存分に味わえます`,
              `脂がのった${todayIngredient.name}の濃厚な旨みとプリプリとした食感が絶品です`,
              `新鮮な${todayIngredient.name}のジューシーで上品な味わいをお楽しみください`,
              `今が旬の${todayIngredient.name}は最高の美味しさ！香ばしい風味がたまらない一品です`
            ],
            vegetable: [
              `シャキシャキとした${todayIngredient.name}の食感と自然な甘みが今の季節にぴったりです`,
              `旬の${todayIngredient.name}は栄養満点で、みずみずしい美味しさが口いっぱいに広がります`,
              `甘くて柔らかい${todayIngredient.name}の風味豊かな旬の美味しさをたっぷりと味わえます`,
              `色鮮やかでフレッシュな${todayIngredient.name}の美味しさを存分にお楽しみください`
            ]
          };
          
          const descriptions = fallbackDescriptions[todayIngredient.category] || fallbackDescriptions.fish;
          const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
          
          setAiDetails({
            reasoning: randomDescription,
            ingredient: todayIngredient.name,
            ingredientCategory: todayIngredient.category
          });
        }
        
      } catch (error) {
        console.error('🚨 食材ベース推薦エラー:', error);
      }
    };

    initializeApp();
  }, []);

  return {
    weather,
    location,
    recommendedDish,
    selectedIngredient,
    loading,
    aiDetails
  };
};
