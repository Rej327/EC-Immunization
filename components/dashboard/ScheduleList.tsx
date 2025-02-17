import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { ThemedText } from "../ThemedText";
import { history, pending, upcoming } from "@/assets";
import { useRouter } from "expo-router";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/db/firebaseConfig"; // Ensure your Firebase config is imported
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

export default function ScheduleList() {
	const route = useRouter();
	const [pendingCount, setPendingCount] = useState(0);
	const [hasNewPending, setHasNewPending] = useState(false);

	// Function to send push notification when there are new pending appointments
	const sendPushNotification = async (count: number) => {
		// Check if a notification has already been sent for this count
		const notifiedCount = await AsyncStorage.getItem(
			"notifiedPendingCount"
		);

		if (count > 0 && notifiedCount !== count.toString()) {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "New Pending Appointment!",
					body: `You have ${count} new pending appointments.`,
					data: { type: "pending", count: count },
				},
				trigger: {
					seconds: 1, // Trigger immediately after being called
				},
			});

			// Save the count to AsyncStorage to prevent re-sending the same notification
			await AsyncStorage.setItem(
				"notifiedPendingCount",
				count.toString()
			);
		}
	};

	// Real-time listener for pending appointments
	useEffect(() => {
		const q = query(
			collection(db, "appointments"),
			where("status", "==", "pending")
		);

		// Listen to real-time updates from the database
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const pendingAppointments = snapshot.docs.length;
			setPendingCount(pendingAppointments);

			// Set the red dot and send a notification if there are pending appointments
			setHasNewPending(pendingAppointments > 0);
			sendPushNotification(pendingAppointments); // Trigger notification when data updates
		});

		// Cleanup the listener when the component unmounts
		return () => unsubscribe();
	}, []);

	// Navigate to the appropriate route and reset red dot for pending
	const handleRoute = (status: string) => {
		if (status === "pending") {
			// Clear the red dot when user views the pending appointments
			setHasNewPending(false);
		}

		// Navigate to the screen
		route.push({
			pathname: "/online/(dashboard)/scheduleByStatus",
			params: { scheduleByStats: status },
		});
	};

	return (
		<View className="mb-2 pb-2 mx-[20px]">
			{/* Header Section */}
			<View className="flex flex-row gap-2 justify-between">
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[32%] mb-2"></View>
				<ThemedText type="cardHeader">Appointments</ThemedText>
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[32%] mb-2"></View>
			</View>

			{/* Appointment Categories */}
			<View className="flex flex-row justify-between items-center mt-4">
				{/* Pending Section */}
				<TouchableOpacity onPress={() => handleRoute("pending")}>
					<View>
						<Image source={pending} className="w-20 h-20" />
						{hasNewPending && (
							<View style={styles.pendingContainer}>
								<ThemedText
									type="cardTitle"
									style={styles.pendingCount}
								>
									{pendingCount}
								</ThemedText>
							</View>
						)}
					</View>
					<ThemedText
						type="default"
						className="text-center text-[#456B72] font-bold"
					>
						Pendings
					</ThemedText>
				</TouchableOpacity>

				{/* Upcoming Section */}
				<TouchableOpacity onPress={() => handleRoute("upcoming")}>
					<Image source={upcoming} className="w-20 h-20" />
					<ThemedText
						type="default"
						className="text-center text-[#456B72] font-bold"
					>
						Upcomings
					</ThemedText>
				</TouchableOpacity>

				{/* History Section */}
				<TouchableOpacity onPress={() => handleRoute("history")}>
					<Image source={history} className="w-20 h-20" />
					<ThemedText
						type="default"
						className="text-center text-[#456B72] font-bold"
					>
						Histories
					</ThemedText>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	pendingContainer: {
		position: "absolute",
		top: -5,
		right: -10,
		backgroundColor: "red",
		width: 20,
		height: 20,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},

	pendingCount: {
		lineHeight: 27,
		marginTop: -3,
		color: "white",
		fontSize: 12,
		fontWeight: "bold",
	},
});
