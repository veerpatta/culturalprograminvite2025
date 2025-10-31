/**
 * Main application module for Timetable Command Center
 * Handles initialization, event handlers, and view orchestration
 * @module app
 */

import { parseTimetableData } from './data.js';
import { state, setAllData, setCurrentView, clearSubstitutionPlan, setSubstitutionPlan } from './state.js';
import { showToast, scrollToTop } from './utils.js';
import { DASHBOARD_REFRESH_INTERVAL } from './constants.js';
import {
	renderDashboard,
	renderDayView,
	renderClassView,
	renderTeacherView,
	renderSubstitutionView,
	renderFreeTeacherFinder,
	renderFullTimetableForPrint,
	findFreeTeachers
} from './views.js';

/**
 * Interval ID for dashboard auto-refresh
 * @type {number|null}
 */
let dashboardInterval = null;

/**
 * Switch between different views in the application
 * @param {string} view - View name ('Dashboard', 'Day', 'Substitution', 'Class', 'Teacher')
 */
export function switchView(view) {
	if (!view || typeof view !== 'string') {
		console.error('switchView: Invalid view name');
		return;
	}

	// Clear dashboard interval
	if (dashboardInterval) {
		clearInterval(dashboardInterval);
		dashboardInterval = null;
	}

	setCurrentView(view);

	// Update navigation active state
	document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
	const activeBtn = document.getElementById(`nav-${view}`);
	if (activeBtn) {
		activeBtn.classList.add('active');
	}

	// Render appropriate view
	switch (view) {
		case 'Dashboard':
			renderDashboard();
			// Set up auto-refresh for dashboard
			dashboardInterval = setInterval(() => {
				if (state.currentView === 'Dashboard') {
					renderFreeTeacherFinder();
				}
			}, DASHBOARD_REFRESH_INTERVAL);
			break;
		case 'Day':
			renderDayView();
			break;
		case 'Substitution':
			renderSubstitutionView();
			break;
		case 'Class':
			renderClassView();
			break;
		case 'Teacher':
			renderTeacherView();
			break;
		default:
			console.warn(`Unknown view: ${view}, defaulting to Dashboard`);
			renderDashboard();
	}

	// Scroll to top on view switch
	scrollToTop();
}

/**
 * Generate substitution plan for absent teachers
 * @param {string} day - Day name
 * @param {string[]} absentTeachers - Array of absent teacher names
 */
export function handleGeneratePlan(day, absentTeachers) {
	try {
		if (!day || !absentTeachers || absentTeachers.length === 0) {
			showToast('⚠️ Please select at least one absent teacher', 3000, 'warning');
			return;
		}

		const { teacherDetails } = state.allData;
		const vacantSlots = [];

		// Find all slots that need substitution
		absentTeachers.forEach(teacher => {
			const schedule = teacherDetails[teacher]?.schedule[day];
			if (schedule) {
				schedule.forEach((period, periodIndex) => {
					if (period) {
						vacantSlots.push({
							...period,
							periodIndex,
							originalTeacher: teacher
						});
					}
				});
			}
		});

		// Get current substitution data
		const currentSubs = state.substitutions[day] || { plan: {}, absentTeachers: [] };

		// Update absent teachers list
		currentSubs.absentTeachers = [...absentTeachers];

		// Clear existing plan for these slots
		vacantSlots.forEach(slot => {
			if (!currentSubs.plan[slot.className]) {
				currentSubs.plan[slot.className] = {};
			}
			delete currentSubs.plan[slot.className][slot.periodIndex];
		});

		// Generate new plan
		const newPlan = currentSubs.plan;
		vacantSlots.forEach(slot => {
			const freeTeachers = findFreeTeachers(day, slot.periodIndex, absentTeachers, newPlan);

			if (freeTeachers.length > 0) {
				if (!newPlan[slot.className]) {
					newPlan[slot.className] = {};
				}
				newPlan[slot.className][slot.periodIndex] = freeTeachers[0];
			}
		});

		// Save updated plan
		setSubstitutionPlan(day, newPlan, absentTeachers);
		showToast('✅ Substitution plan generated successfully!', 3000, 'success');
		renderSubstitutionView(day, absentTeachers);
	} catch (error) {
		console.error('Error generating substitution plan:', error);
		showToast('❌ Failed to generate substitution plan', 3000, 'error');
	}
}

