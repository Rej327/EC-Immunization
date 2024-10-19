import { db } from "@/db/firebaseConfig";
import {
	Appointment,
	Baby,
	Milestone,
	MilestoneData,
	Notification,
	UserData,
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
		const milestonesMap: {
			[key: string]: Milestone;
		} = {};

		querySnapshot.docs.forEach((doc) => {
			const milestoneData = doc.data();
			const babyId = milestoneData.babyId;
			const parentId = milestoneData.parentId;
			const milestoneArray: MilestoneData[] =
				milestoneData.milestone || [];

			if (!milestonesMap[babyId]) {
				milestonesMap[babyId] = {
					babyId,
					parentId,
					firstName: milestoneData.firstName || "",
					lastName: milestoneData.lastName || "",
					createdAt: milestoneData.createdAt.toDate(),
					milestone: [],
				};
			}
			milestonesMap[babyId].milestone.push(...milestoneArray);
		});

		const fetchedMilestones: Milestone[] = Object.values(milestonesMap);

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
				isActive: false,
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

			return {
				id: doc.id,
				parentId: data.parentId,
				firstName: data.firstName,
				lastName: data.lastName,
				birthday: data.birthday.toDate(),
				createdAt: data.createdAt.toDate(),
			} as Baby;
		});

		await AsyncStorage.setItem("babies", JSON.stringify(babies));

		// 5 Fetch notifications based on userId
		const formatNotificationDate = (date: Date) => {
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

		const notificationsRef = query(
			collection(db, "notifications"),
			where("receiverId", "==", userId)
		);
		const notificationsSnapshot = await getDocs(notificationsRef);

		const notifications = notificationsSnapshot.docs.map((doc) => {
			const data = doc.data();

			return {
				id: doc.id,
				receiverId: data.receiverId,
				firstName: data.firstName,
				lastName: data.lastName,
				subject: data.subject,
				message: data.message,
				isRead: data.isRead,
				createdAt: formatNotificationDate(data.createdAt.toDate()),
			} as Notification;
		});

		await AsyncStorage.setItem(
			"notifications",
			JSON.stringify(notifications)
		);

		console.log("Data fetched and saved to AsyncStorage successfully!");
	} catch (error) {
		console.error("Error fetching data: ", error);
	}
};
