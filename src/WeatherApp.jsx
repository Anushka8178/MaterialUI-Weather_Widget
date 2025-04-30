import React, { useState } from 'react';
import SearchBox from './SearchBox';
import InfoBox from './InfoBox';
import './WeatherApp.css'
import Button from 'react-bootstrap/Button';

const WeatherApp = () => {
    const [weatherInfo, setWeatherInfo] = useState({});
    const [newsArticles, setNewsArticles] = useState([]);

    return (
        <div className="container">
            <div className='header'>
                <h2>SkyTrackr-Your Weather Tracker</h2>
            </div>
            
            <div className="weather-container">
                <SearchBox updateInfo={setWeatherInfo} updateNews={setNewsArticles} />
                <InfoBox info={weatherInfo} headlines={newsArticles} />
            </div>
        </div>
    );
};

export default WeatherApp;
