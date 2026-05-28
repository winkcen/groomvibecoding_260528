import React from 'react';
import { Car, Shirt, Compass } from 'lucide-react';
import { useWeatherStore } from '../store/useWeatherStore';
import type { DailyForecast } from '../store/useWeatherStore';

export const SmartIndexCard: React.FC = () => {
  const { weatherData, activeDayIndex } = useWeatherStore();

  if (!weatherData || !weatherData.daily[activeDayIndex]) return null;

  const activeDay: DailyForecast = weatherData.daily[activeDayIndex];

  // Helper for Circular Progress calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  
  const getStrokeDashOffset = (score: number) => {
    return circumference - (score / 100) * circumference;
  };

  // 1. Car Wash Advice
  const getCarWashAdvice = (score: number, condition: string) => {
    if (condition === 'Rainy' || condition === 'Snowy' || score <= 20) {
      return {
        label: '세차 금지',
        color: 'text-red-400 border-red-500/30 bg-red-500/10',
        strokeColor: '#f87171',
        desc: '오늘 비나 눈 예보가 있습니다. 세차를 즉시 미루세요. 세차하자마자 도로의 오물로 인해 다시 더러워집니다!'
      };
    }
    if (score >= 80) {
      return {
        label: '세차 적극 추천',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        strokeColor: '#34d399',
        desc: '세차하기 완벽한 타이밍! 당분간 비 소식 없이 맑아 세차한 보람이 오랫동안 유지되는 시기입니다.'
      };
    }
    if (score >= 50) {
      return {
        label: '세차 양호',
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        strokeColor: '#fbbf24',
        desc: '비 소식은 없으나 황사나 미세먼지가 있을 수 있습니다. 가벼운 물세차나 왁스 코팅 세차를 추천합니다.'
      };
    }
    return {
      label: '세차 보류',
      color: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
      strokeColor: '#fb923c',
      desc: '조만간 강수 확률이 존재합니다. 세차 후 금방 비를 맞을 수 있으니 실내 먼지 털기 수준의 세차만 권장합니다.'
    };
  };

  // 2. Laundry Advice
  const getLaundryAdvice = (score: number, condition: string) => {
    if (condition === 'Rainy' || condition === 'Snowy' || score <= 20) {
      return {
        label: '건조기 필수',
        color: 'text-red-400 border-red-500/30 bg-red-500/10',
        strokeColor: '#f87171',
        desc: '습도가 너무 높고 눈/비가 와서 실외 건조가 완전히 불가합니다. 건조기를 이용하거나 실내에서 제습기를 가동하세요.'
      };
    }
    if (score >= 85) {
      return {
        label: '이불빨래 추천',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        strokeColor: '#34d399',
        desc: '건조 효율 100%! 따스한 햇살과 알맞은 바람 덕분에 밀린 이불빨래와 두꺼운 옷도 반나절 만에 보송하게 마릅니다.'
      };
    }
    if (score >= 60) {
      return {
        label: '실외 건조 양호',
        color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
        strokeColor: '#38bdf8',
        desc: '일반적인 의류를 밖에 널기 아주 좋은 날씨입니다. 해가 잘 드는 오전에 널어두면 해 지기 전에 뽀송해집니다.'
      };
    }
    return {
      label: '실내 건조 권장',
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      strokeColor: '#fbbf24',
      desc: '구름이 많고 습도가 다소 높아 빨래가 마르는 속도가 더딥니다. 방안에서 선풍기를 틀어놓고 실내 건조하시는 것을 추천합니다.'
    };
  };

  // 3. Outdoor / Camping Advice
  const getActivityAdvice = (score: number) => {
    if (score >= 80) {
      return {
        label: '캠핑/피크닉 강력 추천',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        strokeColor: '#34d399',
        desc: '날씨 지수가 환상적입니다! 선선하고 적당한 바람과 기온으로 텐트를 치거나 한강 숲길을 걸으며 인생샷을 건지기 좋은 주말입니다.'
      };
    }
    if (score >= 55) {
      return {
        label: '야외 활동 무난',
        color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
        strokeColor: '#38bdf8',
        desc: '대체로 온화하지만 구름이 있거나 가끔 바람이 불 수 있습니다. 피크닉에는 지장이 없으며 가벼운 외투를 준비하세요.'
      };
    }
    if (score >= 30) {
      return {
        label: '실내 활동 추천',
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        strokeColor: '#fbbf24',
        desc: '날씨가 쌀쌀하거나 더워서 밖에서 오랜 시간 머물기엔 힘듭니다. 미술관, 카페 투어 같은 실내 데이트나 문화생활을 즐겨보세요.'
      };
    }
    return {
      label: '집콕 권장 (위험)',
      color: 'text-red-400 border-red-500/30 bg-red-500/10',
      strokeColor: '#f87171',
      desc: '폭우, 돌풍, 또는 혹한/폭설의 우려가 있습니다. 캠핑 등 야외 일정이 있다면 즉시 취소하고 실내에서 안전하고 따뜻하게 휴식을 취하세요.'
    };
  };

  const carWash = getCarWashAdvice(activeDay.carWashIndex, activeDay.condition);
  const laundry = getLaundryAdvice(activeDay.laundryIndex, activeDay.condition);
  const activity = getActivityAdvice(activeDay.activityIndex);

  const formatDateKorean = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  };

  return (
    <div className="w-full rounded-3xl border border-white/10 p-5 md:p-6 shadow-2xl glass-panel-dark animate-fade-in">
      {/* Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 text-[10px] font-bold uppercase tracking-wider">
            {activeDayIndex === 0 ? 'Today' : `D-${activeDayIndex}`} Forecast
          </span>
          <h3 className="text-xl font-bold text-white mt-1.5">
            {formatDateKorean(activeDay.date)} ({activeDay.dayOfWeek}요일) 추천 라이프 가이드
          </h3>
        </div>
        <div className="mt-2 sm:mt-0 flex gap-4 text-xs text-white/60">
          <span className="flex items-center gap-1">💧 습도 <strong>{activeDay.humidity}%</strong></span>
          <span className="flex items-center gap-1">💨 풍속 <strong>{Math.round(activeDay.windSpeed)} km/h</strong></span>
          <span className="flex items-center gap-1">☀️ 자외선 <strong>{activeDay.uvIndex}</strong></span>
        </div>
      </div>

      {/* Grid of Indexes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Car Wash Index */}
        <div className="flex flex-col items-center p-5 rounded-2xl bg-white/5 border border-white/8 hover:border-white/15 transition-all text-center">
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-5 h-5 text-sky-400" />
            <h4 className="text-sm font-bold text-white/95">세차 추천 지수</h4>
          </div>
          
          {/* Radial Progress */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-white/10 fill-transparent"
                strokeWidth="7"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="fill-transparent transition-all duration-500 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={getStrokeDashOffset(activeDay.carWashIndex)}
                stroke={carWash.strokeColor}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-extrabold text-white">{activeDay.carWashIndex}</span>
              <span className="text-[9px] text-white/40 tracking-wider">SCORE</span>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${carWash.color} mb-3`}>
            {carWash.label}
          </span>
          
          <p className="text-xs text-white/70 leading-relaxed max-w-xs mt-1">
            {carWash.desc}
          </p>
        </div>

        {/* Laundry Index */}
        <div className="flex flex-col items-center p-5 rounded-2xl bg-white/5 border border-white/8 hover:border-white/15 transition-all text-center">
          <div className="flex items-center gap-2 mb-3">
            <Shirt className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-bold text-white/95">빨래 지수</h4>
          </div>
          
          {/* Radial Progress */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-white/10 fill-transparent"
                strokeWidth="7"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="fill-transparent transition-all duration-500 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={getStrokeDashOffset(activeDay.laundryIndex)}
                stroke={laundry.strokeColor}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-extrabold text-white">{activeDay.laundryIndex}</span>
              <span className="text-[9px] text-white/40 tracking-wider">SCORE</span>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${laundry.color} mb-3`}>
            {laundry.label}
          </span>
          
          <p className="text-xs text-white/70 leading-relaxed max-w-xs mt-1">
            {laundry.desc}
          </p>
        </div>

        {/* Outdoor Activity Index */}
        <div className="flex flex-col items-center p-5 rounded-2xl bg-white/5 border border-white/8 hover:border-white/15 transition-all text-center">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-white/95">야외 활동 추천도</h4>
          </div>
          
          {/* Radial Progress */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-white/10 fill-transparent"
                strokeWidth="7"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="fill-transparent transition-all duration-500 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={getStrokeDashOffset(activeDay.activityIndex)}
                stroke={activity.strokeColor}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-extrabold text-white">{activeDay.activityIndex}</span>
              <span className="text-[9px] text-white/40 tracking-wider">SCORE</span>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activity.color} mb-3`}>
            {activity.label}
          </span>
          
          <p className="text-xs text-white/70 leading-relaxed max-w-xs mt-1">
            {activity.desc}
          </p>
        </div>
      </div>
    </div>
  );
};
