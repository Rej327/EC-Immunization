import "dotenv/config"; // This will load the .env file

export default {
  expo: {
    name: "VacApp",
    slug: "VacApp",
    icon: "./assets/icon.png", // Add your icon path here
    // plugins: [
    //   [
    //     "expo-notifications",
    //     {
    //       "icon": "./assets/icon(24x24).png", 
    //       "color": "#456B72"
    //     }
    //   ]
    // ],
    
    android: {
      package: "com.yourname.vacapp", // Replace this with your desired Android package name
      permissions: [
        "ACCESS_NETWORK_STATE",
        "INTERNET",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "WAKE_LOCK",
        "USE_FINGERPRINT",
        "com.google.android.c2dm.permission.RECEIVE", // Required for FCM
      ],
    },
    ios: {
      bundleIdentifier: "com.yourname.vacapp", // Replace this with your desired iOS bundle identifier
    },
    // Other Expo config
    extra: {
      clerkPublishableKey: process.env.EXPO_CLERK_PUBLISHABLE_KEY,
      eas: {
        projectId: "e2f7ecb5-e040-4dc6-921d-882adbc36bf6", // Add your EAS project ID here
      },
    },
  },
};
