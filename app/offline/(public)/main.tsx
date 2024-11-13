import { View, Text, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
import StyledButton from "@/components/StyledButton";
import { babyIcon, mainBottom, mainTop } from "@/assets"; // Adjusted to match the barrel export

export default function Main() {
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
					paddingBottom: 50,
					gap: 10,
				}}
			>
				<View style={{ marginBottom: 10, alignItems: "center" }}>
					<Image
						source={babyIcon}
						style={{ width: 100, height: 100 }}
					/>
					{/* <Text
						style={{
							fontSize: 18,
							color: "#456B72",
							fontWeight: "bold",
						}}
					>
						Know More, Care Better!
					</Text> */}
						<Text
						style={{
							fontSize: 18,
							color: "#456B72",
							fontWeight: "bold",
						}}
					>
						Easy Childhood Immunization App
					</Text>
				</View>
				<Link href="/offline/(public)/login" asChild>
					<StyledButton
						onPress={() => console.log("Go to Login")}
						title="Login"
						textColor="white"
						width="50%"
					/>
				</Link>
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
