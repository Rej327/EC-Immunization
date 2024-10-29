import {
	View,
	StyleSheet,
	Modal,
	TouchableOpacity,
	ActivityIndicator,
	ScrollView,
	Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomCard from "../CustomCard";
import { ThemedText } from "../ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { db } from "@/db/firebaseConfig";
import {
	collection,
	query,
	where,
	getDocs,
	Timestamp,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { noData } from "@/assets";
import { formatAge } from "@/helper/helper";
import { Milestone, MilestoneData } from "@/types/types";

export default function Milestones() {
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedMilestoneGroup, setSelectedMilestoneGroup] = useState<MilestoneData[] | null>(null);
	const [milestones, setMilestones] = useState<MilestoneData[]>([]); // Changed to MilestoneData[]
	const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const fetchBabyId = async () => {
		setLoading(true);
		try {
			const babyId = await AsyncStorage.getItem("selectedBabyId");
			if (babyId) {
				setSelectedBabyId(babyId);
				await fetchMilestones(babyId);
			}
		} catch (error) {
			console.error("Error fetching baby ID from storage: ", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBabyId();
	}, []);
	
	const fetchMilestones = async (babyId: string) => {
		if (!babyId) return; // Ensure babyId is provided
		setLoading(true); // Start loading spinner
		try {
			// Try to fetch from AsyncStorage first
			const storedMilestones = await AsyncStorage.getItem(`milestones_${babyId}`);
			if (storedMilestones) {
				const parsedMilestones: MilestoneData[] = JSON.parse(storedMilestones);
				setMilestones(parsedMilestones);
				console.log("Loaded milestones from AsyncStorage:", parsedMilestones);
				return; // Exit if data is found in storage
			}

			// Fetch from Firestore if not found in AsyncStorage
			const milestonesRef = query(
				collection(db, "milestones"),
				where("babyId", "==", babyId)
			);
			const querySnapshot = await getDocs(milestonesRef);
			const fetchedMilestones: MilestoneData[] = [];

			querySnapshot.docs.forEach((doc) => {
				const milestoneData = doc.data();
				if (milestoneData.milestone) {
					fetchedMilestones.push(...milestoneData.milestone);
				}
			});

			// Save fetched milestones to AsyncStorage for offline use
			await AsyncStorage.setItem(`milestones_${babyId}`, JSON.stringify(fetchedMilestones));
			setMilestones(fetchedMilestones);
			console.log("Fetched milestones from Firestore:", fetchedMilestones);
		} catch (error) {
			console.error("Error fetching milestones: ", error);
		} finally {
			setLoading(false); // Stop loading spinner
		}
	};

	const handlePress = (milestoneGroup: MilestoneData[]) => {
		setSelectedMilestoneGroup(milestoneGroup);
		setModalVisible(true);
	};

	const closeModal = () => {
		setModalVisible(false);
		setSelectedMilestoneGroup(null);
	};

	// Group milestones by ageInMonths
	const groupedMilestones = Object.entries(
		milestones.reduce((acc, milestone) => {
			const age = milestone.ageInMonths;
			if (!acc[age]) {
				acc[age] = [];
			}
			acc[age].push(milestone);
			return acc;
		}, {} as Record<number, MilestoneData[]>)
	).sort(([ageA], [ageB]) => Number(ageA) - Number(ageB)); // Sort by ageInMonths

	const handleReload = () => {
		fetchBabyId();
	};

	return (
		<>
			<CustomCard>
				<View className="flex flex-row justify-between items-center">
					<ThemedText type="cardHeader" className="mb-2 font-bold">
						Milestones
					</ThemedText>
					<TouchableOpacity onPress={handleReload}>
						<Ionicons name="reload-circle-sharp" size={24} color="#456B72" />
					</TouchableOpacity>
				</View>
				<View>
					{!loading ? (
						<>
							{selectedBabyId ? (
								groupedMilestones.length > 0 ? (
									groupedMilestones.map(([age, milestoneGroup], index) => (
										<TouchableOpacity
											key={index}
											onPress={() => handlePress(milestoneGroup)}
											className={`flex flex-row justify-between py-4 ${
												index === groupedMilestones.length - 1 ? "" : "border-b-[1px] border-[#d6d6d6]"
											}`}
										>
											<ThemedText type="default" className="font-bold">
												{formatAge(Number(age))}
											</ThemedText>
											<ThemedText>{`${milestoneGroup.filter(m => m.received).length}/${milestoneGroup.length}`}</ThemedText>
										</TouchableOpacity>
									))
								) : (
									<View>
										<Image source={noData} className="mx-auto w-16 h-20 mb-2 opacity-40" />
										<ThemedText type="default" className="text-center">
											No milestones available. Register or select your children.
										</ThemedText>
									</View>
								)
							) : (
								<View>
									<Image source={noData} className="mx-auto w-16 h-20 mb-2 opacity-50" />
									<ThemedText type="default" className="text-center">
										No milestones available. Register or select your children.
									</ThemedText>
								</View>
							)}
						</>
					) : (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color="#456B72" />
						</View>
					)}
				</View>
			</CustomCard>

			{/* Modal for Vaccine Details */}
			<Modal
				animationType="fade"
				transparent={true}
				visible={modalVisible}
				onRequestClose={closeModal}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<ThemedText type="cardHeader" className="font-bold">
							Vaccine Details
						</ThemedText>
						<ScrollView style={styles.vaccineDetails}>
							{selectedMilestoneGroup?.map((milestone, index) => (
								<View style={styles.vaccineItem} key={index}>
									{milestone.received ? (
										<Ionicons name="checkmark-circle" size={20} color="green" />
									) : (
										<Ionicons name="close-circle" size={20} color="red" />
									)}
									<ThemedText style={styles.vaccineText}>
										{milestone.vaccine}
									</ThemedText>
								</View>
							))}
						</ScrollView>
						<TouchableOpacity onPress={closeModal} style={styles.closeButton}>
							<ThemedText style={styles.closeButtonText}>Close</ThemedText>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.8)",
	},
	modalContent: {
		width: "80%",
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 20,
		alignItems: "center",
	},
	vaccineDetails: {
		marginVertical: 10,
		width: "100%",
	},
	vaccineItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 5,
	},
	vaccineText: {
		marginLeft: 10,
	},
	closeButton: {
		marginTop: 20,
		padding: 10,
		backgroundColor: "#456B72",
		borderRadius: 5,
	},
	closeButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
