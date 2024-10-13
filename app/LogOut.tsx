import { View, Text, Pressable, TouchableOpacity, Modal } from "react-native";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@clerk/clerk-expo"; // Import Clerk's useAuth hook
import { useRouter } from "expo-router"; // Import router for navigation
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

export default function Logout() {
	const { signOut } = useAuth(); // Get the signOut method from Clerk
	const router = useRouter(); // Use router for navigation after logout

	const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

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
		<>
			<TouchableOpacity
				onPress={() => setModalVisible(true)} // Open modal on press
				className="bg-none border-[1px] border-[#aa0202] mt-1 mb-2 py-2 rounded-xl"
			>
				<View className="flex flex-row gap-1 items-center justify-center">
					<Ionicons
						name="log-out-outline"
						size={20}
						color={"#aa0202"}
					/>
					<ThemedText className="text-center text-[#aa0202]">
						Logout
					</ThemedText>
				</View>
			</TouchableOpacity>

			{/* Confirmation Modal */}
			<Modal
				transparent={true}
				animationType="fade"
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View className="flex-1 justify-center items-center bg-black/80">
					<View className="bg-white rounded-lg p-4 w-80">
						<View className="flex items-center justify-center mb-2">
							<Ionicons
								name="alert-circle-outline"
								color={"#aa0202"}
								size={40}
							/>
						</View>
						<ThemedText className="text-xl font-bold mb-2 text-center">
							Confirm Logout?
						</ThemedText>
						<ThemedText className="text-gray-700 mb-4 text-center">
							Are you sure you want to log out? You won’t be able
							to log in or use this application in offline mode.
						</ThemedText>
						<View className="flex-row justify-between">
							<Pressable
								onPress={() => {
									setModalVisible(false); // Close modal
									handleLogout(); // Proceed with logout
								}}
								className="bg-[#aa0202] p-2 rounded-lg flex-1 mr-2"
							>
								<ThemedText className="text-white text-center">
									Yes, Logout
								</ThemedText>
							</Pressable>
							<Pressable
								onPress={() => setModalVisible(false)} // Close modal without action
								className="bg-gray-300 p-2 rounded-lg flex-1 ml-2"
							>
								<ThemedText className="text-black text-center">
									Cancel
								</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
}
