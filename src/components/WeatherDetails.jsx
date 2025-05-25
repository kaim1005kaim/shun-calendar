/**
 * 詳細天気情報コンポーネント
 */

const WeatherDetails = ({ weather }) => {
  if (!weather) return null;

  return (
    <div className="weather-details-expanded">
      <h3>📊 今日の詳細天気</h3>
      <div className="weather-grid">
        <div className="weather-item">
          <span className="weather-label">体感温度</span>
          <span className="weather-value">{weather.feelsLike}℃</span>
        </div>
        <div className="weather-item">
          <span className="weather-label">湿度</span>
          <span className="weather-value">{weather.humidity}%</span>
        </div>
        <div className="weather-item">
          <span className="weather-label">風速</span>
          <span className="weather-value">{weather.windSpeed?.toFixed(1) || 0} m/s</span>
        </div>
        <div className="weather-item">
          <span className="weather-label">雲量</span>
          <span className="weather-value">{weather.cloudiness || 0}%</span>
        </div>
        {weather.cityName && (
          <div className="weather-item">
            <span className="weather-label">地域</span>
            <span className="weather-value">{weather.cityName}</span>
          </div>
        )}
        {weather.pressure && (
          <div className="weather-item">
            <span className="weather-label">気圧</span>
            <span className="weather-value">{Math.round(weather.pressure)} hPa</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherDetails;
