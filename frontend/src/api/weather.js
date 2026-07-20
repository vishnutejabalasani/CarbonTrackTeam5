import axios from "axios";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const HYDERABAD_COORDS = { lat: 17.3850, lon: 78.4867, name: "Hyderabad" };

const AQI_MAP = {
  1: { label: "Good", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50" },
  2: { label: "Fair", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50" },
  3: { label: "Moderate", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50" },
  4: { label: "Poor", color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/50" },
  5: { label: "Very Poor", color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50" },
};

const weatherCodeMap = (code) => {
  if (code === 0) return "Sunny";
  if (code >= 1 && code <= 3) return "Cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rainy";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorm";
  return "Clear";
};

const usAqiToScale = (aqi) => {
  if (aqi <= 50) return 1;
  if (aqi <= 100) return 2;
  if (aqi <= 150) return 3;
  if (aqi <= 200) return 4;
  return 5;
};

export const getWeatherData = async () => {
  let lat = HYDERABAD_COORDS.lat;
  let lon = HYDERABAD_COORDS.lon;
  let cityName = HYDERABAD_COORDS.name;

  try {
    const coords = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
        (err) => reject(err),
        { timeout: 2000 }
      );
    });
    lat = coords.lat;
    lon = coords.lon;
    cityName = "Your Location";
  } catch (e) {
    try {
      const ipRes = await axios.get("https://ipapi.co/json/");
      if (ipRes.data && ipRes.data.latitude && ipRes.data.longitude) {
        lat = ipRes.data.latitude;
        lon = ipRes.data.longitude;
        cityName = ipRes.data.city || "Hyderabad";
      }
    } catch (ipErr) {
      console.log("IP Geolocation failed, defaulting to Hyderabad:", ipErr.message);
    }
  }

  if (API_KEY) {
    try {
      const weatherRes = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
        params: { lat, lon, units: "metric", appid: API_KEY }
      });

      if (weatherRes.data?.name) {
        cityName = weatherRes.data.name;
      }

      const temp = Math.round(weatherRes.data.main?.temp ?? 22);
      const description = weatherRes.data.weather?.[0]?.main ?? "Clear";

      let aqiLabel = "Good";
      let aqiColor = AQI_MAP[1].color;
      try {
        const aqiRes = await axios.get("https://api.openweathermap.org/data/2.5/air_pollution", {
          params: { lat, lon, appid: API_KEY }
        });
        const aqiVal = aqiRes.data?.list?.[0]?.main?.aqi ?? 1;
        const mapped = AQI_MAP[aqiVal] || AQI_MAP[1];
        aqiLabel = mapped.label;
        aqiColor = mapped.color;
      } catch (aqiErr) {
        console.error("AQI fetch failed:", aqiErr);
      }

      return {
        temp,
        description,
        aqiLabel,
        aqiColor,
        cityName,
        updatedAt: new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
      };
    } catch (err) {
      console.log("OpenWeatherMap key is not active yet, falling back to keyless Open-Meteo...");
    }
  }

  try {
    const weatherRes = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: { latitude: lat, longitude: lon, current: "temperature_2m,weather_code" }
    });

    const temp = Math.round(weatherRes.data.current?.temperature_2m ?? 22);
    const description = weatherCodeMap(weatherRes.data.current?.weather_code ?? 0);

    let aqiLabel = "Good";
    let aqiColor = AQI_MAP[1].color;

    try {
      const aqiRes = await axios.get("https://air-quality-api.open-meteo.com/v1/air-quality", {
        params: { latitude: lat, longitude: lon, current: "us_aqi" }
      });
      const usAqi = aqiRes.data?.current?.us_aqi ?? 30;
      const mappedVal = usAqiToScale(usAqi);
      const mapped = AQI_MAP[mappedVal] || AQI_MAP[1];
      aqiLabel = mapped.label;
      aqiColor = mapped.color;
    } catch (aqiErr) {
      console.error("Open-Meteo AQI fetch failed:", aqiErr);
    }

    return {
      temp,
      description,
      aqiLabel,
      aqiColor,
      cityName,
      updatedAt: new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    };
  } catch (err) {
    console.error("All weather services failed:", err);
    return {
      temp: 22,
      description: "Cloudy",
      aqiLabel: "Fair",
      aqiColor: AQI_MAP[2].color,
      cityName: cityName,
      updatedAt: "Default"
    };
  }
};
