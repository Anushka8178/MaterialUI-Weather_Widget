import React, { useEffect, useState } from 'react';
import InfoBox from './InfoBox';

const NewsHeadlines = ({ info }) => {
    const [headlines, setHeadlines] = useState([]);
    const [error, setError] = useState(null);
    const apiUrl = 'https://saurav.tech/NewsAPI/top-headlines/category/health/in.json'; // No API key needed

    useEffect(() => {
        const fetchHeadlines = async () => {
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('API Response:', data); // Log the entire response data
                setHeadlines(data.articles || []); // Assuming articles are returned
            } catch (err) {
                setError(err.message);
                console.error('Error fetching news:', err);
            }
        };

        fetchHeadlines();
    }, [apiUrl]);

    if (error) {
        return <div>Error fetching news: {error}</div>;
    }

    if (headlines.length === 0) {
        return <div>Loading headlines...</div>;
    }

    return (
        <div>
            <InfoBox info={info} articles={headlines} />
        </div>
    );
};

export default NewsHeadlines;
