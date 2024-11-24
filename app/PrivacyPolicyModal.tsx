import { privacyAndPolicy } from "@/assets/data/data";
import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import {
	View,
	Text,
	Modal,
	Pressable,
	StyleSheet,
	ScrollView,
	Button,
} from "react-native";

const PrivacyPolicyModal = ({
	visible,
	onClose,
}: {
	visible: boolean;
	onClose: () => void;
}) => {
	const [modalVisible, setModalVisible] = useState(false);

	return (
		<View style={styles.container}>
			{/* Modal */}
			<Modal
				animationType="fade"
				transparent={true}
				visible={visible}
				onRequestClose={onClose}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<ThemedText style={styles.modalTitle}>
							Privacy Policy
						</ThemedText>

						<ScrollView>
							{privacyAndPolicy.map((item, index) => (
								<View key={index} style={styles.section}>
									<ThemedText style={styles.sectionTitle}>
										{item.title}
									</ThemedText>
									<ThemedText style={styles.sectionContent}>
										{item.content}
									</ThemedText>
								</View>
							))}
							<Button
								title="Close"
								onPress={onClose}
								color="#456B72"
							/>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 10,
	},
	triggerButton: {
		backgroundColor: "#86b3bc",
		padding: 10,
		borderRadius: 8,
	},
	triggerText: {
		color: "#fff",
		fontWeight: "bold",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
    paddingVertical: 20,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		width: "90%",
		backgroundColor: "white",
		padding: 20,
		marginVertical: 20,
		borderRadius: 10,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
		// color: "#456B72",
		textAlign: "center",
	},
	section: {
		marginBottom: 15,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "bold",
		// color: "#86b3bc",
	},
	sectionContent: {
		fontSize: 14,
		color: "#333",
		marginTop: 5,
	},
	closeButton: {
		backgroundColor: "#456B72",
		padding: 10,
		borderRadius: 8,
		alignSelf: "center",
		marginTop: 15,
	},
	closeButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
});

export default PrivacyPolicyModal;
