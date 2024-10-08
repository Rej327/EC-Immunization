import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { circleBg } from "@/assets";

const Appointment = () => {
	const router = useRouter();

	const handleBackPress = () => {
		router.push("/online/(category)/home"); // Navigate to the route passed as a prop
	};

	return (
		<View className="relative bg-[#86b3bc] h-full">
			{/* Back Button */}
			<View className="absolute z-10 top-2 flex flex-row justify-between w-full px-2">
				<TouchableOpacity onPress={handleBackPress}>
					<View className="flex flex-row items-center gap-2">
						<Ionicons name="arrow-back" size={24} color="#456B72" />
						<ThemedText type="navigation">Appointment</ThemedText>
					</View>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => console.log("Opps")}>
					<View className="flex flex-row items-center gap-2">
						<Ionicons
							name="cloud-download"
							size={24}
							color="#456B72"
						/>
						<ThemedText>Download</ThemedText>
					</View>
				</TouchableOpacity>
			</View>

			{/* Background Graphics */}
			<Image
				source={circleBg}
				className="absolute top-0 -right-10 h-52 w-52"
			/>
			<Image
				source={circleBg}
				className="absolute top-40 -left-5 h-32 w-32"
			/>
			<Image
				source={circleBg}
				className="absolute top-56 right-0 h-20 w-20"
			/>
			<Image
				source={circleBg}
				className="absolute top-72 -left-5 h-44 w-44"
			/>
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
