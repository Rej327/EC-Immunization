import { View, Text, Switch } from "react-native";
import React, { useState } from "react";
import { ThemedText } from "../ThemedText";
import CustomCard from "../CustomCard";

export default function Notification() {
	const [isEnabled, setIsEnabled] = useState(false); // State to manage switch

	const toggleSwitch = () => setIsEnabled((previousState) => !previousState); // Function to toggle switch

	return (
		<CustomCard className="my-2">
			<ThemedText type="cardHeader" className="font-bold">
				Notification
			</ThemedText>

			<View className="flex-row items-center justify-between">
				<ThemedText type="default">Reminders</ThemedText>
				<Switch
					trackColor={{ false: "#767577", true: "#86b3bc" }}
					thumbColor={isEnabled ? "#456B72" : "#f4f3f4"}
					onValueChange={toggleSwitch}
					value={isEnabled}
				/>
			</View>
		</CustomCard>
	);
}
