/**
 * Data module for Timetable Command Center
 * Contains raw timetable data and parsing functions
 * @module data
 */

import { DATA_CORRECTIONS, DAYS } from './constants.js';
import { extractClassNumber } from './utils.js';

/**
 * Raw timetable data in CSV format
 * @type {string}
 */
export const rawData = `Monday
		Class,Period 1<br>8:30 AM - 9:10 AM,Period 2<br>9:10 AM - 9:50 AM,Period 3<br>9:50 AM - 10:30 AM,Period 4<br>10:30 AM - 11:10 AM,Period 5<br>11:30 AM - 12:10 PM,Period 6<br>12:10 PM - 12:50 PM,Period 7<br>12:50 PM - 01:30 PM,Period 8<br>01:30 PM - 02:10 PM
		Class 1,EVS (Bindu),EVS (Bindu),ELGA (Bindu),ELGA (Bindu),ELGA (Bindu),Hindi (Bindu),Home Work (Anjana),Maths (Kusum)
		Class 2,Maths (Anita),Maths (Anita),ELGA (Leena),ELGA (Leena),ELGA (Leena),EVS (Rashmita),Hindi (Bindu),Hindi (Bindu)
		Class 3,EVS (Rashmita),EVS (Rashmita),ELGA (Kusum),ELGA (Kusum),ELGA (Kusum),Hindi (Kusum),Hindi (Kusum),Sports (Rakesh)
		Class 4,Hindi (Kusum),Home Work (Jainendra),ELGA (Rashmita),ELGA (Rashmita),ELGA (Rashmita),EVS (Anita),EVS (Anita),Sports (Rakesh)
		Class 5,Maths (Nidhika),Hindi (Kusum),ELGA (Anita),ELGA (Anita),ELGA (Anita),CCS (Maya),Maths (Nidhika),EVS (Nidhika)
		Class 6,Science (Hemlata),Science (Hemlata),ELGA (Nidhika),ELGA (Nidhika),ELGA (Nidhika),Maths (Nidhika),SST (Rashmita),Hindi (Jainendra)
		Class 7,Hindi (Jainendra),Maths (Leena),ELGA (Harshita),ELGA (Harshita),ELGA (Harshita),SST (Prakash),Maths (Leena),Science (Hemlata)
		Class 8,Hindi (Antima),CCS (Maya),ELGA (Harshita),ELGA (Harshita),ELGA (Harshita),Maths (Leena),Science (Hemlata),Sanskrit (Antima)
		Class 9,Maths (Leena),SST (Pradhyuman),Science (Toshit),CCS (Maya),Hindi (Jainendra),Hindi (Jainendra),English (Harshita),Maths (Leena)
		Class 10,SST (Pradhyuman),Hindi (Antima),Maths (Nathulal),Maths (Nathulal),Sanskrit (Antima),English (Harshita),Science (Toshit),Sports (Rakesh)
		Class 11 Science,Physics (Phy),Physics (Phy),Biology (Hemlata),English (Pradhyuman),Chemistry (Toshit),Chemistry (Toshit),English (Pradhyuman),Sports (Rakesh)
		Class 11 Commerce,Self Study (Maya),Business (Nidhika),Economics (Prakash),English (Pradhyuman),Accountancy (Nathulal),Accountancy (Nathulal),English (Pradhyuman),Accountancy (Nathulal)
		Class 11 Arts,English Literature (Harshita),Geography (Prakash),Economics (Prakash),English (Pradhyuman),CCS (Maya),Sports (Rakesh),English (Pradhyuman),Political Science (Pradhyuman)
		Class 12 Science,Chemistry (Toshit),Chemistry (Toshit),Physics (Phy),Physics (Phy),English (Pradhyuman),Biology (Hemlata),Hindi (Jainendra),Physics (Phy)
		Class 12 Commerce,Accountancy (Nathulal),Accountancy (Nathulal),Business (Pradhyuman),Economics (Prakash),English (Pradhyuman),Sports (Rakesh),Hindi (Jainendra),CCS (Maya)
		Class 12 Arts,Geography (Prakash),English Literature (Harshita),Hindi Boards (Antima),Economics (Prakash),English (Pradhyuman),Political Science (Pradhyuman),Hindi (Jainendra),English Literature (Harshita)

		Tuesday
		Class,Period 1<br>8:30 AM - 9:10 AM,Period 2<br>9:10 AM - 9:50 AM,Period 3<br>9:50 AM - 10:30 AM,Period 4<br>10:30 AM - 11:10 AM,Period 5<br>11:30 AM - 12:10 PM,Period 6<br>12:10 PM - 12:50 PM,Period 7<br>12:50 PM - 01:30 PM,Period 8<br>01:30 PM - 02:10 PM
		Class 1,EVS (Bindu),Maths (Kusum),ELGA (Bindu),ELGA (Bindu),ELGA (Bindu),Hindi (Bindu),Hindi (Bindu),Home Work (Anjana)
		Class 2,Maths (Anita),Hindi (Bindu),ELGA (Leena),ELGA (Leena),ELGA (Leena),EVS (Rashmita),EVS (Rashmita),Hindi (Bindu)
		Class 3,EVS (Rashmita),Maths (Anita),ELGA (Kusum),ELGA (Kusum),ELGA (Kusum),Maths (Anita),Hindi (Kusum),Hindi (Kusum)
		Class 4,Hindi (Kusum),Maths (Leena),ELGA (Rashmita),ELGA (Rashmita),ELGA (Rashmita),Basic Hindi (Anjana),EVS (Anita),EVS (Anita)
		Class 5,EVS (Nidhika),Home Work (Rashmita),ELGA (Anita),ELGA (Anita),ELGA (Anita),Hindi (Kusum),Maths (Nidhika),EVS (Nidhika)
		Class 6,Science (Hemlata),Sanskrit (Jainendra),ELGA (Nidhika),ELGA (Nidhika),ELGA (Nidhika),Maths (Nidhika),Hindi (Jainendra),SST (Rashmita)
		Class 7,Hindi (Jainendra),Science (Hemlata),ELGA (Harshita),ELGA (Harshita),ELGA (Harshita),SST (Prakash),Maths (Leena),Sanskrit (Antima)
		Class 8,Hindi (Antima),Sanskrit (Antima),ELGA (Harshita),ELGA (Harshita),ELGA (Harshita),Maths (Leena),Science (Hemlata),SST (Harshita)
		Class 9,Maths (Leena),English (Harshita),Hindi (Jainendra),CCS (Maya),Science (Toshit),Science (Toshit),Sanskrit (Antima),SST (Pradhyuman)
		Class 10,SST (Pradhyuman),CCS (Maya),Maths (Nathulal),Sanskrit (Antima),Hindi (Antima),English (Harshita),Science (Toshit),Maths (Nathulal)
		Class 11 Science,Physics (Phy),Physics (Phy),Chemistry (Toshit),Chemistry (Toshit),Biology (Hemlata),Hindi (Jainendra),English (Pradhyuman),Hindi (Jainendra)
		Class 11 Commerce,Self Study (Maya),Business (Nidhika),Economics (Prakash),Accountancy (Nathulal),Accountancy (Nathulal),Hindi (Jainendra),English (Pradhyuman),Hindi (Jainendra)
		Class 11 Arts,English Literature (Harshita),Political Science (Pradhyuman),Economics (Prakash),Geography (Prakash),CCS (Maya),Hindi (Jainendra),English (Pradhyuman),Hindi (Jainendra)
		Class 12 Science,Chemistry (Toshit),Chemistry (Toshit),Biology (Hemlata),Biology (Hemlata),Hindi (Jainendra),English (Pradhyuman),Physics (Phy),Biology (Hemlata)
		Class 12 Commerce,Accountancy (Nathulal),Accountancy (Nathulal),CCS (Maya),Business (Pradhyuman),Hindi (Jainendra),English (Pradhyuman),Accountancy (Nathulal),Sports (Rakesh)
		Class 12 Arts,Geography (Prakash),Geography (Prakash),Political Science (Pradhyuman),Hindi (Jainendra),Hindi (Jainendra),English (Pradhyuman),English Literature (Harshita),Sports (Rakesh)

		Wednesday
		Class,Period 1<br>8:30 AM - 9:10 AM,Period 2<br>9:10 AM - 9:50 AM,Period 3<br>9:50 AM - 10:30 AM,Period 4<br>10:30 AM - 11:10 AM,Period 5<br>11:30 AM - 12:10 PM,Period 6<br>12:10 PM - 12:50 PM,Period 7<br>12:50 PM - 01:30 PM,Period 8<br>01:30 PM - 02:10 PM
		Class 1,EVS (Bindu),Maths (Kusum),ELGA (Bindu),ELGA (Bindu),ELGA (Bindu),Home Work (Anjana),Hindi (Bindu),Sports (Rakesh)
		Class 2,Maths (Anita),Hindi (Bindu),ELGA (Leena),ELGA (Leena),ELGA (Leena),Hindi (Bindu),EVS (Rashmita),Sports (Rakesh)
		Class 3,EVS (Rashmita),Home Work (Jainendra),ELGA (Kusum),ELGA (Kusum),ELGA (Kusum),Maths (Anita),Maths (Anita),Maths (Anita)
		Class 4,Hindi (Kusum),EVS (Anita),ELGA (Rashmita),ELGA (Rashmita),ELGA (Rashmita),Maths (Leena),Maths (Leena),Hindi (Kusum)
		Class 5,EVS (Nidhika),EVS (Nidhika),ELGA (Anita),ELGA (Anita),ELGA (Anita),Hindi (Kusum),Hindi (Kusum),Maths (Nidhika)
		Class 6,Science (Hemlata),SST (Rashmita),ELGA (Nidhika),ELGA (Nidhika),ELGA (Nidhika),Maths (Nidhika),Science (Hemlata),CCS (Maya)
		Class 7,Hindi (Jainendra),Sanskrit (Antima),ELGA (Harshita),ELGA (Harshita),ELGA (Harshita),Science (Hemlata),CCS (Maya),SST (Prakash)
		Class 8,Sanskrit (Antima),Science (Hemlata),ELGA (Harshita),ELGA (Harshita),ELGA (Harshita),English Boards (Rashmita),SST (Harshita),Maths (Leena)
		Class 9,Maths (Leena),Maths (Leena),Hindi (Jainendra),Science (Toshit),Sports (Rakesh),Sanskrit (Antima),SST (Pradhyuman),English (Harshita)
		Class 10,SST (Pradhyuman),English (Harshita),Science (Toshit),Maths (Nathulal),Sanskrit (Antima),Science (Toshit),Hindi (Antima),Maths (Nathulal)
		Class 11 Science,Physics (Phy),Physics (Phy),English (Pradhyuman),Biology (Hemlata),Biology (Hemlata),Sports (Rakesh),Chemistry (Toshit),Chemistry (Toshit)
		Class 11 Commerce,CCS (Maya),Economics (Prakash),English (Pradhyuman),Self Study (Maya),Accountancy (Nathulal),Accountancy (Nathulal),Business (Nidhika),Sports (Rakesh)
		Class 11 Arts,English Literature (Harshita),Economics (Prakash),English (Pradhyuman),Geography (Prakash),Self Study (Toshit),Political Science (Pradhyuman),Sports (Rakesh),Sports (Rakesh)
		Class 12 Science,Chemistry (Toshit),Chemistry (Toshit),Biology (Hemlata),Hindi (Jainendra),English (Pradhyuman),Sports (Rakesh),Hindi (Jainendra),Hindi (Jainendra)
		Class 12 Commerce,Accountancy (Nathulal),Accountancy (Nathulal),CCS (Maya),Business (Pradhyuman),Hindi (Jainendra),English (Pradhyuman),Accountancy (Nathulal),Sports (Rakesh)
		Class 12 Arts,Geography (Prakash),Political Science (Pradhyuman),Economics (Prakash),Hindi (Jainendra),English (Pradhyuman),English Literature (Harshita),Hindi (Jainendra),Hindi (Jainendra)

		Thursday
		Class,Period 1<br>8:30 AM - 9:10 AM,Period 2<br>9:10 AM - 9:50 AM,Period 3<br>9:50 AM - 10:30 AM,Period 4<br>10:30 AM - 11:10 AM,Period 5<br>11:30 AM - 12:10 PM,Period 6<br>12:10 PM - 12:50 PM,Period 7<br>12:50 PM - 01:30 PM,Period 8<br>01:30 PM - 02:10 PM
		Class 1,Hindi (Bindu),EVS (Bindu),ELGA (Bindu),ELGA (Bindu),ELGA (Bindu),EVS (Bindu),CCS (Maya),Hindi (Anjana)
		Class 2,Maths (Anita),Maths (Anita),ELGA (Leena),ELGA (Leena),ELGA (Leena),EVS (Rashmita),EVS (Rashmita),Hindi (Bindu)
		Class 3,EVS (Rashmita),EVS (Rashmita),ELGA (Kusum),ELGA (Kusum),ELGA (Kusum),Hindi (Kusum),Home Work (Bindu),Maths (Anita)
		Class 4,Hindi (Kusum),CCS (Maya),ELGA (Rashmita),ELGA (Rashmita),ELGA (Rashmita),EVS (Anita),EVS (Anita),Games (Rakesh)
		Class 5,EVS (Nidhika),Hindi (Kusum),ELGA (Anita),ELGA (Anita),ELGA (Anita),Home work (Anjana),Maths (Nidhika),Hindi (Kusum)
		Class 6,Science (Hemlata),Maths (Nidhika),ELGA (Nidhika),ELGA (Nidhika),ELGA (Nidhika),Hindi (Jainendra),Science (Hemlata),SST (Rashmita)
		Class 7,Hindi (Jainendra),Science (Hemlata),ELGA (Harshita),ELGA (Harshita),ELGA (Harshita),SST (Prakash),Sanskrit (Antima),Maths (Leena)
		Class 8,Hindi (Antima),SST (Harshita),ELGA (Harshita),ELGA (Harshita),ELGA (Harshita),Maths (Leena),Maths (Leena),Science (Hemlata)
		Class 9,Maths (Leena),Hindi (Jainendra),SST (Pradhyuman),SST (Pradhyuman),Sanskrit (Antima),Sanskrit (Antima),Science (Toshit),Science (Toshit)
		Class 10,SST (Pradhyuman),SST (Pradhyuman),Science (Toshit),Science (Toshit),Maths (Nathulal),Maths (Nathulal),English (Harshita),Sanskrit (Antima)
		Class 11 Science,Physics (Phy),Physics (Phy),Biology (Hemlata),Biology (Hemlata),Chemistry (Toshit),Chemistry (Toshit),Hindi (Jainendra),English (Pradhyuman)
		Class 11 Commerce,CCS (Maya),Economics (Prakash),Accountancy (Nathulal),Accountancy (Nathulal),Hindi (Jainendra),Business (Nidhika),Hindi (Jainendra),English (Pradhyuman)
		Class 11 Arts,English Literature (Harshita),Economics (Prakash),Geography (Prakash),Self Study (Antima),Political Science (Pradhyuman),Sports (Rakesh),Hindi (Jainendra),English (Pradhyuman)
		Class 12 Science,Chemistry (Toshit),Chemistry (Toshit),Hindi (Jainendra),Physics (Phy),Biology (Hemlata),Biology (Hemlata),English (Pradhyuman),Hindi (Jainendra)
		Class 12 Commerce,Accountancy (Nathulal),Accountancy (Nathulal),Hindi (Jainendra),Economics (Prakash),Sports (Rakesh),Business (Pradhyuman),English (Pradhyuman),Hindi (Jainendra)
		Class 12 Arts,Geography (Prakash),Self Study (Antima),Hindi (Jainendra),Economics (Prakash),Sports (Rakesh),CCS (Maya),Hindi (Jainendra),Hindi (Jainendra)

		Friday
		Class,Period 1<br>8:30 AM - 9:10 AM,Period 2<br>9:10 AM - 9:50 AM,Period 3<br>9:50 AM - 10:30 AM,Period 4<br>10:30 AM - 11:10 AM,Period 5<br>11:30 AM - 12:10 PM,Period 6<br>12:10 PM - 12:50 PM,Period 7<br>12:50 PM - 01:30 PM,Period 8<br>01:30 PM - 02:10 PM
		Class 1,Hindi (Bindu),Hindi (Bindu),Maths (Kusum),EVS (Bindu),Maths (Kusum),CCS (Maya),EVS (Bindu),EVS (Bindu)
		Class 2,Maths (Anita),Maths (Anita),Hindi (Bindu),EVS (Rashmita),Hindi (Bindu),Hindi (Bindu),CCS (Maya),EVS (Rashmita)
		Class 3,EVS (Rashmita),EVS (Rashmita),Maths (Anita),Maths (Anita),CCS (Maya),Hindi (Kusum),Hindi (Kusum),Home Work (Anjana)
		Class 4,Hindi (Kusum),Hindi (Kusum),Home Work (Rashmita),CCS (Maya),Maths (Leena),Maths (Leena),EVS (Anita),EVS (Anita)
		Class 5,EVS (Nidhika),EVS (Nidhika),Basic Hindi (Antima),Hindi (Kusum),Maths (Nidhika),Maths (Nidhika),Home Work (Anjana),Sports (Rakesh)
		Class 6,Science (Hemlata),Sanskrit (Jainendra),Maths (Nidhika),Maths (Nidhika),Sanskrit (Jainendra),SST (Rashmita),SST (Rashmita),Sports (Rakesh)
		Class 7,Hindi (Jainendra),Maths (Leena),Maths (Leena),Science (Hemlata),Science (Hemlata),Sanskrit (Antima),SST (Prakash),SST (Prakash)
		Class 8,Hindi (Antima),Science (Hemlata),Science (Hemlata),Maths (Leena),Sports (Rakesh),SST (Harshita),SST (Harshita),Sanskrit (Antima)
		Class 9,Maths (Leena),SST (Pradhyuman),Science (Toshit),Sanskrit (Antima),English (Harshita),Hindi (Jainendra),Sports (Rakesh),CCS (Maya)
		Class 10,SST (Pradhyuman),Sanskrit (Antima),Maths (Nathulal),English (Harshita),Hindi (Antima),Science (Toshit),Sports (Rakesh),English (Harshita)
		Class 11 Science,Physics (Phy),Physics (Phy),Hindi (Jainendra),Chemistry (Toshit),Chemistry (Toshit),English (Pradhyuman),Biology (Hemlata),Biology (Hemlata)
		Class 11 Commerce,Self Study (Maya),Economics (Prakash),Hindi (Jainendra),Accountancy (Nathulal),Accountancy (Nathulal),English (Pradhyuman),Business (Nidhika),Business (Nidhika)
		Class 11 Arts,English Literature (Harshita),Economics (Prakash),Hindi (Jainendra),Geography (Prakash),Political Science (Pradhyuman),English (Pradhyuman),Sports (Rakesh),Sports (Rakesh)
		Class 12 Science,Chemistry (Toshit),Chemistry (Toshit),Physics (Phy),Physics (Phy),Sports (Rakesh),Biology (Hemlata),English (Pradhyuman),Hindi (Jainendra)
		Class 12 Commerce,Accountancy (Nathulal),Accountancy (Nathulal),Economics (Prakash),Business (Pradhyuman),Sports (Rakesh),Accountancy (Nathulal),English (Pradhyuman),Hindi (Jainendra)
		Class 12 Arts,Geography (Prakash),English Literature (Harshita),Economics/Political Science (Prakash/Pradhyuman),English Literature (Harshita),Sports (Rakesh),Sports (Rakesh),Hindi (Jainendra),English (Pradhyuman)

		Saturday
		Class,Period 1<br>8:30 AM - 9:10 AM,Period 2<br>9:10 AM - 9:50 AM,Period 3<br>9:50 AM - 10:30 AM,Period 4<br>10:30 AM - 11:10 AM,Period 5<br>11:30 AM - 12:10 PM,Period 6<br>12:10 PM - 12:50 PM,Period 7<br>12:50 PM - 01:30 PM,Period 8<br>01:30 PM - 02:10 PM
		Class 1,EVS (Bindu),EVS (Bindu),Hindi (Bindu),Hindi (Bindu),Sports (Rakesh),Maths (Kusum),Home Work (Anjana),Home Work (Bindu)
		Class 2,Maths (Anita),EVS (Rashmita),EVS (Rashmita),EVS (Rashmita),Sports (Rakesh),CCS (Maya),Hindi (Bindu),Home Work (Anita)
		Class 3,EVS (Rashmita),Maths (Anita),Hindi (Kusum),Hindi (Kusum),EVS (Rashmita),Home Work (Anjana),CCS (Maya),Home Work (Rashmita)
		Class 4,Hindi (Kusum),Hindi (Kusum),EVS (Anita),EVS (Anita),Home Work (Anjana),Maths (Leena),Maths (Leena),Maths (Leena)
		Class 5,Maths (Nidhika),Maths (Nidhika),CCS (Maya),EVS (Nidhika),EVS (Nidhika),Sports (Rakesh),Hindi (Kusum),Home Work (Anjana)
		Class 6,Science (Hemlata),Hindi (Jainendra),Maths (Nidhika),CCS (Maya),Sanskrit (Jainendra),Maths (Nidhika),SST (Rashmita),Hindi (Jainendra)
		Class 7,Hindi (Jainendra),Science (Hemlata),Science (Hemlata),Maths (Leena),SST (Prakash),English Basic (Rashmita),SST (Prakash),Sports (Rakesh)
		Class 8,Hindi (Antima),Sanskrit (Antima),Maths (Leena),Science (Hemlata),CCS (Maya),SST (Harshita),SST (Harshita),Sports (Rakesh)
		Class 9,Maths (Leena),Maths (Leena),Science (Toshit),Hindi (Jainendra),Maths (Leena),SST (Pradhyuman),Science (Toshit),English (Harshita)
		Class 10,SST (Pradhyuman),SST (Pradhyuman),Maths (Nathulal),Sanskrit (Antima),English (Harshita),Science (Toshit),SST (Pradhyuman),Hindi (Antima)
		Class 11 Science,Physics (Phy),Physics (Phy),Hindi (Jainendra),Chemistry (Toshit),Chemistry (Toshit),Hindi (Jainendra),Biology (Hemlata),Sports (Rakesh)
		Class 11 Commerce,Self Study (Maya),Economics (Prakash),Hindi (Jainendra),Accountancy (Nathulal),Accountancy (Nathulal),Hindi (Jainendra),Business (Nidhika),Business (Nidhika)
		Class 11 Arts,English Literature (Harshita),Economics (Prakash),Hindi (Jainendra),Geography (Prakash),Political Science (Pradhyuman),Hindi (Jainendra),Sports (Rakesh),Sports (Rakesh)
		Class 12 Science,Chemistry (Toshit),Chemistry (Toshit),Physics (Phy),Physics (Phy),Biology (Hemlata),Biology (Hemlata),Hindi (Jainendra),English (Pradhyuman)
		Class 12 Commerce,Accountancy (Nathulal),Accountancy (Nathulal),Economics (Prakash),Business (Pradhyuman),Sports (Rakesh),Accountancy (Nathulal),Hindi (Jainendra),English (Pradhyuman)
		Class 12 Arts,Geography (Prakash),English Literature (Harshita),Economics/Political Science (Prakash/Pradhyuman),English Literature (Harshita),Sports (Rakesh),Sports (Rakesh),Hindi (Jainendra),English (Pradhyuman)`;

