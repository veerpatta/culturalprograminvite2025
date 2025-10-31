/**
 * Views module for Timetable Command Center
 * Contains all rendering functions for different views
 * @module views
 */

import { state, getSubstitutionPlan } from './state.js';
import { getCurrentDay, getCurrentPeriod, getCurrentTimeString, isValidDay, createTextElement } from './utils.js';
import { SPECIAL_TEACHERS, LIMITED_AVAILABILITY } from './constants.js';

/**
 * Find free teachers for a specific period
 * @param {string} day - Day name
 * @param {number} periodIndex - Period index (0-7)
 * @param {string[]} absentTeachers - Array of absent teacher names
 * @param {Object} currentDaySubs - Current day substitution plan
 * @returns {string[]} Array of free teacher names
 */
export function findFreeTeachers(day, periodIndex, absentTeachers, currentDaySubs) {
	try {
		// Validate inputs
		if (!state.allData || !state.allData.teacherNames) {
			console.error('Teacher data not available');
			return [];
		}

		if (!isValidDay(day, state.allData)) {
			console.error('Day not found in timetable:', day);
			return [];
		}

		if (periodIndex < 0 || periodIndex >= (state.allData.periodHeaders?.length || 8)) {
			console.error('Invalid period index:', periodIndex);
			return [];
		}

		// Check cache
		const cacheKey = `free-${day}-${periodIndex}-${absentTeachers.join(',')}-${JSON.stringify(currentDaySubs)}`;
		if (state.cache.has(cacheKey)) {
			return state.cache.get(cacheKey);
		}

		const free = [];

		for (const teacher of state.allData.teacherNames) {
			// Skip if absent
			if (absentTeachers.includes(teacher)) continue;

			// Skip special cases
			if (SPECIAL_TEACHERS.includes(teacher)) continue;

			// Check limited availability
			if (LIMITED_AVAILABILITY[teacher]) {
				const limit = LIMITED_AVAILABILITY[teacher];
				if (limit.afterPeriod && periodIndex < limit.afterPeriod) {
					continue;
				}
			}

			// Check if teacher has a regular class this period
			const teacherSchedule = state.allData.teacherDetails[teacher]?.schedule[day];
			if (teacherSchedule && teacherSchedule[periodIndex]) {
				continue;
			}

			// Check if already assigned as substitute
			let isBusyAsSub = false;
			for (const cName in currentDaySubs) {
				if (currentDaySubs[cName][periodIndex] === teacher) {
					isBusyAsSub = true;
					break;
				}
			}
			if (isBusyAsSub) continue;

			free.push(teacher);
		}

		// Sort by current workload (ascending)
		free.sort((a, b) => {
			const workloadA = state.allData.teacherDetails[a]?.workload[day] || 0;
			const workloadB = state.allData.teacherDetails[b]?.workload[day] || 0;
			return workloadA - workloadB;
		});

		console.log(`Free teachers for ${day} period ${periodIndex + 1}:`, free);

		state.cache.set(cacheKey, free);
		return free;
	} catch (error) {
		console.error('Error finding free teachers:', error);
		return [];
	}
}

/**
 * Render the free teacher finder component
 * @param {string|null} [day=null] - Day name (defaults to current day)
 * @param {number|null} [period=null] - Period number (defaults to current period)
 */
