import React, { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, isLoading, placeholder = 'Search for a city...' }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q && !isLoading) onSearch(q);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-bar-inner">
        <input
          type="text"
          className="search-bar-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          aria-label="City search"
        />
        <button type="submit" className="search-bar-btn" disabled={isLoading || !query.trim()}>
          {isLoading ? '...' : 'Search'}
        </button>
      </div>
    </form>
  );
}
