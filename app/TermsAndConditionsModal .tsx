import { termsAndConditions } from "@/assets/data/data";
import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Modal, View, Button, StyleSheet, ScrollView } from "react-native";

const TermsAndConditionsModal = ({
	visible,
	onClose,
}: {
	visible: boolean;
	onClose: () => void;
}) => {
	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContainer}>
					<ThemedText style={styles.modalTitle}>
						Terms of Service
					</ThemedText>
					<ScrollView>
						{/* Render Terms and Conditions dynamically */}
						{termsAndConditions.map((item, index) => (
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
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContainer: {
		width: "90%",
		backgroundColor: "white",
		padding: 20,
		marginVertical: 20,
		borderRadius: 10,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	section: {
		marginBottom: 10,
	},
	sectionTitle: {
		fontWeight: "bold",
		fontSize: 16,
	},
	sectionContent: {
		fontSize: 14,
		marginBottom: 5,
	},
});

export default TermsAndConditionsModal;