/**
 * Parse the raw timetable data into structured format
 * @returns {Object} Parsed timetable data with structure:
 *   - timetable: Day -> Class -> Period array
 *   - teacherDetails: Teacher -> schedule, periodCount, subjects, workload
 *   - periodHeaders: Array of period names and times
 *   - classNames: Sorted array of class names
 *   - teacherNames: Sorted array of teacher names
 *   - days: Array of day names
 */
export function parseTimetableData() {
	const timetable = {};
	const teacherDetails = {};
	let headers = [];

	try {
		// Enhanced data cleaning - apply all corrections
		let correctedData = rawData;
		for (const [wrong, correct] of Object.entries(DATA_CORRECTIONS)) {
			const regex = new RegExp(`\\(${wrong}\\)`, 'g');
			correctedData = correctedData.replace(regex, correct ? `(${correct})` : '');
		}

		// Split by lines and filter empty lines
		const lines = correctedData
			.trim()
			.split('\n')
			.map(line => line.trim())
			.filter(line => line);

		const dayNames = DAYS;
		let currentDay = null;
		let currentDayData = [];

		// Process each line
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			// Check if this line is a day name
			if (dayNames.includes(line)) {
				// Process previous day data if exists
				if (currentDay && currentDayData.length > 0) {
					processDay(currentDay, currentDayData);
				}

				// Start new day
				currentDay = line;
				currentDayData = [];
			} else if (currentDay) {
				currentDayData.push(line);
			}
		}

		// Process the last day
		if (currentDay && currentDayData.length > 0) {
			processDay(currentDay, currentDayData);
		}

		/**
		 * Process a single day's data
		 * @param {string} day - Day name
		 * @param {string[]} dayData - Array of CSV lines for the day
		 */
		function processDay(day, dayData) {
			if (!day || !dayData || dayData.length === 0) {
				console.warn(`processDay: Invalid data for ${day}`);
				return;
			}

			timetable[day] = {};

			// First line should be headers (periods)
			if (dayData.length > 0 && dayData[0].includes('Period 1')) {
				if (headers.length === 0) {
					// Only set headers once
					const headerParts = dayData[0].split(',').slice(1);
					headers = headerParts.map(h => {
						const parts = h.split('<br>');
						return {
							name: parts[0]?.trim() || `Period ${h}`,
							time: parts[1]?.trim() || ''
						};
					});
				}

				// Process class data (skip header line)
				for (let j = 1; j < dayData.length; j++) {
					const line = dayData[j];
					if (!line.trim()) continue;

					const columns = line.split(',').map(col => col.trim());
					const className = columns[0];

					if (!className) continue;

					timetable[day][className] = [];

					columns.slice(1).forEach((cell, periodIndex) => {
						const match = cell.match(/^(.+?)\s*\(([^)]+)\)$/);
						let entry = {
							subject: cell,
							teacher: null,
							period: periodIndex,
							className,
							day
						};

						if (match) {
							entry.subject = match[1].trim();
							entry.teacher = match[2].trim();
						}

						timetable[day][className].push(entry);

						// Enhanced teacher tracking
						if (entry.teacher) {
							const teachersInCell = entry.teacher.split('/').map(t => t.trim());
							const subjectsInCell = entry.subject.split('/').map(s => s.trim());

							teachersInCell.forEach((teacherName, k) => {
								if (!teacherDetails[teacherName]) {
									teacherDetails[teacherName] = {
										schedule: {},
										periodCount: 0,
										subjects: new Set(),
										workload: {}
									};
								}

								if (!teacherDetails[teacherName].schedule[day]) {
									teacherDetails[teacherName].schedule[day] = Array(headers.length).fill(null);
								}

								const subjectForTeacher = subjectsInCell[k] || subjectsInCell[0];
								teacherDetails[teacherName].schedule[day][periodIndex] = {
									subject: subjectForTeacher,
									className
								};
								teacherDetails[teacherName].periodCount++;
								teacherDetails[teacherName].subjects.add(subjectForTeacher);

								// Calculate daily workload
								if (!teacherDetails[teacherName].workload[day]) {
									teacherDetails[teacherName].workload[day] = 0;
								}
								teacherDetails[teacherName].workload[day]++;
							});
						}
					});
				}
			}
		}

		// Enhanced class sorting
		const classNames = Object.keys(timetable.Monday || {}).sort((a, b) => {
			const numA = extractClassNumber(a);
			const numB = extractClassNumber(b);

			if (numA !== numB) return numA - numB;
			return a.localeCompare(b);
		});

		const result = {
			timetable,
			teacherDetails,
			periodHeaders: headers,
			classNames,
			teacherNames: Object.keys(teacherDetails).sort(),
			days: Object.keys(timetable)
		};

		console.log('Parsed timetable days:', Object.keys(timetable));
		console.log(
			'Sample Saturday data:',
			timetable.Saturday ? Object.keys(timetable.Saturday).length + ' classes' : 'No Saturday data'
		);

		return result;
	} catch (error) {
		console.error('Error parsing timetable data:', error);
		// Return minimal data structure to prevent crashes
		return {
			timetable: { Monday: {} },
			teacherDetails: {},
			periodHeaders: [],
			classNames: [],
			teacherNames: [],
			days: ['Monday']
		};
	}
}
