import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '@/db/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreatePost() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState('announcement');

  const handlePost = async () => {
    if (!subject || !description) {
      Alert.alert('Error', 'Subject and description are required.');
      return;
    }

    try {
      const newPost = {
        subject,
        description,
        date: date ? Timestamp.fromDate(date) : null,
        createdAt: Timestamp.now(),
        type,
      };

      await addDoc(collection(db, 'feeds'), newPost);
      Alert.alert('Success', 'Post created successfully!');

      // Reset form fields after successful post
      setSubject('');
      setDescription('');
      setDate(null);
      setType('announcement');
    } catch (error) {
      console.error("Error posting data:", error);
      Alert.alert('Error', 'Failed to create post.');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Subject *</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder="Enter subject"
        autoFocus
      />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
      />

      <Text style={styles.label}>Date (optional)</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>
          {date ? date.toLocaleDateString() : 'Select Date'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Type</Text>
      <Picker
        selectedValue={type}
        onValueChange={(itemValue) => setType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Announcement" value="announcement" />
        <Picker.Item label="Notice" value="notice" />
        <Picker.Item label="Tips" value="tips" />
      </Picker>

      <Button title="Post" onPress={handlePost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    marginVertical: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    marginVertical: 8,
  },
  dateButton: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 8,
  },
  dateText: {
    color: '#555',
  },
});
