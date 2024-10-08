import { View, Text, Image, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Link } from "expo-router";
import StyledButton from "@/components/StyledButton";
import { babyIcon, mainBottom, mainTop } from "@/assets"; // Adjusted to match the barrel export

export default function StartPage() {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 3000); // 3 seconds delay

		// Cleanup the timeout if the component unmounts
		return () => clearTimeout(timer);
	}, []);

	if (loading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<ActivityIndicator size="large" color="#456B72" />
			</View>
		);
	}

	return (
		<View style={{ flex: 1 }}>
			<Image
				source={mainTop}
				style={{
					position: "absolute",
					top: 0,
					width: "100%",
					height: 260,
					resizeMode: "cover",
				}}
			/>

			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					gap: 10,
				}}
			>
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Image
						source={babyIcon}
						style={{ width: 100, height: 100 }}
					/>
					<Text
						style={{
							fontSize: 18,
							color: "#456B72",
							fontWeight: "bold",
						}}
					>
						Know More, Care Better!
					</Text>
					<ActivityIndicator className="mt-4" size="large" color="#456B72" />
				</View>

				<Image
					source={mainBottom}
					style={{
						position: "absolute",
						bottom: 0,
						width: "100%",
						height: 190,
						resizeMode: "cover",
					}}
				/>
			</View>
		</View>
	);
}
