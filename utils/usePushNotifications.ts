// import * as Notifications from 'expo-notifications';
// import { useEffect, useRef, useState } from 'react';
// import Constants from 'expo-constants';

// export const usePushNotifications = () => {
//   const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
//   const [notification, setNotification] = useState<any>(false);
//   const notificationListener = useRef<any>();
//   const responseListener = useRef<any>();

//   useEffect(() => {
//     // Register for push notifications
//     registerForPushNotificationsAsync().then((token) => {
//       if (token) {
//         setExpoPushToken(token);
//       }
//     });

//     // This listener is fired whenever a notification is received
//     notificationListener.current =
//       Notifications.addNotificationReceivedListener((notification) => {
//         setNotification(notification);
//       });

//     // This listener is fired whenever a user taps on a notification
//     responseListener.current =
//       Notifications.addNotificationResponseReceivedListener((response) => {
//         console.log(response);
//       });

//     return () => {
//       Notifications.removeNotificationSubscription(
//         notificationListener.current
//       );
//       Notifications.removeNotificationSubscription(
//         responseListener.current
//       );
//     };
//   }, []);

//   return { expoPushToken, notification };
// };

// async function registerForPushNotificationsAsync() {
//   let token;
//   if (Constants.isDevice) {
//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       alert('Failed to get push token for push notification!');
//       return;
//     }
//     token = (await Notifications.getExpoPushTokenAsync()).data;
//     console.log(token);
//   } else {
//     alert('Must use physical device for Push Notifications');
//   }

//   return token;
// }
