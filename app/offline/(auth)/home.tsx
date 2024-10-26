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
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/db/firebaseConfig";
import { Baby, Milestone, MilestoneData } from "@/types/types";
import { useRouter } from "expo-router";
import {
	getBabiesData,
	getMilestonesDAta,
} from "@/middleware/GetFromLocalStorage";
import { formatVaccineList } from "@/helper/helper";
import { Ionicons } from "@expo/vector-icons";

interface UserData {
	id: string;
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	isActive: boolean;
}

const Home = () => {
	const [storedUserData, setStoredUserData] = useState<UserData | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [openBottomSheet, setOpenBottomSheet] = useState<string | null>(null);
	const [babies, setBabies] = useState<Baby[]>([]);
	const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
	const [showBabySelectionModal, setShowBabySelectionModal] = useState(false);
	const [milestones, setMilestones] = useState<MilestoneData[]>([]);
	const [showModal, setShowModal] = useState(false); // Modal visibility state
	const [reminderMessage, setReminderMessage] = useState<string | null>(null); // Store reminder message

	// const onRefresh = async () => {
	// 	setRefreshing(true);

	// 	setRefreshing(false);
	// };

	const route = useRouter();

	const checkOrFetchBabies = async () => {
		await fetchBabies();
		try {
			const storedBabyId = await AsyncStorage.getItem("selectedBabyId");
			console.log("Stored Baby ID:", storedBabyId);

			// Fetch babies data from AsyncStorage
			const babyList = await getBabiesData();

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

	const fetchBabies = async () => {
		try {
			const babiesData = await AsyncStorage.getItem("babies");

			// Parse the stored data, if present
			if (babiesData) {
				const babyList: Baby[] = JSON.parse(babiesData);
				setBabies(babyList);
				return babyList;
			}

			return [];
		} catch (error) {
			console.error("Error fetching babies from AsyncStorage:", error);
			return [];
		}
	};

	const fetchMilestones = async (babyId: any) => {
		if (!babyId) return; // Ensure babyId is provided

		try {
			const fetchedMilestones: Milestone[] = await getMilestonesDAta(
				babyId
			);

			// Map fetched milestones to MilestoneData
			const milestonesData: MilestoneData[] = fetchedMilestones.flatMap(
				(milestone) =>
					milestone.milestoneData.map((mData) => {
						return {
							ageInMonths: mData.ageInMonths,
							vaccine: mData.vaccine,
							expectedDate: mData.expectedDate, // Ensure this is a Date
							received: mData.received,
							description: mData.description || "", // Default if necessary
							updatedAt: mData.updatedAt, // Make sure this is in the correct format
						};
					})
			);

			setMilestones(milestonesData);
			console.log("Alert Triggered");
		} catch (error) {
			console.error("Error fetching milestones: ", error);
		}
	};

	const alertReminder = () => {
		if (milestones.length > 0) {
			const vaccinesDueToday: string[] = [];
			const vaccinesDueTomorrow: string[] = [];
			const vaccinesPastDue: string[] = []; // Array for overdue vaccines

			milestones.forEach((milestone) => {
				// Determine the expectedDate type and parse accordingly
				let expectedDate: Date;

				if (milestone.expectedDate instanceof Timestamp) {
					expectedDate = milestone.expectedDate.toDate(); // Convert Timestamp to Date
				} else if (typeof milestone.expectedDate === "string") {
					expectedDate = new Date(milestone.expectedDate); // Convert ISO string to Date
				} else {
					expectedDate = milestone.expectedDate; // It should already be a Date
				}

				// Check if the expectedDate is valid
				if (!isNaN(expectedDate.getTime()) && !milestone.received) {
					const today = new Date();
					const tomorrow = new Date(today);
					tomorrow.setDate(today.getDate() + 1);

					// Check if expectedDate is today, tomorrow, or overdue
					if (expectedDate.toDateString() === today.toDateString()) {
						vaccinesDueToday.push(milestone.vaccine);
					} else if (
						expectedDate.toDateString() === tomorrow.toDateString()
					) {
						vaccinesDueTomorrow.push(milestone.vaccine);
					} else if (expectedDate < today) {
						// Overdue check
						vaccinesPastDue.push(milestone.vaccine);
					}
				}
			});

			// Build the reminder message
			let message = "";

			// Add overdue vaccines
			if (vaccinesPastDue.length > 0) {
				message +=
					formatVaccineList(vaccinesPastDue, "overdue") + "\n\n";
			}

			// Add today's due vaccines
			if (vaccinesDueToday.length > 0) {
				message +=
					formatVaccineList(vaccinesDueToday, "due today") + "\n\n";
			}

			// Add tomorrow's due vaccines
			if (vaccinesDueTomorrow.length > 0) {
				message +=
					formatVaccineList(vaccinesDueTomorrow, "due tomorrow") +
					"\n\n";
			}

			// Set the reminder message if there's any due
			if (message.trim()) {
				setReminderMessage(message.trim());
				setShowModal(true); // Show the modal
			}
		}
	};

	useEffect(() =>{
		fetchMilestones(selectedBabyId)
	},[selectedBabyId])

	useEffect(() => {
		const fetchDataAndAlert = async () => {
			if (milestones.length > 0) {
				// Wait for some time or any asynchronous operation if necessary
				// await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
				alertReminder();
			}
		};

		fetchDataAndAlert(); // Call the async function

		// Optional: cleanup if needed, or any dependencies you want to track
	}, [milestones]);

	useEffect(() => {
		checkOrFetchBabies();
	}, []);

	const handleBabySelection = async (babyId: string) => {
		setSelectedBabyId(babyId);
		await AsyncStorage.setItem("selectedBabyId", babyId);
		setShowBabySelectionModal(false);
	};

	const handleRouteRegister = () => {
		route.navigate("/offline/(auth)/profile");
		setShowBabySelectionModal(false);
	};

	const closeBottomSheet = useCallback(() => {
		setOpenBottomSheet(null);
	}, []);

	const openBottomSheetHandler = (type: string) => {
		setOpenBottomSheet(type);
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
				// refreshControl={
				// 	<RefreshControl
				// 		refreshing={refreshing}
				// 		onRefresh={onRefresh}
				// 		colors={["#456B72"]}
				// 	/>
				// }
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
							link="/offline/(category)/health"
							icon={healthIcon}
							title="HEALTH TIPS"
							backgroundColor="#5ad5fa66"
							shapeIcon={hearthIcon}
							shapePosition={{ top: 0, left: 0 }}
						/>
						<CategoryCard
							link="/offline/(category)/guide"
							icon={guideIcon}
							title="GUIDE"
							backgroundColor="#5a92fa66"
							shapeIcon={nonagonIcon}
							shapePosition={{ bottom: 0, left: 0 }}
						/>
						<CategoryCard
							link="/offline/(category)/reminder"
							icon={reminderIcon}
							title="REMINDERS"
							backgroundColor="#ecff8253"
							shapeIcon={starIcon}
							shapePosition={{ top: 2, right: 0 }}
						/>
						<CategoryCard
							link="/offline/(category)/appointment"
							icon={appointmentIcon}
							title="APPOINTMENT"
							backgroundColor="#82ffc555"
							shapeIcon={circleIcon}
							shapePosition={{ bottom: 10, right: 10 }}
						/>
					</View>
				</View>

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
								<ThemedText type="cardHeader" className="mb-3">
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
								<ThemedText type="cardHeader" className="mb-3">
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