/**
 * Reset substitution plan for a specific day
 * @param {string} day - Day name
 */
export function handleResetPlan(day) {
	try {
		if (!day) {
			showToast('⚠️ No day selected', 3000, 'warning');
			return;
		}

		if (!state.substitutions[day] || !state.substitutions[day].plan) {
			showToast('ℹ️ No substitution plan exists for this day', 3000, 'info');
			return;
		}

		const confirmReset = confirm(`Are you sure you want to reset the substitution plan for ${day}?`);
		if (!confirmReset) return;

		const absentTeachers = state.substitutions[day].absentTeachers || [];
		clearSubstitutionPlan(day);

		showToast('✅ Substitution plan reset successfully', 3000, 'success');
		renderSubstitutionView(day, absentTeachers);
	} catch (error) {
		console.error('Error resetting substitution plan:', error);
		showToast('❌ Failed to reset substitution plan', 3000, 'error');
	}
}

/**
 * Handle day selection change in substitution view
 * @param {string} newDay - New day name
 */
export function handleSubDayChange(newDay) {
	if (!newDay) {
		console.error('handleSubDayChange: Invalid day');
		return;
	}

	const selectedCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
	const absentTeachers = selectedCheckboxes.map(cb => cb.value);
	renderSubstitutionView(newDay, absentTeachers);
}

/**
 * Handle absent teacher checkbox change
 * @param {HTMLInputElement} checkbox - Checkbox element
 */
export function handleAbsentTeacherChange(checkbox) {
	if (!checkbox) {
		console.error('handleAbsentTeacherChange: Invalid checkbox');
		return;
	}

	const daySelect = document.getElementById('sub-day-select');
	if (!daySelect) {
		console.error('Day select element not found');
		return;
	}

	const day = daySelect.value;
	const selectedCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
	const absentTeachers = selectedCheckboxes.map(cb => cb.value);
	renderSubstitutionView(day, absentTeachers);
}

/**
 * Prepare content for printing
 * @returns {boolean} True if content was prepared successfully
 */
function preparePrintContent() {
	try {
		const printContent = renderFullTimetableForPrint();
		const printHeaderSubtitle = document.getElementById('print-header-subtitle');
		const printContentEl = document.getElementById('print-content');

		if (printHeaderSubtitle) {
			printHeaderSubtitle.textContent = 'Full School Timetable';
		}

		if (printContentEl) {
			printContentEl.innerHTML = printContent;
		}

		return true;
	} catch (error) {
		console.error('Error preparing print content:', error);
		return false;
	}
}

/**
 * Handle print action
 */
export function handlePrint() {
	try {
		if (preparePrintContent()) {
			const captureElement = document.getElementById('print-capture-area');
			if (!captureElement) {
				showToast('❌ Print capture area not found', 3000, 'error');
				return;
			}

			const prevDisplay = captureElement.style.display;
			captureElement.style.display = 'block';

			setTimeout(() => {
				window.print();
				captureElement.style.display = prevDisplay || 'none';
			}, 100);
		} else {
			showToast('⚠️ No printable content available.', 3000, 'warning');
		}
	} catch (error) {
		console.error('Print error:', error);
		showToast('❌ Print failed. Please try again.', 3000, 'error');
	}
}

/**
 * Handle screenshot sharing
 */
export function handleShareScreenshot() {
	try {
		const captureElement = document.getElementById('print-capture-area');
		const content = document.getElementById('main-content');

		if (!captureElement || !content) {
			showToast('❌ Required elements not found', 3000, 'error');
			return;
		}

		// Check if html2canvas is available
		if (typeof html2canvas === 'undefined') {
			showToast('❌ Screenshot library not loaded', 3000, 'error');
			return;
		}

		// Prepare capture area
		const prevCapture = captureElement.style.display;
		const printContentEl = document.getElementById('print-content');
		if (printContentEl) {
			printContentEl.innerHTML = content.innerHTML;
		}
		captureElement.style.display = 'block';

		html2canvas(captureElement).then(canvas => {
			captureElement.style.display = prevCapture;
			canvas.toBlob(blob => {
				if (!blob) {
					showToast('❌ Failed to create image', 3000, 'error');
					return;
				}

				try {
					const file = new File([blob], 'timetable.png', { type: 'image/png' });

					// Check if Web Share API is available
					if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
						navigator
							.share({
								files: [file],
								title: 'Veer Patta Public School Timetable'
							})
							.catch(err => {
								console.error('Share failed:', err);
								// Fallback to download
								downloadImage(blob);
							});
					} else {
						// If Web Share API is not available, download the image
						downloadImage(blob);
					}
				} catch (error) {
					console.error('Error sharing/downloading:', error);
					showToast('❌ Failed to share/download image', 3000, 'error');
				}
			});
		});
	} catch (error) {
		console.error('Screenshot error:', error);
		showToast('❌ Failed to capture screenshot', 3000, 'error');
	}
}

