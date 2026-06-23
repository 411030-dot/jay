const apiKey = '596976b8bd6a47cda2d36ddaa5adf168';
const gasEndpoint = 'https://script.google.com/macros/s/AKfycby9XrRANau3w9EblEGOD-oUfunuAHJInwOFFUW83mk75JL0nVuP5Hnrj0KMfrzNlN9TJA/exec';
const apiBase = 'https://api.openweathermap.org/data/2.5/weather';
const geoApiBase = 'https://api.openweathermap.org/geo/1.0/direct';

const TW_CITY_MAP = {
  '台北': 'Taipei',
  '台北市': 'Taipei',
  '高雄': 'Kaohsiung',
  '高雄市': 'Kaohsiung',
  '台中': 'Taichung',
  '台中市': 'Taichung',
  '台南': 'Tainan',
  '台南市': 'Tainan',
  '桃園': 'Taoyuan',
  '桃園市': 'Taoyuan',
  '新竹': 'Hsinchu',
  '新竹市': 'Hsinchu',
  '基隆': 'Keelung',
  '花蓮': 'Hualien',
  '宜蘭': 'Yilan',
  '屏東': 'Pingtung',
  '嘉義': 'Chiayi',
  '嘉義市': 'Chiayi',
};

const elements = {
  cityInput: document.getElementById('cityInput'),
  searchButton: document.getElementById('searchButton'),
  autoFillButton: document.getElementById('autoFillButton'),
  clearButton: document.getElementById('clearButton'),
  saveButton: document.getElementById('saveButton'),
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

let latestWeatherData = null;

function formatTemperature(celsius) {
  return `${Math.round(celsius)}°C`;
}

function showMessage(text) {
  elements.message.textContent = text;
}

function renderWeather(data, displayCity, displayCountry) {
  elements.cityName.textContent = `${displayCity || data.name}, ${displayCountry || data.sys.country}`;
  elements.weatherDescription.textContent = data.weather[0].description.replace(/\b\w/g, (c) => c.toUpperCase());
  elements.temperature.textContent = formatTemperature(data.main.temp);
  elements.humidity.textContent = `${data.main.humidity}%`;
  elements.windSpeed.textContent = `${data.wind.speed} m/s`;
  elements.pressure.textContent = `${data.main.pressure} hPa`;
  elements.weatherCode.textContent = data.weather[0].id;
  elements.weatherCard.classList.remove('hidden');
}

async function fetchWeather(city) {
  try {
    const normalizedCity = TW_CITY_MAP[city.trim()] || city.trim();
    const geoResponse = await fetch(`${geoApiBase}?q=${encodeURIComponent(normalizedCity)}&limit=3&appid=${apiKey}`);
    if (!geoResponse.ok) {
      const errorData = await geoResponse.json();
      throw new Error(errorData.message || '城市查詢失敗，請稍後再試。');
    }

    const geoData = await geoResponse.json();
    if (!Array.isArray(geoData) || geoData.length === 0) {
      throw new Error('找不到對應城市，請改用繁體/簡體中文或英文再試一次。');
    }

    const taiwanLocation = geoData.find((item) => item.country === 'TW');
    const location = taiwanLocation || geoData[0];
    const response = await fetch(`${apiBase}?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric&lang=zh_tw`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '查詢失敗，請稍後再試。');
    }

    const data = await response.json();
    const displayCity = TW_CITY_MAP[city.trim()] || location.local_names?.en || location.name || data.name;
    const displayCountry = location.country || data.sys.country;
    latestWeatherData = {
      ...data,
      displayCity,
      displayCountry,
    };
    localStorage.setItem('lastCity', city);
    renderWeather(data, displayCity, displayCountry);
    showMessage('');
  } catch (error) {
    elements.weatherCard.classList.add('hidden');
    showMessage(`錯誤：${error.message}`);
  }
}

function saveWeatherRecord() {
  if (!latestWeatherData) {
    showMessage('請先查詢天氣，再儲存到試算表。');
    return;
  }

  if (!gasEndpoint || gasEndpoint.includes('請填入')) {
    showMessage('請先在 script.js 中填入 GAS Web App URL。');
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    city: latestWeatherData.displayCity || latestWeatherData.name,
    country: latestWeatherData.displayCountry || latestWeatherData.sys.country,
    description: latestWeatherData.weather[0].description,
    temperature: latestWeatherData.main.temp,
    humidity: latestWeatherData.main.humidity,
    windSpeed: latestWeatherData.wind.speed,
    pressure: latestWeatherData.main.pressure,
    weatherCode: latestWeatherData.weather[0].id,
  };

  showMessage('儲存中...');

  fetch(gasEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '儲存失敗，請稍後再試。');
      }
      return response.json();
    })
    .then((data) => {
      if (data.status === 'success') {
        showMessage('已成功儲存至 Google 試算表。');
      } else {
        throw new Error(data.message || '儲存失敗。');
      }
    })
    .catch((error) => {
      showMessage(`錯誤：${error.message}`);
    });
}

function autoFillExample() {
  const sampleCity = 'Taipei';
  elements.cityInput.value = sampleCity;
  handleSearch();
}

function clearFields() {
  elements.cityInput.value = '';
  elements.weatherCard.classList.add('hidden');
  showMessage('已清除資料。');
  localStorage.removeItem('lastCity');
}

function handleSearch() {
  const city = elements.cityInput.value.trim();
  if (!city) {
    showMessage('請輸入城市名稱。');
    return;
  }

  if (!apiKey || apiKey.includes('請填入')) {
    showMessage('請先在 script.js 中填入 OpenWeather API Key。');
    return;
  }
  showMessage('查詢中...');
  fetchWeather(city);
}

elements.searchButton.addEventListener('click', handleSearch);
elements.autoFillButton.addEventListener('click', autoFillExample);
elements.clearButton.addEventListener('click', clearFields);
elements.saveButton.addEventListener('click', saveWeatherRecord);
elements.cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const lastCity = localStorage.getItem('lastCity');
  if (lastCity && apiKey && !apiKey.includes('請填入')) {
    elements.cityInput.value = lastCity;
    handleSearch();
  }
});
