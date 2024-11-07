import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { notifIcon } from "@/assets";

export async function registerForPushNotificationsAsync() {
	let token;
	if (Device.isDevice) {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== "granted") {
			alert("Failed to get push token for push notification!");
			return;
		}
		// token = (await Notifications.getExpoPushTokenAsync()).data;
		// console.log("Expo Push Token:", token);

		// // Save the token in AsyncStorage
		// if (token) {
		// 	await AsyncStorage.setItem("expoPushToken", token);
		// }
	} else {
		alert("Must use physical device for Push Notifications");
	}

	return token;
}

// Set up notification handling
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
		icon: notifIcon,
	}),
});