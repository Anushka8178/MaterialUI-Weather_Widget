// Google Tag Manager utility functions

// Initialize dataLayer if it doesn't exist
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

// Function to send custom events to GTM
export const sendGTMEvent = (eventName, eventData = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData
    });
    console.log('GTM Event sent:', eventName, eventData);
  }
};

// Function to send page views
export const sendPageView = (pagePath, pageTitle) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GTM-KWZ9X3S2', {
      page_path: pagePath,
      page_title: pageTitle
    });
  }
};

// Function to test if GTM is working
export const testGTM = () => {
  if (typeof window !== 'undefined') {
    console.log('DataLayer exists:', !!window.dataLayer);
    console.log('GTM script loaded:', !!window.gtag);
    console.log('Current dataLayer:', window.dataLayer);
    
    // Send a test event
    sendGTMEvent('gtm_test', {
      test: true,
      timestamp: new Date().toISOString()
    });
  }
}; 