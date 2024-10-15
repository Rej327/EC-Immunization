import React, { useState } from "react";
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
import { NotificationType } from "../HomeRightHeader";
import { formatDistanceToNow, format } from "date-fns";

interface NotificationProps {
	notifications: NotificationType[];
	isOpen: boolean;
	toggleDrawer: () => void;
	slideAnim: Animated.Value;
	fadeAnim: Animated.Value;
	markAsRead: (id: string) => void; // Prop for marking notifications as read
}

const Notification: React.FC<NotificationProps> = ({
	notifications,
	isOpen,
	toggleDrawer,
	slideAnim,
	fadeAnim,
	markAsRead,
}) => {
	const [selectedNotification, setSelectedNotification] =
		useState<NotificationType | null>(null); // State to hold selected notification

	const formatNotificationDate = (date: Date) => {
		if (!date) return "Unknown Date"; // Fallback if date is not valid
		const now = new Date();
		const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);

		// If less than a week ago, show relative time
		if (secondsDiff < 604800) {
			return formatDistanceToNow(date, { addSuffix: true });
		}

		// If older than a week, show the actual date
		return format(date, "PPPP");
	};

	const handleNotificationPress = (notification: NotificationType) => {
		setSelectedNotification(notification); // Set the selected notification
		markAsRead(notification.id); // Mark as read
	};

	return (
		<Modal
			transparent={true}
			visible={isOpen}
			animationType="none"
			onRequestClose={toggleDrawer}
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
						Notifications
					</ThemedText>
					<ScrollView>
						{notifications.map((notification) => (
							<Pressable
								key={notification.id}
								onPress={() =>
									handleNotificationPress(notification)
								}
								style={[
									styles.notificationCard,
									{
										backgroundColor: notification.isRead
											? "#f5f5f5"
											: "white",
									},
								]}
							>
								<View style={styles.notificationContainer}>
									{/* Show dot for unread notifications */}

									<View style={styles.notificationContent}>
										<Text style={styles.notificationTitle}>
											{notification.subject}
										</Text>
										<Text>{notification.message}</Text>
										<Text style={styles.notificationDate}>
											{formatNotificationDate(
												notification.createdAt.toDate()
											)}
										</Text>
									</View>
									{!notification.isRead && (
										<View style={styles.unreadDot} />
									)}
								</View>
							</Pressable>
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

			{/* Modal for displaying selected notification details */}
			{selectedNotification && (
				<Modal
					transparent={true}
					visible={Boolean(selectedNotification)}
					animationType="fade"
					onRequestClose={() => setSelectedNotification(null)}
				>
					<Animated.View style={styles.detailsOverlay}>
						<Pressable
							style={styles.overlay}
							onPress={() => setSelectedNotification(null)}
						/>
						<View style={styles.detailsContent}>
							<ThemedText type="title">
								{selectedNotification.subject}
							</ThemedText>
							<Text style={styles.detailsMessage}>
								{selectedNotification.message}
							</Text>
							<Text style={styles.detailsDate}>
								{formatNotificationDate(
									selectedNotification.createdAt.toDate()
								)}
							</Text>
							<Pressable
								style={styles.closeButton}
								onPress={() => setSelectedNotification(null)}
							>
								<ThemedText type="close">Close</ThemedText>
							</Pressable>
						</View>
					</Animated.View>
				</Modal>
			)}
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.8)",
		justifyContent: "center",
		alignItems: "flex-end",
	},
	drawerContent: {
		width: "90%",
		height: "100%",
		backgroundColor: "#f5f4f7",
		padding: 20,
		borderTopLeftRadius: 12,
		borderBottomLeftRadius: 12,
		position: "absolute",
		right: 0,
	},
	notificationCard: {
		padding: 15,
		borderRadius: 10,
		marginBottom: 5,
		borderWidth: 1,
		borderColor: "#d6d6d6",
	},
	notificationContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	unreadDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "red",
		marginRight: 10,
	},
	notificationContent: {
		flex: 1,
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
	detailsOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.8)",
		justifyContent: "center",
		alignItems: "center",
	},
	detailsContent: {
		position: "absolute",
		width: "80%",
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		alignItems: "center",
	},
	detailsMessage: {
		marginVertical: 10,
		fontSize: 16,
		textAlign: "center",
	},
	detailsDate: {
		fontSize: 12,
		color: "gray",
	},
});

export default Notification;
