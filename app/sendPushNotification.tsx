// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export async function sendPushNotification(
// 	expoPushToken: string,
// 	title: string,
// 	body: string
// ) {
// 	const message = {
// 		to: expoPushToken,
// 		sound: "default",
// 		title: title,
// 		body: body,
// 		data: { extraData: "some extra data" }, // Optional custom data
// 	};

// 	try {
// 		const response = await fetch("https://exp.host/--/api/v2/push/send", {
// 			method: "POST",
// 			headers: {
// 				Accept: "application/json",
// 				"Content-Type": "application/json",
// 			},
// 			body: JSON.stringify(message),
// 		});

// 		const responseData = await response.json();
// 		console.log("Notification response:", responseData);
// 	} catch (error) {
// 		console.error("Error sending push notification:", error);
// 	}
// }