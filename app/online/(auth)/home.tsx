import {
	View,
	Text,
	StatusBar,
	ScrollView,
	RefreshControl,
	Image,
	StyleSheet,
	TouchableOpacity,
	Modal,
	Pressable,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";
import {
	appointmentIcon,
	circleIcon,
	guideIcon,
	healthIcon,
	hearthIcon,
	noData,
	nonagonIcon,
	reminderIcon,
	starIcon,
	vaccine,
} from "@/assets";
import { ThemedText } from "@/components/ThemedText";
import CategoryCard from "@/components/CategoryCard";
import CustomBottomSheet from "@/components/CustomBottomSheet";
import { events, milestones } from "@/assets/data/data";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	setDoc,
	Timestamp,
	where,
} from "firebase/firestore";
import { db } from "@/db/firebaseConfig";
import { saveForOffline } from "@/middleware/saveForOffline";
import { clearLocalStorage } from "@/middleware/clearLocalStorage";
import CheckLocalData from "@/app/CheckLocalData";
import StyledButton from "@/components/StyledButton";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatVaccineList, isTodayOrTomorrowOrPast } from "@/helper/helper";

interface UserData {
	id: string;
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	isActive: boolean;
}

interface BabyData {
	id: string;
	parentId: string;
	firstName: string;
	lastName: string;
	birthday: string;
	createdAt: Date;
}

type MilestoneList = {
	ageInMonths: number;
	expectedDate: Timestamp | Date; // Allow Firestore Timestamp or JS Date
	vaccine: string;
	description: string;
	received: boolean;
};

