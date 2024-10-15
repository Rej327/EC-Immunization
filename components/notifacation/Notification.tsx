import React from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Modal,
	Animated,
	Pressable,
} from "react-native";
import { ThemedText } from "../ThemedText";

interface NotificationProps {
	notifications: {
		id: number;
		title: string;
		description: string;
		date: string;
	}[];
	isOpen: boolean;
	toggleDrawer: () => void;
	slideAnim: Animated.Value;
	fadeAnim: Animated.Value;
}

const Notification: React.FC<NotificationProps> = ({
	notifications,
	isOpen,
	toggleDrawer,
	slideAnim,
	fadeAnim,
}) => {
	return (
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
	);
};

const styles = StyleSheet.create({
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
		borderTopLeftRadius: 12,
		borderBottomLeftRadius: 12,
		
		position: "absolute",
		right: 0, // Position the drawer from the right
	},
	notificationCard: {
		padding: 15,
		borderRadius: 10,
		backgroundColor: "white", // Updated color
		marginBottom: 5,
		borderWidth: 1,
		borderColor: "#d6d6d6",
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

export default Notification;
