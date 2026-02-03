import React from 'react';
import { getFavorites, getRecents, saveFavorites, addFavorite, removeFavorite, isFavorite } from '../utils/storage';
import './SavedCities.css';

export default function SavedCities({ currentLocation, onSelectCity, onFavoritesChange }) {
  const favorites = getFavorites();
  const recent = getRecents()
    .filter((c) => !currentLocation || !(c.name === currentLocation.name && c.country === currentLocation.country))
    .slice(0, 6);

  const handleFavoriteClick = (e, city) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite(city)) {
      const list = getFavorites().filter((c) => !(c.name === city.name && c.country === city.country));
      saveFavorites(list);
    } else {
      addFavorite(city);
    }
    onFavoritesChange?.();
  };

  const handleClick = (city) => {
    onSelectCity?.({ name: city.name, country: city.country, lat: city.lat, lon: city.lon });
  };

  return (
    <div className="saved-cities glass-card">
      <div className="saved-cities-section">
        <h3 className="saved-cities-title">⭐ Favorites</h3>
        {favorites.length > 0 ? (
          <div className="saved-cities-chips">
            {favorites.map((city, i) => (
              <div key={`fav-${city.name}-${city.country}-${i}`} className="saved-cities-chip-wrap">
                <button
                  type="button"
                  className="saved-cities-chip"
                  onClick={() => handleClick(city)}
                >
                  {city.name}
                  {city.country ? `, ${city.country}` : ''}
                </button>
                <button
                  type="button"
                  className="saved-cities-star active"
                  onClick={(e) => handleFavoriteClick(e, city)}
                  aria-label="Remove from favorites"
                >
                  ★
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="saved-cities-hint">Save a city from the current weather card to see it here.</p>
        )}
      </div>

      <div className="saved-cities-section">
        <h3 className="saved-cities-title">🕒 Recent Searches</h3>
        {recent.length > 0 ? (
          <div className="saved-cities-chips">
            {recent.map((city, i) => (
              <div key={`rec-${city.name}-${city.country}-${i}`} className="saved-cities-chip-wrap">
                <button
                  type="button"
                  className="saved-cities-chip"
                  onClick={() => handleClick(city)}
                >
                  {city.name}
                  {city.country ? `, ${city.country}` : ''}
                </button>
                <button
                  type="button"
                  className={`saved-cities-star ${isFavorite(city) ? 'active' : ''}`}
                  onClick={(e) => handleFavoriteClick(e, city)}
                  aria-label={isFavorite(city) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorite(city) ? '★' : '☆'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="saved-cities-hint">Recent searches will appear here after you search for a city.</p>
        )}
      </div>
    </div>
  );
}
