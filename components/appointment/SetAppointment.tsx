import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	TouchableOpacity,
	StyleSheet,
	Modal,
	Button,
	Pressable,
	ActivityIndicator,
	Image,
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
	doc,
	updateDoc,
} from "firebase/firestore";
import { db } from "@/db/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";
import { noData } from "@/assets";

interface SetAppointmentProps {
	refresh: () => void;
}

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
	address: string;
}

interface AppointmentData {
	id?: string;
	scheduleId: string;
	babyId: string;
	vaccineId: string;
	parentId: string;
	parentName: string;
	babyFirstName: string;
	cardId: string;
	address: string;
	babyLastName: string;
	vaccine: string;
	scheduleDate: Date | null;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}
export const SetAppointment: React.FC<SetAppointmentProps> = ({ refresh }) => {
	const [address, setAddress] = useState("");
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [loading, setLoading] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedVaccine, setSelectedVaccine] = useState<any>(null); // Holds the selected vaccine data
	const [isModalVisible, setModalVisible] = useState(false);
	const [babies, setBabies] = useState<SelectedBaby[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedBaby, setSelectedBaby] = useState<SelectedBaby | null>(null);
	const [isDisabled, setIsDisabled] = useState<boolean>(false);
	const [buttonLabel, setSetButtonLabel] = useState<string>("");

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
					address: data.address,
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

	const handleSubmit = async () => {
		try {
			// Find the selected schedule, ensure it's not undefined
			const selectedSchedule = schedules.find(
				(schedule) => schedule.when
			);

			// If no selected schedule is found, show an error and return
			if (!selectedSchedule) {
				console.error("No schedule selected.");
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "No schedule selected.",
				});
				return;
			}

			// Validate: Ensure the selected vaccine is available in the selected schedule
			const selectedVaccineDetails = selectedSchedule.vaccines.find(
				(vaccine) => vaccine.id === selectedVaccine.id
			);

			if (!selectedVaccineDetails) {
				console.error("Vaccine not found in the selected schedule.");
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Vaccine not found in the selected schedule.",
				});
				return;
			}

			// Prepare the appointment data
			const appointmentData: AppointmentData = {
				scheduleId: selectedSchedule?.id || "",
				parentId: user?.id || "",
				parentName: `${user?.firstName} ${user?.lastName}`.trim(),
				babyFirstName: selectedBaby?.firstName || "",
				babyLastName: selectedBaby?.lastName || "",
				babyId: selectedBaby?.id || "",
				vaccine: selectedVaccine.name,
				vaccineId: selectedVaccine.id,
				cardId: selectedVaccine.cardId,
				address: address,
				scheduleDate: selectedSchedule?.when || null,
				status: "upcoming",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Save the appointment to Firestore
			await addDoc(collection(db, "appointments"), appointmentData);

			// Update the taken count for the selected vaccine
			const scheduleDocRef = doc(db, "schedules", selectedSchedule.id);
			await updateDoc(scheduleDocRef, {
				vaccines: selectedSchedule.vaccines.map((vaccine) => {
					if (vaccine.id === selectedVaccine.id) {
						vaccine.taken += 1; // Increment taken count by 1
					}
					return vaccine;
				}),
			});

			// Show success toast
			Toast.show({
				type: "success",
				text1: "Appointment Submitted",
				text2: "The appointment has been successfully scheduled.",
			});

			console.log("Appointment submitted:", appointmentData);
		} catch (error) {
			console.error("Error submitting appointment:", error);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "An error occurred while submitting the appointment.",
			});
		} finally {
			// await fetchSchedules(address);
			refresh();
			setModalVisible(false);
		}
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
						{displayedColumn2.map((vaccine: any, i) => (
							<TouchableOpacity
								key={i}
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
								{/* Custom Button with Pressable */}
								<TouchableOpacity
									onPress={handleSubmit}
									disabled={isDisabled}
									style={[
										styles.button,
										isDisabled
											? styles.disabledButton
											: styles.enabledButton,
									]}
								>
									<ThemedText style={styles.buttonText}>
										{buttonLabel}
									</ThemedText>
								</TouchableOpacity>

								{/* Default Button for "Close" */}
								<TouchableOpacity
									onPress={() => setModalVisible(false)}
									style={[styles.button, styles.closeButton]}
								>
									<ThemedText style={styles.closeButtonText}>
										Close
									</ThemedText>
								</TouchableOpacity>
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

	const buttonDisable = async (id: string): Promise<boolean> => {
		try {
			const milestonesRef = collection(db, "milestones");
			const q = query(
				milestonesRef,
				where("parentId", "==", user?.id),
				where("babyId", "==", selectedBaby?.id)
			); // Match by user ID
			const querySnapshot = await getDocs(q);

			for (const doc of querySnapshot.docs) {
				const data = doc.data();
				// Check if milestone array contains the provided id
				const milestone = data.milestone.find(
					(m: { targetId: string; received: boolean }) =>
						m.targetId === id
				);

				if (milestone) {
					return milestone.received; // Return 'received' status if found
				}
			}

			return false; // Default to false if no match is found
		} catch (error) {
			console.error("Error fetching milestone:", error);
			return false; // Default to false in case of an error
		}
	};

	useEffect(() => {
		fetchBabies();
		console.log("Trigger fetch babies");
		console.log("Selected Baby Address", selectedBaby?.address);
	}, []);

	useEffect(() => {
		if (babies.length === 1) {
			setSelectedBaby(babies[0]);
			console.log("Automatically selected baby:", babies[0]);
		}
	}, [babies]);

	useEffect(() => {
		const updateButtonState = async () => {
			if (!selectedVaccine || !selectedBaby || !schedules) return;

			const selectedSchedule = schedules.find(
				(schedule) => schedule.when
			);
			if (!selectedSchedule) return;

			try {
				const appointmentsRef = collection(db, "appointments");
				const appointmentQuery = query(
					appointmentsRef,
					where("parentId", "==", user?.id),
					where("babyId", "==", selectedBaby.id),
					where("vaccineId", "==", selectedVaccine.id),
					where("scheduleDate", "==", selectedSchedule.when),
					where("address", "==", address)
				);

				const querySnapshot = await getDocs(appointmentQuery);

				// If an appointment is found, update the button state
				if (!querySnapshot.empty) {
					const appointment = querySnapshot.docs[0].data();

					if (appointment.status === "history") {
						setSetButtonLabel("Vaccinated");
						setIsDisabled(true); // Disable button
					} else {
						setSetButtonLabel("Already Set");
						setIsDisabled(true); // Disable button
					}
					return;
				}

				if (selectedBaby?.address !== address) {
					setSetButtonLabel("Address Mismatch");
					setIsDisabled(true); // Disable button
					return;
				}

				// Additional condition: Check vaccine dose completion
				const selectedVaccineDetails = selectedSchedule.vaccines.find(
					(vaccine) => vaccine.id === selectedVaccine.id
				);

				if (
					selectedVaccineDetails &&
					selectedVaccineDetails.taken >= selectedVaccineDetails.count
				) {
					setSetButtonLabel("Not Available");
					setIsDisabled(true); // Disable button
					return;
				}

				// Check vaccine's received status
				const disabled = await buttonDisable(selectedVaccine.id);

				if (disabled) {
					setSetButtonLabel("Vaccinated");
					setIsDisabled(true); // Disable button
				} else {
					setSetButtonLabel("Set Appointment");
					setIsDisabled(false); // Enable button
				}
			} catch (error) {
				console.error("Error updating button state:", error);
			}
		};

		updateButtonState();
	}, [selectedVaccine, selectedBaby, schedules, user]);

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
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
						marginTop: 10,
					}}
				>
					<ActivityIndicator size="large" color="#456B72" />
				</View>
			) : schedules.length > 0 ? (
				renderMasonryCards(
					schedules.flatMap((schedule) => schedule.vaccines)
				)
			) : (
				<View style={styles.card}>
					<Image
						source={noData}
						className="w-12 mx-auto h-16 mb-2 opacity-40"
					/>
					<ThemedText type="default" style={styles.emptyText}>
						No vaccination schedule found
					</ThemedText>
				</View>
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
		fontSize: 13,
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

	buttonContainer: {
		justifyContent: "space-between",
	},
	button: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
		marginVertical: 5,
		alignItems: "center",
		justifyContent: "center",
	},
	enabledButton: {
		backgroundColor: "#456B72",
	},
	disabledButton: {
		backgroundColor: "#A9A9A9", // Gray for disabled state
	},
	closeButton: {
		backgroundColor: "#86b3bc",
	},
	buttonText: {
		fontSize: 16,
		color: "#FFFFFF",
		fontWeight: "bold",
	},
	closeButtonText: {
		fontSize: 16,
		color: "#FFFFFF",
		fontWeight: "bold",
	},
});
