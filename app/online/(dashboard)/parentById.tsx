import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	TouchableOpacity,
	ScrollView,
	Modal, // Import Modal
	Button, // Import Button (optional for closing)
} from "react-native";
import React, { useEffect, useState } from "react";
import { db } from "@/db/firebaseConfig"; // Your Firestore config
import {
	collection,
	getDocs,
	query,
	where,
	updateDoc,
} from "firebase/firestore";
import { useLocalSearchParams } from "expo-router"; // To get route params
import { Timestamp } from "firebase/firestore"; // Import Timestamp
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import StyledButton from "@/components/StyledButton";
import Toast from "react-native-toast-message";
import { formatDate } from "@/helper/helper";

// Define BabyData and Milestone interfaces
interface BabyData {
	parentId: string;
	id: string;
	firstName: string;
	lastName: string;
	gender: string;
	birthday: Timestamp; // Update to Timestamp
	birthPlace: string;
	height: string;
	weight: string;
	motherName: string;
	fatherName: string;
	contact: string;
	address: string;
	addressInfo: string;
}

interface MilestoneData {
	vaccine: string;
	ageInMonths: number;
	description: string;
	expectedDate: Timestamp; // Update to Timestamp
	received: boolean;
	updatedAt: Timestamp; // Update to Timestamp
}

