import { View, StyleSheet, TextInput, Button, Image, Pressable } from "react-native";
import React, { useState } from "react";
import { Link, Stack } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import CustomInput from "@/components/CustomInput";
import StyledButton from "@/components/StyledButton";
import CustomHeadFoot from "@/components/CustomHeadFoot";
import { babyIcon } from "@/assets";
import { ThemedText } from "@/components/ThemedText";

const PwReset = () => {
	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");
	const [successfulCreation, setSuccessfulCreation] = useState(false);
	const { signIn, setActive } = useSignIn();

	// Request a passowrd reset code by email
	const onRequestReset = async () => {
		try {
			await signIn?.create({
				strategy: "reset_password_email_code",
				identifier: emailAddress,
			});
			setSuccessfulCreation(true);
		} catch (err: any) {
			alert(err.errors[0].message);
		}
	};

	// Reset the password with the code and the new password
	const onReset = async () => {
		try {
			const result = await signIn?.attemptFirstFactor({
				strategy: "reset_password_email_code",
				code,
				password,
			});

			if (result?.createdSessionId) {
				// Set the user session active, which will log in the user automatically
				if (setActive) {
					await setActive({ session: result.createdSessionId });
				}
				alert("Password reset successfully");
			} else {
				throw new Error("Session ID not created");
			}
		} catch (err: any) {
			alert(err.errors?.[0]?.message || err.message);
		}
	};

	return (
		<>
			<CustomHeadFoot />
			<View style={styles.container}>
				<Stack.Screen
					options={{ headerBackVisible: !successfulCreation }}
				/>

				<View className="flex items-center my-4">
					<Image
						source={babyIcon}
						style={{ width: 75, height: 75 }}
					/>
				</View>

				{!successfulCreation && (
					<>
						<CustomInput
							label="Verify email Address"
							placeholder="Enter your Email Address"
							value={emailAddress}
							onChangeText={setEmailAddress}
						/>

						<StyledButton onPress={onRequestReset} title="Submit" />
            <Link href="/online/(public)/login" asChild>
							<Pressable>
								<ThemedText className="text-center" type="link">
									Cancel
								</ThemedText>
							</Pressable>
						</Link>
					</>
				)}

				{successfulCreation && (
					<>
						<View>
							<CustomInput
              label="Verify Code"
								value={code}
								placeholder="Enter your code"
								onChangeText={setCode}
							/>
							<CustomInput
              label="New Password"
								placeholder="Enter your new password"
								value={password}
								onChangeText={setPassword}
								secureTextEntry
							/>
						</View>
						<StyledButton
							onPress={onReset}
							title="Submit"
						/>
             <Link href="/online/(public)/reset" asChild>
							<Pressable>
								<ThemedText className="text-center" type="link">
									Cancel
								</ThemedText>
							</Pressable>
						</Link>
					</>
				)}
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
	inputField: {
		marginVertical: 4,
		height: 50,
		borderWidth: 1,
		borderColor: "#6c47ff",
		borderRadius: 4,
		padding: 10,
		backgroundColor: "#fff",
	},
	button: {
		margin: 8,
		alignItems: "center",
	},
});

export default PwReset;
