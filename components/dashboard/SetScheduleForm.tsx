import {
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { barangays } from "@/assets/data/data";
import { ThemedText } from "../ThemedText";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

interface Vaccine {
	id: string;
	name: string;
}

const vaccines: Vaccine[] = [
	{ id: "bcg", name: "BCG" },
	{ id: "hep_b", name: "Hepatitis B" },
	{ id: "pentavalent_1", name: "Pentavalent Vaccine (1st dose)" },
	{ id: "pentavalent_2", name: "Pentavalent Vaccine (2nd dose)" },
	{ id: "pentavalent_3", name: "Pentavalent Vaccine (3rd dose)" },
	{ id: "opv_1", name: "Oral Polio Vaccine (1st dose)" },
	{ id: "opv_2", name: "Oral Polio Vaccine (2nd dose)" },
	{ id: "opv_3", name: "Oral Polio Vaccine (3rd dose)" },
	{ id: "ipv", name: "Inactivated Polio Vaccine (IPV)" },
	{ id: "pcv_1", name: "PCV 13 (1st dose)" },
	{ id: "pcv_2", name: "PCV 13 (2nd dose)" },
	{ id: "pcv_3", name: "PCV 13 (3rd dose)" },
];

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

const SetScheduleForm = () => {
	const [address, setAddress] = useState<string>("");
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
	const [date, setDate] = useState<Date>(new Date());
	const [birthday, setBirthday] = useState<Date | null>(null);
	const [vaccineCounts, setVaccineCounts] = useState<Record<string, number>>(
		{}
	);

	const handleDateChange = (event: unknown, selectedDate?: Date) => {
		if (event === undefined) return;
		const currentDate = selectedDate || date;
		setShowDatePicker(Platform.OS === "ios");
		setDate(currentDate);
		setBirthday(currentDate);
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

	const handleSubmit = () => {
		const selectedVaccines = vaccines.map((vaccine) => ({
			id: vaccine.id,
			name: vaccine.name,
			count: vaccineCounts[vaccine.id] || 0,
			taken: 0,
		}));

		const formData = {
			address,
			when: birthday ? birthday.toISOString() : null,
			vaccines: selectedVaccines,
		};

		console.log("Form Data:", formData);
	};

	return (
		<View style={styles.container}>
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
						{birthday
							? birthday.toLocaleDateString("en-US")
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

			<TouchableOpacity
				onPress={handleSubmit}
				style={styles.submitButton}
			>
				<ThemedText type="default">Submit</ThemedText>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
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
});

export default SetScheduleForm;
