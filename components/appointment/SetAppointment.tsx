import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	TouchableOpacity,
	StyleSheet,
	Modal,
	Button,
} from "react-native";
import { ThemedText } from "../ThemedText";
import { barangays } from "@/assets/data/data";
import {
	collection,
	query,
	where,
	getDocs,
	Timestamp,
	addDoc,
} from "firebase/firestore";
import { db } from "@/db/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";

interface Vaccine {
	id: string;
	name: string;
	count: number;
	taken: number;
}

interface Schedule {
	id: string;
	address: string;
	when: Date | null;
	completed: boolean;
	createdAt: string;
	updatedAt: string;
	vaccines: Vaccine[];
}

interface SelectedBaby {
	id: string;
	firstName: string;
	lastName: string;
	birthday: Date;
}

export const SetAppointment = () => {
	const [address, setAddress] = useState("");
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [loading, setLoading] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedVaccine, setSelectedVaccine] = useState<any>(null); // Holds the selected vaccine data
	const [isModalVisible, setModalVisible] = useState(false);
	const [babies, setBabies] = useState<SelectedBaby[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedBaby, setSelectedBaby] = useState<SelectedBaby | null>(null);

	const { user } = useUser();
	// Fetch babies for the logged-in user
	const fetchBabies = useCallback(async () => {
		if (!user?.id) {
			console.log("User ID is not available.");
			return; // Early return if user ID is not present
		}

		try {
			const babiesCollection = collection(db, "babies");
			const q = query(babiesCollection, where("parentId", "==", user.id));
			const querySnapshot = await getDocs(q);

			const babyList: SelectedBaby[] = querySnapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					firstName: data.firstName,
					lastName: data.lastName,
					birthday:
						data.birthday instanceof Date
							? data.birthday
							: data.birthday.toDate(), // Assuming birthday is stored as a Firestore Timestamp
				} as SelectedBaby;
			});

			setBabies(babyList);
		} catch (error) {
			console.error("Error fetching babies:", error);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Failed to fetch babies.",
				position: "top",
			});
		}
	}, [user?.id]);

	useEffect(() => {
		fetchBabies();
		console.log("Trigger fetch babies");
	}, []);

	useEffect(() => {
		if (babies.length === 1) {
			setSelectedBaby(babies[0]);
			console.log("Automatically selected baby:", babies[0]);
		}
	}, [babies]);

	const fetchSchedules = async (selectedAddress: string) => {
		setLoading(true);
		try {
			const scheduleCollection = collection(db, "schedules");
			const scheduleQuery = query(
				scheduleCollection,
				where("address", "==", selectedAddress),
				where("completed", "==", false)
			);
			const scheduleSnapshot = await getDocs(scheduleQuery);

			const fetchedSchedules: Schedule[] = scheduleSnapshot.docs.map(
				(doc) => ({
					...(doc.data() as Omit<Schedule, "id">), // Spread without `id`
					id: doc.id, // Add id explicitly
				})
			);

			setSchedules(fetchedSchedules);
		} catch (error) {
			console.error("Error fetching schedules:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectBaby = async (baby: SelectedBaby) => {
		setSelectedBaby(baby);
		setShowDropdown(false); // Close dropdown after selection
	};

	const renderMasonryCards = (vaccines: Vaccine[]) => {
		const column1: Vaccine[] = [];
		const column2: Vaccine[] = [];

		vaccines.forEach((vaccine, index) => {
			if (index % 2 === 0) {
				column1.push(vaccine);
			} else {
				column2.push(vaccine);
			}
		});

		const displayedColumn1 = isExpanded ? column1 : column1.slice(0, 2);
		const displayedColumn2 = isExpanded ? column2 : column2.slice(0, 2);

		return (
			<View>
				<View style={styles.masonryContainer}>
					<View style={styles.column}>
						{displayedColumn1.map((vaccine: any) => (
							<TouchableOpacity
								key={vaccine.id}
								style={styles.card}
								onPress={() => toggleModal(vaccine)}
							>
								<ThemedText
									type="default"
									style={styles.vaccineTitle}
								>
									{vaccine.name}
								</ThemedText>
								<ThemedText
									type="default"
									style={styles.vaccineCount}
								>
									{vaccine.taken}/{vaccine.count}
								</ThemedText>
							</TouchableOpacity>
						))}
					</View>

					<View style={styles.column}>
						{displayedColumn2.map((vaccine: any) => (
							<TouchableOpacity
								key={vaccine.id}
								style={styles.card}
								onPress={() => toggleModal(vaccine)}
							>
								<ThemedText
									type="default"
									style={styles.vaccineTitle}
								>
									{vaccine.name}
								</ThemedText>
								<ThemedText
									type="default"
									style={styles.vaccineCount}
								>
									{vaccine.taken}/{vaccine.count}
								</ThemedText>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* Modal */}
				<Modal
					visible={isModalVisible}
					transparent={true}
					animationType="fade"
					onRequestClose={() => setModalVisible(false)}
				>
					<View style={styles.modalContainer}>
						<View style={styles.modalContent}>
							{/* Children Selection */}
							<View>
								<ThemedText
									type="default"
									className="font-bold"
								>
									Your Children
								</ThemedText>
								<TouchableOpacity
									onPress={() =>
										setShowDropdown(!showDropdown)
									}
									style={styles.input}
								>
									<View style={styles.dropdownHeader}>
										<ThemedText
											type="default"
											style={styles.dropdownText}
										>
											{selectedBaby
												? `${selectedBaby.firstName} ${selectedBaby.lastName}`
												: "None"}
										</ThemedText>
										<Ionicons
											name={
												showDropdown
													? "chevron-up"
													: "chevron-down"
											}
											size={20}
											color="#456B72"
										/>
									</View>
								</TouchableOpacity>
								{/* Dropdown List of Babies */}
								{showDropdown && (
									<View style={styles.dropdown}>
										{babies.length > 0 ? (
											babies.map((baby, index) => (
												<TouchableOpacity
													key={baby.id}
													onPress={() =>
														handleSelectBaby(baby)
													}
													style={[
														styles.dropdownItem,
														index ===
															babies.length - 1 &&
															styles.dropdownLastItem, // Correct condition for last item
													]}
												>
													<ThemedText type="default">
														{baby.firstName}{" "}
														{baby.lastName}
													</ThemedText>
													<ThemedText type="default">
														{baby.birthday.toLocaleDateString(
															"en-US"
														)}
													</ThemedText>
												</TouchableOpacity>
											))
										) : (
											<ThemedText
												type="default"
												style={styles.noBabiesText}
											>
												No babies found. Please register
												your children first.
											</ThemedText>
										)}
									</View>
								)}
							</View>
							<ThemedText type="default">
								Vaccine: {selectedVaccine?.name}
							</ThemedText>

							<ThemedText type="default">
								Description:{" "}
								{selectedVaccine?.description || "N/A"}
							</ThemedText>
							<ThemedText type="default">
								Availability: {selectedVaccine?.taken}/
								{selectedVaccine?.count}
							</ThemedText>
							{/* DATE SECTION */}
							{schedules.length > 0 && (
								<View style={styles.dateContainer}>
									{schedules.map((schedule, i) => {
										return schedule.when ? (
											<View className="flex flex-row justify-between">
												<ThemedText
													type="default"
													key={i}
												>
													Date:{" "}
													{formatDate(schedule.when)}
												</ThemedText>
											</View>
										) : null;
									})}
								</View>
							)}

							<View style={styles.buttonContainer}>
								<Button
									title="Set Appointment"
									// onPress={handleSetAppointment}
									color="#456B72"
								/>
								<Button
									title="Close"
									onPress={() => setModalVisible(false)}
									color="#ccc"
								/>
							</View>
						</View>
					</View>
				</Modal>
			</View>
		);
	};

	const handleSetAddress = async (value: string) => {
		try {
			setAddress(value); // Update the state
			await AsyncStorage.setItem("selectedBrgy", value); // Save to AsyncStorage
		} catch (error) {
			console.error(
				"Error saving selected barangay to local storage:",
				error
			);
		}
	};

	const formatDate = (when: Date | Timestamp) => {
		if (when instanceof Timestamp) {
			return when.toDate().toLocaleDateString("en-US", {
				month: "long",
				day: "2-digit",
				year: "numeric",
			}); // Convert Firestore Timestamp to Date
		} else if (when instanceof Date) {
			return when.toLocaleDateString(); // If it's already a Date object, format it
		} else {
			return "Invalid date"; // If it's neither a Date nor Timestamp, return a default message
		}
	};

	const toggleModal = (vaccine: any) => {
		setSelectedVaccine(vaccine);
		setModalVisible(!isModalVisible);
	};

	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	// const handleSetAppointment = async () => {
	//   if (!selectedVaccine) return;

	//   try {
	//     await addDoc(collection(db, "appointments"), {
	// 			parentId: user?.id || "",
	// 			parentName: user?.firstName + " " + user?.lastName,
	// 			babyFirstName: selectedBaby.firstName,
	// 			babyLastName: selectedBaby.lastName,
	// 			babyId: selectedBaby.id,
	// 			vaccine: vaccineName,
	// 			vaccineId: vaccineId,
	// 			scheduleDate: appointmentDate,
	// 			status: "pending",
	// 			createdAt: new Date(),
	// 			updatedAt: new Date(),
	//     });
	//     console.log("Success", "Appointment successfully set!");
	//     setModalVisible(false);
	//   } catch (error) {
	//     console.error("Error setting appointment:", error);
	//     console.log("Error", "Failed to set appointment.");
	//   }
	// };

	useEffect(() => {
		const loadSelectedBrgy = async () => {
			try {
				const savedBrgy = await AsyncStorage.getItem("selectedBrgy");
				if (savedBrgy) {
					setAddress(savedBrgy);
				}
			} catch (error) {
				console.error(
					"Error loading selected barangay from local storage:",
					error
				);
			}
		};

		loadSelectedBrgy();
	}, []);

	useEffect(() => {
		if (address) {
			fetchSchedules(address);
		}
	}, [address]);

	return (
		<View>
			<View style={styles.headerContainer}>
				<View style={styles.headerLine} />
				<ThemedText type="cardHeader">Upcoming Schedule</ThemedText>
				<View style={styles.headerLine} />
			</View>

			<Picker
				selectedValue={address}
				style={styles.input}
				onValueChange={(value) => handleSetAddress(value)}
			>
				<Picker.Item
					style={styles.input}
					label="Select Barangay"
					value=""
				/>
				{barangays.map((barangay) => (
					<Picker.Item
						key={barangay}
						label={`📍 ${barangay}`}
						value={barangay}
					/>
				))}
			</Picker>

			{/* SHOW DATE */}
			{schedules.length > 0 && (
				<View style={styles.dateContainer}>
					{schedules.map((schedule) => {
						return schedule.when ? (
							<View className="flex flex-row justify-between">
								<ThemedText
									key={schedule.id}
									style={styles.whenText}
								>
									WHEN: {formatDate(schedule.when)}
								</ThemedText>
								<TouchableOpacity
									onPress={toggleExpand}
									style={styles.toggleButton}
								>
									<ThemedText
										type="default"
										style={styles.toggleButtonText}
									>
										{isExpanded ? "Show Less" : "Show More"}{" "}
									</ThemedText>
									<Ionicons
										name={`${
											isExpanded
												? "chevron-up-outline"
												: "chevron-down-outline"
										}`}
										size={20}
										color={"#456B72"}
									/>
								</TouchableOpacity>
							</View>
						) : null;
					})}
				</View>
			)}

			{loading ? (
				<ThemedText type="default" style={styles.loadingText}>
					Loading schedules...
				</ThemedText>
			) : schedules.length > 0 ? (
				renderMasonryCards(
					schedules.flatMap((schedule) => schedule.vaccines)
				)
			) : (
				<ThemedText type="default" style={styles.emptyText}>
					No vaccine schedules found.
				</ThemedText>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	input: {
		borderColor: "#d6d6d6",
		marginBottom: 10,
		padding: 12,
		fontSize: 16,
		backgroundColor: "#ebebeb",
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginVertical: 16,
	},
	headerLine: {
		flex: 1,
		height: 1,
		backgroundColor: "#d6d6d6",
	},
	loadingText: {
		textAlign: "center",
		marginTop: 20,
		fontSize: 16,
	},
	masonryContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	column: {
		flex: 1,
		marginHorizontal: 4,
	},
	card: {
		backgroundColor: "white",
		padding: 16,
		borderWidth: 1,
		borderRadius: 10,
		borderColor: "#d6d6d6",
		marginBottom: 10,
	},
	vaccineTitle: {
		textAlign: "center",
		fontWeight: "bold",
	},
	vaccineCount: {
		textAlign: "center",
	},
	emptyText: {
		textAlign: "center",
		marginTop: 20,
		fontSize: 16,
		color: "#999",
	},
	dateContainer: {
		marginBottom: 5,
	},
	whenText: {
		fontSize: 16,
		marginVertical: 5,
		fontWeight: "bold",
	},
	toggleButton: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
	},
	toggleButtonText: {
		color: "#456B72",
		fontSize: 14,
		fontStyle: "italic",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		width: "80%",
		backgroundColor: "#fff",
		padding: 20,
		borderRadius: 8,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
	buttonContainer: {
		marginTop: 16,
	},
	dropdownHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	dropdownText: {
		flex: 1,
	},
	dropdown: {
		borderWidth: 1,
		borderColor: "#d6d6d6",
		backgroundColor: "#fff",
		borderRadius: 5,
		marginBottom: 10,
		marginTop: 5,
		// maxHeight: 150,
	},
	dropdownItem: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#d6d6d6",
	},
	dropdownLastItem: {
		borderBottomWidth: 0, // Remove bottom border for last item
	},
	noBabiesText: {
		padding: 10,
		textAlign: "center",
		color: "#757575",
	},
});
