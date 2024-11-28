import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Platform,
	Button,
	ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import StyledButton from "@/components/StyledButton";
import CustomBottomSheet from "@/components/CustomBottomSheet";
import { barangays, vaccines } from "@/assets/data/data";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { addDoc, collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/db/firebaseConfig";
import ScheduleData from "@/components/dashboard/ScheduleData";

const setSchedule = () => {
	const [openBottomSheet, setOpenBottomSheet] = useState<string | null>(null);
	const [address, setAddress] = useState<string>("");
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
	const [date, setDate] = useState<Date>(new Date());
	const [when, setWhen] = useState<Date | null>(null);
	const [schedules, setSchedules] = useState<any[]>([]); // Store schedules
	const [loading, setLoading] = useState<boolean>(true);
	const [vaccineCounts, setVaccineCounts] = useState<Record<string, number>>(
		{}
	);

	const fetchSchedules = async () => {
		setLoading(true);
		try {
			const scheduleCollection = collection(db, "schedules");
			const scheduleSnapshot = await getDocs(scheduleCollection);

			const scheduleList = scheduleSnapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					...data,
					updatedAt: data.updatedAt.toDate(), // Convert Firestore Timestamp to JavaScript Date
				};
			});
	
			const sortedScheduleList = scheduleList.sort(
				(a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
			);

			setSchedules(sortedScheduleList);

			// Log the fetched data here
		} catch (error) {
			console.error("Error fetching schedules: ", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSchedules();
	}, []);

	const handleDateChange = (event: unknown, selectedDate?: Date) => {
		if (event === undefined) return;
		const currentDate = selectedDate || date;
		setShowDatePicker(Platform.OS === "ios");
		setDate(currentDate);
		setWhen(currentDate);
	};

	const handleIncrement = (id: string) => {
		setVaccineCounts((prev) => ({
			...prev,
			[id]: (prev[id] || 0) + 1,
		}));
	};

	const handleDecrement = (id: string) => {
		setVaccineCounts((prev) => ({
			...prev,
			[id]: Math.max(0, (prev[id] || 0) - 1),
		}));
	};

	const handleSubmit = async () => {
		if (!address || !when) {
			Toast.show({
				type: "error",
				text1: "Missing Information",
				text2: "Please select an address and a date.",
			});
			return;
		}

		try {
			const selectedVaccines = vaccines.map((vaccine) => ({
				id: vaccine.id,
				name: vaccine.name,
				description: vaccine.description,
				count: vaccineCounts[vaccine.id] || 0,
				taken: 0,
			}));

			const formattedWhen = when
				? when.toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
				  })
				: null;

			const formData = {
				address,
				when: when ? Timestamp.fromDate(new Date(when)) : null,
				vaccines: selectedVaccines,
				completed: false,
				createdAt: Timestamp.now(), // Firestore's Timestamp
				updatedAt: Timestamp.now(), // Firestore's Timestamp
			};

			const addInFeeds = {
				subject: "Vaccination Schedule",
				description: `Babies Vaccination in ${address}`,
				type: "announcement",
				date: when ? Timestamp.fromDate(new Date(when)) : null,
				createdAt: Timestamp.now(),
			};

			const addInNotifications = {
				receiverId: "all",
				firstName: "All",
				lastName: "Users",
				isRead: false,
				subject: "Vaccination Schedule",
				message: `Babies' vaccination on ${formattedWhen} at ${address}.`,
				createdAt: Timestamp.now(),
			};

			await addDoc(collection(db, "schedules"), formData);
			await addDoc(collection(db, "feeds"), addInFeeds);
			await addDoc(collection(db, "notifications"), addInNotifications);

			Toast.show({
				type: "success",
				text1: "Success",
				text2: "Vaccine schedule has been set successfully.",
			});

			// Reset form state
			setAddress("");
			setWhen(null);
			setVaccineCounts({});
		} catch (err) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Something went wrong.",
			});
		} finally {
			fetchSchedules()
		}
	};

	const openBottomSheetHandler = (type: string) => {
		setOpenBottomSheet(type);
	};

	const closeBottomSheetHandler = useCallback(() => {
		setOpenBottomSheet(null);
	}, []);

	const VaccineCounter = ({
		vaccineName,
		count,
		onIncrement,
		onDecrement,
	}: {
		vaccineName: string;
		count: number;
		onIncrement: () => void;
		onDecrement: () => void;
	}) => (
		<View style={styles.vaccineList}>
			<ThemedText type="default" style={styles.vaccineTitle}>
				{vaccineName}
			</ThemedText>
			<View style={styles.vaccineCountContainer}>
				<TouchableOpacity onPress={onDecrement}>
					<Ionicons name="remove-outline" size={24} />
				</TouchableOpacity>
				<TextInput
					style={styles.countInput}
					value={count.toString()}
					editable={false}
				/>
				<TouchableOpacity onPress={onIncrement}>
					<Ionicons name="add-outline" size={24} />
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<View style={styles.container}>
			<View className="flex flex-row gap-2 justify-between my-2">
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[25%] mb-2"></View>
				<ThemedText
					type="cardHeader"
					className="first-letter:capitalize"
				>
					Vaccine Schedules
				</ThemedText>
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[25%] mb-2"></View>
			</View>

			<ScheduleData
				scheduleItems={schedules}
				setScheduleItems={setSchedules}
				reFetch= {fetchSchedules}
				loading={loading}
			/>

			<TouchableOpacity
				onPress={() => openBottomSheetHandler("setup")}
				style={styles.floatingButton}
			>
				<Ionicons name="add-outline" style={styles.iconText} />
			</TouchableOpacity>

			{openBottomSheet && <View style={styles.overlay} />}
			<CustomBottomSheet
				isOpen={openBottomSheet === "setup"}
				onClose={closeBottomSheetHandler}
				title="Set Schedule"
				onCloseSubmit={handleSubmit}
			>
				<View style={styles.bottomSheetContainer}>
					<ThemedText type="cardHeader">Address</ThemedText>
					<Picker
						selectedValue={address}
						style={styles.input}
						onValueChange={(itemValue) => setAddress(itemValue)}
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

					<ThemedText type="cardHeader">Vaccine</ThemedText>
					{vaccines.map((vaccine) => (
						<VaccineCounter
							key={vaccine.id}
							vaccineName={vaccine.name}
							count={vaccineCounts[vaccine.id] || 0}
							onIncrement={() => handleIncrement(vaccine.id)}
							onDecrement={() => handleDecrement(vaccine.id)}
						/>
					))}
				</View>
			</CustomBottomSheet>
		</View>
	);
};