const Home = () => {
	const [storedUserData, setStoredUserData] = useState<UserData | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [openBottomSheet, setOpenBottomSheet] = useState<string | null>(null);
	const [babies, setBabies] = useState<BabyData[]>([]);
	const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
	const [showBabySelectionModal, setShowBabySelectionModal] = useState(false);
	const [milestones, setMilestones] = useState<MilestoneList[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [reminderMessage, setReminderMessage] = useState<string | null>(null);

	const { user } = useUser();
	const route = useRouter();

	const checkOrFetchBabies = async () => {
		try {
			const storedBabyId = await AsyncStorage.getItem("selectedBabyId");
			console.log("Stored Baby ID:", storedBabyId);

			// Fetch babies data first
			const babyList = await fetchBabies();

			// Check the baby list length and set selection accordingly
			if (!storedBabyId) {
				if (babyList.length === 0) {
					// No babies found, show registration modal
					console.log("No babies found.");
					setShowBabySelectionModal(true); // Show modal to register a new baby
				} else if (babyList.length === 1) {
					// Auto-select the baby if there's only one
					console.log("Auto-selecting baby:", babyList[0].id);
					setSelectedBabyId(babyList[0].id);
					await AsyncStorage.setItem(
						"selectedBabyId",
						babyList[0].id
					);
				} else if (babyList.length > 1) {
					// If there are multiple babies, show the selection modal
					setShowBabySelectionModal(true);
				}
			} else {
				// Use the stored selected baby ID
				setSelectedBabyId(storedBabyId);
			}
		} catch (error) {
			console.error("Error fetching or setting baby data:", error);
		}
	};

	const fetchMilestones = async (babyId: any) => {
		const milestonesRef = query(
			collection(db, "milestones"),
			where("babyId", "==", babyId)
		);

		try {
			const querySnapshot = await getDocs(milestonesRef);
			const fetchedMilestones: MilestoneList[] = [];

			querySnapshot.docs.forEach((doc) => {
				const milestoneData = doc.data();
				if (milestoneData.milestone) {
					fetchedMilestones.push(...milestoneData.milestone);
				}
			});

			setMilestones(fetchedMilestones);
			console.log("Alert triggered");
		} catch (error) {
			console.error("Error fetching milestones: ", error);
		}
	};

	const alertReminder = async () => {
		if (milestones.length > 0) {
			const today = new Date();
			today.setHours(0, 0, 0, 0); // Set to start of the day
			const tomorrow = new Date(today);
			tomorrow.setDate(today.getDate() + 1); // Add 1 day for tomorrow
			tomorrow.setHours(0, 0, 0, 0); // Set to start of the day

			const vaccinesDueToday: string[] = [];
			const vaccinesDueTomorrow: string[] = [];
			const vaccinesPastDue: string[] = [];

			milestones.forEach((milestone) => {
				if (!milestone.received) {
					const dateStatus = isTodayOrTomorrowOrPast(
						milestone.expectedDate
					);

					if (dateStatus === "today") {
						vaccinesDueToday.push(milestone.vaccine);
					} else if (dateStatus === "tomorrow") {
						vaccinesDueTomorrow.push(milestone.vaccine);
					} else if (dateStatus === "past") {
						vaccinesPastDue.push(milestone.vaccine);
					}
				}
			});

			// Build the message based on the due dates
			let message = "";
			if (vaccinesPastDue.length > 0) {
				message +=
					formatVaccineList(vaccinesPastDue, "overdue") + "\n\n";
			}
			if (vaccinesDueToday.length > 0) {
				message +=
					formatVaccineList(vaccinesDueToday, "due today") + "\n\n";
			}
			if (vaccinesDueTomorrow.length > 0) {
				message +=
					formatVaccineList(vaccinesDueTomorrow, "due tomorrow") +
					"\n\n";
			}

			// Set the reminder message if there's any due
			if (message.trim()) {
				setReminderMessage(message.trim());
				setShowModal(true); // Show the modal

				// Check for existing notifications
				const notificationsRef = collection(db, "notifications");
				const q = query(
					notificationsRef,
					where("message", "==", message.trim()),
					where("receiverId", "==", user?.id)
				);
				const querySnapshot = await getDocs(q);

				if (querySnapshot.empty) {
					// Prepare notification data
					const notificationData = {
						createdAt: Timestamp.fromDate(new Date()), // Current timestamp
						firstName: user?.firstName, // Set dynamically if needed
						lastName: user?.lastName, // Set dynamically if needed
						isRead: false, // Set as false initially
						message: message.trim(),
						receiverId: user?.id, // Set to the user's ID
						subject: "Vaccine Reminder", // Set appropriate subject
					};

					// Send notification to Firestore
					await addDoc(notificationsRef, notificationData);
					console.log("Notification sent successfully!");
				} else {
					console.log("Duplicate notification not sent.");
				}
			}
		}
	};

	useEffect(() => {
		const fetchDataAndAlert = async () => {
			if (milestones.length > 0) {
				// await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
				alertReminder();
			}
		};

		fetchDataAndAlert();
	}, [milestones]);

	useEffect(() => {
		fetchMilestones(selectedBabyId);
	}, [selectedBabyId]);

	const fetchBabies = async (): Promise<BabyData[]> => {
		if (user?.id) {
			const babyQuery = query(
				collection(db, "babies"),
				where("parentId", "==", user.id)
			);
			const querySnapshot = await getDocs(babyQuery);
			const babyList: BabyData[] = [];
			querySnapshot.forEach((doc) => {
				babyList.push({ id: doc.id, ...doc.data() } as BabyData);
			});
			setBabies(babyList); // Update babies state
			return babyList; // Return baby list to ensure we can check its length
		}
		return [];
	};

	useEffect(() => {
		checkOrFetchBabies();
	}, []);

	const saveUserToParents = async () => {
		if (user) {
			const userId = user.id;

			const userDocRef = doc(db, "parents", userId);

			const userDoc = await getDoc(userDocRef);

			if (!userDoc.exists()) {
				await setDoc(userDocRef, {
					// id: userId,
					email: user.emailAddresses?.[0]?.emailAddress || "",
					username: user.username || "",
					firstName: user.firstName || "",
					lastName: user.lastName || "",
				});
				console.log("User saved to parents collection");
			} else {
				console.log("User already exists in parents collection");
			}
		}
	};

	const fetchData = async () => {
		await saveForOffline(user?.id);
	};

	useEffect(() => {
		fetchData();
		saveUserToParents();
	}, [user]);

	const onRefresh = async () => {
		setRefreshing(true);
		// clearLocalStorage();
		fetchData();
		setRefreshing(false);
	};

	const handleBabySelection = async (babyId: string) => {
		setSelectedBabyId(babyId);
		await AsyncStorage.setItem("selectedBabyId", babyId);
		setShowBabySelectionModal(false);
	};

	const closeBottomSheet = useCallback(() => {
		setOpenBottomSheet(null);
	}, []);

	const openBottomSheetHandler = (type: string) => {
		setOpenBottomSheet(type);
	};

	const handleRouteRegister = () => {
		route.navigate("/online/(auth)/profile");
		setShowBabySelectionModal(false);
	};

	const getViewAllStyle = (index: number, totalItems: number) => {
		return {
			backgroundColor: "white",
			padding: 16,
			borderBottomWidth: index === totalItems - 1 ? 0 : 1, // No border for the last item
			borderTopWidth: index === 0 ? 1 : 0, // Border for the first item
			borderColor: "#d6d6d6",
			marginBottom: 8,
		};
	};

	const ReminderModal = () => (
		<Modal
			animationType="fade"
			transparent={true}
			visible={showModal}
			onRequestClose={() => setShowModal(false)}
		>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContent}>
					<View className="mx-auto mb-2">
						<Ionicons
							name="calendar-outline"
							size={40}
							color={"#456B72"}
						/>
					</View>
					<ThemedText type="cardHeader" style={styles.modalAlertText}>
						{reminderMessage}
					</ThemedText>
					<TouchableOpacity
						style={styles.okButton}
						onPress={() => setShowModal(false)}
					>
						<ThemedText style={styles.okButtonText}>OK</ThemedText>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);

	return (
		<View style={{ flex: 1, backgroundColor: "#f5f4f7" }}>
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={["#456B72"]}
					/>
				}
				className="px-4"
				scrollEnabled={!openBottomSheet} // Disable scrolling when bottom sheet is open
			>
				{showModal && <ReminderModal />}
				{/* HERO IMAGE */}
				<View style={styles.imageContainer}>
					<Image
						source={vaccine}
						style={styles.image}
						resizeMode="cover"
					/>
				</View>
				{/* CATEGORY SECTION */}
				<View>
					<ThemedText type="header">Category</ThemedText>
					<View style={styles.categoryContainer}>
						<CategoryCard
							link="/online/(category)/health"
							icon={healthIcon}
							title="HEALTH TIPS"
							backgroundColor="#5ad5fa66"
							shapeIcon={hearthIcon}
							shapePosition={{ top: 0, left: 0 }}
						/>
						<CategoryCard
							link="/online/(category)/guide"
							icon={guideIcon}
							title="GUIDE"
							backgroundColor="#5a92fa66"
							shapeIcon={nonagonIcon}
							shapePosition={{ bottom: 0, left: 0 }}
						/>
						<CategoryCard
							link="/online/(category)/reminder"
							icon={reminderIcon}
							title="REMINDERS"
							backgroundColor="#ecff8253"
							shapeIcon={starIcon}
							shapePosition={{ top: 2, right: 0 }}
						/>
						<CategoryCard
							link="/online/(category)/appointment"
							icon={appointmentIcon}
							title="APPOINTMENT"
							backgroundColor="#82ffc555"
							shapeIcon={circleIcon}
							shapePosition={{ bottom: 10, right: 10 }}
						/>
					</View>
				</View>
				{/* Baby selection modal */}
				<Modal
					animationType="fade"
					transparent={true}
					visible={showBabySelectionModal}
					onRequestClose={() => setShowBabySelectionModal(false)}
				>
					<View style={styles.modalOverlay}>
						<View style={styles.modalContainer}>
							{babies.length === 0 ? (
								// Show registration option if no babies
								<>
									<Image
										source={noData}
										className="w-16 h-20 mb-2"
									/>
									<ThemedText
										type="cardHeader"
										className="mb-3"
									>
										No childrens found. Please register.
									</ThemedText>
									<TouchableOpacity
										style={styles.babyButton}
										onPress={() => handleRouteRegister()}
									>
										<ThemedText
											type="default"
											className="text-white font-bold"
										>
											Register
										</ThemedText>
									</TouchableOpacity>
								</>
							) : (
								// Show baby selection if babies exist
								<>
									<ThemedText
										type="cardHeader"
										className="mb-3"
									>
										Select Children
									</ThemedText>
									{babies.map((baby) => (
										<TouchableOpacity
											key={baby.id}
											style={styles.babyButton}
											onPress={() =>
												handleBabySelection(baby.id)
											}
										>
											<ThemedText
												type="default"
												className="text-white first-letter: capitalize"
											>
												{baby.firstName} {baby.lastName}
											</ThemedText>
										</TouchableOpacity>
									))}
								</>
							)}
						</View>
					</View>
				</Modal>
				{/* EVENTS SECTION */}
				<View>
					<View style={styles.header}>
						<ThemedText type="header">Events</ThemedText>
						<TouchableOpacity
							onPress={() => openBottomSheetHandler("event")}
						>
							<ThemedText type="link">View all</ThemedText>
						</TouchableOpacity>
					</View>
					<View style={styles.card}>
						<ThemedText type="cardHeader">Lorem, ipsum.</ThemedText>
						<ThemedText type="default">
							Lorem ipsum dolor sit amet consectetur adipisicing
							elit. Perspiciatis, commodi.
						</ThemedText>
						<ThemedText type="date" style={styles.date}>
							01/25/2024
						</ThemedText>
					</View>
				</View>
			</ScrollView>

			{/* Overlay to prevent interaction with outer components */}
			{openBottomSheet && <View style={styles.overlay} />}

			{/* CUSTOM BOTTOM SHEET FOR EVENTS */}
			<CustomBottomSheet
				isOpen={openBottomSheet === "event"}
				onClose={closeBottomSheet}
				title="Events"
			>
				{events.map((event, index) => (
					<View
						key={index}
						style={getViewAllStyle(index, events.length)}
					>
						<ThemedText type="cardHeader">
							{event.header}
						</ThemedText>
						<ThemedText type="default">
							{event.description}
						</ThemedText>
						<ThemedText type="date">{event.date}</ThemedText>
					</View>
				))}
			</CustomBottomSheet>
		</View>
	);
};