export function renderFreeTeacherFinder(day = null, period = null) {
	const container = document.getElementById('free-teacher-finder-container');
	if (!container) return;

	try {
		// Ensure we have data
		if (!state.allData || !state.allData.days || state.allData.days.length === 0) {
			container.innerHTML = `
				<div style="color: var(--red-500); padding: 2rem; text-align: center; border: 2px dashed var(--red-200); border-radius: var(--radius);">
					<i data-lucide="alert-circle" style="width: 24px; height: 24px; margin-bottom: 0.5rem;"></i><br>
					Data not loaded yet. Please wait...
				</div>
			`;
			if (window.lucide) window.lucide.createIcons();
			return;
		}

		// Smart defaults based on current time
		const currentDay = day || getCurrentDay(state.allData);
		const currentPeriod = period || getCurrentPeriod();
		const periodIndex = currentPeriod - 1;

		// Validate that the selected day exists
		if (!isValidDay(currentDay, state.allData)) {
			container.innerHTML = `
				<div style="color: var(--red-500); padding: 2rem; text-align: center; border: 2px dashed var(--red-200); border-radius: var(--radius);">
					<i data-lucide="alert-circle" style="width: 24px; height: 24px; margin-bottom: 0.5rem;"></i><br>
					Day "${currentDay}" not found in timetable data.
				</div>
			`;
			if (window.lucide) window.lucide.createIcons();
			return;
		}

		const freeTeachers = findFreeTeachers(currentDay, periodIndex, [], {});

		const dayOptions = state.allData.days
			.map(d => `<option value="${d}" ${d === currentDay ? 'selected' : ''}>${d}</option>`)
			.join('');

		const periodOptions = state.allData.periodHeaders
			.map((p, i) => `<option value="${i + 1}" ${i + 1 == currentPeriod ? 'selected' : ''}>${p.name} ${p.time ? `(${p.time})` : ''}</option>`)
			.join('');

		const freeTeachersList =
			freeTeachers.length > 0
				? freeTeachers
						.map(t => {
							const workload = state.allData.teacherDetails[t]?.workload[currentDay] || 0;
							return `
							<div style="background: var(--primary-50); color: var(--primary-800); padding: 0.75rem;
										border-radius: var(--radius); font-size: 0.875rem; font-weight: 500;
										display: flex; justify-content: space-between; align-items: center;
										border-left: 3px solid var(--primary-500);">
								<span>${t}</span>
								<small style="opacity: 0.7; background: var(--primary-100); padding: 0.25rem 0.5rem; border-radius: var(--radius); font-size: 0.75rem;">
									${workload} periods today
								</small>
							</div>
						`;
						})
						.join('')
				: `<div style="color: var(--gray-500); padding: 2rem; text-align: center; border: 2px dashed var(--gray-200); border-radius: var(--radius);">
				   <i data-lucide="user-x" style="width: 24px; height: 24px; margin-bottom: 0.5rem; color: var(--gray-400);"></i><br>
				   No teachers are free for this slot.
			   </div>`;

		const currentTime = getCurrentTimeString();

		const html = `
			<div style="background: linear-gradient(135deg, var(--primary-50) 0%, var(--blue-50) 100%);
						padding: 1rem; border-radius: var(--radius-lg); margin-bottom: 1rem;
						border: 1px solid var(--primary-200);">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
					<div>
						<strong style="color: var(--primary-700);">Current Time: ${currentTime}</strong>
					</div>
					<div style="display: flex; align-items: center; gap: 0.5rem;">
						<div style="width: 8px; height: 8px; background: var(--green-500); border-radius: 50%; animation: pulse 2s infinite;"></div>
						<small style="color: var(--primary-600); font-weight: 500;">Live Updates</small>
					</div>
				</div>
				<small style="color: var(--primary-600);">
					Showing free teachers for ${currentDay}, Period ${currentPeriod}
				</small>
			</div>

			<div class="grid grid-cols-1 grid-cols-md-2 gap-4 mb-4">
				<div>
					<label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--gray-700);">
						<i data-lucide="calendar" style="width: 16px; height: 16px; display: inline; margin-right: 0.25rem;"></i>
						Day
					</label>
					<select id="finder-day-select" style="border: 2px solid var(--primary-200);">${dayOptions}</select>
				</div>
				<div>
					<label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--gray-700);">
						<i data-lucide="clock" style="width: 16px; height: 16px; display: inline; margin-right: 0.25rem;"></i>
						Period
					</label>
					<select id="finder-period-select" style="border: 2px solid var(--primary-200);">${periodOptions}</select>
				</div>
			</div>

			<div style="max-height: 20rem; overflow-y: auto; padding: 0.5rem;
						background: var(--gray-50); border-radius: var(--radius-lg);
						border: 1px solid var(--gray-200);">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
					<h4 style="color: var(--gray-700); margin: 0;">
						<i data-lucide="users-check" style="width: 18px; height: 18px; display: inline; margin-right: 0.5rem;"></i>
						Available Teachers
					</h4>
					<span style="background: var(--primary-600); color: white; padding: 0.25rem 0.5rem;
							 border-radius: var(--radius); font-size: 0.75rem; font-weight: 600;">
					${freeTeachers.length} free
				</span>
				</div>
				<div style="display: flex; flex-direction: column; gap: 0.5rem;">
					${freeTeachersList}
				</div>
			</div>
		`;

		container.innerHTML = html;

		// Enhanced event listeners
		const daySelect = document.getElementById('finder-day-select');
		const periodSelect = document.getElementById('finder-period-select');

		if (daySelect) {
			daySelect.addEventListener('change', e => {
				const newDay = e.target.value;
				const newPeriod = document.getElementById('finder-period-select').value;
				renderFreeTeacherFinder(newDay, newPeriod);
			});
		}

		if (periodSelect) {
			periodSelect.addEventListener('change', e => {
				const newDay = document.getElementById('finder-day-select').value;
				const newPeriod = e.target.value;
				renderFreeTeacherFinder(newDay, newPeriod);
			});
		}

		if (window.lucide) window.lucide.createIcons();
	} catch (error) {
		console.error('Error rendering free teacher finder:', error);
		container.innerHTML = `
			<div style="color: var(--red-500); padding: 2rem; text-align: center; border: 2px dashed var(--red-200); border-radius: var(--radius);">
				<i data-lucide="alert-circle" style="width: 24px; height: 24px; margin-bottom: 0.5rem;"></i><br>
				Error loading free teacher finder. Please refresh the page.
			</div>
		`;
		if (window.lucide) window.lucide.createIcons();
	}
}

