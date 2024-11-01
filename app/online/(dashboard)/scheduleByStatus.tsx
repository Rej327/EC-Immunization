import React, { useEffect, useState } from "react";
import {
	View,
	FlatList,
	TouchableOpacity,
	Modal,
	Button,
	StyleSheet,
	TextInput,
	ScrollView,
	ActivityIndicator,
	Image,
	RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	collection,
	query,
	where,
	getDocs,
	updateDoc,
	doc,
	addDoc,
	getDoc,
} from "firebase/firestore";
import { db } from "@/db/firebaseConfig"; // Firestore instance
import { Timestamp } from "firebase/firestore";
import { ThemedText } from "@/components/ThemedText"; // ThemedText component import
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { noData } from "@/assets";
import StyledButton from "@/components/StyledButton";
import { useUser } from "@clerk/clerk-expo";
import { formatDate, useDebounce } from "@/helper/helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";

interface AppointmentData {
	id: string;
	vaccineId: string;
	babyId: string;
	parentId: string;
	babyFirstName: string;
	babyLastName: string;
	parentName: string;
	scheduleDate: any; // Firestore timestamp
	vaccine: string;
	status: string;
	updatedAt: Date; // Include updatedAt in the interface
}

export default function ScheduleByStatus() {
	const [appointments, setAppointments] = useState<AppointmentData[]>([]);
	const [filteredAppointments, setFilteredAppointments] = useState<
		AppointmentData[]
	>([]); // For filtering
	const [searchQuery, setSearchQuery] = useState<string>(""); // For search input
	const [selectedAppointment, setSelectedAppointment] =
		useState<AppointmentData | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [loading, setLoading] = useState(true);
	const [selectedStatus, setSelectedStatus] = useState<string>("");
	const [refreshing, setRefreshing] = useState(false);
	const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
	const [showInput, setShowInput] = useState(false);
	const [remarksData, setRemarksData] = useState("");
	const debouncedSearchQuery = useDebounce(searchQuery, 500);

	const { scheduleByStats } = useLocalSearchParams() as {
		scheduleByStats: string;
	};

	const route = useRouter();
	const { isLoaded, user } = useUser();

	const toggleInput = () => {
		setShowInput(!showInput);
	};

	// Fetch appointments based on status
	const fetchAppointments = async () => {
		try {
			const appointmentsQuery = query(
				collection(db, "appointments"),
				where("status", "==", scheduleByStats) // Query based on the status
			);

			const querySnapshot = await getDocs(appointmentsQuery);
			const fetchedAppointments: AppointmentData[] =
				querySnapshot.docs.map((doc) => ({
					id: doc.id, // Store the document ID for updating
					...doc.data(),
					scheduleDate: doc.data().scheduleDate.toDate(), // Convert Firestore timestamp to JS Date
					updatedAt: doc.data().updatedAt.toDate(), // Convert updatedAt to JS Date
				})) as AppointmentData[];

			setAppointments(fetchedAppointments);
			setFilteredAppointments(fetchedAppointments); // Set filteredAppointments initially
		} catch (error) {
			console.error("Error fetching appointments:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAppointments();
	}, [scheduleByStats]);

	// Filter appointments based on the search query
	useEffect(() => {
		if (debouncedSearchQuery.trim() === "") {
			setFilteredAppointments(appointments); // Show all if search query is empty
		} else {
			const filtered = appointments.filter(
				(appointment) =>
					`${appointment.babyFirstName} ${appointment.babyLastName}`
						.toLowerCase()
						.includes(debouncedSearchQuery.toLowerCase()) ||
					appointment.vaccine
						.toLowerCase()
						.includes(debouncedSearchQuery.toLowerCase())
			);
			setFilteredAppointments(filtered);
		}
	}, [debouncedSearchQuery, appointments]); // Depend on debouncedSearchQuery and appointments

	// Your input handler for search query
	const handleSearchChange = (text: any) => {
		setSearchQuery(text);
	};

	const handleUpdateStatus = async () => {
		if (!selectedAppointment) return;

		// Ensure that the user data is loaded
		if (!isLoaded || !user) {
			Toast.show({
				type: "error",
				text1: "User data not loaded. Please try again later.",
			});
			return;
		}

		try {
			// Reference to the appointment document in Firestore
			const appointmentDocRef = doc(
				db,
				"appointments",
				selectedAppointment.id
			);

			// Update the appointment status in Firestore
			await updateDoc(appointmentDocRef, {
				status: selectedStatus,
				updatedAt: Timestamp.now(),
			});

			// Check if user data is complete before adding to notifications
			const userId = user.id || "";
			const firstName = user.firstName || "Unknown";
			const lastName = user.lastName || "Unknown";

			// Add a notification entry to Firestore
			await addDoc(collection(db, "notifications"), {
				receiverId: selectedAppointment.parentId,
				firstName: firstName,
				lastName: lastName,
				isRead: false,
				subject: "Appointment Status Update",
				message: `Your appointment for ${
					selectedAppointment.vaccine
				} is now marked as ${
					selectedStatus === "history" ? "vaccinated" : selectedStatus
				}.`,
				createdAt: Timestamp.now(),
			});

			// Update the local state to reflect the appointment status change
			setAppointments((prev) =>
				prev.map((appt) =>
					appt.id === selectedAppointment.id
						? {
								...appt,
								status: selectedStatus,
								updatedAt: new Date(),
						  }
						: appt
				)
			);

			// Step 1: Update the babies collection based on the appointment
			const babyId = selectedAppointment.babyId;
			const babyDocRef = doc(db, "babies", babyId);
			const babyDocSnap = await getDoc(babyDocRef);
			if (babyDocSnap.exists()) {
				const babyData = babyDocSnap.data();

				// Step 2: Find the card with the matching vaccineId
				const vaccineId = selectedAppointment.vaccineId;
				const cardIndex = babyData.card.findIndex(
					(card: any) => card.id === vaccineId
				);

				if (cardIndex !== -1) {
					const updatedCard = { ...babyData.card[cardIndex] };

					// Step 3: Handle remarks addition if status is "history"
					if (selectedStatus === "history" && remarksData.trim()) {
						updatedCard.remarks = [
							...(updatedCard.remarks || []),
							remarksData.trim(), // Add the new remark
						];
					}

					// Step 4: Add formatted date if status is "upcoming"
					if (selectedStatus === "upcoming") {
						const currentDate =
							selectedAppointment.scheduleDate instanceof
							Timestamp
								? selectedAppointment.scheduleDate.toDate()
								: new Date(selectedAppointment.scheduleDate);

						const formattedDate = format(currentDate, "MM-dd-yyyy");

						updatedCard.date = [
							...(updatedCard.date || []),
							formattedDate,
						];
					}

					// Update the baby's document with the modified card array
					const updatedCardArray = [...babyData.card];
					updatedCardArray[cardIndex] = updatedCard;

					await updateDoc(babyDocRef, {
						card: updatedCardArray,
						updatedAt: Timestamp.now(),
					});
				}
			}

			// Show success notification
			Toast.show({
				type: "success",
				text1: "Status updated successfully!",
				text2: `${selectedAppointment.vaccine} status set to ${selectedStatus}`,
			});
		} catch (error) {
			// Log and show error toast
			console.error(
				"Error updating status or sending notification:",
				error
			);
			Toast.show({
				type: "error",
				text1: "Error updating status or sending notification.",
				text2: "Please try again.",
			});
		} finally {
			// Ensure modal is closed and data is refreshed
			handleRefresh();
			pressCancel();
			setSelectedAppointment(null);
			setRemarksData(""); // Clear remarks data
		}
	};

	const pressCancel = () => {
		setModalVisible(false);
		setShowInput(false);
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchAppointments(); // Re-fetch appointments
		setRefreshing(false);
	};

	// Route handler for parentById
	const handleRoute = (id: string) => {
		route.push({
			pathname: "/online/(dashboard)/parentById",
			params: { parentIdFromDashboard: id },
		});
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#456B72" />
			</View>
		);
	}

	const disableAction = () => {
		return selectedStatus === "upcoming" ? true : false;
	};

	// Render each appointment item
	const renderAppointment = ({ item }: { item: AppointmentData }) => (
		<TouchableOpacity
			style={styles.appointmentContainer}
			key={item.id}
			onPress={() => {
				if (scheduleByStats === "history") {
					// If status is 'history', navigate to parentById screen
					handleRoute(item.parentId);
				} else {
					// For other statuses, open the modal
					setSelectedAppointment(item);
					setSelectedStatus(item.status); // Set the current status in the modal
					setModalVisible(true); // Open the modal
				}
			}}
		>
			<ThemedText type="default">
				User Account: {item.parentName}
			</ThemedText>
			<ThemedText type="default">
				Baby: {item.babyFirstName} {item.babyLastName}
			</ThemedText>
			<ThemedText type="default">Vaccine: {item.vaccine}</ThemedText>
			<ThemedText type="default">
				Schedule Date: {formatDate(item.scheduleDate)}
			</ThemedText>
			<ThemedText type="default" className="capitalize">
				Status: {item.status}
			</ThemedText>
			<View>
				<ThemedText className="absolute bottom-1 right-1">
					<Ionicons name="create-outline" size={24} color="#456B72" />
				</ThemedText>
			</View>
		</TouchableOpacity>
	);

	return (
		<ScrollView
			style={styles.mainContainer}
			stickyHeaderIndices={[1]}
			stickyHeaderHiddenOnScroll
			keyboardDismissMode="on-drag"
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={handleRefresh} // Ensure this is your refresh function
					colors={["#456B72"]}
				/>
			}
		>
			<View className="flex flex-row gap-2 justify-between bg-[#f9f9f9] mt-2">
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[20%] mb-2"></View>
				<ThemedText
					type="cardHeader"
					className="first-letter:capitalize"
				>
					{scheduleByStats} Schedules
				</ThemedText>
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[20%] mb-2"></View>
			</View>
			{/* Search Input */}
			<View style={styles.searchInputContainer}>
				{/* Sticky container */}
				<TextInput
					style={styles.searchInput}
					placeholder="🔍 Search by baby name or vaccine"
					value={searchQuery}
					onChangeText={handleSearchChange}
					autoCapitalize="words"
				/>
			</View>
			{filteredAppointments.length > 0 ? (
				<View>
					{/* List for filtered appointments */}
					{filteredAppointments.map((item) =>
						renderAppointment({ item })
					)}
				</View>
			) : (
				<View style={styles.noResultsContainer}>
					<Image
						source={noData}
						className="w-20 mx-auto h-24 opacity-40"
					/>
					<ThemedText style={styles.noResultsText}>
						No {scheduleByStats} appointments found
					</ThemedText>
				</View>
			)}
			{/* Modal for status update */}
			<Modal
				animationType="fade"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => {
					setModalVisible(false);
					setSelectedAppointment(null);
				}}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<ThemedText
							style={{
								fontSize: 16,
								fontWeight: "bold",
								marginBottom: 10,
							}}
						>
							Update Status for{" "}
							{selectedAppointment?.babyFirstName}{" "}
							{selectedAppointment?.babyLastName}
						</ThemedText>

						{/* Status Selection */}
						<TouchableOpacity
							onPress={() => setSelectedStatus("pending")}
							disabled={disableAction()}
						>
							<View
								className="flex flex-row-reverse justify-between"
								style={
									selectedStatus === "pending"
										? styles.selectedOption
										: styles.option
								}
							>
								<Ionicons
									name={
										selectedStatus === "pending"
											? "checkmark-circle"
											: "radio-button-off"
									}
									size={24}
									color={
										selectedStatus === "pending"
											? "#456B72"
											: "#ccc"
									}
								/>
								<ThemedText
									style={
										selectedStatus === "pending"
											? styles.selectedOptionText
											: styles.optionText
									}
								>
									Pending
								</ThemedText>
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setSelectedStatus("upcoming")}
						>
							<View
								className="flex flex-row-reverse justify-between"
								style={
									selectedStatus === "upcoming"
										? styles.selectedOption
										: styles.option
								}
							>
								<Ionicons
									name={
										selectedStatus === "upcoming"
											? "checkmark-circle"
											: "radio-button-off"
									}
									size={24}
									color={
										selectedStatus === "upcoming"
											? "#456B72"
											: "#ccc"
									}
								/>
								<ThemedText
									style={
										selectedStatus === "upcoming"
											? styles.selectedOptionText
											: styles.optionText
									}
								>
									Upcoming
								</ThemedText>
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setSelectedStatus("history")}
						>
							<View
								className="flex flex-row-reverse justify-between"
								style={
									selectedStatus === "history"
										? styles.selectedOption
										: styles.option
								}
							>
								<Ionicons
									name={
										selectedStatus === "history"
											? "checkmark-circle"
											: "radio-button-off"
									}
									size={24}
									color={
										selectedStatus === "history"
											? "#456B72"
											: "#ccc"
									}
								/>
								<ThemedText
									style={
										selectedStatus === "history"
											? styles.selectedOptionText
											: styles.optionText
									}
								>
									Vaccinated
								</ThemedText>
							</View>
						</TouchableOpacity>
						{selectedStatus === "history" && (
							<>
								<TouchableOpacity
									className="flex flex-row gap-1 justify-start items-center my-2"
									onPress={toggleInput}
								>
									<Ionicons
										name={
											!showInput
												? "add-circle-outline"
												: "close-circle-outline"
										}
										size={26}
										color={"#456B72"}
									/>
									<ThemedText type="default">
										{!showInput ? "Add Remarks" : "Cancel"}
									</ThemedText>
								</TouchableOpacity>

								{showInput && (
									<TextInput
										multiline={true}
										numberOfLines={5}
										className="border border-gray-300 rounded px-3 py-2"
										placeholder="Enter your remarks"
										value={remarksData}
										onChangeText={setRemarksData}
										autoCapitalize="sentences"
										autoFocus
									/>
								)}
							</>
						)}

						{/* Update Button */}
						<View className="mt-2">
							<StyledButton
								title="Update Status"
								onPress={handleUpdateStatus}
								paddingVertical={10}
								fontSize={14}
								borderRadius={12}
							/>
							<StyledButton
								title="Cancel"
								onPress={() => pressCancel()}
								paddingVertical={10}
								fontSize={14}
								borderRadius={12}
								bgColor="#DAE9EA" // Fixed duplicate #
								textColor="#456B72"
							/>
						</View>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		paddingHorizontal: 20,
		backgroundColor: "#f9f9f9",
	},
	searchInputContainer: {
		backgroundColor: "#f9f9f9",
		paddingVertical: 10,
	},
	searchInput: {
		height: 46,
		borderColor: "#d6d6d6",
		borderWidth: 1,
		paddingHorizontal: 10,
		paddingVertical: 10,
		borderRadius: 10,
		backgroundColor: "#fff",
	},
	appointmentContainer: {
		backgroundColor: "#fff",
		padding: 16,
		marginBottom: 10,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#d6d6d6",
	},
	option: {
		padding: 10,
		borderBottomColor: "#ccc",
		borderBottomWidth: 1,
	},
	selectedOption: {
		padding: 10,
		borderBottomColor: "#456B72",
		borderBottomWidth: 2,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		width: 300,
		padding: 20,
		backgroundColor: "white",
		borderRadius: 10,
		elevation: 5,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	noResultsContainer: {
		padding: 20,
		alignItems: "center",
	},
	noResultsText: {
		fontSize: 14,
		marginTop: 10,
		color: "#999",
	},
	optionContainer: {
		flexDirection: "row-reverse", // Align items horizontally
		justifyContent: "space-between",
		alignItems: "center", // Center items vertically
		paddingVertical: 10, // Add vertical padding
	},
	selectedOptionText: {
		fontWeight: "bold",
		color: "#456B72",
	},
	optionText: {
		fontWeight: "500",
	},
});
