import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Platform,
	Alert,
} from "react-native";
import React, { useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/db/firebaseConfig";
import Toast from "react-native-toast-message";
import { ThemedText } from "@/components/ThemedText";
import StyledButton from "@/components/StyledButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import StepIndicator from "react-native-step-indicator";
import { Picker } from "@react-native-picker/picker";
import { barangays, vaccineSchedule } from "@/assets/data/data";
import { useRouter } from "expo-router";

interface Card {
	id: string;
	vaccineName: string;
	date: string[];
	doses: string;
	remarks: string[];
}

interface Baby {
	firstName: string;
	lastName: string;
	birthday: Date;
	birthPlace: string;
	address: string;
	addressInfo: string;
	motherName: string;
	fatherName: string;
	height: string;
	weight: string;
	gender: string;
	contact: string;
	card: Card[];
}

export default function RegisterChildren() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [birthday, setBirthday] = useState<Date | null>(null);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [date, setDate] = useState(new Date());
	const [birthPlace, setBirthPlace] = useState("");
	const [address, setAddress] = useState("");
	const [addressInfo, setAddressInfo] = useState("");
	const [motherName, setMotherName] = useState("");
	const [fatherName, setFatherName] = useState("");
	const [height, setHeight] = useState("");
	const [weight, setWeight] = useState("");
	const [gender, setGender] = useState("");
	const [contact, setContact] = useState("");
	const [currentStep, setCurrentStep] = useState(0);

	const { user } = useUser();
	const router = useRouter();

	// Function to Register Baby to Firestore
	const addBabyToFirestore = async (newBaby: Baby) => {
		const cards: Card[] = [
			{
				id: "bcg",
				vaccineName: "BCG",
				date: [],
				doses: "1 (pagkapanganak)",
				remarks: [],
			},
			{
				id: "hepa",
				vaccineName: "Hepatitis B",
				date: [],
				doses: "1 (pagkapanganak)",
				remarks: [],
			},
			{
				id: "penta",
				vaccineName: "Pentavalent Vaccine (DPT-HepB-HiB)",
				date: [],
				doses: "3 (1½, 2½, 3½ buwan )",
				remarks: [],
			},
			{
				id: "oral",
				vaccineName: "Oral Polio Vaccine (OPV)",
				date: [],
				doses: "3 (1½, 2½, 3½ buwan )",
				remarks: [],
			},
			{
				id: "polio",
				vaccineName: "Inactivated Polio Vaccine (IPV)",
				date: [],
				doses: "3 (3½ buwan )",
				remarks: [],
			},
			{
				id: "pneumo",
				vaccineName: "Pneumococcal Conjugate Vaccine - 13 (PCV 13)",
				date: [],
				doses: "3 (1½, 2½, 3½ buwan )",
				remarks: [],
			},
			{
				id: "measles",
				vaccineName: "Measles-Containing Vaccine (MCV) MR/MMR",
				date: [],
				doses: "2 (9 buwan & 1 taon )",
				remarks: [],
			},
		];
		try {
			// Register Baby to Firestore
			const docRef = await addDoc(collection(db, "babies"), {
				parentId: user?.id,
				firstName: newBaby.firstName,
				lastName: newBaby.lastName,
				birthday: newBaby.birthday,
				birthPlace: newBaby.birthPlace,
				address: newBaby.address,
				addressInfo: newBaby.addressInfo,
				motherName: newBaby.motherName,
				fatherName: newBaby.fatherName,
				height: newBaby.height + " (cm)",
				weight: newBaby.weight + " (kg)",
				gender: newBaby.gender,
				contact: newBaby.contact,
				createdAt: new Date() as Date,
				card: cards,
			});

			console.log("Baby register to Firestore!");

			// Generate the vaccination milestones for the baby
			await addMilestoneToFirestore(docRef.id, newBaby);

			// Toast.show({
			// 	type: "success",
			// 	text1: "Success",
			// 	text2: "Baby and milestones register successfully! 👶",
			// 	position: "top",
			// });
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
				id: vaccine.id,
				targetId: vaccine.targetId,
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
	const handleAddBaby = async () => {
		// Check if all fields are filled
		if (!birthday) {
			// Show an error toast if any field is empty
			Toast.show({
				type: "error",
				text1: "Missing Information",
				text2: "Please fill out all fields.",
				position: "top",
			});
			console.log("Failed to Register Baby in Firestore!");
			return; // Stop the function here if any field is empty
		}

		const newBaby: Baby = {
			firstName,
			lastName,
			birthday,
			address,
			addressInfo,
			contact,
			fatherName,
			gender,
			height: height ? height : "00",
			motherName,
			weight: weight ? weight : "00",
			birthPlace,
			card: [],
		}; // Use the Date object for birthday

		try {
			// Register Baby to Firestore
			await addBabyToFirestore(newBaby);
			resetForm();
			setCurrentStep(0);

			// Navigate to success page only after successful Firestore operation
			router.push("/online/(auth)/successpage");
		} catch (error) {
			// Handle Firestore error
			Toast.show({
				type: "error",
				text1: "Registration Failed",
				text2: "An error occurred. Please try again.",
				position: "top",
			});
			console.error("Error registering baby:", error);
		}
	};

	const handleDateChange = (event: any, selectedDate?: Date) => {
		const currentDate = selectedDate || date;
		setShowDatePicker(Platform.OS === "ios");
		setDate(currentDate);
		setBirthday(currentDate); // Store the Date object directly
	};

	const handleNext = () => {
		// Step 0 validation
		if (currentStep === 0) {
			if (!firstName || !lastName || !gender) {
				Toast.show({
					type: "error",
					text1: "Missing Information",
					text2: "Please fill out all fields.",
					position: "top",
				});
				return;
			}
		}

		// Step 1 validation
		if (currentStep === 1) {
			if (!birthday || !birthPlace || !address || !addressInfo) {
				Toast.show({
					type: "error",
					text1: "Missing Information",
					text2: "Please fill out all fields.",
					position: "top",
				});
				return;
			}
		}

		// Step 2 validation
		if (currentStep === 2) {
			if (!motherName || !fatherName || !contact) {
				Toast.show({
					type: "error",
					text1: "Missing Information",
					text2: "Please fill out all fields.",
					position: "top",
				});
				return;
			}
		}

		// If all checks pass, move to the next step
		if (currentStep < labels.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const resetForm = () => {
		setFirstName("");
		setLastName("");
		setBirthday(null);
		setBirthPlace("");
		setAddress("");
		setMotherName("");
		setFatherName("");
		setHeight("");
		setWeight("");
		setGender("");
		setContact("");
		setAddressInfo("");
	};

	const labels = ["Baby Info", "Birth Details", "Parents", "Measurements"];

	const stepIndicatorStyles = {
		stepIndicatorSize: 30,
		currentStepIndicatorSize: 35,
		separatorStrokeWidth: 2,
		currentStepStrokeWidth: 3,
		stepStrokeCurrentColor: "#456B72",
		stepStrokeWidth: 3,
		stepStrokeFinishedColor: "#456B72",
		stepStrokeUnFinishedColor: "#dedede",
		separatorFinishedColor: "#456B72",
		separatorUnFinishedColor: "#dedede",
		stepIndicatorFinishedColor: "#456B72",
		stepIndicatorUnFinishedColor: "#ffffff",
		stepIndicatorCurrentColor: "#ffffff",
		stepIndicatorLabelFontSize: 15,
		currentStepIndicatorLabelFontSize: 15,
		stepIndicatorLabelCurrentColor: "#456B72",
		stepIndicatorLabelFinishedColor: "#ffffff",
		stepIndicatorLabelUnFinishedColor: "#dedede",
		labelColor: "#999999",
		currentStepLabelColor: "#456B72",
	};

	return (
		<View style={styles.container}>
			<View className="mb-4">
				<StepIndicator
					customStyles={stepIndicatorStyles}
					currentPosition={currentStep}
					labels={labels}
					stepCount={4}
				/>
			</View>
			{currentStep === 0 && (
				<View>
					<TextInput
						placeholder="First Name"
						value={firstName}
						onChangeText={setFirstName}
						style={styles.input}
						autoCapitalize="words"
					/>
					<TextInput
						placeholder="Last Name"
						value={lastName}
						onChangeText={setLastName}
						style={styles.input}
						autoCapitalize="words"
					/>
					<Picker
						style={styles.input}
						selectedValue={gender}
						onValueChange={(itemValue) => setGender(itemValue)}
					>
						<Picker.Item
							// style={styles.input}
							label="Select gender"
							value=""
						/>
						<Picker.Item
							// style={styles.input}
							label="Male"
							value="Male"
						/>
						<Picker.Item
							// style={styles.input}
							label="Female"
							value="Female"
						/>
					</Picker>
				</View>
			)}
			{currentStep === 1 && (
				<View>
					<TouchableOpacity
						onPress={() => setShowDatePicker(true)}
						style={styles.input}
					>
						<ThemedText
							type="default"
							className="my-1 text-[16px] font-semibold"
						>
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
					<TextInput
						placeholder="Birth Place"
						value={birthPlace}
						onChangeText={setBirthPlace}
						style={styles.input}
						autoCapitalize="words"
					/>
					<Picker
						selectedValue={address} // Use the selected address as the value
						style={styles.input}
						onValueChange={(itemValue) => setAddress(itemValue)} // Update the address state
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
					<TextInput
						placeholder="Street | Sitio | House No."
						value={addressInfo}
						onChangeText={setAddressInfo}
						style={styles.input}
						autoCapitalize="words"
					/>
				</View>
			)}
			{currentStep === 2 && (
				<View>
					<TextInput
						placeholder="Mother's Name"
						value={motherName}
						onChangeText={setMotherName}
						style={styles.input}
						autoCapitalize="words"
					/>
					<TextInput
						placeholder="Father's Name"
						value={fatherName}
						onChangeText={setFatherName}
						style={styles.input}
						autoCapitalize="words"
					/>
					<TextInput
						placeholder="Contact Number"
						value={contact}
						onChangeText={setContact}
						style={styles.input}
						keyboardType="phone-pad"
						maxLength={11}
					/>
				</View>
			)}
			{currentStep === 3 && (
				<View>
					<TextInput
						placeholder="Height (cm)"
						value={height}
						onChangeText={setHeight}
						style={styles.input}
						keyboardType="numeric"
						maxLength={3}
					/>
					<TextInput
						placeholder="Weight (kg)"
						value={weight}
						onChangeText={setWeight}
						style={styles.input}
						keyboardType="numeric"
						maxLength={2}
					/>
				</View>
			)}

			<View style={styles.buttonContainer}>
				{currentStep > 0 && (
					<StyledButton
						title="Previous"
						onPress={handlePrevious}
						customWeight="500"
						fontSize={14}
						borderRadius={12}
						width="47%"
						bgColor="#DAE9EA"
						textColor="#456B72"
					/>
				)}
				{currentStep < labels.length - 1 ? (
					<>
						<StyledButton
							title="Next"
							onPress={handleNext}
							customWeight="500"
							fontSize={14}
							borderRadius={12}
							width="47%"
						/>
					</>
				) : (
					<StyledButton
						title="Submit"
						onPress={handleAddBaby}
						customWeight="500"
						fontSize={14}
						borderRadius={12}
						width="47%"
					/>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#fff",
	},
	input: {
		borderColor: "#d6d6d6",
		marginBottom: 10,
		padding: 12,
		fontSize: 16,
		backgroundColor: "#ebebeb",
	},
	buttonContainer: {
		flexDirection: "row",
		gap: 10,
		justifyContent: "flex-end",
		marginTop: 20,
	},
	picker: {
		height: 50,
		borderWidth: 1,
		borderColor: "gray",
		borderRadius: 5,
	},
});