/**
 * Render the dashboard view
 */
export function renderDashboard() {
	const mainContent = document.getElementById('main-content');
	if (!mainContent) return;

	try {
		const today = getCurrentDay(state.allData);
		const { teacherDetails, teacherNames, timetable, classNames } = state.allData;

		const todaySubs = getSubstitutionPlan(today);
		const substitutionCount = Object.values(todaySubs.plan).reduce(
			(acc, classSubs) => acc + Object.keys(classSubs).length,
			0
		);

		const totalClassesToday = timetable[today]
			? Object.values(timetable[today])
					.flat()
					.filter(p => p.teacher).length
			: 0;

		const totalTeachers = teacherNames.length;
		const activeTeachersToday = new Set();

		if (timetable[today]) {
			Object.values(timetable[today])
				.flat()
				.forEach(period => {
					if (period.teacher) {
						period.teacher.split('/').forEach(t => activeTeachersToday.add(t.trim()));
					}
				});
		}

		const html = `
			<div class="stat-grid">
				<div class="stat-card">
					<div class="stat-card-icon" style="background: var(--primary-500);">
						<i data-lucide="calendar"></i>
					</div>
					<div>
						<div class="stat-card-label">Today's Date</div>
						<div class="stat-card-value">${new Date().toLocaleDateString('en-GB')}</div>
						<small style="color: var(--gray-500);">${today}</small>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-card-icon" style="background: var(--green-500);">
						<i data-lucide="book-open"></i>
					</div>
					<div>
						<div class="stat-card-label">Classes Today</div>
						<div class="stat-card-value">${totalClassesToday}</div>
						<small style="color: var(--gray-500);">${classNames.length} total classes</small>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-card-icon" style="background: var(--yellow-500);">
						<i data-lucide="users"></i>
					</div>
					<div>
						<div class="stat-card-label">Active Teachers</div>
						<div class="stat-card-value">${activeTeachersToday.size}</div>
						<small style="color: var(--gray-500);">of ${totalTeachers} total</small>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-card-icon" style="background: var(--red-500);">
						<i data-lucide="user-check"></i>
					</div>
					<div>
						<div class="stat-card-label">Substitutions</div>
						<div class="stat-card-value">${substitutionCount}</div>
						<small style="color: var(--gray-500);">active today</small>
					</div>
				</div>
			</div>

			<div class="card">
				<h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
					<i data-lucide="search" style="width: 20px; height: 20px;"></i>
					Live Free Teacher Finder
				</h2>
				<div id="free-teacher-finder-container"></div>
			</div>

			<div class="card">
				<h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
					<i data-lucide="zap" style="width: 20px; height: 20px;"></i>
					Quick Actions
				</h2>
				<div class="grid grid-cols-1 grid-cols-md-2 gap-4">
					<button class="button button-primary" onclick="window.appHandlers.switchView('Day')">
						<i data-lucide="calendar"></i> View Today's Schedule
					</button>
					<button class="button button-primary" onclick="window.appHandlers.switchView('Substitution')">
						<i data-lucide="user-cog"></i> Manage Substitutions
					</button>
					<button class="button button-secondary" onclick="window.appHandlers.switchView('Class')">
						<i data-lucide="school"></i> Browse Classes
					</button>
					<button class="button button-secondary" onclick="window.appHandlers.switchView('Teacher')">
						<i data-lucide="users"></i> Teacher Schedules
					</button>
				</div>
			</div>

			<div class="flex justify-center gap-4" style="margin-top: 1.5rem;">
				<button onclick="window.appHandlers.handlePrint()" class="button button-secondary" style="max-width:200px;">
					<i data-lucide="printer"></i> Print Full Timetable
				</button>
			</div>
		`;

		mainContent.innerHTML = html;
		renderFreeTeacherFinder();
		if (window.lucide) window.lucide.createIcons();
	} catch (error) {
		console.error('Error rendering dashboard:', error);
		mainContent.innerHTML = `
			<div class="card">
				<div style="color: var(--red-500); padding: 2rem; text-align: center;">
					<i data-lucide="alert-circle" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i><br>
					<h3>Error Loading Dashboard</h3>
					<p>Please refresh the page to try again.</p>
				</div>
			</div>
		`;
		if (window.lucide) window.lucide.createIcons();
	}
}

