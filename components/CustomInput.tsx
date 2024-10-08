import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';

type InputProps = {
  label?: string;           // Optional label for the input field
  placeholder: string;      // Placeholder text
  value: string;            // Input value
  onChangeText: (text: string) => void; // Function to handle input changes
  secureTextEntry?: boolean; // Optional prop to handle password inputs
};

const CustomInput: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,  // Default to false unless explicitly passed
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}  
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    color: '#456B72',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#DAE9EA',
    padding: 10,
    borderColor: '#86b3bc',
    borderWidth: 1,
    borderRadius: 12,
  },
});

export default CustomInput;
