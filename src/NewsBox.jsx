import React, { useEffect, useState } from 'react';

const NewsComponent = () => {
  const [error, setError] = useState(null);
  const [headlines, setHeadlines] = useState([]);

  const BASE_URL = "https://saurav.tech/NewsAPI/";
  const top_headlines_api = `${BASE_URL}/top-headlines/category/general/in.json`;  // Example category and country (India)

  useEffect(() => {
    const fetchHeadlines = async () => {
      try {
        const response = await fetch(top_headlines_api);
        
        // Check if the API response is okay
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the response as JSON
        const data = await response.json();

        // Check if 'articles' exists in the response data
        if (data.articles) {
          setHeadlines(data.articles);
        } else {
          setError('No results found.');
          setHeadlines([]);  // Clear the headlines in case of no results
        }
      } catch (err) {
        // Handle errors (e.g., network issues, API issues)
        setError(err.message);
        setHeadlines([]);  // Clear headlines on error
      }
    };

    fetchHeadlines();

    // Cleanup function to avoid setting state on unmounted component
    return () => {
      setError(null);
      setHeadlines([]);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <div>
      <h2>News Headlines</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {headlines.length > 0 ? (
        <ul>
          {headlines.map((item, index) => (
            <li key={index}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                Read more
              </a>
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>Loading news...</p>
      )}
    </div>
  );
};

export default NewsComponent;
