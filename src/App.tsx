import { useEffect } from 'react';
import { CloudSun, RefreshCw, Sun, Cloud, CloudRain, Snowflake, Wind, Droplets, Compass } from 'lucide-react';
import { useWeatherStore } from './store/useWeatherStore';
import { fetchWeather } from './services/weatherService';
import { SearchBar } from './components/SearchBar';
import { FavoriteCities } from './components/FavoriteCities';
import { WeatherTimeline } from './components/WeatherTimeline';
import { SmartIndexCard } from './components/SmartIndexCard';
import './App.css';

function App() {
  const {
    selectedCity,
    unit,
    setUnit,
    weatherData,
    setWeatherData,
    isLoading,
    error,
    setIsLoading,
    setError,
    activeDayIndex
  } = useWeatherStore();

  const loadWeather = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(selectedCity);
      setWeatherData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '날씨 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reload weather whenever city changes
  useEffect(() => {
    loadWeather();
  }, [selectedCity]);

  // Helper for dynamic backgrounds based on the selected day's weather condition
  const getThemeBg = () => {
    if (!weatherData) return 'from-slate-900 via-indigo-950 to-slate-950';
    
    // Choose active day's weather code or fall back to current weather code
    const condition = weatherData.daily[activeDayIndex]?.condition || weatherData.current.condition;
    
    switch (condition) {
      case 'Sunny':
        return 'from-amber-600/70 via-orange-950 to-slate-950';
      case 'Rainy':
        return 'from-blue-950 via-slate-900 to-zinc-950';
      case 'Snowy':
        return 'from-cyan-900/65 via-sky-950 to-slate-950';
      case 'Cloudy':
      default:
        return 'from-slate-800 via-indigo-950/70 to-slate-950';
    }
  };

  const formatTemp = (tempC: number) => {
    if (unit === 'C') {
      return `${Math.round(tempC)}°C`;
    }
    return `${Math.round(tempC * 1.8 + 32)}°F`;
  };

  const getBigWeatherIcon = (condition: string) => {
    const className = "w-24 h-24 drop-shadow-[0_10px_15px_rgba(255,255,255,0.1)]";
    switch (condition) {
      case 'Sunny':
        return <Sun className={`${className} text-amber-400 fill-amber-400/20 animate-pulse-slow`} />;
      case 'Rainy':
        return <CloudRain className={`${className} text-sky-400`} />;
      case 'Snowy':
        return <Snowflake className={`${className} text-cyan-300`} />;
      case 'Cloudy':
      default:
        return <Cloud className={`${className} text-slate-300 fill-slate-300/10`} />;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getThemeBg()} text-white p-4 md:p-8 transition-all duration-1000 ease-in-out`}>
      {/* Container */}
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header Banner */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/10 border border-white/20 glass-panel">
              <CloudSun className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                웨더클라우드 (WeatherCloud)
              </h1>
              <p className="text-xs text-white/50">"이번 주말 캠핑 갈 수 있을까?" 한눈에 보는 주간 날씨 & 활동 추천 대시보드</p>
            </div>
          </div>

          {/* Unit Toggle and Refresh */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={loadWeather}
              disabled={isLoading}
              title="새로고침"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-white/70 hover:text-white cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="flex rounded-xl bg-white/5 border border-white/10 p-0.5">
              <button
                onClick={() => setUnit('C')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  unit === 'C' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUnit('F')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  unit === 'F' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </header>

        {/* Search & Favorites Bar */}
        <section className="flex flex-col gap-4">
          <SearchBar />
          <FavoriteCities />
        </section>

        {/* Error Notification */}
        {error && (
          <div className="w-full max-w-md mx-auto p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm text-center animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Loading Overlay or Main Content */}
        {isLoading && !weatherData ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <RefreshCw className="w-12 h-12 text-indigo-400 animate-spin" />
            <p className="text-white/60 text-sm animate-pulse">실시간 기상 데이터를 동기화하는 중...</p>
          </div>
        ) : weatherData ? (
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Left Column: Current Weather Overview */}
            <section className="lg:col-span-1 flex flex-col gap-6">
              <div className="rounded-3xl border border-white/10 p-6 flex flex-col justify-between h-full relative overflow-hidden glass-panel-dark">
                {/* Background ambient light */}
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-6">
                  {/* City Title */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 id="current-weather-title" className="text-3xl font-extrabold tracking-tight text-white">
                        {weatherData.city}
                      </h2>
                      <p className="text-xs text-white/50 mt-1 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-white/10 uppercase tracking-wider">{weatherData.country}</span>
                        <span>실시간 날씨 정보</span>
                      </p>
                    </div>
                    {isLoading && (
                      <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                    )}
                  </div>

                  {/* Large Temp & Icon */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col">
                      <span className="text-6xl font-black tracking-tighter text-white">
                        {formatTemp(weatherData.current.temp)}
                      </span>
                      <span className="text-lg font-semibold text-indigo-200 mt-1">
                        {weatherData.current.description}
                      </span>
                    </div>
                    <div>
                      {getBigWeatherIcon(weatherData.current.condition)}
                    </div>
                  </div>

                  {/* Highlights today */}
                  <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="p-2 rounded-xl bg-sky-500/10 text-sky-300">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/40">실시간 습도</span>
                        <span className="text-sm font-bold text-white">{weatherData.current.humidity}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300">
                        <Wind className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/40">실시간 풍속</span>
                        <span className="text-sm font-bold text-white">{Math.round(weatherData.current.windSpeed)} km/h</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-4 relative z-10 flex flex-col gap-1 text-[11px] text-white/40">
                  <p>📍 위도: {weatherData.lat.toFixed(4)} | 경도: {weatherData.lon.toFixed(4)}</p>
                  <p>⏰ 최종 동기화: {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </section>

            {/* Right Column: Timeline & Smart Index (spans 2 columns on desktop) */}
            <section className="lg:col-span-2 flex flex-col gap-6">
              {/* Timeline Container */}
              <div className="rounded-3xl border border-white/10 p-6 glass-panel-dark">
                <WeatherTimeline />
              </div>

              {/* Smart Index Recommendation Container */}
              <SmartIndexCard />
            </section>

          </main>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4 glass-panel rounded-3xl border border-white/10">
            <Compass className="w-16 h-16 text-indigo-300 animate-pulse-slow" />
            <h3 className="text-lg font-bold">날씨 데이터를 가져올 수 없습니다</h3>
            <p className="text-white/50 text-xs">도시를 검색하거나 GPS 버튼을 클릭해 실시간 날씨 정보를 불러와 주세요.</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-white/30 border-t border-white/5 pt-4">
          <p>© 2026 웨더클라우드 (WeatherCloud). All rights reserved.</p>
          <p className="mt-1">Powered by Open-Meteo & React TS</p>
        </footer>

      </div>
    </div>
  );
}

export default App;
