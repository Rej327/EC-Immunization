import Logout from "@/app/LogOut";
import { babyIcon, botField, topField } from "@/assets";
import CustomHeadFoot from "@/components/CustomHeadFoot";
import CustomInput from "@/components/CustomInput";
import StyledButton from "@/components/StyledButton";
import { ThemedText } from "@/components/ThemedText";
// import TopBg from "@/components/TopBg";
import { useSignIn } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
	View,
	StyleSheet,
	TextInput,
	Button,
	Pressable,
	Text,
	Alert,
	Image,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Toast from "react-native-toast-message";

const Login = () => {
	const { signIn, setActive, isLoaded } = useSignIn();

	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const onSignInPress = async () => {
		if (!isLoaded) {
			return;
		}
		setLoading(true);
		try {
			const completeSignIn = await signIn.create({
				identifier: emailAddress,
				password,
			});

			if (completeSignIn) {
				await AsyncStorage.setItem(
					"userPassword",
					JSON.stringify({ password: password })
				);
			}

			// This indicates the user is signed in
			await setActive({ session: completeSignIn.createdSessionId });

			Toast.show({
				type: "success",
				text1: "Login successful",
				text2: "User is now active.",
			});
		} catch (err: any) {
			Toast.show({
				type: "error",
				text1: "Login Error",
				text2: "Invalid credentials!",
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
						secureTextEntry={true} // Optional for password field
					/>
				</View>
				<StyledButton
					onPress={onSignInPress}
					title="Login"
					borderRadius={12}
				/>
				<View className="flex flex-row-reverse w-full justify-between">
					<Link href="/online/(public)/reset" asChild>
						<Pressable style={styles.button}>
							<ThemedText type="link">
								Forgot password?
							</ThemedText>
						</Pressable>
					</Link>
					<Link href="/online/(public)/main" asChild>
						<Pressable style={styles.button}>
							<ThemedText type="link">Back</ThemedText>
						</Pressable>
					</Link>
				</View>
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
