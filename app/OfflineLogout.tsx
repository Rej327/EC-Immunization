import { View, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function OfflineLogout() {

	const router = useRouter()

	const handleLogout = async () => {
		try {
			// Retrieve userData from AsyncStorage
			const userDataJson = await AsyncStorage.getItem("users");

			if (userDataJson) {
				// Parse the userData
				const userData = JSON.parse(userDataJson);

				// Update the isActive field to false
				const updatedUserData = {
					...userData,
					isActive: false, // Set user as inactive
				};

				// Save the updated userData back to AsyncStorage
				await AsyncStorage.setItem("users", JSON.stringify(updatedUserData));
				router.replace("/offline/(public)/main");
				// Alert.alert("Logout successful", "User is now inactive.");
			} else {
				Alert.alert("Error", "User data not found.");
			}
		} catch (error) {
			// console.error("Logout error:", error);
			Alert.alert("Error", "An error occurred during logout.");
		}
	};

	return (
		<TouchableOpacity
			onPress={handleLogout}
			className="bg-none border-[1px] border-[#aa0202] mt-1 mb-2 py-2 mx-2 rounded-xl"
		>
			<View className="flex flex-row gap-1 items-center justify-center">
				<Ionicons name="log-out-outline" size={20} color={"#aa0202"} />
				<ThemedText className="text-center text-[#aa0202]">Logout</ThemedText>
			</View>
		</TouchableOpacity>
	);
}
