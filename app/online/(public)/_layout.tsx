import React from "react";
import { Stack } from "expo-router";

const PublicLayout = () => {
	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: "#87b2bd",
				},
				headerTintColor: "#ff",
				headerBackTitle: "Back",
				statusBarColor: "#86b3bc",
				headerShown: false
			}}
		>
			<Stack.Screen
				name="main"
			/>
			<Stack.Screen
				name="login"
			/>
			<Stack.Screen
				name="register"
			/>
			<Stack.Screen
				name="reset"
			/>
		</Stack>
	);
};

export default PublicLayout;
