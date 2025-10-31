/**
 * Constants module for Timetable Command Center
 * Contains period times, special teachers list, and other configuration constants
 * @module constants
 */

/**
 * School day names
 * @type {string[]}
 */
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * School period times in minutes from midnight
 * Used for calculating current period
 * @type {Array<{start: number, end: number}>}
 */
export const PERIOD_TIMES = [
	{ start: 8 * 60 + 30, end: 9 * 60 + 10 },   // Period 1: 8:30-9:10
	{ start: 9 * 60 + 10, end: 9 * 60 + 50 },   // Period 2: 9:10-9:50
	{ start: 9 * 60 + 50, end: 10 * 60 + 30 },  // Period 3: 9:50-10:30
	{ start: 10 * 60 + 30, end: 11 * 60 + 10 }, // Period 4: 10:30-11:10
	{ start: 11 * 60 + 30, end: 12 * 60 + 10 }, // Period 5: 11:30-12:10
	{ start: 12 * 60 + 10, end: 12 * 60 + 50 }, // Period 6: 12:10-12:50
	{ start: 12 * 60 + 50, end: 13 * 60 + 30 }, // Period 7: 12:50-13:30
	{ start: 13 * 60 + 30, end: 14 * 60 + 10 }  // Period 8: 13:30-14:10
];

/**
 * Special teachers who are excluded from free teacher finder
 * @type {string[]}
 */
export const SPECIAL_TEACHERS = ['Gyan', 'Phy'];

/**
 * Teachers with limited availability
 * Anjana is only available after period 4
 * @type {Object<string, {afterPeriod: number}>}
 */
export const LIMITED_AVAILABILITY = {
	'Anjana': { afterPeriod: 4 }
};

/**
 * Data correction mappings for common typos/variations
 * @type {Object<string, string>}
 */
export const DATA_CORRECTIONS = {
	'Nindika': 'Nidhika',
	'Sir': '',
	'english': 'English'
};

/**
 * Toast notification types
 * @type {Object<string, string>}
 */
export const TOAST_TYPES = {
	INFO: 'info',
	SUCCESS: 'success',
	WARNING: 'warning',
	ERROR: 'error'
};

/**
 * Default toast duration in milliseconds
 * @type {number}
 */
export const DEFAULT_TOAST_DURATION = 3000;

/**
 * Auto-refresh interval for dashboard (in milliseconds)
 * @type {number}
 */
export const DASHBOARD_REFRESH_INTERVAL = 30000; // 30 seconds

/**
 * Debounce delay for input events (in milliseconds)
 * @type {number}
 */
export const DEBOUNCE_DELAY = 300;
