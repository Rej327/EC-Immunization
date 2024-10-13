import {
	View,
	Text,
	ScrollView,
	RefreshControl,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { ThemedText } from "@/components/ThemedText";
import CustomBottomSheet from "@/components/CustomBottomSheet";
import StyledButton from "../StyledButton";
import { db } from "@/db/firebaseConfig"; // Import Firestore config
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message"; // Ensure you have this installed
import DateTimePicker from "@react-native-community/datetimepicker";
import { events, milestones as miles } from "@/assets/data/data";

// Define interfaces
interface SelectedBaby {
	id: string;
	firstName: string;
	lastName: string;
	birthday: Date;
}

interface VaccineSelection {
	vaccine: string;
	received: boolean;
	expectedDate: string;
}

interface AppointmentData {
	parentId: string;
	babyFirstName: string;
	babyLastName: string;
	vaccine: string;
	scheduleDate: Date;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

const AppointmentSetter = () => {
	const { user } = useUser(); // Get logged-in user from Clerk
	const [refreshing, setRefreshing] = useState(false);
	const [vaccineName, setVaccineName] = useState("");
	const [openBottomSheet, setOpenBottomSheet] = useState<string | null>(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedBaby, setSelectedBaby] = useState<SelectedBaby | null>(null);
	const [babies, setBabies] = useState<SelectedBaby[]>([]);
	const [milestones, setMilestones] = useState<VaccineSelection[]>([]);
	const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(
		undefined
	);
	const [loading, setLoading] = useState(false); // Add loading state
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<
		number | null
	>(null);
	const [appointments, setAppointments] = useState<{
		upcoming: AppointmentData[];
		pending: AppointmentData[];
		history: AppointmentData[];
	}>({
		upcoming: [],
		pending: [],
		history: [],
	});

	const handleDateChange = (event: any, selectedDate?: Date) => {
		const currentDate = selectedDate || appointmentDate;
		setShowDatePicker(false); // Hide date picker after selection
		setAppointmentDate(currentDate); // Set the selected date
	};

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

	// Fetch milestones for selected baby
	const fetchMilestones = useCallback(async (babyId: string) => {
		setLoading(true); // Start loading spinner
		try {
			const milestonesCollection = collection(db, "milestones");
			const q = query(
				milestonesCollection,
				where("babyId", "==", babyId)
			);
			const querySnapshot = await getDocs(q);

			const milestoneList: VaccineSelection[] = [];
			querySnapshot.docs.forEach((doc) => {
				const data = doc.data();
				if (data.milestone && Array.isArray(data.milestone)) {
					data.milestone.forEach((m: any) => {
						milestoneList.push({
							vaccine: m.vaccine,
							received: m.received,
							expectedDate: m.expectedDate
								.toDate()
								.toISOString()
								.split("T")[0], // Format date as YYYY-MM-DD
						});
					});
				}
			});

			// Filter out received vaccines and sort by expectedDate
			const filteredMilestones = milestoneList
				.filter((milestone) => !milestone.received)
				.sort(
					(a, b) =>
						new Date(a.expectedDate).getTime() -
						new Date(b.expectedDate).getTime()
				);

			setMilestones(filteredMilestones);
		} catch (error) {
			console.error("Error fetching milestones:", error);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Failed to fetch milestones.",
				position: "top",
			});
		} finally {
			setLoading(false); // Stop loading spinner
		}
	}, []);

	// Handle baby selection
	const handleSelectBaby = async (baby: SelectedBaby) => {
		setSelectedBaby(baby);
		await fetchMilestones(baby.id); // Fetch milestones for selected baby
		setShowDropdown(false); // Close dropdown after selection
	};

	// Handle setting appointment
	const handleSetAppointment = async () => {
		if (selectedBaby && appointmentDate && vaccineName) {
			const appointmentData: AppointmentData = {
				parentId: user?.id || "",
				babyFirstName: selectedBaby.firstName,
				babyLastName: selectedBaby.lastName,
				vaccine: vaccineName,
				scheduleDate: appointmentDate,
				status: "pending",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			try {
				await addDoc(collection(db, "appointments"), appointmentData);
				Toast.show({
					type: "success",
					text1: "Appointment Set",
					text2: `Vaccine ${vaccineName} scheduled for ${appointmentDate}.`,
					position: "top",
				});

				// Reset form fields
				// setAppointmentDate();
				setVaccineName("");
				// closeBottomSheet();
			} catch (error) {
				console.error("Error setting appointment:", error);
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Failed to set appointment.",
					position: "top",
				});
			}
		} else {
			Toast.show({
				type: "error",
				text1: "Missing Information",
				text2: "Please fill in all fields.",
				position: "top",
			});
			console.warn("Please fill in all fields.");
		}

		setSelectedBaby(null);
		setAppointmentDate(undefined);
		setSelectedMilestoneIndex(null);
	};

	const closeBottomSheetHandler = useCallback(() => {
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

	// Fetch appointments for the logged-in user
	const fetchAppointments = useCallback(async () => {
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
					return {
						parentId: data.parentId,
						babyFirstName: data.babyFirstName,
						babyLastName: data.babyLastName,
						vaccine: data.vaccine,
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
				pending: sortedAppointments.filter(
					(appointment) => appointment.status === "pending"
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
		}
	}, [user?.id]);

	// Handle refresh
	const onRefresh = useCallback(() => {
		setRefreshing(true);
		fetchBabies().then(() => setRefreshing(false));
		fetchAppointments().then(() => setRefreshing(false));
	}, [fetchBabies]);

	useEffect(() => {
		fetchBabies(); // Fetch babies on component mount
		fetchAppointments();
	}, [fetchBabies, fetchAppointments]);

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
				<View style={styles.buttonContainer}>
					<StyledButton
						title="Set Appointment"
						onPress={() => openBottomSheetHandler("setup")}
						borderRadius={12}
						fontSize={14}
					/>
				</View>

				{/* PENDING SECTION */}
				<View>
					<View style={styles.header}>
						<ThemedText type="header">Pending</ThemedText>
						<TouchableOpacity
							onPress={() => openBottomSheetHandler("pending")}
						>
							<ThemedText type="link">View all</ThemedText>
						</TouchableOpacity>
					</View>
					{appointments.pending.length === 0 ? (
						<View style={styles.card}>
							<ThemedText type="default" className="text-center">
								No upcoming schedule
							</ThemedText>
						</View>
					) : (
						appointments.pending
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
									<ThemedText type="date" style={styles.date}>
										When:{" "}
										{appointment.scheduleDate.toLocaleDateString()}{" "}
										{/* Format the date as needed */}
									</ThemedText>
								</View>
							))
					)}
				</View>

				{/* UPCOMING SECTION */}
				<View>
					<View style={styles.header}>
						<ThemedText type="header">Upcoming</ThemedText>
						<TouchableOpacity
							onPress={() => openBottomSheetHandler("upcoming")}
						>
							<ThemedText type="link">View all</ThemedText>
						</TouchableOpacity>
					</View>
					{appointments.upcoming.length === 0 ? (
						<View style={styles.card}>
							<ThemedText type="default" className="text-center">
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
									<ThemedText type="date" style={styles.date}>
										When:{" "}
										{appointment.scheduleDate.toLocaleDateString()}{" "}
										{/* Format the date as needed */}
									</ThemedText>
								</View>
							))
					)}
				</View>

				{/* HISTORY SECTION */}
				<View>
					<View style={styles.header}>
						<ThemedText type="header">History</ThemedText>
						<TouchableOpacity
							onPress={() => openBottomSheetHandler("history")}
						>
							<ThemedText type="link">View all</ThemedText>
						</TouchableOpacity>
					</View>
					{appointments.history.length === 0 ? (
						<View style={styles.card}>
							<ThemedText type="default" className="text-center">
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
									<ThemedText type="date" style={styles.date}>
										Vaccinated on:{" "}
										{appointment.scheduleDate.toLocaleDateString()}{" "}
										{/* Format the date as needed */}
									</ThemedText>
								</View>
							))
					)}
				</View>
			</ScrollView>

			{/* Overlay to prevent interaction with outer components */}
			{openBottomSheet && <View style={styles.overlay} />}

			{/* CUSTOM BOTTOM SHEET FOR PENDING */}
			<CustomBottomSheet
				isOpen={openBottomSheet === "pending"}
				onClose={closeBottomSheetHandler}
				title="Pending Appointments"
			>
				{appointments.pending.length === 0 ? (
					<ThemedText type="default" className="text-center">
						No pending schedule
					</ThemedText>
				) : (
					appointments.pending.map((appointment, index) => (
						<View
							key={index}
							style={getViewAllStyle(
								index,
								appointments.pending.length
							)}
						>
							<ThemedText type="cardHeader">
								{appointment.babyFirstName}{" "}
								{appointment.babyLastName}
							</ThemedText>
							<ThemedText type="default">
								Vaccine: {appointment.vaccine}
							</ThemedText>
							<ThemedText type="date">
								When:{" "}
								{appointment.scheduleDate.toLocaleDateString()}{" "}
								{/* Format the date as needed */}
							</ThemedText>
						</View>
					))
				)}
			</CustomBottomSheet>

			{/* CUSTOM BOTTOM SHEET FOR UPCOMING */}
			<CustomBottomSheet
				isOpen={openBottomSheet === "upcoming"}
				onClose={closeBottomSheetHandler}
				title="Upcoming Appointments"
			>
				{appointments.upcoming.length === 0 ? (
					<ThemedText type="default" className="text-center">
						No upcoming schedule
					</ThemedText>
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
							<ThemedText type="date">
								When:{" "}
								{appointment.scheduleDate.toLocaleDateString()}{" "}
								{/* Format the date as needed */}
							</ThemedText>
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
					<ThemedText type="default" className="text-center">
						No history
					</ThemedText>
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
							<ThemedText type="date">
								Vaccinated on:{" "}
								{appointment.scheduleDate.toLocaleDateString()}{" "}
								{/* Format the date as needed */}
							</ThemedText>
						</View>
					))
				)}
			</CustomBottomSheet>

			{/* Custom Bottom Sheet for setting appointment */}
			<CustomBottomSheet
				isOpen={openBottomSheet === "setup"}
				onClose={closeBottomSheetHandler}
				title="Set Vaccine Appointment"
			>
				{/* Select Baby Dropdown */}
				<ThemedText type="default" className="font-bold">
					Your Baby
				</ThemedText>
				<TouchableOpacity
					onPress={() => setShowDropdown(!showDropdown)}
					style={styles.input}
				>
					<View style={styles.dropdownHeader}>
						<ThemedText type="default" style={styles.dropdownText}>
							{selectedBaby
								? `${selectedBaby.firstName} ${selectedBaby.lastName}`
								: "None"}
						</ThemedText>
						<Ionicons
							name={showDropdown ? "chevron-up" : "chevron-down"}
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
									onPress={() => handleSelectBaby(baby)}
									style={[
										styles.dropdownItem,
										index === babies.length - 1 &&
											styles.dropdownLastItem, // Correct condition for last item
									]}
								>
									<ThemedText type="default">
										{baby.firstName} {baby.lastName}
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
								No babies found. Please add a baby first.
							</ThemedText>
						)}
					</View>
				)}

				{/* Appointment Date Input */}
				{/* Update the TouchableOpacity for appointment date selection */}
				<ThemedText type="default" className="font-bold mt-2">
					Select Date
				</ThemedText>
				<TouchableOpacity
					onPress={() => setShowDatePicker(true)} // Show date picker on press
					style={styles.input}
				>
					<ThemedText type="default">
						{appointmentDate
							? appointmentDate.toLocaleDateString("en-US") // Format the date to a readable string
							: "Pick Date"}
						{/* Placeholder text when no date is selected */}
					</ThemedText>
				</TouchableOpacity>
				{/* Use the DateTimePicker component */}
				{showDatePicker && (
					<DateTimePicker
						value={appointmentDate ? appointmentDate : new Date()} // Set the default date to the current date if no date is selected
						mode="date"
						display="default"
						onChange={handleDateChange} // Update the state with the selected date
					/>
				)}
				{/* Vaccine Selection */}
				<ThemedText type="default" style={styles.sectionHeader}>
					Select Vaccine
				</ThemedText>
				{milestones.length > 0 ? (
					milestones.map((milestone, index) => (
						<TouchableOpacity
							key={index}
							style={[
								styles.milestoneItem,
								milestone.received && styles.disabledMilestone,
								selectedMilestoneIndex === index &&
									styles.selectedMilestone, // Apply selected style
							]}
							disabled={milestone.received}
							onPress={() => {
								setVaccineName(milestone.vaccine);
								setSelectedMilestoneIndex(index); // Set the selected milestone index
							}}
						>
							<View style={styles.milestoneInfo}>
								<ThemedText type="default">
									{milestone.vaccine}
								</ThemedText>
								<ThemedText
									type="default"
									style={styles.expectedDate}
								>
									Expected: {milestone.expectedDate}
								</ThemedText>
							</View>
							{selectedMilestoneIndex === index ? ( // Check if this milestone is selected
								<Ionicons
									name="checkmark-circle"
									size={20}
									color="#456B72"
								/>
							) : (
								<Ionicons
									name="ellipse-outline"
									size={20}
									color="#aaaaaa"
								/>
							)}
						</TouchableOpacity>
					))
				) : (
					<ThemedText type="default" style={styles.noMilestonesText}>
						No available vaccines. Select your baby first
					</ThemedText>
				)}

				{/* Set Appointment Button */}
				<TouchableOpacity
					style={styles.button}
					onPress={handleSetAppointment}
				>
					<Text style={styles.buttonText}>Set Appointment</Text>
				</TouchableOpacity>
			</CustomBottomSheet>

			{/* Loading Indicator */}
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#456B72" />
				</View>
			)}
		</View>
	);
};

export default AppointmentSetter;

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
	input: {
		borderColor: "#d6d6d6",
		borderWidth: 1,
		// marginBottom: 10,
		padding: 10,
		borderRadius: 5,
		backgroundColor: "#ebebeb",
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
	sectionHeader: {
		marginVertical: 10,
		fontWeight: "bold",
	},
	milestoneItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 10,
		borderColor: "#d6d6d6",
		borderWidth: 1,
		borderRadius: 5,
		marginBottom: 8,
		backgroundColor: "#fff",
	},
	selectedMilestone: {
		backgroundColor: "#86b3bc5e",
		borderColor: "#456B72",
	},
	disabledMilestone: {
		backgroundColor: "#f0f0f0",
	},
	milestoneInfo: {
		flexDirection: "column",
	},
	expectedDate: {
		fontSize: 12,
		color: "#757575",
	},
	noMilestonesText: {
		textAlign: "center",
		color: "#757575",
		marginBottom: 10,
	},
	button: {
		backgroundColor: "#456B72",
		padding: 12,
		borderRadius: 5,
		alignItems: "center",
		marginBottom: 10,
		marginTop: 5,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	loadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.8)",
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
});
