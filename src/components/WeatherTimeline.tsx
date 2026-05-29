import React from 'react';
import { Sun, Cloud, CloudRain, Snowflake } from 'lucide-react';
import { useWeatherStore } from '../store/useWeatherStore';
import type { DailyForecast } from '../store/useWeatherStore';

export const WeatherTimeline: React.FC = () => {
  const { weatherData, unit, activeDayIndex, setActiveDayIndex } = useWeatherStore();

  if (!weatherData) return null;

  const formatTemp = (tempC: number) => {
    if (unit === 'C') {
      return `${Math.round(tempC)}°`;
    }
    return `${Math.round(tempC * 1.8 + 32)}°`;
  };

  const getWeatherIcon = (condition: string, className = "w-8 h-8") => {
    switch (condition) {
      case 'Sunny':
        return <Sun className={`${className} text-amber-400 fill-amber-400/20`} />;
      case 'Rainy':
        return <CloudRain className={`${className} text-sky-400`} />;
      case 'Snowy':
        return <Snowflake className={`${className} text-cyan-300`} />;
      case 'Cloudy':
      default:
        return <Cloud className={`${className} text-slate-300 fill-slate-300/10`} />;
    }
  };

  const getConditionName = (condition: string): string => {
    switch (condition) {
      case 'Sunny': return '맑음';
      case 'Cloudy': return '흐림';
      case 'Rainy': return '비';
      case 'Snowy': return '눈';
      default: return '흐림';
    }
  };

  const getCardBg = (condition: string, isActive: boolean) => {
    if (isActive) {
      switch (condition) {
        case 'Sunny': return 'bg-amber-500/20 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-2 ring-amber-500/20';
        case 'Rainy': return 'bg-sky-500/20 border-sky-400/80 shadow-[0_0_15px_rgba(56,189,248,0.15)] ring-2 ring-sky-500/20';
        case 'Snowy': return 'bg-cyan-500/20 border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-2 ring-cyan-500/20';
        case 'Cloudy':
        default:
          return 'bg-slate-500/25 border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.15)] ring-2 ring-slate-500/20';
      }
    }
    return 'bg-white/5 border-white/10 hover:bg-white/10';
  };

  const formatDate = (dateStr: string): string => {
    const [,, day] = dateStr.split('-');
    return `${parseInt(day)}일`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 id="timeline-title" className="text-lg font-bold text-white flex items-center gap-2">
          <span>📅 7일 주간 예보</span>
          <span className="text-xs font-normal text-white/50">(카드를 클릭하면 상세 활동 지수를 확인하실 수 있습니다)</span>
        </h2>
      </div>

      {/* Flex scroll for mobile, Grid for desktop */}
      <div className="flex md:grid md:grid-cols-7 gap-2 md:gap-3 overflow-x-auto md:overflow-x-visible no-scrollbar py-2 -mx-4 px-4 md:mx-0 md:px-0">
        {weatherData.daily.slice(0, 7).map((day: DailyForecast, index: number) => {
          const isActive = index === activeDayIndex;
          const isWeekend = day.dayOfWeek === '토' || day.dayOfWeek === '일';
          
          return (
            <button
              key={day.date}
              onClick={() => setActiveDayIndex(index)}
              className={`flex-shrink-0 w-[78px] md:w-auto flex flex-col items-center justify-between p-3 rounded-2xl border text-center transition-all cursor-pointer ${getCardBg(
                day.condition,
                isActive
              )} ${isActive ? 'scale-102 -translate-y-0.5' : 'active:scale-95'}`}
            >
              {/* Day of Week */}
              <div className="flex flex-col gap-0.5">
                <span className={`text-xs font-semibold ${
                  isActive 
                    ? 'text-white font-extrabold' 
                    : isWeekend 
                      ? day.dayOfWeek === '일' ? 'text-red-400' : 'text-blue-400' 
                      : 'text-white/70'
                }`}>
                  {day.dayOfWeek}요일
                </span>
                <span className="text-[10px] text-white/40 font-medium">
                  {formatDate(day.date)}
                </span>
              </div>

              {/* Icon & Weather Code Desc */}
              <div className="my-3 flex flex-col items-center gap-1">
                {getWeatherIcon(day.condition)}
                <span className="text-[10px] text-white/50">{getConditionName(day.condition)}</span>
              </div>

              {/* Rain Probability (POP) */}
              <div className="text-[10px] font-semibold flex flex-col items-center mb-2">
                {day.pop > 0 ? (
                  <span className="text-sky-300 flex items-center gap-0.5">
                    💧 {day.pop}%
                  </span>
                ) : (
                  <span className="text-white/30">-</span>
                )}
              </div>

              {/* Temperature Range */}
              <div className="flex flex-col text-xs font-medium w-full border-t border-white/5 pt-1.5">
                <span className="text-amber-300 font-semibold">{formatTemp(day.tempMax)}</span>
                <span className="text-sky-200/60 text-[10px]">{formatTemp(day.tempMin)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
