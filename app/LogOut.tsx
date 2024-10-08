import { View, Text, Pressable, TouchableOpacity } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@clerk/clerk-expo"; // Import Clerk's useAuth hook
import { useRouter } from "expo-router"; // Import router for navigation
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

export default function Logout() {
	const { signOut } = useAuth(); // Get the signOut method from Clerk
	const router = useRouter(); // Use router for navigation after logout

	const handleLogout = async () => {
		try {
			// Sign out the user via Clerk
			await signOut();
			// Optionally clear local storage if needed
			await AsyncStorage.removeItem("userData");
			await AsyncStorage.removeItem("babies");
			await AsyncStorage.removeItem("userPassword");
			await AsyncStorage.removeItem("selectedBabyId");

			console.log("User signed out and all data was cleared");

			// Redirect to the login page after sign-out
			router.replace("/online/(public)/main");
		} catch (error) {
			console.error("Failed to log out or clear user data:", error);
		}
	};

	return (
		<TouchableOpacity
			onPress={handleLogout}
			className="bg-none border-[1px] border-[#aa0202] mt-1 mb-2 py-2 mx-2 rounded-xl"
		>
			<View className="flex flex-row gap-1 items-center justify-center">
				<Ionicons name="log-out-outline" size={20} color={"#aa0202"} />
				<ThemedText className="text-center text-[#aa0202]">
					Logout
				</ThemedText>
			</View>
		</TouchableOpacity>
	);
}
