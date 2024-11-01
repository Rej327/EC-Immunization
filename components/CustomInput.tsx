import React from "react";
import { TextInput, StyleSheet, View, Text } from "react-native";

type InputProps = {
	label?: string; // Optional label for the input field
	placeholder: string; // Placeholder text
	value: string; // Input value
	onChangeText: (text: string) => void; // Function to handle input changes
	secureTextEntry?: boolean; // Optional prop to handle password inputs
	autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; // Restrict options to valid values
};

const CustomInput: React.FC<InputProps> = ({
	label,
	placeholder,
	value,
	autoCapitalize = "none",
	onChangeText,
	secureTextEntry = false, // Default to false unless explicitly passed
}) => {
	return (
		<View style={styles.container}>
			{label && <Text style={styles.label}>{label}</Text>}
			<TextInput
				style={styles.input}
				placeholder={placeholder}
				value={value}
				onChangeText={onChangeText}
				autoCapitalize={autoCapitalize}
				secureTextEntry={secureTextEntry}
				// Accessibility props
				accessible={true}
				accessibilityLabel={placeholder} // Use placeholder as accessibility label
				// testID="custom-input" // For testing purposes
			/>
		</View>
	);
};

// Styles
const styles = StyleSheet.create({
	container: {
		marginBottom: 12,
	},
	label: {
		marginBottom: 4,
		color: "#456B72",
		fontWeight: "bold",
	},
	input: {
		backgroundColor: "#DAE9EA",
		padding: 10,
		borderColor: "#86b3bc",
		borderWidth: 1,
		borderRadius: 12,
		fontSize: 16, // Improved font size for better readability
	},
});

CustomInput.defaultProps = {
	secureTextEntry: false,
	autoCapitalize: 'none',
};

export default CustomInput;
