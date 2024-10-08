import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ClearData() {
	const [storedUserData, setStoredUserData] = useState(null);

	const clearUserData = async () => {
		try {
			await AsyncStorage.removeItem("userData");
			setStoredUserData(null);
      console.log('Clear Data');
      
		} catch (error) {
			console.error(
				"Failed to clear user data from local storage:",
				error
			);
		}
	};
	return (
		<Pressable className="w-auto flex items-center justify-center bg-red-700 p-2" onPress={clearUserData}>
			<Text className="text-white">Clear</Text>
		</Pressable>
	);
}
