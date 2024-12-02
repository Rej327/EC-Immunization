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
import { noData, noWifi } from "@/assets";
import { getScheduleData } from "@/middleware/GetFromLocalStorage";
import { Schedules } from "@/types/types";

interface Vaccine {
	id: string;
	name: string;
	count: number;
	taken: number;
}

interface SelectedBaby {
	id: string;
	firstName: string;
	lastName: string;
	birthday: Date;
	address: string;
}


export const OfflineSetAppointment = () => {
	const [address, setAddress] = useState("");
	const [schedules, setSchedules] = useState<Schedules[]>([]);
	const [loading, setLoading] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedVaccine, setSelectedVaccine] = useState<any>(null); // Holds the selected vaccine data
	const [isModalVisible, setModalVisible] = useState(false);
	const [babies, setBabies] = useState<SelectedBaby[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedBaby, setSelectedBaby] = useState<SelectedBaby | null>(null);
	const [isDisabled, setIsDisabled] = useState<boolean>(false);
	const [buttonLabel, setSetButtonLabel] = useState<string>("");

	const fetchSchedules = async (selectedAddress: string) => {
    setLoading(true);
    try {
      const schedulesFromStorage = await getScheduleData();
      // Check if schedules are available from AsyncStorage
      if (schedulesFromStorage.length > 0) {
        // If schedules exist in AsyncStorage, filter them by selectedAddress
        const filteredSchedules = schedulesFromStorage.filter(
          (schedule) => schedule.address === selectedAddress && !schedule.completed
        );
        setSchedules(filteredSchedules);
      } else {
        // Otherwise, fetch schedules from Firestore
        const scheduleCollection = collection(db, "schedules");
        const scheduleQuery = query(
          scheduleCollection,
          where("address", "==", selectedAddress),
          where("completed", "==", false)
        );
        const scheduleSnapshot = await getDocs(scheduleQuery);
  
        const fetchedSchedules: Schedules[] = scheduleSnapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Schedules, "id">), // Spread without `id`
          id: doc.id, // Add `id` explicitly
        }));
  
        // Store the fetched schedules in AsyncStorage
        await AsyncStorage.setItem("schedules", JSON.stringify(fetchedSchedules));
  
        // Update the state with the fetched schedules
        setSchedules(fetchedSchedules);
      }
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
							<View className="flex justify-between items-center">
								<Image
									source={noWifi}
									className="w-20 h-20 opacity-50"
								/>
								<ThemedText
									type="cardHeader"
									className="text-[#999]"
								>
									No internet connection
								</ThemedText>
							</View>

							<View style={styles.buttonContainer}>
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
					{schedules.map((schedule, i) => {
						return schedule.when ? (
							<View key={i} className="flex flex-row justify-between">
								<ThemedText
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
    marginTop: 10,
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
