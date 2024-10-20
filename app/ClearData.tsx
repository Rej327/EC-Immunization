import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StyledButton from "@/components/StyledButton";

export default function ClearData() {
	const [storedUserData, setStoredUserData] = useState(null);

	const clearUserData = async () => {
		try {

			AsyncStorage.removeItem("users");
			AsyncStorage.removeItem("babies");
			AsyncStorage.removeItem("milestones");
			AsyncStorage.removeItem("appointments");
			AsyncStorage.removeItem("notifications");

			AsyncStorage.removeItem("userPassword");
			AsyncStorage.removeItem("selectedBabyId");
			AsyncStorage.removeItem("reminders");
			setStoredUserData(null);
			console.log("Clear Data");
		} catch (error) {
			console.error(
				"Failed to clear user data from local storage:",
				error
			);
		}
	};
	return (
		<StyledButton
			onPress={clearUserData}
			title="Clear Data"
			borderRadius={12}
			bgColor="red"
		/>
	);
}
