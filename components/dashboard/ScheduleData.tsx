import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	Modal,
	TextInput,
	TouchableOpacity,
	Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
	collection,
	getDocs,
	updateDoc,
	deleteDoc,
	doc,
	Timestamp,
} from "firebase/firestore";
import { db } from "@/db/firebaseConfig";
import { ThemedText } from "../ThemedText";
import { Picker } from "@react-native-picker/picker";
import { barangays } from "@/assets/data/data";
import { Ionicons } from "@expo/vector-icons";

const ScheduleData = () => {
	const [schedules, setSchedules] = useState<any[]>([]); // Store schedules
	const [loading, setLoading] = useState<boolean>(true);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
	const [address, setAddress] = useState<string>("");
	const [when, setWhen] = useState<Date | null>(null);
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
	const [date, setDate] = useState<Date>(new Date());
	const [completed, setCompleted] = useState<boolean>(false); // false = Upcoming, true = Completed
	const [vaccines, setVaccines] = useState<any[]>([]);

	// Fetch data from Firestore
	const fetchSchedules = async () => {
		setLoading(true);
		try {
			const scheduleCollection = collection(db, "schedules");
			const scheduleSnapshot = await getDocs(scheduleCollection);
			const scheduleList = scheduleSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setSchedules(scheduleList);
		} catch (error) {
			console.error("Error fetching schedules: ", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSchedules();
	}, []);

	const openModal = (schedule: any) => {
		setSelectedSchedule(schedule);
		setAddress(schedule.address);
		setWhen(
			schedule.when instanceof Timestamp ? schedule.when.toDate() : null
		);
		setVaccines(schedule.vaccines);
		setCompleted(schedule.completed);
		setIsModalVisible(true);
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setSelectedSchedule(null);
		setAddress("");
		setWhen(null);
		setVaccines([]);
	};

	const handleDateChange = (event: unknown, selectedDate?: Date) => {
		if (event === undefined) return;
		const currentDate = selectedDate || date;
		setShowDatePicker(Platform.OS === "ios");
		setDate(currentDate);
		setWhen(currentDate);
	};

	const handleUpdate = async () => {
		if (selectedSchedule) {
			try {
				const scheduleRef = doc(db, "schedules", selectedSchedule.id);

				// Convert the when field to Firestore Timestamp if it's a Date object

				// Update the Firestore document
				await updateDoc(scheduleRef, {
					address,
					when: when ? Timestamp.fromDate(new Date(when)) : null,
					completed,
					vaccines,
				});

				// Refresh the schedule list
				setSchedules((prevSchedules) =>
					prevSchedules.map((schedule) =>
						schedule.id === selectedSchedule.id
							? {
									...schedule,
									address,
									when,
									vaccines,
									completed,
							  }
							: schedule
					)
				);

				closeModal();
			} catch (error) {
				console.error("Error updating schedule: ", error);
			} finally {
				fetchSchedules();
			}
		}
	};

	const handleDelete = async () => {
		if (selectedSchedule) {
			try {
				const scheduleRef = doc(db, "schedules", selectedSchedule.id);
				await deleteDoc(scheduleRef);

				// Refresh the schedule list after deletion
				setSchedules((prevSchedules) =>
					prevSchedules.filter(
						(schedule) => schedule.id !== selectedSchedule.id
					)
				);

				closeModal();
			} catch (error) {
				console.error("Error deleting schedule: ", error);
			}
		}
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<Text>Loading...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{schedules.length > 0 ? (
				<FlatList
					data={schedules}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TouchableOpacity onPress={() => openModal(item)}>
							<View style={styles.scheduleItem}>
								<ThemedText type="default">
									Address: {item.address}
								</ThemedText>
								<ThemedText type="default">
									Date:{" "}
									{item.when
										? item.when instanceof Timestamp
											? item.when
													.toDate()
													.toLocaleDateString(
														"en-US",
														{
															year: "numeric",
															month: "long",
															day: "numeric",
														}
													)
											: new Date(
													item.when
											  ).toLocaleDateString("en-US", {
													year: "numeric",
													month: "long",
													day: "numeric",
											  })
										: "Select Date"}
								</ThemedText>
								<ThemedText type="default">
									Status:{" "}
									{item.completed ? "Completed" : "Upcoming"}
								</ThemedText>
							</View>
						</TouchableOpacity>
					)}
				/>
			) : (
				<Text>No schedules available</Text>
			)}

			{/* Modal for viewing and editing schedule */}
			<Modal
				visible={isModalVisible}
				animationType="fade"
				transparent={true}
				onRequestClose={closeModal}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<ThemedText type="cardHeader">Address</ThemedText>
						<Picker
							style={styles.input}
							selectedValue={address}
							onValueChange={(itemValue: any) =>
								setAddress(itemValue)
							}
						>
							<Picker.Item
								style={styles.input}
								label="Select Barangay"
								value=""
							/>
							{barangays.map((barangay) => (
								<Picker.Item
									key={barangay}
									label={barangay}
									value={barangay}
								/>
							))}
						</Picker>

						<ThemedText type="cardHeader">When</ThemedText>
						<View>
							<TouchableOpacity
								onPress={() => setShowDatePicker(true)}
								style={styles.input}
							>
								<ThemedText
									type="default"
									className="my-1 text-[16px] font-semibold"
								>
									{when
										? when.toLocaleDateString("en-US")
										: "Select Date"}
								</ThemedText>
							</TouchableOpacity>
							{showDatePicker && (
								<DateTimePicker
									value={date}
									mode="date"
									display="default"
									onChange={handleDateChange}
								/>
							)}
						</View>

						{/* Status Section */}
						<View style={styles.statusContainer}>
							<TouchableOpacity
								style={styles.radioButton}
								onPress={() => setCompleted(false)}
							>
								<View
									style={[
										styles.radioCircle,
										completed === false &&
											styles.radioCircleSelected,
									]}
								/>
								<ThemedText>Upcoming</ThemedText>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.radioButton}
								onPress={() => setCompleted(true)}
							>
								<View
									style={[
										styles.radioCircle,
										completed === true &&
											styles.radioCircleSelected,
									]}
								/>
								<ThemedText>Completed</ThemedText>
							</TouchableOpacity>
						</View>

						{/* Display vaccines with increment and decrement */}
						{vaccines.map((vaccine, index) => (
							<View key={index} style={styles.vaccineRow}>
								<ThemedText>{vaccine.name}</ThemedText>
								<View className="flex flex-row gap-2 justify-center items-center">
									<TouchableOpacity
										onPress={() => {
											const newVaccines = [...vaccines];
											newVaccines[index].count -= 1;
											setVaccines(newVaccines);
										}}
									>
										<Ionicons
											name="remove-outline"
											size={20}
										/>
									</TouchableOpacity>
									<ThemedText className="text-center text-[16px]">
										{vaccines[index].count}
									</ThemedText>
									<TouchableOpacity
										onPress={() => {
											const newVaccines = [...vaccines];
											newVaccines[index].count += 1;
											setVaccines(newVaccines);
										}}
									>
										<Ionicons
											name="add-outline"
											size={20}
										/>
									</TouchableOpacity>
								</View>
							</View>
						))}

						<View style={styles.modalButtons}>
							<TouchableOpacity
								onPress={handleUpdate}
								style={[styles.button, styles.updateButton]}
							>
								<Text style={styles.buttonText}>Update</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleDelete}
								style={[styles.button, styles.deleteButton]}
							>
								<Text style={styles.buttonText}>Delete</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={closeModal}
								style={styles.button}
							>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scheduleItem: {
		marginBottom: 12,
		padding: 12,
		backgroundColor: "white",
		borderRadius: 8,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 8,
		width: "90%",
	},
	input: {
		borderBlockColor: 'none',
		backgroundColor: "#ebebeb",
		padding: 10,
		marginBottom: 10,
		borderRadius: 4,
	},
	vaccineRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 5,
		borderBottomColor: "#ccc",
		borderBottomWidth: 1,
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	statusContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		marginVertical: 12,
	},
	radioButton: {
		flexDirection: "row",
		alignItems: "center",
	},
	radioCircle: {
		height: 20,
		width: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: "#ccc",
		marginRight: 8,
	},
	radioCircleSelected: {
		borderColor: "#456B72",
		backgroundColor: "#456B72",
	},

	button: {
		backgroundColor: "#456B72",
		padding: 10,
		borderRadius: 4,
		marginTop: 10,
		width: "30%",
	},
	buttonText: {
		color: "white",
		textAlign: "center",
	},
	updateButton: {
		backgroundColor: "#1f9e34",
	},
	deleteButton: {
		backgroundColor: "#b92828",
	},
});

export default ScheduleData;
