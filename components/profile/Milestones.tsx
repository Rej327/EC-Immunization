import {
	View,
	StyleSheet,
	Modal,
	TouchableOpacity,
	ActivityIndicator,
	ScrollView,
	Image, // Add ScrollView for the modal
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomCard from "../CustomCard";
import { ThemedText } from "../ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { db } from "@/db/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { noData } from "@/assets";

type Milestone = {
	ageInMonths: number;
	expectedDate: string;
	received: boolean;
	vaccine: string;
};

type BabyMilestone = {
	babyId: string;
	firstName: string;
	lastName: string;
	milestones: Milestone[];
	parentId: string;
};

export default function Milestones() {
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedMilestoneGroup, setSelectedMilestoneGroup] = useState<
		Milestone[] | null
	>(null); // Update to hold a group of milestones
	const [milestones, setMilestones] = useState<Milestone[]>([]);
	const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const fetchBabyId = async () => {
		setLoading(true);
		try {
			const babyId = await AsyncStorage.getItem("selectedBabyId");
			// console.log("Fetched baby ID: ", babyId);
			if (babyId) {
				setSelectedBabyId(babyId);
				fetchMilestones(babyId);
			}
		} catch (error) {
			console.error("Error fetching baby ID from storage: ", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBabyId();
		// console.log("Fetching milestone", fetchBabyId);
	}, [selectedBabyId]);

	const fetchMilestones = async (babyId: string) => {
		const milestonesRef = query(
			collection(db, "milestones"),
			where("babyId", "==", babyId)
		);

		try {
			const querySnapshot = await getDocs(milestonesRef);
			const fetchedMilestones: Milestone[] = [];

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
		}
	};

	const handlePress = (milestoneGroup: Milestone[]) => {
		setSelectedMilestoneGroup(milestoneGroup); // Pass the whole group
		setModalVisible(true);
	};

	const closeModal = () => {
		setModalVisible(false);
		setSelectedMilestoneGroup(null);
	};

	const aggregateMilestones = (milestones: Milestone[]) => {
		const aggregated: { [key: number]: Milestone[] } = {};

		milestones.forEach((milestone) => {
			if (!aggregated[milestone.ageInMonths]) {
				aggregated[milestone.ageInMonths] = [];
			}
			aggregated[milestone.ageInMonths].push(milestone);
		});

		return Object.entries(aggregated).map(([age, milestones]) => {
			const receivedCount = milestones.filter((m) => m.received).length;
			return {
				age: parseInt(age),
				total: milestones.length,
				receivedCount,
				vaccines: milestones,
			};
		});
	};

	const aggregatedMilestones = aggregateMilestones(milestones);

	const handleReload = () => {
		fetchBabyId();
		console.log("Refetching milestone", fetchBabyId);
	};

	return (
		<>
			<CustomCard>
				<View className="flex flex-row justify-between items-center">
					<ThemedText type="cardHeader" className="mb-2 font-bold">
						Milestones
					</ThemedText>
					<TouchableOpacity onPress={handleReload}>
						<Ionicons
							name="reload-circle-sharp"
							size={24}
							color="#456B72"
						/>
					</TouchableOpacity>
				</View>
				<View>
					{!loading ? (
						<>
							{selectedBabyId ? (
								aggregatedMilestones.length > 0 ? (
									aggregatedMilestones.map(
										(milestoneGroup, index) => (
											<TouchableOpacity
												key={index}
												onPress={() =>
													handlePress(
														milestoneGroup.vaccines
													)
												}
												className={`flex flex-row justify-between py-4 ${
													index ===
													aggregatedMilestones.length -
														1
														? ""
														: "border-b-[1px] border-[#d6d6d6]"
												}`}
											>
												<ThemedText
													type="default"
													className="font-bold"
												>
													{milestoneGroup.age} months
												</ThemedText>
												<ThemedText>{`${milestoneGroup.receivedCount}/${milestoneGroup.total}`}</ThemedText>
											</TouchableOpacity>
										)
									)
								) : (
									<View>
										<Image
											source={noData}
											className="mx-auto w-16 h-20 mb-2 opacity-40"
										/>
										<ThemedText
											type="default"
											className="text-center left-[2%] z-10 absolute top-6"
										>
											No milestones available. Register or
											select first your baby.
										</ThemedText>
									</View>
								)
							) : (
								<View>
									<Image
										source={noData}
										className="mx-auto w-16 h-20 mb-2 opacity-50"
									/>
									<ThemedText
										type="default"
										className="text-center left-[2%] z-10 absolute top-6"
									>
										No milestones available. Register or
										select first your baby.
									</ThemedText>
								</View>
							)}
						</>
					) : (
						<View
							style={{
								flex: 1,
								justifyContent: "center",
								alignItems: "center",
								height: 88
							}}
						>
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
										<Ionicons
											name="checkmark-circle"
											size={20}
											color="green"
										/>
									) : (
										<Ionicons
											name="close-circle"
											size={20}
											color="red"
										/>
									)}
									<ThemedText style={styles.vaccineText}>
										{milestone.vaccine}
									</ThemedText>
								</View>
							))}
						</ScrollView>
						<TouchableOpacity
							onPress={closeModal}
							style={styles.closeButton}
						>
							<ThemedText style={styles.closeButtonText}>
								Close
							</ThemedText>
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
	},
});
