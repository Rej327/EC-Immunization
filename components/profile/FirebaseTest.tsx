import { db } from "@/db/firebaseConfig";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import CustomCard from "../CustomCard";

// Define a type for the baby data
interface BabyData {
  id: string;
  firstName: string;
  lastName: string;
  birthday: string;
}

export default function FirebaseTest() {
  const [babyInfo, setBabyInfo] = useState<BabyData[]>([]); // Explicit type for baby data array

  useEffect(() => {
    // Fetch baby data from Firestore
    const fetchBabyData = async () => {
      try {
        const babyCollection = collection(db, "babies"); // Correct reference
        const querySnapshot = await getDocs(babyCollection); // Use 'getDocs' to fetch the data
        const babies = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Include document ID
          firstName: doc.data().firstName, // Fetch fields from Firestore doc
          lastName: doc.data().lastName,
          birthday: doc.data().birthday, // Ensure correct field names
        }));
        setBabyInfo(babies); // Update state with baby data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchBabyData(); // Call the async function
  }, []); // Empty dependency array to ensure this runs only once

  return (
    <CustomCard>
      {babyInfo.length > 0 ? ( // Check if babyInfo contains data
        <View>
          <Text>Firebase Data:</Text>
          {babyInfo.map((item) => (
            <Text key={item.id}>{`${item.firstName} ${item.lastName}, Birthday: ${item.birthday}`}</Text>
          ))}
        </View>
      ) : (
        <View>
          <Text>No Data</Text>
        </View>
      )}
    </CustomCard>
  );
}
