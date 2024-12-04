import { useUser } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "../ThemedText";
import { Ionicons } from "@expo/vector-icons";
import Logout from "@/app/LogOut";
import { generatePDF } from "@/helper/downloadPdf";
import { Link } from "expo-router";
import TermsAndConditionsModal from "@/app/TermsAndConditionsModal ";
import PrivacyPolicyModal from "@/app/PrivacyPolicyModal";
import { appVersion } from "@/assets/data/data";

type CustomDrawerContentProps = {
	navigation: any; // Adjust to match your type
};

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = ({
	navigation,
}) => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);

	const { user } = useUser(); // Get current user data
	const adminUserId = "user_2pjV2DPELrcWut0yUZMDPX1cTf4"; // Admin user ID

	const downloadCard = () => {
		generatePDF();
	};

	return (
		<View style={styles.container}>
			<TermsAndConditionsModal
				visible={isModalVisible}
				onClose={() => setIsModalVisible(false)}
			/>
			<PrivacyPolicyModal
				visible={isPrivacyModalVisible}
				onClose={() => setIsPrivacyModalVisible(false)}
			/>
			<LinearGradient
				colors={["#456B72", "#5b7e8a", "#3B5A64"]}
				style={styles.header}
			>
				{user && (
					<View style={styles.profileContainer}>
						<Image
							source={{ uri: user.imageUrl }}
							style={styles.profileImage}
						/>
						<ThemedText type="default" style={styles.userName}>
							{user.firstName} {user.lastName}
						</ThemedText>
					</View>
				)}
			</LinearGradient>
			<View style={styles.menuContainer}>
				{/* Show Dashboard Menu Item (Admin Only) */}
				{user?.id === adminUserId && (
					<>
						<TouchableOpacity
							style={styles.menuItem}
							onPress={() => navigation.navigate("dashboard")}
						>
							<Ionicons
								name="grid-sharp"
								size={20}
								color="#456B72"
							/>
							<ThemedText type="default" style={styles.link}>
								Dashboard
							</ThemedText>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.menuItem}
							onPress={() => navigation.navigate("events")}
						>
							<Ionicons name="albums" size={20} color="#456B72" />
							<ThemedText type="default" style={styles.link}>
								Events
							</ThemedText>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.menuItem}
							onPress={() => navigation.navigate("posts")}
						>
							<Ionicons
								name="add-circle"
								size={20}
								color="#456B72"
							/>
							<ThemedText type="default" style={styles.link}>
								Post Events
							</ThemedText>
						</TouchableOpacity>
					</>
				)}
				{/* Only show Home and Profile for non-admin users */}
				{user?.id !== adminUserId && (
					<>
						{/* Home Menu Item */}
						<TouchableOpacity
							style={styles.menuItem}
							onPress={() => navigation.navigate("home")}
						>
							<Ionicons
								name="home-sharp"
								size={20}
								color="#456B72"
							/>
							<ThemedText type="default" style={styles.link}>
								Home
							</ThemedText>
						</TouchableOpacity>
						{/* Profile Menu Item */}
						<TouchableOpacity
							style={styles.menuItem}
							onPress={() => navigation.navigate("profile")}
						>
							<Ionicons
								name="person-sharp"
								size={20}
								color="#456B72"
							/>
							<ThemedText type="default" style={styles.link}>
								Profile
							</ThemedText>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.menuItem}
							onPress={downloadCard}
						>
							<Ionicons
								name="cloud-download-sharp"
								size={20}
								color="#456B72"
							/>
							<ThemedText type="default" style={styles.link}>
								Download Immunization Card
							</ThemedText>
						</TouchableOpacity>
					</>
				)}
				{/* Logout */}
				<Logout />
				<View style={styles.footer}>
					<View style={styles.menuItem}>
						<Ionicons
							name="phone-portrait-sharp"
							size={20}
							color="#456B72"
						/>
						<View style={styles.footerText}>
							<ThemedText type="link" style={styles.footerLink}>
								{appVersion.version}
							</ThemedText>
							<Link
								href={
									"https://drive.google.com/drive/folders/1F2v20pxSYV8LMZ9jGPhawYWSr00CRMwD?usp=sharing"
								}
							>
								<ThemedText
									type="link"
									style={styles.footerLink}
								>
									check for update
								</ThemedText>
							</Link>
						</View>
					</View>
					<View className="flex flex-row justify-center gap-4">
						<TouchableOpacity
							onPress={() => setIsModalVisible(true)}
						>
							<ThemedText type="link" style={styles.footerLink}>
								Terms of Service
							</ThemedText>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setIsPrivacyModalVisible(true)}
						>
							<ThemedText type="link" style={styles.footerLink}>
								Privacy Policy
							</ThemedText>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		height: 300,
		paddingTop: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	profileContainer: {
		alignItems: "center",
	},
	profileImage: {
		width: 60,
		height: 60,
		borderRadius: 50,
		marginBottom: 8,
	},
	userName: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
		textTransform: "capitalize",
	},
	menuContainer: {
		position: "relative",
		margin: 16,
		backgroundColor: "#fff",
		flex: 1,
	},
	link: {
		fontSize: 14,
		color: "#456B72",
		marginVertical: 1,
		marginLeft: 5,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
	},
	activeMenuItem: {
		backgroundColor: "#d0e3e3", // Background color for the active item
		borderRadius: 4, // Optional: adds rounded corners
	},
	footer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
	},
	footerText: {
		marginLeft: 8,
	},
	footerLink: {
		fontSize: 12,
	},
});

export default CustomDrawerContent;
