import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	Appointment,
	Baby,
	Milestone,
	Notification,
	UserData,
} from "@/types/types";

// 1. Fetch Milestones
export const getMilestonesDAta = async (babyId: string): Promise<Milestone[]> => {
  try {
    const milestonesData = await AsyncStorage.getItem("milestones");
    if (!milestonesData) return [];
    
    const allMilestones: Milestone[] = JSON.parse(milestonesData);
    // Filter milestones for the selected baby
    return allMilestones.filter(milestone => milestone.babyId === babyId);
  } catch (error) {
    console.error("Error fetching milestones from AsyncStorage: ", error);
    return [];
  }
};


// 2. Fetch Appointments
export const getAppointmentsData = async (): Promise<Appointment[]> => {
	try {
		const appointmentsData = await AsyncStorage.getItem("appointments");
		return appointmentsData ? JSON.parse(appointmentsData) : [];
	} catch (error) {
		console.error("Error fetching babies from AsyncStorage: ", error);
		return [];
	}
};

// 3. Fetch Babies
export const getBabiesData = async (): Promise<Baby[]> => {
	try {
		const babiesData = await AsyncStorage.getItem("babies");
		return babiesData ? JSON.parse(babiesData) : [];
	} catch (error) {
		console.error("Error fetching babies from AsyncStorage: ", error);
		return [];
	}
};

// 4. Get Notifications
export const getNotificationsData = async (): Promise<Notification[]> => {
	try {
		const notificationsData = await AsyncStorage.getItem("notifications");
		return notificationsData ? JSON.parse(notificationsData) : [];
	} catch (error) {
		console.error(
			"Error fetching notifications from AsyncStorage: ",
			error
		);
		return [];
	}
};

// 5. Get Users
export const getUserData = async (): Promise<UserData | null> => {
	try {
		const userData = await AsyncStorage.getItem("users");
		return userData ? JSON.parse(userData) : null;
	} catch (error) {
		console.error(
			"Error fetching notifications from AsyncStorage: ",
			error
		);
		return null;
	}
};
