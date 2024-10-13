import React, { useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import {
	View,
	Pressable,
	Image,
	Text,
	StyleSheet,
	ScrollView,
	Modal,
	Animated,
	StatusBar,
} from "react-native";
import { ThemedText } from "./ThemedText";

export const HomeRightHeader = () => {
	const { user } = useUser();
	const [notifications] = useState([
		{
			id: 1,
			title: "New Update",
			description: "App version 1.2 is live",
			date: "2024-09-30",
		},
		{
			id: 2,
			title: "Feature Added",
			description: "Check out the new quiz feature",
			date: "2024-09-29",
		},
	]);
	const [isOpen, setIsOpen] = useState(false);
	const [slideAnim] = useState(new Animated.Value(300)); // Start off-screen
	const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity

	const toggleDrawer = () => {
		if (isOpen) {
			// Close the drawer
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
			// Open the drawer
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
			{/* <StatusBar />  */}
			<Pressable style={{ marginRight: 10 }} onPress={toggleDrawer}>
				<View>
					<Ionicons
						name="notifications-sharp"
						size={24}
						color={"#f7d721"}
					/>
					{notifications.length > 0 && <View style={styles.redDot} />}
				</View>
			</Pressable>

			{user && (
				<Image
					source={{ uri: user.imageUrl }} // Use Clerk's profile image URL
					style={styles.profileImage}
				/>
			)}

			<Modal
				transparent={true}
				visible={isOpen}
				animationType="none"
				onRequestClose={toggleDrawer} // Close modal on back button press
			>
				<Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
					<Pressable style={styles.overlay} onPress={toggleDrawer} />
					<Animated.View
						style={[
							styles.drawerContent,
							{ transform: [{ translateX: slideAnim }] },
						]}
					>
						<ThemedText type="subtitle" className="mb-4">
							Notification
						</ThemedText>
						<ScrollView>
							{notifications.map((notification) => (
								<View
									key={notification.id}
									style={styles.notificationCard}
								>
									<Text style={styles.notificationTitle}>
										{notification.title}
									</Text>
									<Text>{notification.description}</Text>
									<Text style={styles.notificationDate}>
										{notification.date}
									</Text>
								</View>
							))}
						</ScrollView>
						<Pressable
							style={styles.closeButton}
							onPress={toggleDrawer}
						>
							<ThemedText type="close">Close</ThemedText>
						</Pressable>
					</Animated.View>
				</Animated.View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	profileImage: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginLeft: 5,
		marginRight: 14,
	},
	redDot: {
		position: "absolute",
		top: -4,
		right: -4,
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "red",
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent backdrop
		justifyContent: "center",
		alignItems: "flex-end",
	},
	drawerContent: {
		width: "90%", // Drawer covers 90% of the width
		height: "100%", // Full height
		backgroundColor: "#f5f4f7",
		padding: 20,
		borderTopLeftRadius: 20,
		borderBottomLeftRadius: 20,
		elevation: 5, // Add shadow effect on Android
		shadowColor: "#000", // Shadow for iOS
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		position: "absolute",
		right: 0, // Position the drawer from the right
	},

	notificationCard: {
		padding: 15,
		borderRadius: 10,
		backgroundColor: "#fefffe", // Updated color
		marginBottom: 10,
		// Shadow for iOS
		shadowColor: "#000",
		shadowOffset: { width: 4, height: 4 }, // Increase height for better bottom shadow
		shadowOpacity: 0.3,
		shadowRadius: 6, // Increase for a softer shadow
		// Shadow for Android
		elevation: 2, // Increase elevation for stronger shadow
	},

	notificationTitle: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 5,
	},
	notificationDate: {
		fontSize: 12,
		color: "gray",
		marginTop: 5,
	},
	closeButton: {
		position: "absolute",
		top: 5,
		right: 10,
		padding: 10,
		borderRadius: 20,
	},
});