/**
 * Render the day view
 * @param {string|null} [day=null] - Day name (defaults to current day)
 */
export function renderDayView(day = null) {
	const mainContent = document.getElementById('main-content');
	if (!mainContent) return;

	try {
		const selectedDay = day || getCurrentDay(state.allData);
		const { timetable, classNames, periodHeaders } = state.allData;

		// Validate that the selected day exists in timetable
		if (!timetable[selectedDay]) {
			console.error(`Day ${selectedDay} not found in timetable`);
			return;
		}

		const daySubs = getSubstitutionPlan(selectedDay).plan;

		const dayButtons = state.allData.days
			.map(
				d => `<button class="nav-button ${selectedDay === d ? 'active' : ''}" onclick="window.appHandlers.renderDayView('${d}')">
				${d === getCurrentDay(state.allData) ? '🔴 ' : ''}${d}
			</button>`
			)
			.join('');

		const printHeaderSubtitle = document.getElementById('print-header-subtitle');
		if (printHeaderSubtitle) {
			printHeaderSubtitle.textContent = `Daily Schedule for ${selectedDay}`;
		}

		const tableHeader =
			'<th>Class</th>' +
			periodHeaders.map(h => `<th>${h.name}<br/><span style="font-weight:400; font-size: 0.75rem;">${h.time}</span></th>`).join('');

		const tableBody = classNames
			.map(cName => {
				// Check if class exists for this day
				if (!timetable[selectedDay][cName]) {
					console.warn(`Class ${cName} not found for ${selectedDay}`);
					return '';
				}

				return `
					<tr>
						<td class="font-bold" data-label="Class">${cName}</td>
						${timetable[selectedDay][cName]
							.map((period, i) => {
								const substitute = daySubs[cName]?.[i];
								const label = `${periodHeaders[i]?.name || `Period ${i + 1}`} (${periodHeaders[i]?.time || ''})`;
								return `
									<td data-label="${label}">
										<div class="subject">${period.subject || 'No Subject'}</div>
										${period.teacher ? `<div class="teacher ${substitute ? 'line-through' : ''}">${period.teacher}</div>` : ''}
										${substitute ? `<div class="teacher substitute">Sub: ${substitute}</div>` : ''}
									</td>
								`;
							})
							.join('')}
					</tr>
				`;
			})
			.filter(row => row)
			.join('');

		const html = `
			<div class="card">
				<div class="flex items-center justify-between flex-wrap gap-4">
					<h2 style="font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
						<i data-lucide="calendar-days"></i>
						${selectedDay} Schedule
						${selectedDay === getCurrentDay(state.allData) ? '<span style="color: var(--red-500); font-size: 0.75rem;">● LIVE</span>' : ''}
					</h2>
					<div class="flex gap-2">
						<button onclick="window.appHandlers.handlePrint()" class="button button-secondary" style="width: auto;">
							<i data-lucide="printer"></i>
						</button>
						<button onclick="window.appHandlers.handleShareScreenshot()" class="button button-whatsapp" style="width: auto;">
							<i data-lucide="share-2"></i>
						</button>
					</div>
				</div>
				<div class="flex flex-wrap gap-2" style="border-bottom: 1px solid var(--gray-200);
				 padding-bottom: 0.75rem; margin: 1rem 0;">
					${dayButtons}
				</div>
				<div class="table-container">
					<table class="responsive">
						<thead><tr>${tableHeader}</tr></thead>
						<tbody>${tableBody}</tbody>
					</table>
				</div>
			</div>
		`;

		mainContent.innerHTML = html;
		if (window.lucide) window.lucide.createIcons();
	} catch (error) {
		console.error('Error rendering day view:', error);
		mainContent.innerHTML = `
			<div class="card">
				<div style="color: var(--red-500); padding: 2rem; text-align: center;">
					<i data-lucide="alert-circle" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i><br>
					<h3>Error Loading Day View</h3>
					<p>Failed to load schedule for ${day || getCurrentDay(state.allData)}. Please try again.</p>
					<button onclick="window.appHandlers.switchView('Dashboard')" class="button button-primary" style="margin-top: 1rem; max-width: 200px;">
						Return to Dashboard
					</button>
				</div>
			</div>
		`;
		if (window.lucide) window.lucide.createIcons();
	}
}

