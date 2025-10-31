/**
 * State management module for Timetable Command Center
 * Manages application state, caching, and substitution data
 * @module state
 */

/**
 * Application state object
 * Maintains current view, substitutions, parsed data, cache, and performance metrics
 * @type {Object}
 */
export const state = {
	/** Current active view */
	currentView: 'Dashboard',

	/** Substitution data organized by day */
	substitutions: {},

	/** Parsed timetable data */
	allData: {},

	/** Cache for expensive computations */
	cache: new Map(),

	/** Last data update timestamp */
	lastUpdate: null,

	/** Performance metrics */
	performance: {
		renderTimes: [],
		avgRenderTime: 0
	}
};

/**
 * Initialize substitutions structure for all days
 * @param {string[]} days - Array of day names
 */
export function initializeSubstitutions(days) {
	if (!days || !Array.isArray(days)) {
		console.error('initializeSubstitutions: Invalid days array');
		return;
	}

	days.forEach(day => {
		if (!state.substitutions[day]) {
			state.substitutions[day] = {
				plan: {},
				absentTeachers: []
			};
		}
	});
}

/**
 * Get substitution plan for a specific day
 * @param {string} day - Day name
 * @returns {Object} Substitution plan for the day
 */
export function getSubstitutionPlan(day) {
	if (!day || typeof day !== 'string') {
		console.error('getSubstitutionPlan: Invalid day');
		return { plan: {}, absentTeachers: [] };
	}

	return state.substitutions[day] || { plan: {}, absentTeachers: [] };
}

/**
 * Set substitution plan for a specific day
 * @param {string} day - Day name
 * @param {Object} plan - Substitution plan object
 * @param {string[]} absentTeachers - Array of absent teacher names
 */
export function setSubstitutionPlan(day, plan, absentTeachers = []) {
	if (!day || typeof day !== 'string') {
		console.error('setSubstitutionPlan: Invalid day');
		return;
	}

	if (!plan || typeof plan !== 'object') {
		console.error('setSubstitutionPlan: Invalid plan');
		return;
	}

	state.substitutions[day] = {
		plan: plan,
		absentTeachers: absentTeachers
	};
}

/**
 * Clear substitution plan for a specific day
 * @param {string} day - Day name
 */
export function clearSubstitutionPlan(day) {
	if (!day || typeof day !== 'string') {
		console.error('clearSubstitutionPlan: Invalid day');
		return;
	}

	if (state.substitutions[day]) {
		const absentTeachers = state.substitutions[day].absentTeachers || [];
		state.substitutions[day] = {
			plan: {},
			absentTeachers: absentTeachers
		};
	}
}

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {*} Cached value or undefined
 */
export function getCachedValue(key) {
	if (!key || typeof key !== 'string') {
		console.error('getCachedValue: Invalid key');
		return undefined;
	}

	return state.cache.get(key);
}

/**
 * Set cached value
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 */
export function setCachedValue(key, value) {
	if (!key || typeof key !== 'string') {
		console.error('setCachedValue: Invalid key');
		return;
	}

	state.cache.set(key, value);
}

/**
 * Clear all cached values
 */
export function clearCache() {
	state.cache.clear();
	console.log('Cache cleared');
}

/**
 * Clear specific cache keys matching a pattern
 * @param {string} pattern - Pattern to match (simple string match)
 */
export function clearCachePattern(pattern) {
	if (!pattern || typeof pattern !== 'string') {
		console.error('clearCachePattern: Invalid pattern');
		return;
	}

	const keysToDelete = [];
	for (const key of state.cache.keys()) {
		if (key.includes(pattern)) {
			keysToDelete.push(key);
		}
	}

	keysToDelete.forEach(key => state.cache.delete(key));
	console.log(`Cleared ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
}

/**
 * Set the parsed timetable data
 * @param {Object} data - Parsed timetable data
 */
export function setAllData(data) {
	if (!data || typeof data !== 'object') {
		console.error('setAllData: Invalid data');
		return;
	}

	state.allData = data;
	state.lastUpdate = Date.now();

	// Initialize substitutions for all days
	if (data.days && Array.isArray(data.days)) {
		initializeSubstitutions(data.days);
	}
}

/**
 * Get the current view name
 * @returns {string} Current view name
 */
export function getCurrentView() {
	return state.currentView;
}

/**
 * Set the current view name
 * @param {string} viewName - View name to set
 */
export function setCurrentView(viewName) {
	if (!viewName || typeof viewName !== 'string') {
		console.error('setCurrentView: Invalid view name');
		return;
	}

	state.currentView = viewName;
	console.log(`Switched to view: ${viewName}`);
}

/**
 * Record render performance metric
 * @param {number} renderTime - Render time in milliseconds
 */
export function recordRenderTime(renderTime) {
	if (typeof renderTime !== 'number' || renderTime < 0) {
		console.error('recordRenderTime: Invalid render time');
		return;
	}

	state.performance.renderTimes.push(renderTime);

	// Keep only last 10 render times
	if (state.performance.renderTimes.length > 10) {
		state.performance.renderTimes.shift();
	}

	// Calculate average
	const sum = state.performance.renderTimes.reduce((a, b) => a + b, 0);
	state.performance.avgRenderTime = sum / state.performance.renderTimes.length;
}

/**
 * Get performance metrics
 * @returns {Object} Performance metrics object
 */
export function getPerformanceMetrics() {
	return {
		...state.performance,
		cacheSize: state.cache.size,
		lastUpdate: state.lastUpdate
	};
}

/**
 * Export current state (for debugging or backup)
 * @returns {Object} Current state snapshot
 */
export function exportState() {
	return {
		currentView: state.currentView,
		substitutions: JSON.parse(JSON.stringify(state.substitutions)),
		lastUpdate: state.lastUpdate,
		performance: { ...state.performance },
		cacheSize: state.cache.size
	};
}

/**
 * Reset state to initial values (except allData)
 */
export function resetState() {
	state.currentView = 'Dashboard';
	state.substitutions = {};
	state.cache.clear();
	state.performance = {
		renderTimes: [],
		avgRenderTime: 0
	};

	// Reinitialize substitutions if we have data
	if (state.allData && state.allData.days) {
		initializeSubstitutions(state.allData.days);
	}

	console.log('State reset to initial values');
}
