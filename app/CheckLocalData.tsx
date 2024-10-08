import { View, Text, Alert } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StyledButton from "@/components/StyledButton";

export default function CheckLocalData() {
	const checkUserData = async () => {
		try {
			const userDataJson = await AsyncStorage.getItem("userData");

			if (userDataJson !== null) {
				// Parse userData and log it
				const userData = JSON.parse(userDataJson);
				console.log("Data:", userData);
				Alert.alert("Data Found", JSON.stringify(userData)); // Display the data in an alert for testing
			} else {
				console.log("No data found.");
				Alert.alert("No data", "No data found in local storage.");
			}
		} catch (error) {
			console.error("Error retrieving data:", error);
			Alert.alert("Error", "Error retrieving data.");
		}
	};
	return (
		<StyledButton
			onPress={checkUserData}
			title="Test Data"
			borderRadius={12}
		/>
	);
}