export default setSchedule;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16,
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.8)",
	},
	bottomSheetContainer: {
		flex: 1,
		backgroundColor: "#fff",
	},
	input: {
		marginBottom: 10,
		padding: 12,
		fontSize: 16,
		backgroundColor: "#ebebeb",
	},
	vaccineList: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottomWidth: 2,
		borderBottomColor: "#d6d6d6",
		paddingVertical: 10,
	},
	vaccineTitle: {
		fontSize: 16,
	},
	vaccineCountContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	countInput: {
		borderColor: "#d6d6d6",
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		textAlign: "center",
		fontSize: 16,
		color: "#222222",
		backgroundColor: "#ebebeb",
		width: 40,
		marginHorizontal: 8,
	},
	submitButton: {
		marginTop: 20,
		padding: 12,
		backgroundColor: "#4CAF50",
		alignItems: "center",
		borderRadius: 8,
	},
	buttonContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	floatingButton: {
		position: "absolute",
		bottom: 20,
		right: 20,
		width: 50,
		height: 50,
		borderRadius: 30, // Make it circular
		backgroundColor: "#456B72", // Set your desired background color
		justifyContent: "center",
		alignItems: "center",
	},
	iconText: {
		fontSize: 25,
		color: "white", // Set the color for the "+" icon
	},
});