/**
 * Render the class view
 * @param {string} [selectedClass=''] - Selected class name
 */
export function renderClassView(selectedClass = '') {
	const mainContent = document.getElementById('main-content');
	if (!mainContent) return;

	try {
		const { timetable, classNames, periodHeaders } = state.allData;

		const printHeaderSubtitle = document.getElementById('print-header-subtitle');
		if (printHeaderSubtitle) {
			printHeaderSubtitle.textContent = selectedClass ? `Weekly Schedule for ${selectedClass}` : 'Class Timetables';
		}

		const classOptions =
			'<option value="">-- Select a Class --</option>' +
			classNames.map(c => `<option value="${c}" ${c === selectedClass ? 'selected' : ''}>${c}</option>`).join('');

		let tableHtml = '';
		if (selectedClass && timetable.Monday && timetable.Monday[selectedClass]) {
			const tableHeader =
				'<th>Day</th>' +
				periodHeaders.map(h => `<th>${h.name}<br/><span style="font-weight:400; font-size: 0.75rem;">${h.time}</span></th>`).join('');

			const tableBody = Object.keys(timetable)
				.map(day => {
					const daySchedule = timetable[day][selectedClass] || [];
					const daySubs = getSubstitutionPlan(day).plan;

					return `
						<tr>
							<td class="font-bold" data-label="Day">${day}</td>
							${periodHeaders
								.map((_, i) => {
									const period = daySchedule[i];
									const substitute = daySubs[selectedClass]?.[i];
									const label = periodHeaders[i]?.name || `Period ${i + 1}`;
									return `
										<td data-label="${label}">
											${
												period
													? `
												<div class="${substitute ? 'line-through' : ''}">
													<div class="subject">${period.subject}</div>
													${period.teacher ? `<div class="teacher">${period.teacher}</div>` : ''}
												</div>
											`
													: ''
											}
											${substitute ? `<div class="teacher substitute">Sub: ${substitute}</div>` : ''}
										</td>
									`;
								})
								.join('')}
						</tr>
					`;
				})
				.join('');

			tableHtml = `
				<div class="table-container">
					<table class="responsive">
						<thead><tr>${tableHeader}</tr></thead>
						<tbody>${tableBody}</tbody>
					</table>
				</div>
				<div class="flex justify-center gap-4" style="margin-top: 1.5rem;">
					<button onclick="window.appHandlers.handlePrint()" class="button button-secondary" style="max-width: 200px;">
						<i data-lucide="printer"></i> Print
					</button>
					<button onclick="window.appHandlers.handleShareScreenshot()" class="button button-whatsapp" style="max-width: 200px;">
						<i data-lucide="share-2"></i> Share
					</button>
				</div>
			`;
		}

		const html = `
			<div class="card">
				<h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">
					🏫 View by Class
				</h2>
				<select onchange="window.appHandlers.renderClassView(this.value)">${classOptions}</select>
				${tableHtml}
			</div>
		`;

		mainContent.innerHTML = html;
		if (window.lucide) window.lucide.createIcons();
	} catch (error) {
		console.error('Error rendering class view:', error);
	}
}

