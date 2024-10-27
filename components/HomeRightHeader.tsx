import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import {
	View,
	TouchableOpacity,
	Image,
	StyleSheet,
	Animated,
} from "react-native";
import { db } from "@/db/firebaseConfig"; // Your Firestore configuration
import {
	collection,
	onSnapshot,
	doc,
	Timestamp,
	query,
	where,
	updateDoc,
} from "firebase/firestore";
import Notification from "./notifacation/Notification";
import { ThemedText } from "./ThemedText";

// Define the Notification type
export interface NotificationType {
	id: string; // Firestore's document ID is a string
	receiverId: string;
	firstName: string;
	lastName: string;
	subject: string;
	message: string;
	createdAt: Timestamp; // Use Firestore Timestamp here
	isRead: boolean; // Add this field
}

export const HomeRightHeader = () => {
	const { user } = useUser();
	const [notifications, setNotifications] = useState<NotificationType[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [slideAnim] = useState(new Animated.Value(300)); // Start off-screen
	const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity
	const [unreadCount, setUnreadCount] = useState(0); // Track unread notifications

	useEffect(() => {
		if (user) {
			const unsubscribe = onSnapshot(
				query(
					collection(db, "notifications"),
					where("receiverId", "==", user?.id)
				),
				(snapshot) => {
					const notificationsData: NotificationType[] =
						snapshot.docs.map((doc) => {
							const data = doc.data() as Omit<
								NotificationType,
								"id"
							>; // Omit 'id' from the type for fetching

							return {
								id: doc.id, // Keep id as string
								receiverId: data.receiverId,
								firstName: data.firstName,
								lastName: data.lastName,
								subject: data.subject || "No title",
								message: data.message || "No description",
								createdAt: data.createdAt,
								isRead: data.isRead || false,
							};
						});

					// Sort notifications by createdAt in descending order
					notificationsData.sort(
						(a, b) =>
							b.createdAt.toMillis() - a.createdAt.toMillis()
					);
					setNotifications(notificationsData);

					// Update unread count
					setUnreadCount(
						notificationsData.filter(
							(notification) => !notification.isRead
						).length
					);
				}
			);

			return () => unsubscribe(); // Cleanup subscription on unmount
		}
	}, [user]);

	// New function to mark a notification as read
	const markNotificationAsRead = async (id: string) => {
		const notificationRef = doc(db, "notifications", id);
		await updateDoc(notificationRef, { isRead: true });
	};

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
					{/* Show red dot with unread count if there are unread notifications */}
					{unreadCount > 0 && (
						<View style={styles.redDot}>
							<ThemedText
								type="cardTitle"
								style={styles.unreadCountText}
							>
								{unreadCount}
							</ThemedText>
						</View>
					)}
				</View>
			</TouchableOpacity>

			<Notification
				notifications={notifications}
				isOpen={isOpen}
				toggleDrawer={toggleDrawer}
				slideAnim={slideAnim}
				fadeAnim={fadeAnim}
				markAsRead={markNotificationAsRead} // Pass the new function
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	redDot: {
		position: "absolute",
		top: -4,
		right: -7,
		minWidth: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: "red",
		alignItems: "center",
		justifyContent: "center",
	},
	unreadCountText: {
		lineHeight: 24,
		marginTop: -3,
		color: "white",
		fontSize: 12,
		fontWeight: "bold",
	},
});
