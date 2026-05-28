import { create } from 'zustand';

export interface City {
  name: string;
  lat: number;
  lon: number;
  country: string;
}

export interface DailyForecast {
  date: string;         // YYYY-MM-DD
  dayOfWeek: string;    // 월, 화, 수 ...
  tempMin: number;      // 최저 기온 (°C)
  tempMax: number;      // 최고 기온 (°C)
  condition: 'Sunny' | 'Rainy' | 'Cloudy' | 'Snowy';
  weatherCode: number;  // WMO weather code for advanced logic
  pop: number;          // 강수확률 (0~100%)
  humidity: number;     // 습도 (%)
  windSpeed: number;    // 풍속 (km/h)
  uvIndex: number;      // UV 지수
  activityIndex: number; // 야외활동 지수 (0~100)
  carWashIndex: number;  // 세차 지수 (0~100)
  laundryIndex: number;  // 빨래 지수 (0~100)
}

export interface WeeklyWeather {
  city: string;
  country: string;
  lat: number;
  lon: number;
  current: {
    temp: number;
    condition: 'Sunny' | 'Rainy' | 'Cloudy' | 'Snowy';
    humidity: number;
    windSpeed: number;
    description: string;
  };
  daily: DailyForecast[];
}

interface WeatherStore {
  selectedCity: City;
  favorites: City[];
  unit: 'C' | 'F';
  weatherData: WeeklyWeather | null;
  isLoading: boolean;
  error: string | null;
  activeDayIndex: number;
  
  setSelectedCity: (city: City) => void;
  addFavorite: (city: City) => void;
  removeFavorite: (cityName: string) => void;
  setUnit: (unit: 'C' | 'F') => void;
  setWeatherData: (data: WeeklyWeather | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveDayIndex: (index: number) => void;
}

const DEFAULT_CITY: City = {
  name: '서울',
  lat: 37.5665,
  lon: 126.9780,
  country: 'KR'
};

const getSavedFavorites = (): City[] => {
  try {
    const saved = localStorage.getItem('weathercloud_favorites');
    return saved ? JSON.parse(saved) : [DEFAULT_CITY];
  } catch {
    return [DEFAULT_CITY];
  }
};

const getSavedUnit = (): 'C' | 'F' => {
  try {
    const saved = localStorage.getItem('weathercloud_unit');
    return (saved === 'C' || saved === 'F') ? saved : 'C';
  } catch {
    return 'C';
  }
};

export const useWeatherStore = create<WeatherStore>((set) => ({
  selectedCity: DEFAULT_CITY,
  favorites: getSavedFavorites(),
  unit: getSavedUnit(),
  weatherData: null,
  isLoading: false,
  error: null,
  activeDayIndex: 0,

  setSelectedCity: (city) => set({ selectedCity: city }),
  
  addFavorite: (city) => set((state) => {
    // Avoid duplicates by coordinates or city name
    if (state.favorites.some(f => f.name.toLowerCase() === city.name.toLowerCase() && Math.abs(f.lat - city.lat) < 0.05)) {
      return state;
    }
    const updated = [...state.favorites, city];
    localStorage.setItem('weathercloud_favorites', JSON.stringify(updated));
    return { favorites: updated };
  }),

  removeFavorite: (cityName) => set((state) => {
    const updated = state.favorites.filter(f => f.name !== cityName);
    localStorage.setItem('weathercloud_favorites', JSON.stringify(updated));
    return { favorites: updated };
  }),

  setUnit: (unit) => set(() => {
    localStorage.setItem('weathercloud_unit', unit);
    return { unit };
  }),

  setWeatherData: (data) => set({ weatherData: data, activeDayIndex: 0 }), // Reset index when new city loaded
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setActiveDayIndex: (activeDayIndex) => set({ activeDayIndex })
}));
