const apiKey = '<請填入你的 OpenWeather API Key>'; // 請替換成自己的 OpenWeather API 金鑰
const apiBase = 'https://api.openweathermap.org/data/2.5/weather';

const elements = {
  cityInput: document.getElementById('cityInput'),
  searchButton: document.getElementById('searchButton'),
  weatherCard: document.getElementById('weatherCard'),
  cityName: document.getElementById('cityName'),
  weatherDescription: document.getElementById('weatherDescription'),
  temperature: document.getElementById('temperature'),
  humidity: document.getElementById('humidity'),
  windSpeed: document.getElementById('windSpeed'),
  pressure: document.getElementById('pressure'),
  weatherCode: document.getElementById('weatherCode'),
  message: document.getElementById('message'),
};

function kelvinToCelsius(kelvin) {
  return Math.round(kelvin - 273.15);
}

function showMessage(text) {
  elements.message.textContent = text;
}

function renderWeather(data) {
  elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
  elements.weatherDescription.textContent = data.weather[0].description.replace(/\b\w/g, (c) => c.toUpperCase());
  elements.temperature.textContent = `${kelvinToCelsius(data.main.temp)}°C`;
  elements.humidity.textContent = `${data.main.humidity}%`;
  elements.windSpeed.textContent = `${data.wind.speed} m/s`;
  elements.pressure.textContent = `${data.main.pressure} hPa`;
  elements.weatherCode.textContent = data.weather[0].id;
  elements.weatherCard.classList.remove('hidden');
}

async function fetchWeather(city) {
  try {
    const response = await fetch(`${apiBase}?q=${encodeURIComponent(city)}&appid=${apiKey}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '查詢失敗，請稍後再試。');
    }

    const data = await response.json();
    renderWeather(data);
    showMessage('');
  } catch (error) {
    elements.weatherCard.classList.add('hidden');
    showMessage(`錯誤：${error.message}`);
  }
}

function handleSearch() {
  const city = elements.cityInput.value.trim();
  if (!city) {
    showMessage('請輸入城市名稱。');
    return;
  }
  showMessage('查詢中...');
  fetchWeather(city);
}

elements.searchButton.addEventListener('click', handleSearch);
elements.cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
});