export default function ParentById() {
	const [loading, setLoading] = useState(true); // Loading state
	const [error, setError] = useState<string | null>(null); // Error state
	const [babyData, setBabyData] = useState<BabyData[]>([]); // Baby data state
	const [selectedBaby, setSelectedBaby] = useState<BabyData | null>(null); // State for selected baby
	const [milestones, setMilestones] = useState<MilestoneData[]>([]); // Milestones data state
	const [selectedMilestone, setSelectedMilestone] =
		useState<MilestoneData | null>(null); // State for selected milestone
	const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

	// Fetching the parentId from route params
	const { parentIdFromDashboard } = useLocalSearchParams() as {
		parentIdFromDashboard: string;
	};

	// Fetch baby data by parentId
	useEffect(() => {
		const fetchBabies = async () => {
			try {
				// Firebase query to get babies by parentId
				const babyQuery = query(
					collection(db, "babies"),
					where("parentId", "==", parentIdFromDashboard)
				);

				const querySnapshot = await getDocs(babyQuery);
				const data: BabyData[] = [];

				// Extracting each baby's data
				querySnapshot.forEach((doc) => {
					data.push({
						parentId: doc.id,
						id: doc.id,
						...doc.data(),
					} as BabyData);
				});

				setBabyData(data); // Update state with fetched data
			} catch (err) {
				setError("Failed to fetch baby data. Please try again.");
			} finally {
				setLoading(false); // Ensure loading state is off after data is fetched or error occurs
			}
		};

		// Only fetch if parentId is available
		if (parentIdFromDashboard) {
			fetchBabies();
		}
	}, [parentIdFromDashboard]);

	// Fetch milestones when a baby is selected
	const fetchMilestones = async (babyId: string) => {
		setLoading(true); // Start loading spinner
		const milestonesRef = query(
			collection(db, "milestones"),
			where("babyId", "==", babyId)
		);

		try {
			const querySnapshot = await getDocs(milestonesRef);
			const fetchedMilestones: MilestoneData[] = [];

			querySnapshot.docs.forEach((doc) => {
				const milestoneData = doc.data();
				if (milestoneData.milestone) {
					fetchedMilestones.push(...milestoneData.milestone);
				}
			});

			setMilestones(fetchedMilestones);
			console.log("Fetched Milestones Success ");
		} catch (error) {
			console.error("Error fetching milestones: ", error);
		} finally {
			setLoading(false); // Stop loading spinner after data is fetched
		}
	};

	// Handle selecting a baby
	const handleSelectBaby = (baby: BabyData) => {
		setSelectedBaby(baby);
		fetchMilestones(baby.id);
	};

	// Handle toggling the milestone status
	const handleToggleStatus = async () => {
		if (!selectedMilestone || !selectedBaby) return;

		const updatedMilestone = {
			...selectedMilestone,
			received: !selectedMilestone.received,
			updatedAt: Timestamp.now(),
		};

		const milestonesQuery = query(
			collection(db, "milestones"),
			where("babyId", "==", selectedBaby.id)
		);

		try {
			const querySnapshot = await getDocs(milestonesQuery);
			if (!querySnapshot.empty) {
				const docRef = querySnapshot.docs[0];

				// Log current milestones before updating
				const currentMilestones = docRef.data().milestone;

				// Check if currentMilestones is an array
				if (Array.isArray(currentMilestones)) {
					// Update the specific milestone in the array
					const updatedMilestones = currentMilestones.map(
						(milestone: MilestoneData) =>
							milestone.vaccine === selectedMilestone.vaccine
								? updatedMilestone
								: milestone
					);

					// Update Firestore with the modified milestone array
					await updateDoc(docRef.ref, {
						milestone: updatedMilestones, // Only update the milestone array
					});

					console.log(
						"Milestone updated successfully:",
						updatedMilestone
					);

					// Show toast message on success
					Toast.show({
						text1: "Success",
						text2: `Milestone for ${updatedMilestone.vaccine} has been updated.`,
						type: "success",
						position: "top",
					});

					// Update the local state to reflect the change
					setMilestones((prev) =>
						prev.map((milestone) =>
							milestone.vaccine === selectedMilestone.vaccine
								? updatedMilestone
								: milestone
						)
					);
				} else {
					console.error("Current milestones is not an array.");
				}
			}
		} catch (error) {
			console.error("Error updating milestone status:", error);

			// Show toast message on error
			Toast.show({
				text1: "Error",
				text2: "Failed to update milestone. Please try again.",
				type: "error",
				position: "top",
			});
		} finally {
			handleCloseModal(); // Close modal after update
		}
	};

	// Handle opening modal
	const handleOpenModal = (milestone: MilestoneData) => {
		setSelectedMilestone(milestone);
		setModalVisible(true);
	};

	// Handle closing modal
	const handleCloseModal = () => {
		setModalVisible(false);
		setSelectedMilestone(null); // Reset selected milestone
	};

	// Render loading state
	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#456B72" />
			</View>
		);
	}

	// Render error state
	if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text>{error}</Text>
			</View>
		);
	}

	// Render baby data and milestones
	return (
		<ScrollView style={styles.container}>
			<ThemedText type="header">Parent's Children Data</ThemedText>
			{babyData.length > 0 ? (
				babyData.map((baby, i) => (
					<TouchableOpacity
						key={i}
						onPress={() => handleSelectBaby(baby)}
						style={styles.babyItem}
					>
						<ThemedText type="default">
							Name: {baby.firstName} {baby.lastName}
						</ThemedText>
						<ThemedText type="default">
							Birthday: {formatDate(baby.birthday)}
						</ThemedText>
						<ThemedText type="default">
							Place of Birth: {baby.birthPlace}
						</ThemedText>
						<ThemedText type="default">
							Sex: {baby.gender}
						</ThemedText>
						<ThemedText type="default">
							Heigth: {baby.height}
						</ThemedText>
						<ThemedText type="default">
							Weight: {baby.weight}
						</ThemedText>
						<ThemedText type="default">
							St. or Sitio: {baby.addressInfo}
						</ThemedText>
						<ThemedText type="default">
							Mother's Name: {baby.motherName}
						</ThemedText>
						<ThemedText type="default">
							Father's Name: {baby.fatherName}
						</ThemedText>
						<ThemedText type="default">
							Address: {baby.address}
						</ThemedText>
						<ThemedText type="default">
							Contact No.#: {baby.contact}
						</ThemedText>
					</TouchableOpacity>
				))
			) : (
				<ThemedText>No baby data found for this parent.</ThemedText>
			)}

			{/* Render milestones if a baby is selected */}
			{selectedBaby && milestones.length > 0 && (
				<View style={styles.milestoneContainer}>
					<ThemedText type="header">
						Milestones for {selectedBaby.firstName} {selectedBaby.lastName}
					</ThemedText>
					{milestones.map((milestone, index) => (
						<TouchableOpacity
							key={index}
							style={styles.milestoneItem}
							onPress={() => handleOpenModal(milestone)}
						>
							<ThemedText>
								Vaccine: {milestone.vaccine}
							</ThemedText>
							<ThemedText>
								Expected Date:{" "}
								{formatDate(milestone.expectedDate)}
							</ThemedText>
							<ThemedText>
								Status:{" "}
								{milestone.received
									? "Vaccinated ✅"
									: "Not Vaccinated ❌"}
							</ThemedText>
							<View>
								<ThemedText className="absolute bottom-1 right-1">
									<Ionicons
										name="create-outline"
										size={24}
										color="#456B72"
									/>
								</ThemedText>
							</View>
						</TouchableOpacity>
					))}
				</View>
			)}

			{/* Modal for editing milestone status */}
			<Modal
				transparent={true}
				visible={modalVisible}
				onRequestClose={handleCloseModal}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<ThemedText type="header">
							Update vaccine status
						</ThemedText>
						<ThemedText type="default" className="font-bold">
							Vaccine: {selectedMilestone?.vaccine}
						</ThemedText>
						<ThemedText type="default" className="font-bold">
							Current Status:{" "}
							{selectedMilestone?.received
								? "Received ✅"
								: "Not Received ❌"}
						</ThemedText>
						<View className="flex gap-1 pt-2">
							<StyledButton
								title={
									!selectedMilestone?.received
										? "Mark as received"
										: "Mark as not received"
								}
								paddingVertical={10}
								fontSize={14}
								borderRadius={12}
								onPress={handleToggleStatus} // Toggle status on button press
							/>
							<StyledButton
								title="Cancel"
								paddingVertical={10}
								fontSize={14}
								borderRadius={12}
								bgColor="#d6d6d6"
								textColor="#456B72"
								onPress={handleCloseModal} // Close modal on cancel
							/>
						</View>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 14,
		backgroundColor: "#f9f9f9",
	},

	babyItem: {
		marginVertical: 5,
		padding: 10,
		backgroundColor: "#fff",
		borderRadius: 5,
		borderWidth: 1,
		borderColor: "#ccc",
	},
	detail: {
		fontSize: 18,
		marginVertical: 5,
	},
	milestoneContainer: {
		marginTop: 5,
		marginBottom: 20,
	},
	milestoneItem: {
		marginVertical: 5,
		padding: 10,
		backgroundColor: "#fff",
		borderRadius: 5,
		borderWidth: 1,
		borderColor: "#ccc",
		position: "relative", // Set position relative for absolute positioning
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent background
	},
	modalContent: {
		width: "80%",
		padding: 20,
		backgroundColor: "#fff",
		borderRadius: 10,
		// alignItems: "center",
	},
});
