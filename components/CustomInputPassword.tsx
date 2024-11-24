import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

type InputProps = {
  label?: string; // Optional label for the input field
  placeholder: string; // Placeholder text
  value: string; // Input value
  onChangeText: (text: string) => void; // Function to handle input changes
  secureTextEntry?: boolean; // Optional prop to handle password inputs
  autoCapitalize?: "none" | "sentences" | "words" | "characters"; // Restrict options to valid values
  keyboardType?: "default";
};

const CustomInputPassword: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  autoCapitalize = "none",
  onChangeText,
  secureTextEntry = false, // Default to false unless explicitly passed
  keyboardType = "default",
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(!secureTextEntry);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          secureTextEntry={!isPasswordVisible && secureTextEntry}
          keyboardType={keyboardType}
          // Accessibility props
          accessible={true}
          accessibilityLabel={placeholder}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.iconContainer}
            accessibilityLabel={
              isPasswordVisible ? "Hide password" : "Show password"
            }
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#456B72"
            />
          </TouchableOpacity>
        )}
      </View>
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DAE9EA",
    borderColor: "#86b3bc",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: "#333",
  },
  iconContainer: {
    marginLeft: 8,
  },
});

CustomInputPassword.defaultProps = {
  secureTextEntry: false,
  autoCapitalize: "none",
};

export default CustomInputPassword;
