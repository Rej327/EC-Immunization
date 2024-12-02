import { db } from "@/db/firebaseConfig";
import { formatNotificationDate } from "@/helper/helper";
import {
	Appointment,
	Baby,
	Card,
	Feed,
	Milestone,
	MilestoneData,
	Notification,
	Schedules,
	UserData,
	VaccineSchedule,
} from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, formatDistanceToNow } from "date-fns";
import { collection, getDocs, query, where } from "firebase/firestore";

export const saveForOffline = async (userId: any) => {
	try {
		// 1. Fetch milestones based on userId (parentId)
		const milestonesRef = query(
			collection(db, "milestones"),
			where("parentId", "==", userId)
		);
		const querySnapshot = await getDocs(milestonesRef);

		// Create a mapping of babyId to milestones
		const milestonesMap: { [key: string]: Milestone } = {};

		querySnapshot.docs.forEach((doc) => {
			const milestoneData = doc.data();
			const babyId = milestoneData.babyId;
			const parentId = milestoneData.parentId;

			// Transform milestoneData array items to ensure proper types
			const milestoneArray: MilestoneData[] = (
				milestoneData.milestone || []
			).map((milestone: any) => ({
				ageInMonths: milestone.ageInMonths,
				vaccine: milestone.vaccine,
				description: milestone.description,
				received: Boolean(milestone.received),
				expectedDate: milestone.expectedDate.toDate
					? milestone.expectedDate.toDate()
					: new Date(milestone.expectedDate),
				updatedAt: milestone.updatedAt
					? milestone.updatedAt.toDate()
					: new Date(),
			}));

			if (!milestonesMap[babyId]) {
				milestonesMap[babyId] = {
					babyId,
					parentId,
					firstName: milestoneData.firstName || "",
					lastName: milestoneData.lastName || "",
					createdAt: milestoneData.createdAt.toDate(),
					milestoneData: [],
				};
			}

			// Push transformed data into the milestones map
			milestonesMap[babyId].milestoneData.push(...milestoneArray);
		});

		const fetchedMilestones: Milestone[] = Object.values(milestonesMap);

		// Save milestones to AsyncStorage
		await AsyncStorage.setItem(
			"milestones",
			JSON.stringify(fetchedMilestones)
		);

		// // 2 Fetch users based on userId
		const usersRef = collection(db, "parents");
		const usersSnapshot = await getDocs(usersRef);

		const userDoc = usersSnapshot.docs.find((doc) => doc.id === userId);

		if (userDoc) {
			const userData: UserData = {
				id: userDoc.id,
				email: userDoc.data().email || "",
				username: userDoc.data().username || "",
				firstName: userDoc.data().firstName || "",
				lastName: userDoc.data().lastName || "",
				isActive: true,
			};

			await AsyncStorage.setItem("users", JSON.stringify(userData));
		}

		// 3 Fetch appointments based on userId
		const appointmentsRef = query(
			collection(db, "appointments"),
			where("parentId", "==", userId)
		);
		const appointmentsSnapshot = await getDocs(appointmentsRef);
		const appointments = appointmentsSnapshot.docs.map((doc) => {
			const data = doc.data();

			return {
				id: doc.id,
				parentId: data.parentId,
				parentName: data.parentName,
				babyFirstName: data.babyFirstName,
				babyLastName: data.babyLastName,
				vaccine: data.vaccine,
				address: data.address,
				status: data.status,
				scheduleDate: data.scheduleDate.toDate(),
				createdAt: data.createdAt.toDate(),
				updatedAt: data.updatedAt.toDate(),
			} as Appointment;
		});

		await AsyncStorage.setItem(
			"appointments",
			JSON.stringify(appointments)
		);

		// 4 Fetch babies based on userId
		const babiesRef = query(
			collection(db, "babies"),
			where("parentId", "==", userId)
		);
		const babiesSnapshot = await getDocs(babiesRef);

		const babies = babiesSnapshot.docs.map((doc) => {
			const data = doc.data();

			// Ensure card is an array of Card objects
			const card: Card[] = (data.card || []).map((cardData: any) => ({
				id: cardData.id,
				vaccineName: cardData.vaccineName,
				date: cardData.date || [], // Default to empty array if date is not available
				doses: cardData.doses, // Default to empty string if doses is not available
				remarks: cardData.remarks || [], // Default to empty array if remarks is not available
			}));

			// Return the formatted baby object
			return {
				id: doc.id,
				parentId: data.parentId,
				firstName: data.firstName,
				lastName: data.lastName,
				birthday: data.birthday?.toDate(), // Ensure date is valid
				birthPlace: data.birthplace,
				address: data.address,
				addressInfo: data.addresInfo,
				contact: data.contact,
				fatherName: data.fatherName,
				gender: data.gender,
				height: data.height,
				motherName: data.motherName,
				weight: data.weight,
				createdAt: data.createdAt?.toDate(), // Ensure date is valid
				card, // Return the formatted card
			} as Baby;
		});

		// Store babies in AsyncStorage
		await AsyncStorage.setItem("babies", JSON.stringify(babies));

		// 5 Fetch notifications based on userId

		const notificationsRef = query(
			collection(db, "notifications"),
			where("receiverId", "in", [userId, "all"])
		);
		const notificationsSnapshot = await getDocs(notificationsRef);

		const notifications = notificationsSnapshot.docs.map((doc) => {
			const data = doc.data();

			const createdAt = data.createdAt?.toDate
				? data.createdAt.toDate() // Firestore Timestamp to Date
				: new Date(data.createdAt); // Handle string/other date formats

			const formattedCreatedAt = formatNotificationDate(createdAt);

			return {
				id: doc.id,
				receiverId: data.receiverId,
				firstName: data.firstName,
				lastName: data.lastName,
				subject: data.subject,
				message: data.message,
				isRead: data.isRead,
				createdAt: createdAt,
				formattedCreatedAt: formattedCreatedAt,
			} as Notification;
		});

		notifications.sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
		);

		await AsyncStorage.setItem(
			"notifications",
			JSON.stringify(
				notifications.map((notif) => ({
					...notif,
					createdAt: notif.createdAt.toISOString(),
				}))
			)
		);

		// 6. Fetch feeds
		const feedsRef = collection(db, "feeds");
		const feedsSnapshot = await getDocs(feedsRef);

		const feeds: Feed[] = feedsSnapshot.docs.map((doc) => {
			const data = doc.data();

			const createdAt = data.createdAt?.toDate
				? data.createdAt.toDate() // Firestore Timestamp to Date
				: new Date(data.createdAt); // Handle string/other date formats

			const formattedCreatedAt = formatNotificationDate(createdAt);

			return {
				id: doc.id,
				type: data.type,
				subject: data.subject,
				description: data.description,
				date: data.date ? data.date.toDate() : null,
				createdAt: data.createdAt.toDate(),
				offlineCreatedAt: formattedCreatedAt,
			} as Feed;
		});

		// Sort feeds by createdAt in descending order
		feeds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		// Save feeds to AsyncStorage
		await AsyncStorage.setItem(
			"feeds",
			JSON.stringify(
				feeds.map((feed) => ({
					...feed,
					date: feed.date ? feed.date.toISOString() : null,
					createdAt: feed.createdAt.toISOString(),
				}))
			)
		);

		// 7. Fetch schedules where completed is false
		const schedulesRef = query(
			collection(db, "schedules"),
			where("completed", "==", false)
		);
		const schedulesSnapshot = await getDocs(schedulesRef);

		const schedules: Schedules[] = schedulesSnapshot.docs.map((doc) => {
			const data = doc.data();

			const createdAt = data.createdAt?.toDate
				? data.createdAt.toDate()
				: new Date(data.createdAt);
			const updatedAt = data.updatedAt?.toDate
				? data.updatedAt.toDate()
				: new Date(data.updatedAt);

			// Ensure we get vaccines from the `card` field, fallback to empty array if not present
			const vaccines: VaccineSchedule[] = (data.vaccines || []).map(
				(vaccines: any) => ({
					count: vaccines.count,
					description: vaccines.description,
					id: vaccines.id,
					name: vaccines.name,
					taken: vaccines.taken,
				})
			);

			// Return the schedule object that matches the Schedules interface
			return {
				id: doc.id,
				address: data.address,
				completed: data.completed,
				when: data.when.toDate(), // Convert Firestore timestamp to Date
				createdAt: createdAt,
				updatedAt: updatedAt,
				vaccines: vaccines, // Ensure the vaccines field is properly populated
			} as Schedules;
		});

		// Save schedules to AsyncStorage
		await AsyncStorage.setItem("schedules", JSON.stringify(schedules));

		console.log("Feeds fetched and saved to AsyncStorage successfully!");
	} catch (error) {
		console.error("Error fetching data: ", error);
	}
};
