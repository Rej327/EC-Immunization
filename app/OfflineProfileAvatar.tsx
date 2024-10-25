import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { getUserData } from "@/middleware/GetFromLocalStorage"; // Fetching from AsyncStorage
import { UserData } from "@/types/types"; // Assuming this is your UserData interface
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function OfflineProfileAvatar() {
	const [data, setData] = useState<UserData | null>(null); // State is UserData or null

	useEffect(() => {
		const fetchData = async () => {
			try {
				const userData = await getUserData();
				setData(userData);
			} catch (error) {
				console.error("Error fetching data: ", error);
			}
		};

		fetchData();
	}, []);

	if (!data) {
		return (
			<LinearGradient
				colors={["#456A73", "#7bbeaa", "#304b52"]}
				start={{ x: 1, y: 0 }}
				end={{ x: 0, y: 3 }}
				style={styles.avatarContainer}
			>
				<Ionicons name="person-outline" size={20} color={"#2b4a5f"} />
			</LinearGradient>
		);
	}

	const getInitials = (firstName: string, lastName: string): string => {
		const firstInitial = firstName ? firstName.charAt(0) : "";
		const lastInitial = lastName ? lastName.charAt(0) : "";
		return `${firstInitial}${lastInitial}`.toUpperCase();
	};

	const initials = getInitials(data?.firstName ?? "", data?.lastName ?? "");

	return (
		<View>
			<LinearGradient
				colors={["#456A73", "#7bbeaa", "#304b52"]}
				start={{ x: 1, y: 0 }}
				end={{ x: 0, y: 3 }}
				style={styles.avatarContainer}
			>
				<Text style={styles.avatarText}>{initials}</Text>
			</LinearGradient>
		</View>
	);
}

const styles = StyleSheet.create({
	avatarContainer: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 20,
	},
	avatarText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: 'semibold',
	},
	placeholder: {
		width: 32,
		height: 32,
		justifyContent: "center",
		alignItems: "center",
	},
});
