import { View, TouchableOpacity, Alert, Modal, StyleSheet } from "react-native";
import React, { useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function OfflineLogout() {
	const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

	const router = useRouter();

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
				await AsyncStorage.setItem(
					"users",
					JSON.stringify(updatedUserData)
				);
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
		<>
			<TouchableOpacity
				style={styles.menuItem}
				onPress={() => setModalVisible(true)} // Open modal on press
			>
				<View className="flex flex-row gap-1 items-center">
					<Ionicons name="log-out-sharp" size={20} color="#456B72" />
					<ThemedText type="default" style={styles.link}>
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
						<ThemedText className="text-xl font-bold mb-4 text-center">
							Confirm Logout?
						</ThemedText>
						{/* <ThemedText className="text-gray-700 mb-4 text-center">
							Are you sure you want to log out? You won’t be able
							to log in or use this application in offline mode.
						</ThemedText> */}
						<View className="flex-row justify-between">
							<TouchableOpacity
								onPress={() => {
									setModalVisible(false); // Close modal
									handleLogout(); // Proceed with logout
								}}
								className="bg-[#aa0202] p-2 rounded-lg flex-1 mr-2"
							>
								<ThemedText className="text-white text-center">
									Yes, Logout
								</ThemedText>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => setModalVisible(false)} // Close modal without action
								className="bg-gray-300 p-2 rounded-lg flex-1 ml-2"
							>
								<ThemedText className="text-black text-center">
									Cancel
								</ThemedText>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
}
const styles = StyleSheet.create({
	link: {
		fontSize: 14,
		color: "#456B72",
		marginVertical: 1,
		marginLeft: 5,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
	},
});
