import React from 'react';
import { Star, X } from 'lucide-react';
import { useWeatherStore } from '../store/useWeatherStore';
import type { City } from '../store/useWeatherStore';

export const FavoriteCities: React.FC = () => {
  const { selectedCity, setSelectedCity, favorites, addFavorite, removeFavorite } = useWeatherStore();

  const isCurrentFavorite = favorites.some(
    (f) => f.name.toLowerCase() === selectedCity.name.toLowerCase() && Math.abs(f.lat - selectedCity.lat) < 0.05
  );

  const toggleFavorite = () => {
    if (isCurrentFavorite) {
      removeFavorite(selectedCity.name);
    } else {
      addFavorite(selectedCity);
    }
  };

  const handleSelect = (city: City) => {
    setSelectedCity(city);
  };

  const handleDelete = (e: React.MouseEvent, cityName: string) => {
    e.stopPropagation(); // Prevent choosing the city when deleting
    removeFavorite(cityName);
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Favorite Toggle Button */}
      <button
        onClick={toggleFavorite}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-semibold cursor-pointer ${
          isCurrentFavorite
            ? 'bg-amber-500/20 border-amber-400 text-amber-300 hover:bg-amber-500/30'
            : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80 hover:text-white'
        }`}
      >
        {isCurrentFavorite ? (
          <>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            즐겨찾기 저장됨
          </>
        ) : (
          <>
            <Star className="w-4 h-4 text-white/60" />
            이 지역 즐겨찾기 추가
          </>
        )}
      </button>

      {/* Favorites List */}
      {favorites.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {favorites.map((city, idx) => {
            const isSelected = selectedCity.name === city.name && Math.abs(selectedCity.lat - city.lat) < 0.05;
            return (
              <div
                key={`${city.name}-${idx}`}
                onClick={() => handleSelect(city)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-600/35 border-indigo-400 text-white font-medium ring-2 ring-indigo-500/30'
                    : 'bg-white/5 border-white/8 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{city.name}</span>
                {city.country !== 'GPS' && (
                  <span className="text-[10px] opacity-40 uppercase">{city.country}</span>
                )}
                {/* Delete button (only show X if there is more than 1 favorite, or just show it) */}
                <button
                  onClick={(e) => handleDelete(e, city.name)}
                  className="p-0.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  title="즐겨찾기 삭제"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
