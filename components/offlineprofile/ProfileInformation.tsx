import {
	View,
	TextInput,
	Alert,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomCard from "../CustomCard";
import { ThemedText } from "../ThemedText";
import StyledButton from "../StyledButton";
import Toast from "react-native-toast-message";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/db/firebaseConfig";
import { getUserData } from "@/middleware/GetFromLocalStorage";

export default function ProfileInformation() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(false);
	const [userId, setUserId] = useState(""); // Added state for userId

	// Fetch user data on mount
	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getUserData();
				if (data) {
					setFirstName(data.firstName);
					setLastName(data.lastName);
					setUsername(data.username);
					setUserId(data.id); // Assuming `id` is part of the fetched data
				}
			} catch (error) {
				console.error("Error fetching data: ", error);
				Alert.alert("Error", "Failed to fetch data.");
			}
		};

		fetchData();
	}, []);

	// Function to update user information
	const handleUpdateUser = async () => {
		Toast.show({
			type: "error",
			text2: "No internet connection",
		});
	};

	return (
		<CustomCard>
			<ThemedText type="cardHeader" className="mb-2">
				Profile Information
			</ThemedText>
			<View className="flex justify-between">
				<ThemedText type="default" className="font-bold">
					User ID:
				</ThemedText>
				<TextInput
					value={userId}
					editable={false}
					className="border-[#d6d6d6] my-1 h-10 w-auto p-2 rounded-xl bg-[#ebebeb]"
				/>
				<ThemedText type="default" className="font-bold">
					Username:
				</ThemedText>
				<TextInput
					placeholder="Username"
					onChangeText={setUsername}
					value={username}
					editable={false}
					className="border-[#d6d6d6] my-1 h-10 w-auto p-2 rounded-xl bg-[#ebebeb] mb-2"
				/>
			</View>
			<View className="flex flex-row justify-between">
				<View className="w-[49%]">
					<ThemedText type="default" className="font-bold">
						First name:
					</ThemedText>
					<TextInput
						onChangeText={setFirstName}
						value={firstName}
						placeholder="First name"
						editable={false}
						className="border-[#d6d6d6] my-1 h-10 w-auto p-2 rounded-xl bg-[#ebebeb]"
					/>
				</View>
				<View className="w-[49%]">
					<ThemedText type="default" className="font-bold">
						Last name:
					</ThemedText>
					<TextInput
						onChangeText={setLastName}
						value={lastName}
						placeholder="Last name"
						editable={false}
						className="border-[#d6d6d6] my-1 h-10 w-auto p-2 rounded-xl bg-[#ebebeb] mb-2"
					/>
				</View>
			</View>
			<TouchableOpacity style={styles.button} onPress={handleUpdateUser}>
				<Text style={styles.buttonTxt}>Update User</Text>
			</TouchableOpacity>
		</CustomCard>
	);
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#456B72",
		borderRadius: 12,
		paddingVertical: 10,
		marginTop: 1,
	},

	buttonTxt: {
		fontSize: 14,
		fontWeight: "500",
		color: "#fff",
		textAlign: "center",
	},
});
