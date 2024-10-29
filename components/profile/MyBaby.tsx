import React, { useEffect, useState } from "react";
import {
	View,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Image,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import CustomCard from "@/components/CustomCard";
import StyledButton from "../StyledButton";
import { db } from "@/db/firebaseConfig"; // Import Firestore config
import {
	collection,
	getDocs,
	query,
	where,
	doc,
	getDoc,
} from "firebase/firestore"; // Import Firestore functions
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { noData } from "@/assets";
import { useRouter } from "expo-router";

interface SelectedBaby {
	id: string;
	firstName: string;
	lastName: string;
	birthday: Date;
}

const MyBaby = () => {
	const [babies, setBabies] = useState<SelectedBaby[]>([]);

	const [selectedBaby, setSelectedBaby] = useState<SelectedBaby | null>(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const { user } = useUser();
	const router = useRouter();

	// Load babies from Firestore when the component mounts
	const loadBabies = async () => {
		if (!user?.id) {
			console.log("User ID is not available.");
			return; // Early return if user ID is not present
		}

		try {
			const babiesQuery = query(
				collection(db, "babies"),
				where("parentId", "==", user.id)
			);
			const querySnapshot = await getDocs(babiesQuery);
			const babiesData = querySnapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					firstName: data.firstName,
					lastName: data.lastName,
					birthday:
						data.birthday instanceof Date
							? data.birthday
							: data.birthday.toDate(), // Assuming birthday is stored as a Firestore Timestamp
				} as SelectedBaby; // Cast to Baby type
			});

			setBabies(babiesData);
		} catch (error) {
			console.error("Error fetching babies from Firestore: ", error);
		}
	};

	// Fetch the selected baby using the stored ID in AsyncStorage
	const fetchSelectedBaby = async (id: string) => {
		try {
			const babyRef = doc(db, "babies", id);
			const babySnapshot = await getDoc(babyRef);
			if (babySnapshot.exists()) {
				const data = babySnapshot.data();
				setSelectedBaby({
					id: babySnapshot.id,
					firstName: data.firstName,
					lastName: data.lastName,
					birthday:
						data.birthday instanceof Date
							? data.birthday
							: data.birthday.toDate(),
				});
			} else {
				console.log("No such baby!");
			}
		} catch (error) {
			console.error("Error fetching selected baby data: ", error);
		}
	};

	useEffect(() => {
		loadBabies();
		const loadSelectedBabyId = async () => {
			const existingBabyId = await AsyncStorage.getItem("selectedBabyId");
			if (existingBabyId) {
				await fetchSelectedBaby(existingBabyId);
			}
		};

		loadSelectedBabyId();
	}, [user]); // Add user as a dependency to refetch babies when the user changes

	const handleSelectBaby = async (baby: SelectedBaby) => {
		try {
			setSelectedBaby(baby);
			setShowDropdown(false); // Close dropdown after selection

			// Save the selected baby's ID to local storage
			await AsyncStorage.setItem("selectedBabyId", baby.id);
			console.log(`Saved selected baby ID: ${baby.id}`);
		} catch (error) {
			console.error(
				"Error saving selected baby ID to local storage: ",
				error
			);
		}
	};

	// Corrected the babyInfo function to return JSX
	const babyInfo = (baby: SelectedBaby) => {
		return (
			<View style={styles.babyInfoContainer}>
				<ThemedText type="default">
					{baby.firstName} {baby.lastName}
				</ThemedText>
				<ThemedText type="default">
					{baby.birthday.toLocaleDateString("en-US")}
				</ThemedText>
			</View>
		);
	};

	const handelRouteToRegister = () => {
		router.push("online/(auth)/registerchild");
	};

	return (
		<ScrollView>
			{babies.length > 0 ? (
				<CustomCard className="my-2">
					<ThemedText type="cardHeader" className="mb-2">
						Your Children
					</ThemedText>

					<TouchableOpacity
						onPress={() => setShowDropdown(!showDropdown)} // Toggle dropdown
						style={styles.input}
					>
						<View className="flex flex-row justify-between">
							{selectedBaby ? (
								babyInfo(selectedBaby) // Display the selected baby's info
							) : (
								<ThemedText
									type="default"
									className="font-bold"
								>
									Select your children
								</ThemedText>
							)}
						</View>
					</TouchableOpacity>
					{showDropdown && (
						<View style={styles.dropdown}>
							{babies.map((baby, index) => (
								<TouchableOpacity
									key={index}
									onPress={() => handleSelectBaby(baby)}
									style={styles.dropdownItem}
								>
									<ThemedText type="default">
										{baby.firstName} {baby.lastName}
									</ThemedText>
									<ThemedText type="default">
										{baby.birthday.toLocaleDateString(
											"en-US"
										)}
									</ThemedText>
								</TouchableOpacity>
							))}
						</View>
					)}
					<StyledButton
						title="Register Children"
						onPress={handelRouteToRegister}
						paddingVertical={10}
						fontSize={14}
						borderRadius={12}
						customWeight="500"
					/>
				</CustomCard>
			) : (
				<CustomCard>
					<ThemedText type="cardHeader" className="mb-2">
						My Children
					</ThemedText>
					<View className="mx-auto flex items-center justify-center">
						<Image
							source={noData}
							className="w-16 h-20 mb-2 opacity-40 absolute -top-1"
						/>
					</View>
					<ThemedText type="header" className="text-center">
						No children registered yet!
					</ThemedText>
					<ThemedText type="default" className="text-center mb-2">
						Please register your children to use all features of the
						application.
					</ThemedText>
					<StyledButton
						title="Register Children"
						onPress={handelRouteToRegister}
						paddingVertical={10}
						fontSize={14}
						borderRadius={12}
						customWeight="500"
					/>
				</CustomCard>
			)}
		</ScrollView>
	);
};

export default MyBaby;

const styles = StyleSheet.create({
	input: {
		borderColor: "#d6d6d6",
		borderWidth: 1,
		marginBottom: 10,
		padding: 10,
		borderRadius: 8,
		backgroundColor: "#ebebeb",
	},
	babyInfoContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	dropdown: {
		borderWidth: 1,
		borderColor: "#d6d6d6",
		backgroundColor: "#fff",
		borderRadius: 8,
		marginBottom: 10,
	},
	dropdownItem: {
		display: "flex",
		justifyContent: "space-between",
		flexDirection: "row",
		padding: 10,
		width: "100%",
	},
});
