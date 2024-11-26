import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import { ThemedText } from "../ThemedText";
import { Picker } from "@react-native-picker/picker";
import { barangays } from "@/assets/data/data";

const SetAppointment = () => {
	const [address, setAddress] = useState("");

	return (
		<View>
			<View className="flex flex-row gap-2 justify-between my-4">
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[25%] mb-2"></View>
				<ThemedText type="cardHeader">Upcomming Schedule</ThemedText>
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[25%] mb-2"></View>
			</View>

			{/* VACCINE SELECTION */}
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

			{/* VACCINE LIST SECTION */}
			<View style={styles.vaccineListContainer}>
				<TouchableOpacity style={styles.card}>
					<ThemedText type="default" style={styles.vaccineTitle}>
						BCG
					</ThemedText>
					<ThemedText type="default" style={styles.vaccineCount}>
						10/10
					</ThemedText>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default SetAppointment;

const styles = StyleSheet.create({
	input: {
		borderColor: "#d6d6d6",
		marginBottom: 10,
		padding: 12,
		fontSize: 16,
		backgroundColor: "#ebebeb",
	},
	card: {
		backgroundColor: "white",
		width: "31.5%",
		padding: 16,
		borderWidth: 1,
		borderRadius: 10,
		borderColor: "#d6d6d6",
		marginBottom: 8,
	},
	vaccineListContainer: {
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	vaccineTitle: {
		textAlign: "center",
    fontWeight: 'bold'
	},
	vaccineCount: {
		textAlign: "center",
	},
});
