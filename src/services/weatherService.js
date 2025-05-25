/**
 * 天気情報取得サービス
 */

// 実際のOpenWeatherMap APIを使用した天気情報取得
export const getWeatherInfo = async (lat, lon) => {
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
export const getMockWeatherData = () => {
  const hour = new Date().getHours();
  const season = getCurrentSeason();
  
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
    uvIndex: getCurrentSeason() === 'summer' ? 8 : 4,
    cityName: '東京',
    country: 'JP',
    sunrise: new Date(),
    sunset: new Date(),
    isMockData: true
  };
};

// 現在の季節を取得
export const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

// 体感温度を計算（風速と湿度を考慮）
export const calculateFeelsLikeTemperature = (temp, humidity, windSpeed) => {
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

// 天気アイコンを取得
export const getWeatherIcon = (condition) => {
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
  };
  return icons[condition] || '☀️';
};
