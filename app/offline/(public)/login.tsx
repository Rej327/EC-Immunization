import { babyIcon } from "@/assets";
import CustomHeadFoot from "@/components/CustomHeadFoot";
import CustomInput from "@/components/CustomInput";
import StyledButton from "@/components/StyledButton";
import { ThemedText } from "@/components/ThemedText";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const Login = () => {
	const [emailAddress, setEmailAddress] = useState("patrick0");
	const [password, setPassword] = useState("asdasdasd");
	const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(false);

	const router = useRouter();

	const onSignInPress = async () => {
		try {
			setLoading(true);

			// Retrieve userData from AsyncStorage
			const userDataJson = await AsyncStorage.getItem("users");
			const userPasswordJson = await AsyncStorage.getItem("userPassword");

			if (userDataJson && userPasswordJson) {
				const userData = JSON.parse(userDataJson);
				const userPassword = JSON.parse(userPasswordJson);

				// Check if the entered email/username and password match the stored user data
				if (
					(userData.email === emailAddress.trim() ||
						userData.username === emailAddress.trim()) && // Trim to avoid whitespace issues
					userPassword.password === password
				) {
					// Update the isActive field to true
					const updatedUserData = {
						...userData,
						isActive: true, // Set user as active
					};

					// Save the updated userData back to AsyncStorage
					await AsyncStorage.setItem(
						"userData",
						JSON.stringify(updatedUserData)
					);

					// Show success toast
					Toast.show({
						type: "success",
						text1: "Login successful",
						text2: "User is now active.",
					});

					router.replace("/offline/(auth)/home");
				} else {
					// Show error toast
					Toast.show({
						type: "error",
						text1: "Login Error",
						text2: "Invalid credentials!",
					});
				}
			} else {
				// Show error toast
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Invalid credentials!",
				});
			}
		} catch (error) {
			console.error("Login error:", error);
			// Show error toast
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "An error occurred during login.",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<CustomHeadFoot />
			<View style={styles.container}>
				<Spinner color="#456B72" visible={loading} />

				<View style={{ alignItems: "center" }}>
					<Image
						source={babyIcon}
						style={{ width: 75, height: 75 }}
					/>
				</View>
				<View>
					<ThemedText type="title" className="my-4">
						Sign in
					</ThemedText>
					<CustomInput
						label="Email or Username"
						placeholder="Enter your email or username"
						value={emailAddress}
						onChangeText={setEmailAddress}
					/>
					<CustomInput
						label="Password"
						placeholder="Enter your password"
						value={password}
						onChangeText={setPassword}
						secureTextEntry={true}
					/>
				</View>
				<StyledButton
					onPress={onSignInPress}
					title="Login"
					borderRadius={12}
				/>
				<Link href="/offline/(public)/main" asChild>
					<Pressable style={styles.button}>
						<ThemedText type="link">Back</ThemedText>
					</Pressable>
				</Link>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
	},
	button: {
		margin: 8,
		alignItems: "center",
	},
});

export default Login;