/**
 * Render the teacher view
 * @param {string} [selectedTeacher=''] - Selected teacher name
 */
export function renderTeacherView(selectedTeacher = '') {
	const mainContent = document.getElementById('main-content');
	if (!mainContent) return;

	try {
		const { teacherDetails, teacherNames, periodHeaders, timetable } = state.allData;

		const printHeaderSubtitle = document.getElementById('print-header-subtitle');
		if (printHeaderSubtitle) {
			printHeaderSubtitle.textContent = selectedTeacher ? `Weekly Schedule for ${selectedTeacher}` : 'Teacher Timetables';
		}

		const teacherOptions =
			'<option value="">-- Select a Teacher --</option>' +
			teacherNames.map(t => `<option value="${t}" ${t === selectedTeacher ? 'selected' : ''}>${t}</option>`).join('');

		let detailsHtml = '';
		if (selectedTeacher && teacherDetails[selectedTeacher]) {
			const tableHeader = '<th>Day</th>' + periodHeaders.map(h => `<th>${h.name}</th>`).join('');
			const tableBody = Object.keys(timetable)
				.map(day => {
					const daySchedule = teacherDetails[selectedTeacher].schedule[day] || [];
					const daySubs = getSubstitutionPlan(day).plan;

					return `
						<tr>
							<td class="font-bold" data-label="Day">${day}</td>
							${periodHeaders
								.map((_, i) => {
									const originalPeriod = daySchedule[i];
									const isSubstitutedOut = originalPeriod && daySubs[originalPeriod.className]?.[i];

									let subPeriodInfo = null;
									for (const cName in daySubs) {
										if (daySubs[cName][i] === selectedTeacher) {
											subPeriodInfo = timetable[day][cName][i];
											break;
										}
									}

									const label = periodHeaders[i]?.name || `Period ${i + 1}`;
									return `
										<td data-label="${label}">
											${
												originalPeriod
													? `
												<div class="${isSubstitutedOut ? 'line-through' : ''}">
													<div class="subject">${originalPeriod.subject}</div>
													<div class="class-name">${originalPeriod.className}</div>
												</div>
											`
													: ''
											}
											${
												subPeriodInfo
													? `
												<div style="margin-top: 0.25rem;">
													<div class="subject substitute">${subPeriodInfo.subject}</div>
													<div class="class-name">(Sub for ${subPeriodInfo.teacher})</div>
													<div class="class-name">${subPeriodInfo.className}</div>
												</div>
											`
													: ''
											}
										</td>
									`;
								})
								.join('')}
						</tr>
					`;
				})
				.join('');

			detailsHtml = `
				<div class="mt-4">
					<div style="background: var(--primary-50); color: var(--primary-800);
								font-weight: 600; text-align: center; border-radius: var(--radius);
								padding: 0.75rem; margin-bottom: 1.5rem;">
						Total Weekly Periods: ${teacherDetails[selectedTeacher].periodCount}
					</div>
				</div>
				<div class="table-container">
					<table class="responsive">
						<thead><tr>${tableHeader}</tr></thead>
						<tbody>${tableBody}</tbody>
					</table>
				</div>
				<div class="flex justify-center gap-4" style="margin-top: 1.5rem;">
					<button onclick="window.appHandlers.handlePrint()" class="button button-secondary" style="max-width: 200px;">
						<i data-lucide="printer"></i> Print
					</button>
					<button onclick="window.appHandlers.handleShareScreenshot()" class="button button-whatsapp" style="max-width: 200px;">
						<i data-lucide="share-2"></i> Share
					</button>
				</div>
			`;
		}

		const html = `
			<div class="card">
				<h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">
					👨‍🏫 View by Teacher
				</h2>
				<select onchange="window.appHandlers.renderTeacherView(this.value)">${teacherOptions}</select>
				<div id="teacher-details-container">${detailsHtml}</div>
			</div>
		`;

		mainContent.innerHTML = html;
		if (window.lucide) window.lucide.createIcons();
	} catch (error) {
		console.error('Error rendering teacher view:', error);
	}
}

