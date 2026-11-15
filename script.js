const cityInput = document.querySelector("#cityInput");
const status = document.querySelector("#status");
const weatherCard = document.querySelector("#weatherCard");
const cityName = document.querySelector("#cityName");
const temperature = document.querySelector("#temperature");
const weatherDescription = document.querySelector("#weatherDescription");
const feelsLike = document.querySelector("#feelsLike");
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#windSpeed");
const searchForm = document.querySelector("#searchForm");
const forecast = document.querySelector("#forecast");

// 1. Şehir koordinatlarını bulacak fonksiyon
async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=tr&format=json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP hatası: ${response.status}`);
    }

    const data = await response.json();

    // Şehir bulunamazsa
    if (!data.results || data.results.length === 0) {
      throw new Error("Şehir bulunamadı!");
    }

    // İlk şehir bilgisini al
    const location = data.results[0];

    // Koordinatları al
    const latitude = location.latitude;
    const longitude = location.longitude;

    // Kontrol et
    return {
      name: location.name,
      latitude: latitude,
      longitude: longitude,
    };
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
}

async function getWeather(latitude, longitude) {
  const weather = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

  try {
    const res = await fetch(weather);

    if (!res.ok) {
      throw new Error(`HTTP hatası: ${res.status}`);
    }

    const resJson = await res.json();

    return resJson;
  } catch (error) {
    console.error("Hava durumu alınamadı:", error);
  }
}

function getWeatherDescription(code) {
  switch (code) {
    case 0:
      return "Güneşli";

    case 1:
      return "Genellikle açık";

    case 2:
      return "Parçalı bulutlu";
    case 3:
      return "Kapalı";
    case 45:
    case 48:
      return "Sisli";
    case 51:
    case 53:
    case 55:
      return "Çisenti";
    case 61:
    case 63:
    case 65:
      return "Yağmurlu";
    case 71:
    case 73:
    case 75:
      return "Karlı";
    case 80:
    case 81:
    case 82:
      return "Sağanak Yağışlı";
    case 95:
      return "	Gök gürültülü fırtına";
    default:
      return "Bilinmeyen hava durumu";
  }
}

// 2. Arama işlemini dinle
searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    status.textContent = "Lütfen bir şehir girin.";
    return;
  }

  const location = await getCoordinates(city);

  if (!location) {
    status.textContent = "Şehir bulunamadı!";
    return;
  }

  const weatherData = await getWeather(location.latitude, location.longitude);

  if (!weatherData) {
    status.textContent = "Hava durumu alınamadı!";
    return;
  }

  const current = weatherData.current;
  const description = getWeatherDescription(current.weather_code);
  weatherDescription.textContent = description;
  const currentTemp = current.temperature_2m;
  const humidityy = current.relative_humidity_2m;
  const temp = current.apparent_temperature;
  const wind = current.wind_speed_10m;
  temperature.textContent = `${currentTemp} °C`;
  humidity.textContent = `${humidityy} %`;
  windSpeed.textContent = `${wind} km/sa`;
  feelsLike.textContent = `${temp} °C`;

  weatherCard.hidden = false;
  cityName.textContent = location.name;
  const daily = weatherData.daily;
  console.log(forecast);
  forecast.innerHTML = "";

  for (let i = 0; i < daily.time.length; i++) {
    const gunler = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi"
];
    const date = new Date(daily.time[i]);
    const gunAdi = gunler[date.getUTCDay()];
    const weatherCode = daily.weather_code[i];
    const maxTemp = daily.temperature_2m_max[i];
    const minTemp = daily.temperature_2m_min[i];
    const description = getWeatherDescription(weatherCode);

    forecast.innerHTML += `
  <div class="forecast-item">
    <h3>${gunAdi}</h3>
    <p>${description}</p>
    <p>En yüksek: ${maxTemp} °C</p>
    <p>En düşük: ${minTemp} °C</p>
  </div>
`;
  }

  console.log(weatherData);
});
