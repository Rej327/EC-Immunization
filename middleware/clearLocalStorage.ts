import AsyncStorage from "@react-native-async-storage/async-storage";

export const clearLocalStorage = async () => {

	await AsyncStorage.removeItem("user");
	await AsyncStorage.removeItem("babies");
	await AsyncStorage.removeItem("milestones");
	await AsyncStorage.removeItem("appointments");
	await AsyncStorage.removeItem("notifications");

	// await AsyncStorage.removeItem("userPassword");
	// await AsyncStorage.removeItem("selectedBabyId");
	// await AsyncStorage.removeItem("reminders");
	// await AsyncStorage.removeItem("babyDetails");
};
