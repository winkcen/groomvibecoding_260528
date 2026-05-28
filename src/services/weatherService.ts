import type { WeeklyWeather, DailyForecast, City } from '../store/useWeatherStore';

// Map WMO weather codes to our simplified conditions
export const mapWeatherCode = (code: number): 'Sunny' | 'Rainy' | 'Cloudy' | 'Snowy' => {
  if ([0, 1].includes(code)) return 'Sunny';
  if ([2, 3, 45, 48].includes(code)) return 'Cloudy';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return 'Rainy';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snowy';
  return 'Cloudy'; // Fallback
};

export const getWeatherDescription = (code: number): string => {
  const descriptions: Record<number, string> = {
    0: '맑음',
    1: '대체로 맑음',
    2: '구름 조금',
    3: '흐림',
    45: '안개',
    48: '침착 안개',
    51: '가벼운 이슬비',
    53: '이슬비',
    55: '강한 이슬비',
    56: '가벼운 결빙성 이슬비',
    57: '강한 결빙성 이슬비',
    61: '약한 비',
    63: '보통 비',
    65: '강한 비',
    66: '가벼운 결빙성 비',
    67: '강한 결빙성 비',
    71: '약한 눈',
    73: '보통 눈',
    75: '강한 눈',
    77: '싸락눈',
    80: '약한 소나기',
    81: '보통 소나기',
    82: '강한 소나기',
    85: '약한 소나기성 눈',
    86: '강한 소나기성 눈',
    95: '천둥번개',
    96: '천둥번개를 동반한 우박',
    99: '강한 천둥번개를 동반한 우박',
  };
  return descriptions[code] || '정보 없음';
};

