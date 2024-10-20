import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Modal,
	Animated,
	Pressable,
	Image,
	TouchableOpacity,
} from "react-native";
import { ThemedText } from "../ThemedText";
import { NotificationType } from "../HomeRightHeader";
import { formatDistanceToNow, format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { noNotif } from "@/assets";

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
					<ThemedText
						type="cardHeader"
						className="text-center shadow-xl bg-[#86b3bc] py-4 text-lg"
					>
						Notifications
					</ThemedText>
					<ScrollView className="px-4 mt-2">
						{notifications.length > 0 ? (
							<>
								{notifications.map((notification) => (
									<TouchableOpacity
										key={notification.id}
										onLongPress={() =>
											handleNotificationPress(
												notification
											)
										}
										style={[
											styles.notificationCard,
											{
												backgroundColor:
													notification.isRead
														? "white"
														: "#d2e3e7e6",
											},
										]}
									>
										<View
											style={styles.notificationContainer}
										>
											{/* Show dot for unread notifications */}

											<View
												style={
													styles.notificationContent
												}
											>
												<Text
													style={
														styles.notificationTitle
													}
													numberOfLines={1}
													ellipsizeMode="tail"
												>
													{notification.subject}
												</Text>
												<Text
													numberOfLines={1}
													ellipsizeMode="tail"
												>
													{notification.message}
												</Text>
												<Text
													style={
														styles.notificationDate
													}
												>
													{formatNotificationDate(
														notification.createdAt.toDate()
													)}
												</Text>
											</View>
											{!notification.isRead && (
												<View
													style={styles.unreadDot}
												/>
											)}
										</View>
									</TouchableOpacity>
								))}
							</>
						) : (
							<View className="flex mt-[70%] items-center justify-center">
								<Image
									source={noNotif}
									className="w-52 h-52 object-cover"
								/>
								<ThemedText
									type="cardHeader"
									className="text-[#456b7288] -mt-2"
								>
									No notifications
								</ThemedText>
							</View>
						)}
					</ScrollView>
					<Pressable
						style={styles.closeNotificationButton}
						onPress={toggleDrawer}
					>
						<Ionicons
							name="return-up-forward-outline"
							size={24}
							color={"#456B72"}
						/>
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
							<ThemedText style={styles.notificationTitle}>
								{selectedNotification.subject}
							</ThemedText>
							<ThemedText style={styles.detailsMessage}>
								{selectedNotification.message}
							</ThemedText>
							<Text style={styles.notificationDate}>
								{formatNotificationDate(
									selectedNotification.createdAt.toDate()
								)}
							</Text>
							<Pressable
								style={styles.closeButton}
								onPress={() => setSelectedNotification(null)}
							>
								<Ionicons
									name="close-circle-sharp"
									size={22}
									color={"#456B72"}
								/>
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
		borderTopLeftRadius: 12,
		borderBottomLeftRadius: 12,
		position: "absolute",
		right: 0,
	},
	notificationCard: {
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
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
		paddingRight: 10,
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
		top: 0,
		right: 0,
		padding: 5,
	},
	closeNotificationButton: {
		position: "absolute",
		top: 14,
		right: 20,
		padding: 5,
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
		paddingHorizontal: 20,
		paddingBottom: 20,
		paddingTop: 25,
		borderRadius: 10,
	},
	detailsMessage: {
		marginVertical: 10,
		fontSize: 14,
	},
	detailsDate: {
		fontSize: 12,
		color: "gray",
	},
});

export default Notification;
