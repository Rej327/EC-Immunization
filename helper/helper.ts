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