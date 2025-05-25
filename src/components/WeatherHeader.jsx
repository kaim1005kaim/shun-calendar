/**
 * 今日のヘッダーコンポーネント（日付と天気情報）
 */
import { formatDate, getTimeOfDayInfo } from '../utils/helpers.js';
import { getWeatherIcon } from '../services/weatherService.js';

const WeatherHeader = ({ weather }) => {
  const today = new Date();
  const timeOfDay = getTimeOfDayInfo();

  return (
    <header className="today-header">
      <div className="date-section">
        <p className="today-date">{formatDate(today)}</p>
        <div className="time-period">
          <span className={`time-indicator ${timeOfDay.class}`}>
            {timeOfDay.icon} {timeOfDay.period}
          </span>
        </div>
      </div>
      
      {weather && (
        <div className="weather-section">
          <div className="weather-info">
            <span className="weather-icon">{getWeatherIcon(weather.condition)}</span>
            <div className="weather-details">
              <span className="temperature">{weather.temperature}℃</span>
              <span className="condition">{weather.description}</span>
              {weather.isMockData && (
                <span className="mock-notice">※模擬データ</span>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default WeatherHeader;