/**
 * Render the substitution view
 * @param {string|null} [day=null] - Day name
 * @param {string[]} [absentTeachers=[]] - Array of absent teacher names
 */
export function renderSubstitutionView(day = null, absentTeachers = []) {
	const mainContent = document.getElementById('main-content');
	if (!mainContent) return;

	const { teacherNames, periodHeaders, teacherDetails, timetable, days } = state.allData;
	const selectedDay = day || days[0];

	const printHeaderSubtitle = document.getElementById('print-header-subtitle');
	if (printHeaderSubtitle) {
		printHeaderSubtitle.textContent = `Substitution Plan for ${selectedDay}`;
	}

	const dayOptions = days.map(d => `<option value="${d}" ${d === selectedDay ? 'selected' : ''}>${d}</option>`).join('');

	const teacherOptionsHtml = teacherNames
		.map(
			t => `
		<label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem;
					  border-radius: var(--radius); cursor: pointer; transition: background 0.2s;">
			<input type="checkbox" value="${t}" ${absentTeachers.includes(t) ? 'checked' : ''}
				   onchange="window.appHandlers.handleAbsentTeacherChange(this)">
			<span>${t}</span>
		</label>
	`
		)
		.join('');

	const daySubsData = getSubstitutionPlan(selectedDay).plan;
	const vacantSlots = [];
	absentTeachers.forEach(absentTeacher => {
		const schedule = teacherDetails[absentTeacher]?.schedule[selectedDay];
		if (schedule) {
			schedule.forEach((period, periodIndex) => {
				if (period) {
					vacantSlots.push({ ...period, periodIndex, originalTeacher: absentTeacher });
				}
			});
		}
	});

	const plan = vacantSlots
		.map(slot => {
			const substitute = daySubsData[slot.className]?.[slot.periodIndex];
			return { ...slot, substitute };
		})
		.sort((a, b) => a.periodIndex - b.periodIndex);

	let planTableHTML = '';
	if (plan.length > 0) {
		const tableRows = plan
			.map(
				slot => `
			<tr>
				<td>${periodHeaders[slot.periodIndex].name}</td>
				<td>${slot.className}</td>
				<td>${slot.subject}</td>
				<td style="color: var(--red-600);">${slot.originalTeacher}</td>
				<td><span class="substitute">${slot.substitute || '--'}</span></td>
			</tr>
		`
			)
			.join('');

		planTableHTML = `
			<div style="margin-top: 2rem;">
				<div id="substitution-plan-content">
					<h3 style="text-align: center; margin-bottom: 1rem; font-size: 1.25rem;">
						📋 Substitution Plan: ${selectedDay}
					</h3>
					<div class="table-container">
						<table>
							<thead>
								<tr>
									<th>Period</th>
									<th>Class</th>
									<th>Subject</th>
									<th>Original Teacher</th>
									<th>Substitute</th>
								</tr>
							</thead>
							<tbody>${tableRows}</tbody>
						</table>
					</div>
				</div>
			</div>
		`;
	}

	const html = `
		<div class="card">
			<div class="grid grid-cols-1 grid-cols-md-2 gap-6">
				<div>
					<label class="block font-bold mb-2">1. Select Day</label>
					<select id="sub-day-select" onchange="window.appHandlers.handleSubDayChange(this.value)">
						${dayOptions}
					</select>
				</div>
				<div>
					<label class="block font-bold mb-2">2. Select Absent Teachers</label>
					<div style="border: 1px solid var(--gray-300); border-radius: var(--radius);
								padding: 0.5rem; max-height: 15rem; overflow-y: auto;">
						${teacherOptionsHtml}
					</div>
				</div>
			</div>
			<div class="grid grid-cols-1 grid-cols-md-2 gap-4"
				 style="border-top: 1px solid var(--gray-200); padding-top: 1.5rem; margin-top: 1.5rem;">
				<button id="generate-plan-btn" class="button button-primary">
					<i data-lucide="wand-2"></i> Generate Smart Plan
				</button>
				<button id="reset-plan-btn" class="button button-danger">
					<i data-lucide="rotate-ccw"></i> Reset ${selectedDay} Plan
				</button>
			</div>
			<div id="plan-container">${planTableHTML}</div>
			<div class="flex justify-center gap-4" style="margin-top: 1.5rem;">
				<button onclick="window.appHandlers.handlePrint()" class="button button-secondary" style="max-width: 200px;">
					<i data-lucide="printer"></i> Print Full Timetable
				</button>
			</div>
		</div>
	`;

	mainContent.innerHTML = html;

	// Attach event listeners
	const generateBtn = document.getElementById('generate-plan-btn');
	const resetBtn = document.getElementById('reset-plan-btn');

	if (generateBtn) {
		generateBtn.addEventListener('click', () => window.appHandlers.handleGeneratePlan(selectedDay, absentTeachers));
	}

	if (resetBtn) {
		resetBtn.addEventListener('click', () => window.appHandlers.handleResetPlan(selectedDay));
	}

	if (window.lucide) window.lucide.createIcons();
}

