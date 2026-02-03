import Typography from '@mui/material/Typography';
import './InfoBox.css';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import { motion } from 'framer-motion';
import WeatherForecast from './components/WeatherForecast';
import WeatherChart from './components/WeatherChart';

export default function InfoBox({ info, headlines, forecastData, isLoading }) {
    // Weather image URLs for different conditions
    const SUNNY_URL = "https://images.pexels.com/photos/912364/pexels-photo-912364.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
    const RAIN_URL = "https://images.pexels.com/photos/763398/pexels-photo-763398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
    const COLD_URL = "https://images.pexels.com/photos/2557709/pexels-photo-2557709.jpeg?auto=compress&cs=tinysrgb&w=400";
    const HOT_URL = "https://images.unsplash.com/photo-1581129724980-2ab2153c2d8d?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdCUyMHdlYXRoZXJ8ZW58MHx8MHx8fDA%3D";
    const VERY_HOT_URL = "https://media.istockphoto.com/id/1007768414/photo/blue-sky-with-bright-sun-and-clouds.webp?a=1&b=1&s=612x612&w=0&k=20&c=Dbpa9jxwFTZnW-yyyJccEU_FqhEL3fXqMIP68kbLUFw=";

    // Get current date and time
    const currDate = new Date().toLocaleDateString();
    const currTime = new Date().toLocaleTimeString();
    const currentHour = new Date().getHours();

    // Determine time of day message
    let timeMsg;
    if (currentHour < 12) {
        timeMsg = "Morning";
    } else if (currentHour >= 12 && currentHour < 17) {
        timeMsg = "Afternoon";
    } else {
        timeMsg = "Evening";
    }

    // Variables for weather image and icon
    let weatherImage, weatherIcon;

    // Determine weather image and icon based on conditions
    if (info.humidity > 70) {
        weatherImage = RAIN_URL;
        weatherIcon = <ThunderstormIcon />;
    } else if (info.temp > 30) {
        weatherImage = VERY_HOT_URL;
        weatherIcon = <WbSunnyIcon />;
    } else if (info.temp > 20) {
        weatherImage = HOT_URL;
        weatherIcon = <WbSunnyIcon />;
    } else if (info.temp < 10) {
        weatherImage = COLD_URL;
        weatherIcon = <AcUnitIcon />;
    } else {
        weatherImage = SUNNY_URL;
        weatherIcon = <WbSunnyIcon />;
    }

    // Main component render
    return (
        <div className="pageContainer">
            {info.city && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="InfoBox">
                        <Card.Img 
                            src={weatherImage} 
                            alt="Weather image" 
                            className="card-img"
                        />
                        <Card.ImgOverlay className="card-img-overlay">
                            <div className='content'>
                                {/* Weather title with city name and icon */}
                                <motion.div 
                                    className='title'
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card.Title>What's the weather like in {info.city} {weatherIcon}</Card.Title>
                                </motion.div>
                                {/* Weather data section */}
                                <motion.div 
                                    className='data'
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Card.Text>
                                        <p>Current Date: {currDate}</p>
                                        <p>Current Time: {currTime}</p>
                                        <p>Good {timeMsg}</p>
                                        <p>Temperature: {Math.round(info.temp)}&deg;C</p>
                                        <p>Humidity: {info.humidity}%</p>
                                        <p>Min Temp: {Math.round(info.tempMin)}&deg;C</p>
                                        <p>Max Temp: {Math.round(info.tempMax)}&deg;C</p>
                                        <p>Weather: {info.weather}, Feels like: {Math.round(info.feelslike)}&deg;C</p>
                                        {info.windSpeed && <p>Wind Speed: {info.windSpeed} m/s</p>}
                                        {info.pressure && <p>Pressure: {info.pressure} hPa</p>}
                                    </Card.Text>
                                </motion.div>
                                
                                {/* Weather Forecast */}
                                {forecastData && forecastData.length > 0 && (
                                    <WeatherForecast forecastData={forecastData} />
                                )}
                                
                                {/* Weather Chart */}
                                {forecastData && forecastData.length > 0 && (
                                    <WeatherChart forecastData={forecastData} />
                                )}
                                
                                {/* News section - only shown if headlines are available */}
                                {headlines && headlines.length > 0 && (
                                    <motion.div 
                                        className='news-section'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <Card.Title>Latest News</Card.Title>
                                        <ListGroup variant="flush" className="news-list">
                                            {headlines.slice(0, 5).map((article, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.6 + index * 0.1 }}
                                                >
                                                    <ListGroup.Item>
                                                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                                                            <h6>{article.title}</h6>
                                                        </a>
                                                        <small>{article.publishedAt}</small>
                                                        <p className="mb-0">{article.description}</p>
                                                    </ListGroup.Item>
                                                </motion.div>
                                            ))}
                                        </ListGroup>
                                    </motion.div>
                                )}
                                <Card.Text className="last-updated">Last updated just now</Card.Text>
                            </div>
                        </Card.ImgOverlay>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
