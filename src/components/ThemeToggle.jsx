import React from 'react';
import { motion } from 'framer-motion';
import Button from 'react-bootstrap/Button';
import './ThemeToggle.css';

export default function ThemeToggle({ isDark, toggleTheme }) {
    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="theme-toggle-container"
        >
            <Button
                variant="outline-light"
                onClick={toggleTheme}
                className="theme-toggle-btn"
            >
                {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </Button>
        </motion.div>
    );
}
