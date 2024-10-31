import { format, formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";

// Helper function to format date
export const formatDate = (date: Timestamp | Date) => {
	const jsDate = date instanceof Timestamp ? date.toDate() : date;
	return jsDate.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

export const OfflineformatExpectedDate = (date: Timestamp | Date | string) => {
	// If the date is a Timestamp, convert it to a Date
	const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);

	// Check if jsDate is a valid Date object
	if (isNaN(jsDate.getTime())) {
		return "Invalid Date"; // Fallback for invalid date
	}

	return jsDate.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

// Helper function to compare dates
export const isTodayOrTomorrow = (expectedDate: Timestamp | Date) => {
	const jsDate =
		expectedDate instanceof Timestamp
			? expectedDate.toDate()
			: expectedDate;
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1); // Add 1 day to today's date for tomorrow

	// Check if the expectedDate is today or tomorrow
	return (
		jsDate.toDateString() === today.toDateString() ||
		jsDate.toDateString() === tomorrow.toDateString()
	);
};

export const isTodayOrTomorrowOrPast = (expectedDate: Timestamp | Date) => {
	const jsDate =
		expectedDate instanceof Timestamp
			? expectedDate.toDate()
			: expectedDate;
	const today = new Date();
	today.setHours(0, 0, 0, 0); // Start of the day
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0); // Start of the day

	// Check if the expectedDate is today, tomorrow, or in the past
	if (jsDate < today) {
		return "past";
	} else if (jsDate.toDateString() === today.toDateString()) {
		return "today";
	} else if (jsDate.toDateString() === tomorrow.toDateString()) {
		return "tomorrow";
	}

	// If none of the above, it's in the future (beyond tomorrow)
	return "future";
};

// Helper function to format vaccine list
export const formatVaccineList = (vaccines: string[], timeFrame: string) => {
	if (vaccines.length === 0) return "";

	if (vaccines.length === 1) {
		return `The vaccine ${vaccines[0]} is ${timeFrame}.`;
	} else if (vaccines.length === 2) {
		return `The vaccines ${vaccines.join(" and ")} are ${timeFrame}.`;
	} else {
		return `The vaccines ${vaccines.slice(0, -1).join(", ")}, and ${
			vaccines[vaccines.length - 1]
		} are ${timeFrame}.`;
	}
};


export const formatNotificationDate = (date: Date) => {
	if (!date) return "Unknown Date";
	const now = new Date();
	const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);

	// If less than a week ago, show relative time
	if (secondsDiff < 604800) {
		return formatDistanceToNow(date, { addSuffix: true });
	}

	// If older than a week, show the actual date
	return format(date, "PPPP");
};

// Helper function to format age
export const formatAge = (ageInMonths: number): string => {
	if (ageInMonths === 0) {
		return "At Birth";
	} else if (ageInMonths % 1 === 0.5) {
		return `${Math.floor(ageInMonths)} ½ month's`;
	} else {
		return `${ageInMonths} month's`;
	}
};

