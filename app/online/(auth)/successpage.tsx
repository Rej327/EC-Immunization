import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useFocusEffect } from "@react-navigation/native";

export default function Success() {
	const router = useRouter();
	const [countdown, setCountdown] = useState(5);

	// Start countdown and redirection when the screen is focused
	useFocusEffect(
		React.useCallback(() => {
			setCountdown(5); // Reset countdown when the screen is focused

			const interval = setInterval(() => {
				setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
			}, 1000);

			const timeout = setTimeout(() => {
				router.push("/online/(auth)/profile");
			}, 5000);

			// Cleanup on unmount
			return () => {
				clearInterval(interval);
				clearTimeout(timeout);
			};
		}, [router]) // Add router as a dependency
	);

	return (
		<View style={styles.container}>
			<Ionicons name="checkmark-circle" size={80} color="green" />
			<ThemedText type="default" style={styles.title}>
				Registration Successful!
			</ThemedText>
			<ThemedText type="default" style={styles.message}>
				Redirecting to Profile Screen in {countdown} seconds...
			</ThemedText>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginVertical: 10,
	},
	message: {
		fontSize: 16,
		textAlign: "center",
		color: "#666",
		marginTop: 10,
	},
});
