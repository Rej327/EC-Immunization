import {
	View,
	ScrollView,
	RefreshControl,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	Image,
	Modal,
	Pressable,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { ThemedText } from "@/components/ThemedText";
import CustomBottomSheet from "@/components/CustomBottomSheet";
import { db } from "@/db/firebaseConfig"; // Import Firestore config
import {
	collection,
	getDocs,
	query,
	where,
	deleteDoc,
	doc,
	getDoc,
	updateDoc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { noData, vaccine } from "@/assets";
import { formatDate } from "@/helper/helper";
import { SetAppointment } from "./SetAppointment";

// Define interfaces
interface SelectedBaby {
	id: string;
	firstName: string;
	lastName: string;
	birthday: Date;
}

interface VaccineSelection {
	vaccine: string;
	vaccineId: string;
	received: boolean;
	expectedDate: string;
}

interface AppointmentData {
	id?: string;
	scheduleId: string;
	babyId: string;
	vaccineId: string;
	parentId: string;
	parentName: string;
	babyFirstName: string;
	babyLastName: string;
	vaccine: string;
	address: string;
	scheduleDate: Date;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

const AppointmentNewBody = () => {
	const { user } = useUser(); // Get logged-in user from Clerk
	const [refreshing, setRefreshing] = useState(false);
	const [vaccineName, setVaccineName] = useState("");
	const [openBottomSheet, setOpenBottomSheet] = useState<string | null>(null);
	const [selectedBaby, setSelectedBaby] = useState<SelectedBaby | null>(null);
	const [babies, setBabies] = useState<SelectedBaby[]>([]);
	const [milestones, setMilestones] = useState<VaccineSelection[]>([]);
	const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(
		undefined
	);
	const [loading, setLoading] = useState(false); // Add loading state
	const [componentLoad, setComponentLoad] = useState(false); // Add loading state
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [appointmentToDelete, setAppointmentToDelete] = useState(null);

	const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<
		number | null
	>(null);
	const [appointments, setAppointments] = useState<{
		upcoming: AppointmentData[];
		history: AppointmentData[];
	}>({
		upcoming: [],
		history: [],
	});

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

	const closeBottomSheetHandler = useCallback(() => {
		setOpenBottomSheet(null);
		setVaccineName("");
		setSelectedBaby(null);
		setAppointmentDate(undefined);
		setSelectedMilestoneIndex(null);
		setMilestones([]);
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

	// Fetch appointments for the logged-in user
	const fetchAppointments = useCallback(async () => {
		setLoading(true);
		const userId = user?.id; // Ensure user is defined
		if (!userId) {
			console.log("User ID is not available."); // Log if user ID is not available
			return; // Early return if user ID is not present
		}

		try {
			const snapshot = await getDocs(
				query(
					collection(db, "appointments"),
					where("parentId", "==", userId)
				)
			);

			const fetchedAppointments: AppointmentData[] = snapshot.docs.map(
				(doc) => {
					const data = doc.data();
					const dataId = doc.id;
					return {
						id: dataId,
						parentId: data.parentId,
						babyFirstName: data.babyFirstName,
						babyLastName: data.babyLastName,
						vaccine: data.vaccine,
						scheduleId: data.scheduleId,
						address: data.address,
						scheduleDate: data.scheduleDate.toDate(), // Convert Firestore timestamp to JS Date
						status: data.status,
						createdAt: data.createdAt.toDate(), // Convert Firestore timestamp to JS Date
					} as AppointmentData;
				}
			);

			// Sort appointments by createdAt in descending order
			const sortedAppointments = fetchedAppointments.sort(
				(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
			);

			const now = new Date();

			const categorizedAppointments = {
				upcoming: sortedAppointments.filter(
					(appointment) => appointment.status === "upcoming"
				),
				history: sortedAppointments.filter(
					(appointment) => appointment.status === "history"
				),
			};

			// Update state with categorized appointments
			console.log("Fetched Appointments", categorizedAppointments);

			setAppointments(categorizedAppointments);
		} catch (error) {
			console.error("Error fetching appointments:", error);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Failed to fetch appointments.",
				position: "top",
			});
		} finally {
			setLoading(false);
		}
	}, [user?.id]);

	// Handle refresh
	const onRefresh = useCallback(() => {
		setRefreshing(true);
		fetchBabies().then(() => setRefreshing(false));
		fetchAppointments().then(() => setRefreshing(false));
	}, [fetchBabies]);

	const handleDeleteAppointment = async (appointmentId: string) => {
		try {
			// Fetch the appointment details to get scheduleId and vaccineId
			const appointmentDoc = await getDoc(
				doc(db, "appointments", appointmentId)
			);
			if (!appointmentDoc.exists()) {
				throw new Error("Appointment not found.");
			}

			const appointmentData = appointmentDoc.data();
			const { vaccineId, scheduleId } = appointmentData;

			// Delete the appointment
			await deleteDoc(doc(db, "appointments", appointmentId));

			// Fetch the corresponding schedule by scheduleId
			const scheduleDoc = await getDoc(doc(db, "schedules", scheduleId));
			if (!scheduleDoc.exists()) {
				throw new Error("Schedule not found.");
			}

			const scheduleData = scheduleDoc.data();

			// Locate the specific vaccine in the schedule's vaccines array
			const vaccineIndex = scheduleData.vaccines.findIndex(
				(vaccine: { id: string }) => vaccine.id === vaccineId
			);

			if (vaccineIndex !== -1) {
				const updatedVaccines = [...scheduleData.vaccines];
				const currentVaccine = updatedVaccines[vaccineIndex];

				// Decrement the `taken` count if it's greater than 0
				if (currentVaccine.taken > 0) {
					updatedVaccines[vaccineIndex] = {
						...currentVaccine,
						taken: currentVaccine.taken - 1,
					};

					// Update the schedule document with the decremented value
					await updateDoc(doc(db, "schedules", scheduleId), {
						vaccines: updatedVaccines,
						updatedAt: new Date(),
					});
				}
			}

			// Show success toast
			Toast.show({
				type: "success",
				text1: "Appointment Deleted",
				text2: "The appointment and vaccine data have been updated.",
				position: "top",
			});
		} catch (error) {
			console.error("Error deleting appointment:", error);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Failed to delete appointment and update vaccine data.",
				position: "top",
			});
		} finally {
			fetchAppointments(); // Optionally refresh the appointments
		}
	};

	const handleDeletePress = (appointmentId: any) => {
		setAppointmentToDelete(appointmentId); // Store the ID of the appointment to delete
		setIsModalVisible(true); // Show the confirmation modal
	};

	const confirmDeleteAppointment = () => {
		if (appointmentToDelete) {
			handleDeleteAppointment(appointmentToDelete);
		}
		setOpenBottomSheet(null);
		setIsModalVisible(false); // Hide modal after confirmation
	};

	const cancelDeleteAppointment = () => {
		setIsModalVisible(false); // Hide modal if the user cancels
	};

	useEffect(() => {
		fetchBabies(); // Fetch babies on component mount
		fetchAppointments();
	}, [fetchAppointments]);

	if (loading) {
		return (
			<View style={styles.loadingOverlay}>
				<ActivityIndicator size="large" color="#456B72" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={["#456B72"]}
					/>
				}
				contentContainerStyle={styles.scrollView}
				scrollEnabled={!openBottomSheet}
			>
				{/* Button to open bottom sheet */}
				<SetAppointment refresh={onRefresh} />
				{/* STATUS HEADER */}
				<View className="flex flex-row gap-2 justify-between mb-4">
					<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[25%] mb-2"></View>
					<ThemedText type="cardHeader">
						Appointment Status
					</ThemedText>
					<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[25%] mb-2"></View>
				</View>

				{/* UPCOMING SECTION */}
				<View>
					<View style={styles.header}>
						<ThemedText type="cardHeader">Upcoming</ThemedText>
						<TouchableOpacity
							onPress={() => openBottomSheetHandler("upcoming")}
						>
							<ThemedText type="link">View all</ThemedText>
						</TouchableOpacity>
					</View>
					{appointments.upcoming.length === 0 ? (
						<View style={styles.card}>
							<Image
								source={noData}
								className="w-12 mx-auto h-16 mb-2 opacity-40"
							/>
							<ThemedText type="default" style={styles.emptyText}>
								No upcoming schedule
							</ThemedText>
						</View>
					) : (
						appointments.upcoming
							.slice(0, 2)
							.map((appointment, index) => (
								<View key={index} style={styles.card}>
									<ThemedText type="cardHeader">
										{appointment.babyFirstName}{" "}
										{appointment.babyLastName}
									</ThemedText>
									<ThemedText type="default">
										Vaccine: {appointment.vaccine}
									</ThemedText>
									<ThemedText type="default">
										Address: {appointment.address}
									</ThemedText>
									<ThemedText type="default">
										When:{" "}
										{formatDate(appointment.scheduleDate)}
										{/* Format the date as needed */}
									</ThemedText>
								</View>
							))
					)}
				</View>

				{/* HISTORY SECTION */}
				<View>
					<View style={styles.header}>
						<ThemedText type="cardHeader">History</ThemedText>
						<TouchableOpacity
							onPress={() => openBottomSheetHandler("history")}
						>
							<ThemedText type="link">View all</ThemedText>
						</TouchableOpacity>
					</View>
					{appointments.history.length === 0 ? (
						<View style={styles.card}>
							<Image
								source={noData}
								className="w-12 mx-auto h-16 mb-2 opacity-40"
							/>
							<ThemedText type="default" style={styles.emptyText}>
								No history
							</ThemedText>
						</View>
					) : (
						appointments.history
							.slice(0, 2)
							.map((appointment, index) => (
								<View key={index} style={styles.card}>
									<ThemedText type="cardHeader">
										{appointment.babyFirstName}{" "}
										{appointment.babyLastName}
									</ThemedText>
									<ThemedText type="default">
										Vaccine: {appointment.vaccine}
									</ThemedText>
									<ThemedText type="default">
										Address: {appointment.address}
									</ThemedText>
									<ThemedText type="default">
										Vaccinated on:{" "}
										{formatDate(appointment.scheduleDate)}
										{/* Format the date as needed */}
									</ThemedText>
								</View>
							))
					)}
				</View>
			</ScrollView>

			{/* Overlay to prevent interaction with outer components */}
			{openBottomSheet && <View style={styles.overlay} />}

			{/* CUSTOM BOTTOM SHEET FOR UPCOMING */}
			<CustomBottomSheet
				isOpen={openBottomSheet === "upcoming"}
				onClose={closeBottomSheetHandler}
				title="Upcoming Appointments"
			>
				{appointments.upcoming.length === 0 ? (
					<View>
						<Image
							source={noData}
							className="w-12 mx-auto mt-2 h-16 mb-2 opacity-40"
						/>
						<ThemedText type="default" style={styles.emptyText}>
							No upcoming schedule
						</ThemedText>
					</View>
				) : (
					appointments.upcoming.map((appointment, index) => (
						<View
							key={index}
							style={getViewAllStyle(
								index,
								appointments.upcoming.length
							)}
						>
							<ThemedText type="cardHeader">
								{appointment.babyFirstName}{" "}
								{appointment.babyLastName}
							</ThemedText>
							<ThemedText type="default">
								Vaccine: {appointment.vaccine}
							</ThemedText>
							<ThemedText type="default">
								Address: {appointment.address}
							</ThemedText>
							<ThemedText type="default">
								When:{" "}
								{appointment.scheduleDate.toLocaleDateString()}
							</ThemedText>

							{/* Add delete button */}
							<TouchableOpacity
								onPress={() =>
									handleDeletePress(appointment.id)
								} // Trigger delete confirmation
								style={styles.deleteButton}
							>
								<Ionicons
									name="trash"
									color={"#fff"}
									size={14}
								/>
							</TouchableOpacity>
						</View>
					))
				)}
			</CustomBottomSheet>

			{/* CUSTOM BOTTOM SHEET FOR HISTORY */}
			<CustomBottomSheet
				isOpen={openBottomSheet === "history"}
				onClose={closeBottomSheetHandler}
				title="History"
			>
				{appointments.history.length === 0 ? (
					<View>
						<Image
							source={noData}
							className="w-12 mx-auto mt-2 h-16 mb-2 opacity-40"
						/>
						<ThemedText type="default" style={styles.emptyText}>
							No history
						</ThemedText>
					</View>
				) : (
					appointments.history.map((appointment, index) => (
						<View
							key={index}
							style={getViewAllStyle(
								index,
								appointments.history.length
							)}
						>
							<ThemedText type="cardHeader">
								{appointment.babyFirstName}{" "}
								{appointment.babyLastName}
							</ThemedText>
							<ThemedText type="default">
								Vaccine: {appointment.vaccine}
							</ThemedText>
							<ThemedText type="default">
								Address: {appointment.address}
							</ThemedText>
							<ThemedText type="date">
								Vaccinated on:{" "}
								{formatDate(appointment.scheduleDate)}
								{/* Format the date as needed */}
							</ThemedText>
						</View>
					))
				)}
			</CustomBottomSheet>

			<Modal
				animationType="fade"
				transparent={true}
				visible={isModalVisible}
				onRequestClose={cancelDeleteAppointment} // Handle back button press
			>
				<View className="flex-1 justify-center items-center bg-black/80">
					<View className="bg-white rounded-lg p-4 w-80">
						<View className="flex items-center justify-center mb-2">
							<Ionicons
								name="alert-circle-outline"
								color={"#aa0202"}
								size={40}
							/>
						</View>
						<ThemedText className="text-xl font-bold mb-2 text-center">
							Confirm delete?
						</ThemedText>
						<ThemedText className="text-gray-700 mb-4 text-center">
							Are you sure you want to delete this appointment?
						</ThemedText>
						<View className="flex-row justify-between">
							<Pressable
								onPress={confirmDeleteAppointment}
								className="bg-[#aa0202] p-2 rounded-lg flex-1 mr-2"
							>
								<ThemedText className="text-white text-center">
									Yes, Delete
								</ThemedText>
							</Pressable>
							<Pressable
								onPress={cancelDeleteAppointment} // Close modal without action
								className="bg-gray-300 p-2 rounded-lg flex-1 ml-2"
							>
								<ThemedText className="text-black text-center">
									Cancel
								</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default AppointmentNewBody;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 30, // Equivalent to mt-12
	},
	scrollView: {
		padding: 16,
	},
	buttonContainer: {
		marginTop: 16,
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.8)",
	},
	sectionHeader: {
		marginVertical: 10,
		fontWeight: "bold",
	},
	expectedDate: {
		fontSize: 12,
		color: "#757575",
	},

	button: {
		backgroundColor: "#456B72",
		padding: 12,
		borderRadius: 5,
		alignItems: "center",
		marginBottom: 10,
		marginTop: 5,
	},
	loadingOverlay: {
		position: "absolute",
		top: 56,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "#f5f4f7",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1000,
	},
	loadingComponentOverlay: {
		position: "absolute",
		top: 56,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "#f5f4f7",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1000,
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
	deleteButton: {
		position: "absolute",
		right: 0,
		bottom: 15,
		backgroundColor: "#c00202", // Red background for delete
		padding: 10,
		borderRadius: 5,
		alignItems: "center",
	},
	emptyText: {
		color: "#888",
		fontSize: 13,
		textAlign: "center",
	},
});
