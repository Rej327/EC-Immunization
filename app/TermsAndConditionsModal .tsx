import { termsAndConditions } from "@/assets/data/data";
import React from "react";
import {
	Modal,
	View,
	Text,
	Button,
	StyleSheet,
	ScrollView,
} from "react-native";

const TermsAndConditionsModal = ({
	visible,
	onClose,
}: {
	visible: boolean;
	onClose: () => void;
}) => {
	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContainer}>
					<ScrollView>
						<Text style={styles.modalTitle}>
							Terms and Conditions
						</Text>

						{/* Render Terms and Conditions dynamically */}
						{termsAndConditions.map((item, index) => (
							<View key={index} style={styles.section}>
								<Text style={styles.sectionTitle}>
									{item.title}
								</Text>
								<Text style={styles.sectionContent}>
									{item.content}
								</Text>
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
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	section: {
		marginBottom: 10,
	},
	sectionTitle: {
		fontWeight: "bold",
		fontSize: 18,
	},
	sectionContent: {
		fontSize: 16,
		marginBottom: 5,
	},
});

export default TermsAndConditionsModal;
