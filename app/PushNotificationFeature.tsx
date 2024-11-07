import React, { useEffect } from "react";
import { View, Text, Button } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { notifIcon } from "@/assets";
import ForegroundNotification from "./ForegroundNotification";

// Function to register for push notifications and save the token in AsyncStorage
async function registerForPushNotificationsAsync() {
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
		token = (await Notifications.getExpoPushTokenAsync()).data;
		console.log("Expo Push Token:", token);

		// Save the token in AsyncStorage
		if (token) {
			await AsyncStorage.setItem("expoPushToken", token);
		}
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

const PushNotificationFeature = () => {
	useEffect(() => {
		// Register for push notifications and save the token in AsyncStorage
		registerForPushNotificationsAsync();

		// Listen for incoming notifications
		const notificationListener =
			Notifications.addNotificationReceivedListener((notification) => {
				console.log(
					"Notification received in foreground:",
					notification
				);
			});

		// Listen for when the user taps on a notification
		const responseListener =
			Notifications.addNotificationResponseReceivedListener(
				async (response) => {
					console.log("Notification tapped:", response);

					// Example: Navigate to a specific screen or perform an action
					// You can add navigation code here if you want to navigate to a specific screen
					// based on the notification data.

					// Example of saving tapped notification data in AsyncStorage
					await AsyncStorage.setItem(
						"lastNotificationTapped",
						JSON.stringify(
							response.notification.request.content.data
						)
					);
				}
			);

		// Cleanup listeners when the component is unmounted
		return () => {
			Notifications.removeNotificationSubscription(notificationListener);
			Notifications.removeNotificationSubscription(responseListener);
		};
	}, []);

	return <ForegroundNotification />;
};

export default PushNotificationFeature;