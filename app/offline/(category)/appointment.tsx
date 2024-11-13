import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import OfflineAppointmentBody from "@/components/appointment/OfflineAppointmentBody";

const Appointment = () => {
	const router = useRouter();

	const handleBackPress = () => {
		router.push("/offline/(auth)/home"); // Navigate to the route passed as a prop
	};

	return (
		<View className="relative bg-[#f5f4f7] h-full">
			{/* Back Button */}
			<View className="absolute z-10 w-full px-2 py-4 bg-[#86b3bc]">
				<TouchableOpacity onPress={handleBackPress}>
					<View className="flex flex-row items-center gap-2">
						<Ionicons name="arrow-back" size={24} color="#456B72" />
						<ThemedText type="navigation" className="text-[#456B72]">Appointment</ThemedText>
					</View>
				</TouchableOpacity>

			</View>

			{/* BODY */}
			<OfflineAppointmentBody />
		</View>
	);
};

export default Appointment;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
	},
	contentContainer: {
		backgroundColor: "#f5f4f7",
	},
});


