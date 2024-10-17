import {
	View,
	Text,
	StatusBar,
	ScrollView,
	RefreshControl,
	Image,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";
import {
	appointmentIcon,
	circleIcon,
	guideIcon,
	healthIcon,
	hearthIcon,
	nonagonIcon,
	reminderIcon,
	starIcon,
	vaccine,
} from "@/assets";
import { ThemedText } from "@/components/ThemedText";
import CategoryCard from "@/components/CategoryCard";
import CustomBottomSheet from "@/components/CustomBottomSheet";
import { events, milestones } from "@/assets/data/data";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/db/firebaseConfig";

interface UserData {
	id: string;
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	isActive: boolean;
}

const Home = () => {
	const { user } = useUser();
	const [storedUserData, setStoredUserData] = useState<UserData | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [openBottomSheet, setOpenBottomSheet] = useState<string | null>(null);

	const saveUserDataToLocalStorage = async () => {
		if (user) {
			try {
				const userData: UserData = {
					id: user.id,
					email: user.emailAddresses?.[0]?.emailAddress || "",
					username: user.username || "",
					firstName: user.firstName || "",
					lastName: user.lastName || "",
					isActive: false,
				};

				await AsyncStorage.setItem(
					"userData",
					JSON.stringify(userData)
				);
			} catch (error) {
				console.error(
					"Failed to save user data to local storage:",
					error
				);
			}
		}
	};

	const retrieveUserDataFromLocalStorage = async () => {
		try {
			const retrievedData = await AsyncStorage.getItem("userData");
			if (retrievedData !== null) {
				setStoredUserData(JSON.parse(retrievedData) as UserData);
			}
		} catch (error) {
			console.error(
				"Failed to retrieve user data from local storage:",
				error
			);
		}
	};

	const saveUserToParents = async () => {
		if (user) {
			const userId = user.id;

			// Reference to the user's document in the 'parents' collection
			const userDocRef = doc(db, "parents", userId);

			// Check if the user already exists in the 'parents' collection
			const userDoc = await getDoc(userDocRef);

			if (!userDoc.exists()) {
				// User doesn't exist, save the user data
				await setDoc(userDocRef, {
					// id: userId,
					email: user.emailAddresses?.[0]?.emailAddress || "",
					username: user.username || "",
					firstName: user.firstName || "",
					lastName: user.lastName || "",
				});
				console.log("User saved to parents collection");
			} else {
				console.log("User already exists in parents collection");
			}
		}
	};

	useEffect(() => {
		saveUserToParents();
		saveUserDataToLocalStorage();
		retrieveUserDataFromLocalStorage();
	}, [user]);

	const onRefresh = async () => {
		setRefreshing(true);
		await AsyncStorage.removeItem("userData");
		await saveUserDataToLocalStorage();
		await retrieveUserDataFromLocalStorage();
		setRefreshing(false);
	};

	const closeBottomSheet = useCallback(() => {
		setOpenBottomSheet(null);
	}, []);

	const openBottomSheetHandler = (type: string) => {
		setOpenBottomSheet(type);
	};

	const getViewAllStyle = (index: number, totalItems: number) => {
		return {
			backgroundColor: "white",
			padding: 16,
			borderBottomWidth: index === totalItems - 1 ? 0 : 1, // No border for the last item
			borderTopWidth: index === 0 ? 1 : 0, // Border for the first item
			borderColor: "#d6d6d6",
			marginBottom: 8,
		};
	};

	return (
		<View style={{ flex: 1, backgroundColor: '#f5f4f7' }}>
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={["#456B72"]}
					/>
				}
				className="px-4"
				scrollEnabled={!openBottomSheet} // Disable scrolling when bottom sheet is open
			>
				{/* HERO IMAGE */}
				<View style={styles.imageContainer}>
					<Image
						source={vaccine}
						style={styles.image}
						resizeMode="cover"
					/>
				</View>

				{/* CATEGORY SECTION */}
				<View>
					<ThemedText type="header">Category</ThemedText>
					<View style={styles.categoryContainer}>
						<CategoryCard
							link="/online/(category)/health"
							icon={healthIcon}
							title="HEALTH TIPS"
							backgroundColor="#5ad5fa66"
							shapeIcon={hearthIcon}
							shapePosition={{ top: 0, left: 0 }}
						/>
						<CategoryCard
							link="/online/(category)/guide"
							icon={guideIcon}
							title="GUIDE"
							backgroundColor="#5a92fa66"
							shapeIcon={nonagonIcon}
							shapePosition={{ bottom: 0, left: 0 }}
						/>
						<CategoryCard
							link="/online/(category)/reminder"
							icon={reminderIcon}
							title="REMINDERS"
							backgroundColor="#ecff8253"
							shapeIcon={starIcon}
							shapePosition={{ top: 2, right: 0 }}
						/>
						<CategoryCard
							link="/online/(category)/appointment"
							icon={appointmentIcon}
							title="APPOINTMENT"
							backgroundColor="#82ffc555"
							shapeIcon={circleIcon}
							shapePosition={{ bottom: 10, right: 10 }}
						/>
					</View>
				</View>


				{/* EVENTS SECTION */}
				<View>
					<View style={styles.header}>
						<ThemedText type="header">Events</ThemedText>
						<TouchableOpacity
							onPress={() => openBottomSheetHandler("event")}
						>
							<ThemedText type="link">View all</ThemedText>
						</TouchableOpacity>
					</View>
					<View style={styles.card}>
						<ThemedText type="cardHeader">Lorem, ipsum.</ThemedText>
						<ThemedText type="default">
							Lorem ipsum dolor sit amet consectetur adipisicing
							elit. Perspiciatis, commodi.
						</ThemedText>
						<ThemedText type="date" style={styles.date}>
							01/25/2024
						</ThemedText>
					</View>
				</View>
			</ScrollView>

			{/* Overlay to prevent interaction with outer components */}
			{openBottomSheet && <View style={styles.overlay} />}

			{/* CUSTOM BOTTOM SHEET FOR EVENTS */}
			<CustomBottomSheet
				isOpen={openBottomSheet === "event"}
				onClose={closeBottomSheet}
				title="Events"
			>
				{events.map((event, index) => (
					<View
						key={index}
						style={getViewAllStyle(index, events.length)}
					>
						<ThemedText type="cardHeader">
							{event.header}
						</ThemedText>
						<ThemedText type="default">
							{event.description}
						</ThemedText>
						<ThemedText type="date">{event.date}</ThemedText>
					</View>
				))}
			</CustomBottomSheet>
		</View>
	);
};

export default Home;

const styles = StyleSheet.create({
	imageContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 2,
	},
	image: {
		width: "100%",
		height: 200,
		borderRadius: 10,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	categoryContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
	},
	card: {
		backgroundColor: "white",
		padding: 16,
		borderWidth: 1,
		borderRadius: 10,
		borderColor: "#d6d6d6",
		marginBottom: 8,
	},
	viewAll: {
		backgroundColor: "white",
		padding: 16,
		borderBottomWidth: 1,
		borderColor: "#d6d6d6",
		marginBottom: 8,
	},
	date: {
		color: "#757575",
		fontSize: 12,
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent overlay
	},
});
