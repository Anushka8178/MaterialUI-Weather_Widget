import React from 'react';
import Card from 'react-bootstrap/Card';
import { motion } from 'framer-motion';
import './WeatherForecast.css';

export default function WeatherForecast({ forecastData }) {
    if (!forecastData || forecastData.length === 0) return null;

    const getDayName = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const getWeatherIcon = (weather) => {
        const weatherLower = weather.toLowerCase();
        if (weatherLower.includes('rain')) return '🌧️';
        if (weatherLower.includes('cloud')) return '☁️';
        if (weatherLower.includes('sun') || weatherLower.includes('clear')) return '☀️';
        if (weatherLower.includes('snow')) return '❄️';
        if (weatherLower.includes('storm')) return '⛈️';
        return '🌤️';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="forecast-container"
        >
            <h3 className="forecast-title">5-Day Forecast</h3>
            <div className="forecast-grid">
                {forecastData.slice(0, 5).map((day, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Card className="forecast-card">
                            <Card.Body>
                                <div className="forecast-day">{getDayName(day.date)}</div>
                                <div className="forecast-icon">{getWeatherIcon(day.weather)}</div>
                                <div className="forecast-temp">
                                    <span className="temp-high">{Math.round(day.tempMax)}°</span>
                                    <span className="temp-low">/{Math.round(day.tempMin)}°</span>
                                </div>
                                <div className="forecast-weather">{day.weather}</div>
                            </Card.Body>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
