import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import OfflineNotification from "./notifacation/OfflineNotification";
import { getNotificationsData } from "@/middleware/GetFromLocalStorage";
import { Notification } from "@/types/types";
import OfflineProfileAvatar from "@/app/OfflineProfileAvatar";

export const OfflineHomeRightHeader = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [slideAnim] = useState(new Animated.Value(300)); // Start off-screen
	const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getNotificationsData();
				// Alert.alert('Date', data.createdAt)
				setNotifications(data);
				console.log("Success Fetching Notification in Offline mode");
			} catch (error) {
				console.error("Error fetching data: ", error);
				// Alert.alert("Error", "Failed to fetch data.");
			}
		};

		fetchData();
	}, []);

	const toggleDrawer = () => {
		if (isOpen) {
			Animated.parallel([
				Animated.timing(slideAnim, {
					toValue: 300, // Slide out
					duration: 300,
					useNativeDriver: false,
				}),
				Animated.timing(fadeAnim, {
					toValue: 0, // Fade out
					duration: 300,
					useNativeDriver: true,
				}),
			]).start(() => setIsOpen(false));
		} else {
			setIsOpen(true);
			Animated.parallel([
				Animated.timing(slideAnim, {
					toValue: 0, // Slide in
					duration: 300,
					useNativeDriver: false,
				}),
				Animated.timing(fadeAnim, {
					toValue: 1, // Fade in
					duration: 300,
					useNativeDriver: true,
				}),
			]).start();
		}
	};

	return (
		<View style={{ flexDirection: "row", alignItems: "center" }}>
			<TouchableOpacity
				style={{ marginRight: 20 }}
				onPress={toggleDrawer}
			>
				<View>
					<Ionicons
						name="notifications-sharp"
						size={24}
						color={"#f7d721"}
					/>
				</View>
			</TouchableOpacity>

			<OfflineNotification
				notifications={notifications}
				isOpen={isOpen}
				toggleDrawer={toggleDrawer}
				slideAnim={slideAnim}
				fadeAnim={fadeAnim}
			/>
		</View>
	);
};