/**
 * Download blob as image file
 * @param {Blob} blob - Image blob
 */
function downloadImage(blob) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'timetable.png';
	a.click();
	URL.revokeObjectURL(url);
	showToast('✅ Timetable image downloaded', 3000, 'success');
}

/**
 * Initialize toast styles
 */
function initializeToastStyles() {
	const style = document.createElement('style');
	style.innerHTML = `
		.toast-notification {
			position: fixed;
			top: 20px;
			right: 20px;
			z-index: 10000;
			background: var(--primary-600);
			color: white;
			padding: 0.75rem 1rem;
			border-radius: var(--radius);
			box-shadow: var(--shadow-lg);
			transition: all 0.3s ease;
			font-size: 0.875rem;
			font-weight: 500;
			max-width: 300px;
			opacity: 1;
		}
		.toast-notification.error {
			background: var(--red-500);
		}
		.toast-notification.success {
			background: var(--green-500);
		}
		.toast-notification.warning {
			background: var(--yellow-500);
		}
		@keyframes pulse {
			0%, 100% { opacity: 1; }
			50% { opacity: .5; }
		}
	`;
	document.head.appendChild(style);
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardShortcuts() {
	document.addEventListener('keydown', e => {
		if (e.altKey) {
			switch (e.key) {
				case '1':
					switchView('Dashboard');
					break;
				case '2':
					switchView('Day');
					break;
				case '3':
					switchView('Substitution');
					break;
				case '4':
					switchView('Class');
					break;
				case '5':
					switchView('Teacher');
					break;
			}
		}
	});
}

/**
 * Initialize the application
 */
async function init() {
	try {
		console.log('Initializing Timetable Command Center...');

		// Parse data
		const parsedData = parseTimetableData();
		setAllData(parsedData);
		console.log('Initialized with data:', parsedData.days);

		// Initialize toast styles
		initializeToastStyles();

		// Render initial view
		switchView('Dashboard');

		// Set up keyboard shortcuts
		setupKeyboardShortcuts();

		// Hide loader after a delay for smoother UX
		setTimeout(() => {
			const loader = document.getElementById('loader');
			if (loader) {
				loader.style.opacity = '0';
				setTimeout(() => {
					loader.style.display = 'none';
				}, 300);
			}

			showToast('📚 Timetable Command Center loaded successfully!', 2000, 'success');
		}, 300);
	} catch (error) {
		console.error('Initialization error:', error);
		showToast('❌ Failed to load timetable data', 5000, 'error');

		// Show fallback content
		const mainContent = document.getElementById('main-content');
		if (mainContent) {
			mainContent.innerHTML = `
				<div class="card">
					<div style="color: var(--red-500); padding: 2rem; text-align: center;">
						<i data-lucide="alert-circle" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i><br>
						<h3>Initialization Error</h3>
						<p>Failed to load the timetable application. Please refresh the page.</p>
						<button onclick="window.location.reload()" class="button button-primary" style="margin-top: 1rem; max-width: 200px;">
							Reload Page
						</button>
					</div>
				</div>
			`;
		}

		if (window.lucide) {
			window.lucide.createIcons();
		}
	}
}

// Export handlers to window object for inline event handlers
window.appHandlers = {
	switchView,
	renderDayView,
	renderClassView,
	renderTeacherView,
	handleGeneratePlan,
	handleResetPlan,
	handleSubDayChange,
	handleAbsentTeacherChange,
	handlePrint,
	handleShareScreenshot
};

// Make scrollToTop globally available
window.scrollToTop = scrollToTop;

// Initialize app when window loads
window.addEventListener('load', init);
