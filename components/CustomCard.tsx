import React from "react";
import { View, StyleSheet } from "react-native";

interface CustomCardProps {
	children: React.ReactNode;
	className?: string;
}

const CustomCard: React.FC<CustomCardProps> = ({ children, className }) => {
	return (
		<View style={styles.content} className={className}>
			<View style={styles.card}>{children}</View>
		</View>
	);
};

const styles = StyleSheet.create({
	content: {
		// paddingHorizontal: 16,
		marginVertical: 2
	},
	card: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#d6d6d6",
		backgroundColor: "white",
		padding: 16,
	},
});

export default CustomCard;
