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
						style={{ width: 100, height: 100, marginBottom: 5 }}
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
						Early Childhood Immunization App
					</Text>
				</View>

				<Link href="/online/(public)/login" asChild>
					<StyledButton
						onPress={() => console.log("Go to Login")}
						title="Login"
						textColor="white"
						width="50%"
					/>
				</Link>

				<Link href="/online/(public)/register" asChild>
					<StyledButton
						onPress={() => console.log("Go To Register")}
						title="Register"
						bgColor="#DAE9EA"
						textColor="#456B72"
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