export default Home;

const styles = StyleSheet.create({
	imageContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 2,
	},
	image: {
		width: "100%",
		height: 200,
		borderRadius: 10,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	categoryContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
	},
	card: {
		backgroundColor: "white",
		padding: 16,
		borderWidth: 1,
		borderRadius: 10,
		borderColor: "#d6d6d6",
		marginBottom: 8,
	},
	viewAll: {
		backgroundColor: "white",
		padding: 16,
		borderBottomWidth: 1,
		borderColor: "#d6d6d6",
		marginBottom: 8,
	},
	date: {
		color: "#757575",
		fontSize: 12,
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent overlay
	},
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
	},
	modalContainer: {
		width: 300,
		padding: 20,
		backgroundColor: "white",
		borderRadius: 10,
		alignItems: "center",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	modalText: {
		fontSize: 16,
		marginBottom: 20,
	},
	babyButton: {
		backgroundColor: "#456B72",
		padding: 10,
		borderRadius: 5,
		marginVertical: 5,
		width: "100%",
		alignItems: "center",
	},

	modalContent: {
		// alignItems: 'center',
		width: 300,
		padding: 20,
		backgroundColor: "white",
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	modalAlertText: {
		marginBottom: 15,
		textAlign: "center",
		fontSize: 16,
	},
	okButton: {
		backgroundColor: "#456B72",
		padding: 8,
		borderRadius: 5,
		alignItems: "center",
	},
	okButtonText: {
		color: "white",
		fontWeight: "bold",
	},
});