/**
 * Render full timetable for printing
 * @returns {string} HTML string of full timetable
 */
export function renderFullTimetableForPrint() {
	const { timetable, classNames, periodHeaders, days } = state.allData;
	let html = '';
	days.forEach(day => {
		html += `<h3 style="margin:1rem 0 0.5rem 0;font-size:1.1em;">${day}</h3>`;
		html += `<div class="table-container"><table class="responsive"><thead><tr><th>Class</th>`;
		html += periodHeaders
			.map(h => `<th>${h.name}<br><span style="font-weight:400;font-size:0.75em;">${h.time}</span></th>`)
			.join('');
		html += `</tr></thead><tbody>`;
		classNames.forEach(cName => {
			if (!timetable[day][cName]) return;
			html += `<tr><td class="font-bold" data-label="Class">${cName}</td>`;
			html += timetable[day][cName]
				.map((period, i) => {
					const label = `${periodHeaders[i]?.name || `Period ${i + 1}`} (${periodHeaders[i]?.time || ''})`;
					return `<td data-label="${label}">
					<div class="subject">${period.subject || 'No Subject'}</div>
					${period.teacher ? `<div class="teacher">${period.teacher}</div>` : ''}
				</td>`;
				})
				.join('');
			html += `</tr>`;
		});
		html += `</tbody></table></div>`;
	});
	return html;
}
