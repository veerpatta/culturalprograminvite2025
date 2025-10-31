/**
 * Utility functions module for Timetable Command Center
 * Contains helper functions for UI interactions, time calculations, and data validation
 * @module utils
 */

import { PERIOD_TIMES, DAYS, DEFAULT_TOAST_DURATION, TOAST_TYPES } from './constants.js';

/**
 * Display a toast notification to the user
 * @param {string} message - The message to display
 * @param {number} [duration=3000] - Duration in milliseconds
 * @param {string} [type='info'] - Toast type: 'info', 'success', 'warning', 'error'
 */
export function showToast(message, duration = DEFAULT_TOAST_DURATION, type = TOAST_TYPES.INFO) {
	// Input validation
	if (!message || typeof message !== 'string') {
		console.error('showToast: Invalid message');
		return;
	}

	// Remove existing toast
	const existingToast = document.querySelector('.toast-notification');
	if (existingToast) {
		existingToast.remove();
	}

	// Create toast element
	const toast = document.createElement('div');
	toast.className = `toast-notification ${type}`;

	// Use textContent to prevent XSS
	const span = document.createElement('span');
	span.textContent = message;
	toast.appendChild(span);

	document.body.appendChild(toast);

	// Auto-remove after duration
	setTimeout(() => {
		toast.style.opacity = '0';
		setTimeout(() => toast.remove(), 300);
	}, duration);
}

/**
 * Scroll the page to the top smoothly
 */
export function scrollToTop() {
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
	if (typeof func !== 'function') {
		throw new TypeError('debounce: first argument must be a function');
	}

	if (typeof wait !== 'number' || wait < 0) {
		throw new TypeError('debounce: second argument must be a positive number');
	}

	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

/**
 * Get the current day name, mapping Sunday to Monday for school context
 * @param {Object} allData - The parsed timetable data
 * @returns {string} Current day name
 */
export function getCurrentDay(allData = null) {
	const today = new Date();
	const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

	// Map Sunday to Monday for school context
	if (dayName === 'Sunday') {
		return 'Monday';
	}

	// Ensure the day exists in our timetable if data is available
	if (allData && allData.days && allData.days.includes(dayName)) {
		return dayName;
	}

	// Fallback to Monday
	return 'Monday';
}

/**
 * Calculate the current school period based on time
 * @returns {number} Current period number (1-8), or 1 if before school, 8 if after
 */
export function getCurrentPeriod() {
	const now = new Date();
	const hour = now.getHours();
	const minute = now.getMinutes();
	const timeInMinutes = hour * 60 + minute;

	for (let i = 0; i < PERIOD_TIMES.length; i++) {
		if (timeInMinutes >= PERIOD_TIMES[i].start && timeInMinutes <= PERIOD_TIMES[i].end) {
			return i + 1;
		}
	}

	// If outside school hours, return appropriate period
	if (timeInMinutes < PERIOD_TIMES[0].start) {
		return 1;
	}

	return Math.min(8, PERIOD_TIMES.length);
}

/**
 * Format time from 24-hour to 12-hour format with AM/PM
 * @param {number} hours - Hours (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {string} Formatted time string
 */
export function formatTime(hours, minutes) {
	if (typeof hours !== 'number' || hours < 0 || hours > 23) {
		console.error('formatTime: Invalid hours');
		return 'Invalid time';
	}

	if (typeof minutes !== 'number' || minutes < 0 || minutes > 59) {
		console.error('formatTime: Invalid minutes');
		return 'Invalid time';
	}

	const period = hours >= 12 ? 'PM' : 'AM';
	const displayHours = hours % 12 || 12;
	const displayMinutes = minutes.toString().padStart(2, '0');

	return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Get current time formatted as a string
 * @returns {string} Current time in 12-hour format
 */
export function getCurrentTimeString() {
	const now = new Date();
	return now.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});
}

/**
 * Extract class number from class name for sorting
 * @param {string} className - Class name (e.g., "Class 10", "Class 11 Science")
 * @returns {number} Extracted number or 999 if not found
 */
export function extractClassNumber(className) {
	if (!className || typeof className !== 'string') {
		return 999;
	}

	const match = className.match(/(\d+)/);
	return match ? parseInt(match[1]) : 999;
}

/**
 * Validate that a day exists in the timetable data
 * @param {string} day - Day name to validate
 * @param {Object} allData - The parsed timetable data
 * @returns {boolean} True if day is valid
 */
export function isValidDay(day, allData) {
	if (!day || typeof day !== 'string') {
		return false;
	}

	if (!allData || !allData.days || !Array.isArray(allData.days)) {
		return false;
	}

	return allData.days.includes(day);
}

/**
 * Validate that a period index is within valid range
 * @param {number} periodIndex - Period index to validate (0-7)
 * @param {Object} allData - The parsed timetable data
 * @returns {boolean} True if period index is valid
 */
export function isValidPeriod(periodIndex, allData) {
	if (typeof periodIndex !== 'number' || periodIndex < 0) {
		return false;
	}

	const maxPeriods = allData?.periodHeaders?.length || 8;
	return periodIndex < maxPeriods;
}

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeHTML(html) {
	if (!html || typeof html !== 'string') {
		return '';
	}

	const div = document.createElement('div');
	div.textContent = html;
	return div.innerHTML;
}

/**
 * Create a DOM element with text content (XSS-safe)
 * @param {string} tag - HTML tag name
 * @param {string} text - Text content
 * @param {string} [className] - Optional class name
 * @returns {HTMLElement} Created element
 */
export function createTextElement(tag, text, className = '') {
	if (!tag || typeof tag !== 'string') {
		throw new Error('createTextElement: Invalid tag');
	}

	const element = document.createElement(tag);
	if (text) {
		element.textContent = text;
	}
	if (className) {
		element.className = className;
	}
	return element;
}

/**
 * Generate a cache key for memoization
 * @param {...any} args - Arguments to include in cache key
 * @returns {string} Cache key
 */
export function generateCacheKey(...args) {
	return args.map(arg => {
		if (typeof arg === 'object') {
			return JSON.stringify(arg);
		}
		return String(arg);
	}).join('-');
}
