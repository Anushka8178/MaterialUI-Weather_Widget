import React, { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export default function SearchBox({ updateInfo, updateNews }) {
    let [city, setCity] = useState("");
    let [error, setError] = useState(false);
    const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
    const WEATHER_API_KEY = "bd5e378503939ddaee76f12ad7a97608";
    const BASE_URL = "https://saurav.tech/NewsAPI/";
    const top_headlines_api = `${BASE_URL}/top-headlines/category/general/in.json`;  // Example category and country

    const getWeatherInfo = async () => {
        try {
            let response = await fetch(`${WEATHER_API_URL}?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
            let jsonResponse = await response.json();
            if (!response.ok) throw new Error(jsonResponse.message);
            let result = {
                city: city,
                temp: jsonResponse.main.temp,
                tempMin: jsonResponse.main.temp_min,
                tempMax: jsonResponse.main.temp_max,
                humidity: jsonResponse.main.humidity,
                feelslike: jsonResponse.main.feels_like,
                weather: jsonResponse.weather[0].description,
            };
            return result;
        } catch (err) {
            throw err;
        }
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
    };

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        try {
            const weatherData = await getWeatherInfo();
            updateInfo(weatherData);
            const newsData = await getNewsInfo();
            updateNews(newsData);
            setError(false);
            setCity("");
        } catch (err) {
            setError(true);
            console.error(err);
        }
    };

    return (
        <div className='SearchBox'>
            <form onSubmit={handleSubmit}>
                <InputGroup className="mb-3 input">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Enter the city name:
                    </InputGroup.Text>
                    <Form.Control
                        value={city}
                        onChange={handleChange}
                        placeholder='Enter City Name'
                        required
                    />
                </InputGroup>
                <Button variant="primary" size="lg" type="submit" className='weaBtn'>
                    Click to get the weather and news!
                </Button>
                {error && <p style={{ color: "red", fontWeight: "bold" }}>No such place exists :/</p>}
            </form>
        </div>
    );
}