// Calculate Car Wash Index (0 ~ 100)
// High index means good day for car wash (no rain expected, moderate humidity, sunny)
const calculateCarWashIndex = (
  pop: number,
  humidity: number,
  condition: string,
  nextDaysPop: number[]
): number => {
  if (condition === 'Rainy' || condition === 'Snowy') return 10;
  
  let score = 100;
  
  // Deduct for today's rain probability
  score -= pop * 0.7;
  
  // Deduct for next 2 days rain probability (very important for car wash!)
  if (nextDaysPop.length > 0) {
    const nextDayPop = nextDaysPop[0];
    score -= nextDayPop * 0.5;
  }
  if (nextDaysPop.length > 1) {
    const dayAfterPop = nextDaysPop[1];
    score -= dayAfterPop * 0.3;
  }
  
  // High humidity is bad for drying
  if (humidity > 70) {
    score -= (humidity - 70) * 0.5;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

// Calculate Laundry Index (0 ~ 100)
// High index means laundry dries fast (high temp, low humidity, breezy, no rain)
const calculateLaundryIndex = (
  tempMax: number,
  humidity: number,
  windSpeed: number,
  pop: number,
  condition: string
): number => {
  if (condition === 'Rainy' || condition === 'Snowy') return 0;
  
  let tempScore = 0;
  if (tempMax >= 30) tempScore = 30;
  else if (tempMax >= 20) tempScore = 25;
  else if (tempMax >= 10) tempScore = 15;
  else tempScore = 5;
  
  let humidityScore = 0;
  if (humidity <= 40) humidityScore = 40;
  else if (humidity <= 60) humidityScore = 30;
  else if (humidity <= 80) humidityScore = 15;
  else humidityScore = 5;
  
  let windScore = 0;
  if (windSpeed >= 15) windScore = 15;
  else if (windSpeed >= 5) windScore = 10;
  else windScore = 5;
  
  let totalScore = tempScore + humidityScore + windScore;
  
  if (condition === 'Cloudy') {
    totalScore *= 0.6; // cloudy reduces drying speed
  }
  
  // Deduct based on rain probability
  totalScore = totalScore * (1 - pop / 100);
  
  // Add base points if condition is sunny
  if (condition === 'Sunny') {
    totalScore += 15;
  }
  
  return Math.max(0, Math.min(100, Math.round(totalScore)));
};

// Calculate Outdoor Activity Index (0 ~ 100)
// High index means great camping, picnic weather (warm temp 18~24°C, no rain, soft wind, low UV)
const calculateActivityIndex = (
  tempMax: number,
  pop: number,
  windSpeed: number,
  uvIndex: number,
  condition: string
): number => {
  let score = 100;
  
  // Optimal temp is around 22°C
  const tempDiff = Math.abs(tempMax - 22);
  score -= tempDiff * 3.5;
  
  // Rain probability hurts index
  score -= pop * 0.9;
  
  // Strong wind hurts camping/picnic
  if (windSpeed >= 20) score -= 30;
  else if (windSpeed >= 10) score -= 12;
  
  // Extreme UV index hurts outdoor activities
  if (uvIndex >= 8) score -= 15;
  else if (uvIndex >= 6) score -= 5;
  
  // Condition adjustments
  if (condition === 'Rainy') score -= 40;
  else if (condition === 'Snowy') score -= 50;
  else if (condition === 'Cloudy') score -= 10;
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

const getDayOfWeekKorean = (dateStr: string): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

// We will fetch weather from the API
export const fetchWeather = async (city: City): Promise<WeeklyWeather> => {
  const isDev = import.meta.env.DEV;
  const proxyUrl = `/api/weather?lat=${city.lat}&lon=${city.lon}`;
  const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max&hourly=relative_humidity_2m&timezone=auto`;
  
  const response = await fetch(isDev ? directUrl : proxyUrl);

  if (!response.ok) {
    throw new Error('날씨 데이터를 가져오는 중 오류가 발생했습니다.');
  }

  const data = await response.json();
  
  // If the serverless proxy was used, it might return the processed output directly or raw Open-Meteo payload.
  // We handle raw Open-Meteo payload here to be safe and consistent.
  const raw = data.daily ? data : data.raw || data;

  const dailyList: DailyForecast[] = [];
  const timeArray = raw.daily.time;
  
  for (let i = 0; i < timeArray.length; i++) {
    const date = timeArray[i];
    const dayOfWeek = getDayOfWeekKorean(date);
    const tempMax = raw.daily.temperature_2m_max[i];
    const tempMin = raw.daily.temperature_2m_min[i];
    const weatherCode = raw.daily.weather_code[i];
    const pop = raw.daily.precipitation_probability_max[i] ?? 0;
    const uvIndex = raw.daily.uv_index_max[i] ?? 0;
    const windSpeed = raw.daily.wind_speed_10m_max[i] ?? 0;
    const condition = mapWeatherCode(weatherCode);

    // Calculate humidity from hourly for the specific day (each day has 24 hourly points)
    let humidity = 60; // fallback
    if (raw.hourly && raw.hourly.relative_humidity_2m) {
      const dayStartIdx = i * 24;
      const dayHumidityPoints = raw.hourly.relative_humidity_2m.slice(dayStartIdx, dayStartIdx + 24);
      if (dayHumidityPoints.length > 0) {
        humidity = Math.round(dayHumidityPoints.reduce((a: number, b: number) => a + b, 0) / dayHumidityPoints.length);
      }
    }

    // Collect next 2 days POP for car wash index calculations
    const nextDaysPop: number[] = [];
    if (i + 1 < timeArray.length) nextDaysPop.push(raw.daily.precipitation_probability_max[i + 1] ?? 0);
    if (i + 2 < timeArray.length) nextDaysPop.push(raw.daily.precipitation_probability_max[i + 2] ?? 0);

    const carWashIndex = calculateCarWashIndex(pop, humidity, condition, nextDaysPop);
    const laundryIndex = calculateLaundryIndex(tempMax, humidity, windSpeed, pop, condition);
    const activityIndex = calculateActivityIndex(tempMax, pop, windSpeed, uvIndex, condition);

    dailyList.push({
      date,
      dayOfWeek,
      tempMin,
      tempMax,
      condition,
      weatherCode,
      pop,
      humidity,
      windSpeed,
      uvIndex,
      activityIndex,
      carWashIndex,
      laundryIndex
    });
  }

  // Current weather
  const currentTemp = raw.current?.temperature_2m ?? raw.daily?.temperature_2m_max[0] ?? 20;
  const currentCode = raw.current?.weather_code ?? raw.daily?.weather_code[0] ?? 0;
  const currentHumidity = raw.current?.relative_humidity_2m ?? raw.hourly?.relative_humidity_2m?.[0] ?? 60;
  const currentWindSpeed = raw.current?.wind_speed_10m ?? raw.daily?.wind_speed_10m_max[0] ?? 10;
  const currentCondition = mapWeatherCode(currentCode);
  const currentDesc = getWeatherDescription(currentCode);

  return {
    city: city.name,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
    current: {
      temp: currentTemp,
      condition: currentCondition,
      humidity: currentHumidity,
      windSpeed: currentWindSpeed,
      description: currentDesc
    },
    daily: dailyList
  };
};

export const searchCities = async (query: string): Promise<City[]> => {
  if (!query || query.trim().length < 2) return [];
  
  const isDev = import.meta.env.DEV;
  const proxyUrl = `/api/geocode?name=${encodeURIComponent(query)}`;
  const directUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=ko&format=json`;

  const response = await fetch(isDev ? directUrl : proxyUrl);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const results = data.results || [];
  
  return results.map((item: any) => ({
    name: item.name,
    lat: item.latitude,
    lon: item.longitude,
    country: item.country_code || item.country || ''
  }));
};
