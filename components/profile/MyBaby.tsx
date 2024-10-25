import React, { useEffect, useState } from "react";
import {
	View,
	ScrollView,
	Button,
	Modal,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Platform,
	Image,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import CustomCard from "@/components/CustomCard";
import DateTimePicker from "@react-native-community/datetimepicker";
import StyledButton from "../StyledButton";
import { db } from "@/db/firebaseConfig"; // Import Firestore config
import {
	collection,
	addDoc,
	getDocs,
	query,
	where,
	doc,
	getDoc,
} from "firebase/firestore"; // Import Firestore functions
import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message"; // Ensure you have this installed
import AsyncStorage from "@react-native-async-storage/async-storage";
import { noData } from "@/assets";

// Define the interface for Baby
interface Baby {
	firstName: string;
	lastName: string;
	birthday: Date;
}

interface SelectedBaby {
	id: string;
	firstName: string;
	lastName: string;
	birthday: Date;
}

const MyBaby = () => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [birthday, setBirthday] = useState<Date | null>(null);
	const [babies, setBabies] = useState<SelectedBaby[]>([]);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [date, setDate] = useState(new Date());
	const [selectedBaby, setSelectedBaby] = useState<SelectedBaby | null>(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const { user } = useUser();

	// Load babies from Firestore when the component mounts
	const loadBabies = async () => {
		if (!user?.id) {
			console.log("User ID is not available.");
			return; // Early return if user ID is not present
		}

		try {
			const babiesQuery = query(
				collection(db, "babies"),
				where("parentId", "==", user.id)
			);
			const querySnapshot = await getDocs(babiesQuery);
			const babiesData = querySnapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					firstName: data.firstName,
					lastName: data.lastName,
					birthday:
						data.birthday instanceof Date
							? data.birthday
							: data.birthday.toDate(), // Assuming birthday is stored as a Firestore Timestamp
				} as SelectedBaby; // Cast to Baby type
			});

			setBabies(babiesData);
		} catch (error) {
			console.error("Error fetching babies from Firestore: ", error);
		}
	};

	// Fetch the selected baby using the stored ID in AsyncStorage
	const fetchSelectedBaby = async (id: string) => {
		try {
			const babyRef = doc(db, "babies", id);
			const babySnapshot = await getDoc(babyRef);
			if (babySnapshot.exists()) {
				const data = babySnapshot.data();
				setSelectedBaby({
					id: babySnapshot.id,
					firstName: data.firstName,
					lastName: data.lastName,
					birthday:
						data.birthday instanceof Date
							? data.birthday
							: data.birthday.toDate(),
				});
			} else {
				console.log("No such baby!");
			}
		} catch (error) {
			console.error("Error fetching selected baby data: ", error);
		}
	};

	useEffect(() => {
		loadBabies();
		const loadSelectedBabyId = async () => {
			const existingBabyId = await AsyncStorage.getItem("selectedBabyId");
			if (existingBabyId) {
				await fetchSelectedBaby(existingBabyId);
			}
		};

		loadSelectedBabyId();
	}, [user]); // Add user as a dependency to refetch babies when the user changes

	// Function to Register Baby to Firestore
	const addBabyToFirestore = async (newBaby: Baby) => {
		try {
			// Register Baby to Firestore
			const docRef = await addDoc(collection(db, "babies"), {
				parentId: user?.id,
				firstName: newBaby.firstName,
				lastName: newBaby.lastName,
				birthday: newBaby.birthday,
				createdAt: new Date() as Date,
			});

			console.log("Baby register to Firestore!");
			loadBabies();
			// Generate the vaccination milestones for the baby
			await addMilestoneToFirestore(docRef.id, newBaby);

			Toast.show({
				type: "success",
				text1: "Success",
				text2: "Baby and milestones register successfully! 👶",
				position: "top",
			});
		} catch (error) {
			console.error("Error adding baby to Firestore: ", error);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Failed to Register Baby! ❌",
				position: "top",
			});
		}
	};

	// Function to add vaccination milestones to Firestore
	const addMilestoneToFirestore = async (babyId: string, newBaby: Baby) => {
		const vaccineSchedule = [
			{
				vaccine: "BCG",
				ageInMonths: 0,
				received: false,
				description:
					"Bacillus Calmette-Guérin (BCG) vaccine protects against tuberculosis (TB), particularly severe forms in children like TB meningitis.",
			},
			{
				vaccine: "Hepatitis B",
				ageInMonths: 0,
				received: false,
				description:
					"Prevents Hepatitis B virus (HBV) infection, which can cause chronic liver disease and liver cancer.",
			},
			{
				vaccine: "Pentavalent Vaccine (1st dose)",
				ageInMonths: 1.5,
				received: false,
				description:
					"Combines protection against 5 diseases: diphtheria (D), pertussis (P), tetanus (T), hepatitis B (HB), and Haemophilus influenzae type B (Hib).",
			},
			{
				vaccine: "Pentavalent Vaccine (2nd dose)",
				ageInMonths: 2.5,
				received: false,
				description:
					"Combines protection against 5 diseases: diphtheria (D), pertussis (P), tetanus (T), hepatitis B (HB), and Haemophilus influenzae type B (Hib).",
			},
			{
				vaccine: "Pentavalent Vaccine (3rd dose)",
				ageInMonths: 3.5,
				received: false,
				description:
					"Combines protection against 5 diseases: diphtheria (D), pertussis (P), tetanus (T), hepatitis B (HB), and Haemophilus influenzae type B (Hib).",
			},
			{
				vaccine: "Oral Polio Vaccine (1st dose)",
				ageInMonths: 1.5,
				received: false,
				description:
					"Oral Polio Vaccine (OPV) protects against poliovirus, which can lead to paralysis.",
			},
			{
				vaccine: "Oral Polio Vaccine (2nd dose)",
				ageInMonths: 2.5,
				received: false,
				description:
					"Oral Polio Vaccine (OPV) protects against poliovirus, which can lead to paralysis.",
			},
			{
				vaccine: "Oral Polio Vaccine (3rd dose)",
				ageInMonths: 3.5,
				received: false,
				description:
					"Oral Polio Vaccine (OPV) protects against poliovirus, which can lead to paralysis.",
			},
			{
				vaccine: "Inactivated Polio Vaccine (IPV)",
				ageInMonths: 3.5,
				received: false,
				description:
					"IPV is an injected polio vaccine that boosts immunity against poliovirus, complementing the oral vaccine.",
			},
			{
				vaccine: "Pneumococcal Conjugate Vaccine (1st dose)",
				ageInMonths: 1.5,
				received: false,
				description:
					"First dose of PCV for complete protection against pneumococcal diseases.",
			},
			{
				vaccine: "Pneumococcal Conjugate Vaccine (2nd dose)",
				ageInMonths: 2.5,
				received: false,
				description:
					"Second dose of PCV for complete protection against pneumococcal diseases.",
			},
			{
				vaccine: "Pneumococcal Conjugate Vaccine (3rd dose)",
				ageInMonths: 3.5,
				received: false,
				description:
					"Third and last dose of PCV for complete protection against pneumococcal diseases.",
			},
			{
				vaccine: "Measles-Rubella (1st dose)",
				ageInMonths: 9,
				received: false,
				description:
					"First dose of MR vaccine ensures long-lasting protection against measles and rubella.",
			},
			{
				vaccine: "Measles-Rubella (2nd dose)",
				ageInMonths: 12,
				received: false,
				description:
					"Second and last dose of MR vaccine ensures long-lasting protection against measles and rubella.",
			},
		];

		const babyBirthday = new Date(newBaby.birthday);

		// Calculate the expected date of each vaccination based on baby's birthday
		const milestones = vaccineSchedule.map((vaccine) => {
			const expectedDate = new Date(babyBirthday);

			// Split the ageInMonths into whole months and fractional months
			const wholeMonths = Math.floor(vaccine.ageInMonths); // Get the integer part of the age in months
			const fractionalMonths = vaccine.ageInMonths - wholeMonths; // Get the fractional part (e.g., 0.5 for 1.5 months)

			// Add the whole months first
			expectedDate.setMonth(babyBirthday.getMonth() + wholeMonths);

			// Convert the fractional months to days (approximate)
			const daysInMonth = 30; // Use an average month length (you can refine this if needed)
			const extraDays = Math.round(fractionalMonths * daysInMonth);

			// Add the extra days to account for the fractional part
			expectedDate.setDate(expectedDate.getDate() + extraDays);

			return {
				vaccine: vaccine.vaccine,
				ageInMonths: vaccine.ageInMonths,
				expectedDate: expectedDate, // Store as a date string
				received: vaccine.received,
				description: vaccine.description,
				updatedAt: new Date() as Date,
			};
		});

		try {
			await addDoc(collection(db, "milestones"), {
				babyId: babyId,
				parentId: user?.id,
				firstName: newBaby.firstName,
				lastName: newBaby.lastName,
				milestone: milestones,
				createdAt: new Date() as Date,
			});
			console.log("Milestones register to Firestore!");
		} catch (error) {
			console.error("Error adding milestones to Firestore: ", error);
		}
	};

	// Handle adding a baby (only to Firestore)
	const handleAddBaby = () => {
		// Check if all fields are filled
		if (!firstName || !lastName || !birthday) {
			// Show an error toast if any field is empty
			Toast.show({
				type: "error",
				text1: "Missing Information",
				text2: "Please fill out all fields before adding a baby!",
				position: "top",
			});
			console.log("Failed to Register Baby in Firestore!");
			setIsModalVisible(false);
			return; // Stop the function here if any field is empty
		}

		const newBaby: Baby = { firstName, lastName, birthday }; // Use the Date object for birthday

		// Register Baby to Firestore
		addBabyToFirestore(newBaby);

		// Reset form fields
		setFirstName("");
		setLastName("");
		setBirthday(null); // Reset birthday to null
		setIsModalVisible(false);
	};

	const handleDateChange = (event: any, selectedDate?: Date) => {
		const currentDate = selectedDate || date;
		setShowDatePicker(Platform.OS === "ios");
		setDate(currentDate);
		setBirthday(currentDate); // Store the Date object directly
	};

	const handleSelectBaby = async (baby: SelectedBaby) => {
		try {
			setSelectedBaby(baby);
			setShowDropdown(false); // Close dropdown after selection

			// Save the selected baby's ID to local storage
			await AsyncStorage.setItem("selectedBabyId", baby.id);
			console.log(`Saved selected baby ID: ${baby.id}`);
		} catch (error) {
			console.error(
				"Error saving selected baby ID to local storage: ",
				error
			);
		}
	};

	// Corrected the babyInfo function to return JSX
	const babyInfo = (baby: SelectedBaby) => {
		return (
			<View style={styles.babyInfoContainer}>
				<ThemedText type="default">
					{baby.firstName} {baby.lastName}
				</ThemedText>
				<ThemedText type="default">
					{baby.birthday.toLocaleDateString("en-US")}
				</ThemedText>
			</View>
		);
	};

	return (
		<ScrollView>
			{babies.length > 0 ? (
				<CustomCard className="my-2">
					<ThemedText type="cardHeader" className="mb-2">
						Your Children
					</ThemedText>

					<TouchableOpacity
						onPress={() => setShowDropdown(!showDropdown)} // Toggle dropdown
						style={styles.input}
					>
						<View className="flex flex-row justify-between">
							{selectedBaby ? (
								babyInfo(selectedBaby) // Display the selected baby's info
							) : (
								<ThemedText
									type="default"
									className="font-bold"
								>
									Select your children
								</ThemedText>
							)}
						</View>
					</TouchableOpacity>
					{showDropdown && (
						<View style={styles.dropdown}>
							{babies.map((baby, index) => (
								<TouchableOpacity
									key={index}
									onPress={() => handleSelectBaby(baby)}
									style={styles.dropdownItem}
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
							))}
						</View>
					)}
					<StyledButton
						title="Register Baby"
						onPress={() => setIsModalVisible(true)}
						paddingVertical={10}
						fontSize={14}
						borderRadius={12}
						customWeight="500"
					/>
				</CustomCard>
			) : (
				<CustomCard>
					<ThemedText type="cardHeader" className="mb-2">
						My Children
					</ThemedText>
					<View className="mx-auto flex items-center justify-center">
						<Image
							source={noData}
							className="w-16 h-20 mb-2 opacity-40 absolute -top-1"
						/>
					</View>
					<ThemedText type="header" className="text-center">
						No children registered yet!
					</ThemedText>
					<ThemedText type="default" className="text-center mb-2">
						Please register your children to use all features of the
						application.
					</ThemedText>
					<StyledButton
						title="Register Baby"
						onPress={() => setIsModalVisible(true)}
						paddingVertical={10}
						fontSize={14}
						borderRadius={12}
						customWeight="500"
					/>
				</CustomCard>
			)}

			<Modal
				visible={isModalVisible}
				animationType="fade"
				transparent={true}
				onRequestClose={() => setIsModalVisible(false)}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<ThemedText type="header" style={styles.modalHeader}>
							Register Baby
						</ThemedText>

						<TextInput
							placeholder="First Name"
							value={firstName}
							onChangeText={setFirstName}
							style={styles.input}
						/>
						<TextInput
							placeholder="Last Name"
							value={lastName}
							onChangeText={setLastName}
							style={styles.input}
						/>

						<TouchableOpacity
							onPress={() => setShowDatePicker(true)}
							style={styles.input}
						>
							<ThemedText type="default">
								{birthday
									? birthday.toLocaleDateString("en-US")
									: "Select Birthday"}
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

						<View style={styles.buttonContainer}>
							<StyledButton
								title="Submit"
								onPress={handleAddBaby}
								customWeight="500"
								fontSize={14}
								borderRadius={12}
							/>
							<StyledButton
								title="Cancel"
								onPress={() => setIsModalVisible(false)}
								bgColor="#d6d6d6"
								customWeight="500"
								fontSize={14}
								borderRadius={12}
								textColor="#456B72"
							/>
						</View>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
};

export default MyBaby;

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.8)",
	},
	modalContent: {
		width: "80%",
		padding: 20,
		backgroundColor: "white",
		borderRadius: 10,
	},
	modalHeader: {
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		borderColor: "#d6d6d6",
		borderWidth: 1,
		marginBottom: 10,
		padding: 10,
		borderRadius: 8,
		backgroundColor: "#ebebeb",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
	},
	babyInfoContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	dropdown: {
		borderWidth: 1,
		borderColor: "#d6d6d6",
		backgroundColor: "#fff",
		borderRadius: 8,
		marginBottom: 10,
	},
	dropdownItem: {
		display: "flex",
		justifyContent: "space-between",
		flexDirection: "row",
		padding: 10,
		width: "100%",
	},
});
