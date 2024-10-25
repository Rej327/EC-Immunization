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
	const jsDate = expectedDate instanceof Timestamp ? expectedDate.toDate() : expectedDate;
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1); // Add 1 day to today's date for tomorrow

	// Check if the expectedDate is today or tomorrow
	return (
		jsDate.toDateString() === today.toDateString() ||
		jsDate.toDateString() === tomorrow.toDateString()
	);
};

export const isTodayOrTomorrowOffline = (expectedDate: Date | null): boolean => {
	// Ensure expectedDate is not null or undefined
	if (!expectedDate) return false;

	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1); // Add 1 day to today's date for tomorrow

	// Check if the expectedDate is today or tomorrow
	return (
		expectedDate.toDateString() === today.toDateString() ||
		expectedDate.toDateString() === tomorrow.toDateString()
	);
};



export const formatNotificationDate = (date: Date) => {
	if (!date) return "Unknown Date";
	const now = new Date();
	const secondsDiff = Math.floor(
		(now.getTime() - date.getTime()) / 1000
	);

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
