import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "@/db/firebaseConfig"; // Import your Firestore configuration
import { onSnapshot, collection, query, where, updateDoc, doc } from "firebase/firestore"; // Firestore imports
import { getUserData } from "@/middleware/GetFromLocalStorage";
import { Notification, UserData } from "@/types/types";
import * as Notifications from "expo-notifications";
import { sendPushNotification } from "./sendPushNotification";
export default function ForegroundNotification() {
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [processedNotifications, setProcessedNotifications] = useState<string[]>([]);
  useEffect(() => {
    const getTokenAndUserData = async () => {
      try {
        // Retrieve the Expo push token directly
        const tokenData = await Notifications.getExpoPushTokenAsync();
        if (tokenData) setToken(tokenData.data);
        // Retrieve user data
        const userData = await getUserData();
        if (userData) setUserData(userData);
        console.log("Token:", tokenData.data);
        console.log("User ID:", userData?.id);
        // Load processed notifications from AsyncStorage
        const storedNotifications = await AsyncStorage.getItem("processedNotifications");
        if (storedNotifications) {
          setProcessedNotifications(JSON.parse(storedNotifications));
        }
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    };
    getTokenAndUserData();
  }, []);
  useEffect(() => {
    if (!userData?.id || !token) return;
    // Firestore listener for unread notifications for the current user
    const notificationsRef = collection(db, "notifications");
    const notificationsQuery = query(
      notificationsRef,
      where("receiverId", "==", userData.id),
      where("isRead", "==", false) // Filter for unread notifications only
    );
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const newNotification = change.doc.data() as Notification;
          // Check if this notification was already processed
          if (processedNotifications.includes(change.doc.id)) {
            return; // Skip already processed notification
          }
          console.log("New unread notification:", newNotification);
          // Send push notification for each new document
          sendPushNotification(token, newNotification.subject, newNotification.message);
          // Mark notification as read and add it to processed notifications
          try {
            // await updateDoc(doc(db, "notifications", change.doc.id), {
            //   isRead: true,
            // });
            // Update processed notifications list
            const updatedProcessedNotifications = [...processedNotifications, change.doc.id];
            setProcessedNotifications(updatedProcessedNotifications);
            await AsyncStorage.setItem(
              "processedNotifications",
              JSON.stringify(updatedProcessedNotifications)
            );
          } catch (error) {
            console.error("Error marking notification as read:", error);
          }
        }
      });
    });
    // Clean up the Firestore listener when the component unmounts
    return () => unsubscribe();
  }, [userData?.id, token, processedNotifications]);
  return null;
}