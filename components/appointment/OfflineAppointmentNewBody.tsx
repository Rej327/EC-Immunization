import {
	View,
	Text,
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
import StyledButton from "../StyledButton";
import { db } from "@/db/firebaseConfig"; // Import Firestore config
import {
	collection,
	getDocs,
	query,
	where,
	addDoc,
	deleteDoc,
	doc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message"; // Ensure you have this installed
import DateTimePicker from "@react-native-community/datetimepicker";
import { events, milestones as miles } from "@/assets/data/data";
import { noData, noWifi } from "@/assets";
import { getAppointmentsData } from "@/middleware/GetFromLocalStorage";
import { AppointmentsByStatus } from "@/types/types";
import { OfflineformatExpectedDate } from "@/helper/helper";
import { SetAppointment } from "./SetAppointment";
import { OfflineSetAppointment } from "./OfflineSetAppointment";

const OfflineAppointmentNewBody = () => {
	const [openBottomSheet, setOpenBottomSheet] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [appointments, setAppointments] = useState<AppointmentsByStatus>({
		upcoming: [],
		history: [],
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getAppointmentsData();
				setAppointments(data);
			} catch (error) {
				console.error("Error fetching appointments data: ", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

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
				contentContainerStyle={styles.scrollView}
				scrollEnabled={!openBottomSheet}
			>
				<OfflineSetAppointment />

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
							<Image
								source={noData}
								className="w-12 mx-auto h-16 mb-2 opacity-40"
							/>
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
									<ThemedText type="default">
										Address: {appointment.address}
									</ThemedText>
									<ThemedText type="default">
										When:{" "}
										{OfflineformatExpectedDate(
											appointment.scheduleDate
										)}{" "}
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
							<Image
								source={noData}
								className="w-12 mx-auto h-16 mb-2 opacity-40"
							/>
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
									<ThemedText type="default">
										Address: {appointment.address}
									</ThemedText>
									<ThemedText type="default">
										Vaccinated on:{" "}
										{OfflineformatExpectedDate(
											appointment.scheduleDate
										)}{" "}
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
							<ThemedText type="default">
								Address: {appointment.address}
							</ThemedText>
							<ThemedText type="default">
								When:{" "}
								{OfflineformatExpectedDate(
									appointment.scheduleDate
								)}{" "}
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
							<ThemedText type="default">
								Address: {appointment.address}
							</ThemedText>
							<ThemedText type="date">
								Vaccinated on:{" "}
								{OfflineformatExpectedDate(
									appointment.scheduleDate
								)}{" "}
								{/* Format the date as needed */}
							</ThemedText>
						</View>
					))
				)}
			</CustomBottomSheet>
		</View>
	);
};

export default OfflineAppointmentNewBody;

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
});
