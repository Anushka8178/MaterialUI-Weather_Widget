import React, { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { motion, AnimatePresence } from 'framer-motion';
import { sendGTMEvent, testGTM } from './utils/gtm';
import LoadingSpinner from './components/LoadingSpinner';
import './SearchBox.css';

export default function SearchBox({ updateInfo, updateNews, updateForecast, setLoading }) {
    let [city, setCity] = useState("");
    let [error, setError] = useState(false);
    let [errorMessage, setErrorMessage] = useState("");
    let [isLoading, setIsLoading] = useState(false);
    const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
    const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";
    const WEATHER_API_KEY = "bd5e378503939ddaee76f12ad7a97608";
    const BASE_URL = "https://saurav.tech/NewsAPI/";
    const top_headlines_api = `${BASE_URL}/top-headlines/category/general/in.json`;

    // Test GTM on component mount
    React.useEffect(() => {
        testGTM();
    }, []);

    const getWeatherInfo = async (cityName = null) => {
        try {
            const searchCity = cityName || city.trim();
            if (!searchCity) {
                throw new Error("Please enter a city name");
            }
            const encodedCity = encodeURIComponent(searchCity);
            let response = await fetch(`${WEATHER_API_URL}?q=${encodedCity}&appid=${WEATHER_API_KEY}&units=metric`);
            let jsonResponse = await response.json();
            
            if (!response.ok || jsonResponse.cod === '404') {
                throw new Error(jsonResponse.message || "City not found");
            }
            
            let result = {
                city: jsonResponse.name || searchCity,
                temp: jsonResponse.main.temp,
                tempMin: jsonResponse.main.temp_min,
                tempMax: jsonResponse.main.temp_max,
                humidity: jsonResponse.main.humidity,
                feelslike: jsonResponse.main.feels_like,
                weather: jsonResponse.weather[0].description,
                weatherMain: jsonResponse.weather[0].main,
                windSpeed: jsonResponse.wind?.speed || 0,
                pressure: jsonResponse.main.pressure,
            };
            return result;
        } catch (err) {
            throw err;
        }
    };

    const getForecastInfo = async (cityName = null) => {
        try {
            const searchCity = cityName || city.trim();
            if (!searchCity) return [];
            
            const encodedCity = encodeURIComponent(searchCity);
            let response = await fetch(`${FORECAST_API_URL}?q=${encodedCity}&appid=${WEATHER_API_KEY}&units=metric`);
            let jsonResponse = await response.json();
            
            if (!response.ok || jsonResponse.cod === '404') {
                return [];
            }
            
            // Group forecast by day and get daily averages
            const dailyData = {};
            jsonResponse.list.forEach(item => {
                const date = item.dt_txt.split(' ')[0];
                if (!dailyData[date]) {
                    dailyData[date] = {
                        date: date,
                        temps: [],
                        weathers: [],
                        tempMins: [],
                        tempMaxs: []
                    };
                }
                dailyData[date].temps.push(item.main.temp);
                dailyData[date].tempMins.push(item.main.temp_min);
                dailyData[date].tempMaxs.push(item.main.temp_max);
                dailyData[date].weathers.push(item.weather[0].description);
            });
            
            return Object.values(dailyData).map(day => ({
                date: day.date,
                temp: day.temps.reduce((a, b) => a + b, 0) / day.temps.length,
                tempMin: Math.min(...day.tempMins),
                tempMax: Math.max(...day.tempMaxs),
                weather: day.weathers[0]
            }));
        } catch (err) {
            console.error("Forecast error:", err);
            return [];
        }
    };

    const getLocationWeather = async () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const response = await fetch(
                            `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
                        );
                        const jsonResponse = await response.json();
                        
                        if (!response.ok) {
                            throw new Error(jsonResponse.message || "Location not found");
                        }
                        
                        const cityName = jsonResponse.name;
                        resolve(cityName);
                    } catch (err) {
                        reject(err);
                    }
                },
                (error) => {
                    reject(new Error("Unable to retrieve your location"));
                }
            );
        });
    };

    const getNewsInfo = async () => {
        try {
            const response = await axios.get(top_headlines_api);  // Fetching from updated API
            return response.data.articles.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                publishedAt: new Date(article.publishedAt).toLocaleDateString()
            }));
        } catch (err) {
            console.error("Error fetching news:", err);
            return []; // Return empty array if news fetch fails
        }
    };

    const handleChange = (evt) => {
        setCity(evt.target.value);
        setError(false);
        setErrorMessage("");
    };

    const handleLocationClick = async () => {
        setIsLoading(true);
        setError(false);
        setErrorMessage("");
        if (setLoading) setLoading(true);
        
        try {
            const cityName = await getLocationWeather();
            setCity(cityName);
            await handleSearch(cityName);
        } catch (err) {
            setError(true);
            setErrorMessage(err.message || "Unable to get your location");
            if (setLoading) setLoading(false);
            setIsLoading(false);
        }
    };

    const handleSearch = async (cityName = null) => {
        const searchCity = cityName || city.trim();
        if (!searchCity) {
            setError(true);
            setErrorMessage("Please enter a city name");
            return;
        }

        setIsLoading(true);
        setError(false);
        setErrorMessage("");
        if (setLoading) setLoading(true);

        try {
            sendGTMEvent('weather_search', {
                city: searchCity,
                timestamp: new Date().toISOString()
            });

            const [weatherData, forecastData, newsData] = await Promise.all([
                getWeatherInfo(searchCity),
                getForecastInfo(searchCity),
                getNewsInfo()
            ]);

            updateInfo(weatherData);
            if (updateForecast) updateForecast(forecastData);
            updateNews(newsData);

            sendGTMEvent('weather_success', {
                city: searchCity,
                temperature: weatherData.temp,
                weather: weatherData.weather
            });

            setError(false);
            if (!cityName) setCity("");
        } catch (err) {
            sendGTMEvent('weather_error', {
                city: searchCity,
                error: err.message
            });
            
            setError(true);
            setErrorMessage(err.message || "City not found. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
            if (setLoading) setLoading(false);
        }
    };

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        await handleSearch();
    };

    return (
        <div className='SearchBox'>
            <form onSubmit={handleSubmit}>
                <div className="search-wrapper">
                    <div className="search-input-container">
                        <Form.Control
                            value={city}
                            onChange={handleChange}
                            placeholder='Search for a city...'
                            required
                            disabled={isLoading}
                            className="search-input"
                        />
                        <Button 
                            variant="primary" 
                            type="submit" 
                            className='search-btn'
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Search'}
                        </Button>
                    </div>
                    <Button 
                        variant="outline" 
                        type="button"
                        onClick={handleLocationClick}
                        className='location-btn'
                        disabled={isLoading}
                    >
                        Use My Location
                    </Button>
                </div>
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="error-message"
                        >
                            {errorMessage || "City not found. Please try again."}
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
}
