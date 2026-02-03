import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { motion } from 'framer-motion';
import './WeatherChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function WeatherChart({ forecastData }) {
    if (!forecastData || forecastData.length === 0) return null;

    const labels = forecastData.slice(0, 5).map((day, index) => {
        const date = new Date(day.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const maxTemps = forecastData.slice(0, 5).map(day => Math.round(day.tempMax));
    const minTemps = forecastData.slice(0, 5).map(day => Math.round(day.tempMin));

    const data = {
        labels,
        datasets: [
            {
                label: 'Max Temperature',
                data: maxTemps,
                borderColor: '#8B6FA8',
                backgroundColor: 'rgba(139, 111, 168, 0.15)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: 'Min Temperature',
                data: minTemps,
                borderColor: '#9B8FA8',
                backgroundColor: 'rgba(155, 143, 168, 0.15)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#6B5B7D',
                    font: {
                        size: 12,
                        weight: '600'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#6B5B7D',
                bodyColor: '#5A4A6A',
                borderColor: 'rgba(139, 111, 168, 0.25)',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                ticks: {
                    color: '#8B7A9B',
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: 'rgba(139, 111, 168, 0.15)',
                }
            },
            y: {
                ticks: {
                    color: '#6B5B7D',
                    font: {
                        size: 11
                    },
                    callback: function(value) {
                        return value + '°C';
                    }
                },
                grid: {
                    color: 'rgba(139, 111, 168, 0.2)',
                }
            },
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="chart-container"
        >
            <h3 className="chart-title">Temperature Trend</h3>
            <div className="chart-wrapper">
                <Line data={data} options={options} />
            </div>
        </motion.div>
    );
}
