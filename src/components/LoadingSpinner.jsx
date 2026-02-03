import React from 'react';
import { motion } from 'framer-motion';
import './LoadingSpinner.css';

export default function LoadingSpinner() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loading-container"
        >
            <div className="spinner">
                <motion.div
                    className="spinner-ring"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="spinner-ring"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="loading-text"
            >
                Fetching weather data...
            </motion.p>
        </motion.div>
    );
}
