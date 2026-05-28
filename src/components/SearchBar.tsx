import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { useWeatherStore } from '../store/useWeatherStore';
import type { City } from '../store/useWeatherStore';
import { searchCities } from '../services/weatherService';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { setSelectedCity, addFavorite, favorites } = useWeatherStore();

  // Handle outside clicks to close autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCities(query);
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        console.error('검색 실패:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const myLocation: City = {
          name: '현재 위치',
          lat: parseFloat(latitude.toFixed(4)),
          lon: parseFloat(longitude.toFixed(4)),
          country: 'GPS'
        };
        setSelectedCity(myLocation);
        // Automatically add to favorites if not exists
        if (!favorites.some(f => f.name === '현재 위치')) {
          addFavorite(myLocation);
        }
        setIsSearching(false);
      },
      (error) => {
        console.error('위치 정보 획득 실패:', error);
        alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        setIsSearching(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className="relative w-full max-w-md mx-auto z-50" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="도시명을 영어 또는 한글로 입력하세요..."
            className="w-full pl-10 pr-10 py-3 rounded-full bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 transition-all text-white placeholder-white/50 text-sm glass-panel"
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button
          onClick={handleCurrentLocation}
          disabled={isSearching}
          title="현재 위치 날씨 보기"
          className="p-3 rounded-full bg-white/10 border border-white/15 hover:bg-white/20 active:scale-95 transition-all disabled:opacity-50 text-white cursor-pointer glass-panel"
        >
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <MapPin className="w-5 h-5 text-indigo-300" />
          )}
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass-panel-dark max-h-60 overflow-y-auto animate-fade-in z-50">
          {suggestions.map((city, idx) => (
            <button
              key={`${city.name}-${idx}`}
              onClick={() => handleSelectCity(city)}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-white hover:bg-white/10 active:bg-white/15 border-b border-white/5 last:border-0 transition-colors text-sm"
            >
              <span className="font-medium">{city.name}</span>
              <span className="text-xs text-white/50 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-white/10 uppercase tracking-wider">{city.country}</span>
                <span className="font-mono text-[10px]">({city.lat.toFixed(2)}, {city.lon.toFixed(2)})</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim().length >= 2 && suggestions.length === 0 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 px-4 py-4 rounded-2xl border border-white/10 text-center text-sm text-white/50 glass-panel-dark z-50">
          검색 결과가 없습니다. 영문 도시명(예: Seoul, Tokyo)으로 검색해 보세요.
        </div>
      )}
    </div>
  );
};
