import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { db } from "@/db/firebaseConfig"; // Your Firestore config
import { collection, getDocs, query, where } from "firebase/firestore";
import { useLocalSearchParams } from "expo-router"; // To get route params
import { Timestamp } from "firebase/firestore"; // Import Timestamp
import { ThemedText } from "@/components/ThemedText";

// Define BabyData and Milestone interfaces
interface BabyData {
	parentId: string;
	id: string;
	firstName: string;
	lastName: string;
	birthday: Timestamp; // Update to Timestamp
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

	// Fetching the parentId from route params
	const { parentIdFromdDashboard } = useLocalSearchParams() as {
		parentIdFromdDashboard: string;
	};

	// Fetch baby data by parentId
	useEffect(() => {
		const fetchBabies = async () => {
			try {
				// Firebase query to get babies by parentId
				const babyQuery = query(
					collection(db, "babies"),
					where("parentId", "==", parentIdFromdDashboard)
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
		if (parentIdFromdDashboard) {
			fetchBabies();
		}
	}, [parentIdFromdDashboard]);

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
			<ThemedText type="header">Parent's Baby Data</ThemedText>
			{babyData.length > 0 ? (
				babyData.map((baby, i) => (
					<TouchableOpacity
						key={i}
						onPress={() => handleSelectBaby(baby)}
						style={styles.babyItem}
					>
						<ThemedText>
							Name: {baby.firstName} {baby.lastName}
						</ThemedText>
						<ThemedText>
							Birthday:{" "}
							{baby.birthday.toDate().toLocaleDateString("en-US")}
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
						Milestones for {selectedBaby.firstName}
					</ThemedText>
					{milestones.map((milestone, index) => (
						<View key={index} style={styles.milestoneItem}>
							<ThemedText>
								Vaccine: {milestone.vaccine}
							</ThemedText>
							<ThemedText>
								Expected Date:{" "}
								{milestone.expectedDate
									.toDate()
									.toLocaleDateString("en-US")}
							</ThemedText>
							<ThemedText>
								Status:{" "}
								{milestone.received
									? "Received"
									: "Not Received"}
							</ThemedText>
						</View>
					))}
				</View>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f9f9f9",
	},

	babyItem: {
		marginVertical: 10,
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
		marginTop: 20,
	},
	milestoneTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 10,
	},
	milestoneItem: {
		marginVertical: 10,
		padding: 10,
		backgroundColor: "#fff",
		borderRadius: 5,
		borderWidth: 1,
		borderColor: "#ccc",
	},
	milestoneText: {
		fontSize: 16,
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
	errorText: {
		fontSize: 18,
		color: "red",
	},
});
