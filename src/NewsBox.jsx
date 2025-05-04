import React, { useEffect, useState } from 'react';
import InfoBox from './InfoBox';

const NewsHeadlines = ({ info }) => {
    const [headlines, setHeadlines] = useState([]);
    const [error, setError] = useState(null);
    const apiUrl = 'https://newsdata.io/api/1/archive?apikey=pub_8472551a224531ddec41cc8d04fe45aa3cd29&q=example&language=en&from_date=2023-01-19&to_date=2023-01-25';
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
