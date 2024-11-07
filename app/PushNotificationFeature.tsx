import React, { useEffect } from "react";
import { View, Text, Button } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { notifIcon } from "@/assets";
import ForegroundNotification from "./ForegroundNotification";
import { registerForPushNotificationsAsync } from "@/middleware/registerForPushNotificationsAsync";

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
