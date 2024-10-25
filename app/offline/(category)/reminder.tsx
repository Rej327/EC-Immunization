import {
	View,
	ActivityIndicator,
	Image,
	Alert,
	Modal,
	Text,
	TouchableOpacity,
	StyleSheet,
	Button,
	Pressable,
} from "react-native"; // Import Alert for notifications
import React, { useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import CustomBody from "@/components/body/CustomBody";
import { noData, reminder } from "@/assets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/db/firebaseConfig";
import CustomCard from "@/components/CustomCard";
import { Ionicons } from "@expo/vector-icons";
import { Timestamp } from "firebase/firestore"; // Import Timestamp if using Firestore dates
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Link } from "expo-router";
import {
	formatAge,
	formatDate,
	isTodayOrTomorrow,
	isTodayOrTomorrowOffline,
	OfflineformatExpectedDate,
} from "@/helper/helper";
import {
	getBabiesData,
	getMilestonesDAta,
} from "@/middleware/GetFromLocalStorage";
import { Milestone, MilestoneData } from "@/types/types";

// type MilestoneList = {
// 	ageInMonths: number;
// 	expectedDate: Timestamp | Date; // Allow Firestore Timestamp or JS Date
// 	vaccine: string;
// 	description: string;
// 	received: boolean;
// };

type BabyDetails = {
	firstName: string;
	lastName: string;
	// birthday: Timestamp | Date; // Add birthday field
};

export default function Reminder() {
	const [milestones, setMilestones] = useState<MilestoneData[]>([]);
	const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [babyDetails, setBabyDetails] = useState<BabyDetails | null>(null);
	const [showModal, setShowModal] = useState(false); // Modal visibility state
	const [reminderMessage, setReminderMessage] = useState<string | null>(null); // Store reminder message

	const fetchBabyId = async () => {
		try {
			const babyId = await AsyncStorage.getItem("selectedBabyId");
			if (babyId) {
				setSelectedBabyId(babyId); // This will update the state
				await fetchMilestones(babyId); // Pass the babyId to fetchMilestones
				await fetchBabyDetails(babyId); // Fetch baby details
			}
		} catch (error) {
			console.error("Error fetching baby ID from storage: ", error);
		}
	};

	const fetchBabyDetails = async (babyId: string) => {
		try {
			const babies = await getBabiesData(); // Fetch all babies
			const baby = babies.find((b) => b.id === babyId); // Match the selected babyId
			if (baby) {
				setBabyDetails({
					firstName: baby.firstName,
					lastName: baby.lastName,
				});
			}
		} catch (error) {
			console.error("Error fetching baby details: ", error);
		}
	};

	const fetchMilestones = async (babyId: string) => {
		if (!babyId) return; // Ensure babyId is provided
		setLoading(true); // Start loading spinner
		try {
			const fetchedMilestones: Milestone[] = await getMilestonesDAta(
				babyId
			);

			// Map fetched milestones to MilestoneData
			const milestonesData: MilestoneData[] = fetchedMilestones.flatMap(
				(milestone) =>
					milestone.milestoneData.map((mData) => {
						return {
							ageInMonths: mData.ageInMonths,
							vaccine: mData.vaccine,
							expectedDate: mData.expectedDate, // Ensure this is a Date
							received: mData.received,
							description: mData.description || "", // Default if necessary
							updatedAt: mData.updatedAt, // Make sure this is in the correct format
						};
					})
			);

			// console.log(
			// 	"Dataaa",
			// 	milestonesData.flatMap((data) => data.expectedDate)
			// );

			setMilestones(milestonesData);
			console.log("Fetched milestones:", milestonesData);
		} catch (error) {
			console.error("Error fetching milestones: ", error);
		} finally {
			setLoading(false); // Stop loading spinner
		}
	};

	const alertReminder = () => {
		if (milestones.length > 0) {
			milestones.forEach((milestone) => {
				// Determine the expectedDate type and parse accordingly
				let expectedDate: Date;

				if (milestone.expectedDate instanceof Timestamp) {
					expectedDate = milestone.expectedDate.toDate(); // Convert Timestamp to Date
				} else if (typeof milestone.expectedDate === "string") {
					expectedDate = new Date(milestone.expectedDate); // Convert ISO string to Date
				} else {
					expectedDate = milestone.expectedDate; // It should already be a Date
				}

				// Check if the expectedDate is valid
				if (!isNaN(expectedDate.getTime()) && !milestone.received) {
					const today = new Date();
					const tomorrow = new Date(today);
					tomorrow.setDate(today.getDate() + 1);

					// Check if expectedDate is today or tomorrow
					if (expectedDate.toDateString() === today.toDateString()) {
						const message = `The vaccine ${milestone.vaccine} is due today.`;
						setReminderMessage(message);
						setShowModal(true); // Show the modal
					} else if (
						expectedDate.toDateString() === tomorrow.toDateString()
					) {
						const message = `The vaccine ${milestone.vaccine} is due tomorrow.`;
						setReminderMessage(message);
						setShowModal(true); // Show the modal
					}
				}
			});
		}
	};

	useEffect(() => {
		const fetchDataAndAlert = async () => {
			if (milestones.length > 0) {
				// Wait for some time or any asynchronous operation if necessary
				await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
	
				alertReminder();
			}
		};
	
		fetchDataAndAlert(); // Call the async function
	
		// Optional: cleanup if needed, or any dependencies you want to track
	}, [milestones]);

	useEffect(() => {
		fetchBabyId();
	}, []);

	useEffect(() => {
		if (selectedBabyId) {
			fetchMilestones(selectedBabyId); // Only fetch when babyId is available
		}
	}, [selectedBabyId]);

	// Group milestones by ageInMonths
	const groupedMilestones = Object.entries(
		milestones.reduce((acc, milestone) => {
			const age = milestone.ageInMonths;
			if (!acc[age]) {
				acc[age] = [];
			}
			acc[age].push(milestone);

			return acc;
		}, {} as Record<number, MilestoneData[]>)
	).sort(([ageA], [ageB]) => Number(ageA) - Number(ageB));

	// Generate PDF
	// const generatePDF = async (): Promise<void> => {
	// 	const htmlContent = `
	//     <html>
	//     <head>
	//         <style>
	//             body {
	//                 font-family: Arial, sans-serif;
	//                 margin: 20px;
	//                 padding: 10px;
	//             }
	//             h1 {
	//                 text-align: center;
	//                 margin-bottom: 10px;
	//             }
	//             h3 {
	//                 margin-bottom: 20px;
	//             }
	//             .card {
	//                 border: 1px solid #d6d6d6;
	//                 padding: 15px;
	//                 margin-bottom: 10px;
	//                 border-radius: 5px;
	//             }
	//             .header {
	//                 font-size: 18px;
	//                 font-weight: bold;
	//                 margin-bottom: 10px;
	//             }
	//             .bold {
	//                 font-weight: bold;
	//             }
	//             .vaccineData {
	//                 margin-bottom: 25px;
	//             }
	//             .vaccineData .list {
	//                 line-height: .7;
	//             }
	//         </style>
	//     </head>
	//     <body>
	//         <h1>Baby Vaccination Reminders</h1>
	// 				<h3>Name: ${babyDetails?.firstName} ${babyDetails?.lastName}</h3>

	//         ${Object.entries(groupedMilestones)
	// 			.map(
	// 				([age, vaccines]) => `
	//               <div class="card">
	//                   <div class="header">${
	// 					age === "0" ? "At Birth" : `${age} month's`
	// 				}</div>
	//                   ${vaccines
	// 					.map(
	// 						(vaccine) => `
	//                       <div class="vaccineData">
	//                           <p class="list"><span class="bold">Vaccine:</span> ${
	// 							vaccine.vaccine
	// 						}</p>
	//                           <p class="list"><span class="bold">Expected Date:</span> ${formatDate(
	// 							vaccine.expectedDate
	// 						)}</p>
	//                           <p class="list"><span class="bold">Received:</span> ${
	// 							vaccine.received ? "✅" : "❌"
	// 						}</p>
	//                       </div>
	//                       `
	// 					)
	// 					.join("")}
	//               </div>
	//               `
	// 			)
	// 			.join("")}
	//     </body>
	//     </html>
	//   `;

	// 	// Create PDF
	// 	const { uri } = await Print.printToFileAsync({ html: htmlContent });
	// 	console.log("PDF generated at:", uri);

	// 	// Share PDF
	// 	await Sharing.shareAsync(uri);
	// };

	const ReminderModal = () => (
		<Modal
			animationType="fade"
			transparent={true}
			visible={showModal}
			onRequestClose={() => setShowModal(false)}
		>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContent}>
					<View className="mx-auto mb-2">
						<Ionicons
							name="calendar-outline"
							size={40}
							color={"#456B72"}
						/>
					</View>
					<ThemedText type="cardHeader" style={styles.modalText}>
						{reminderMessage}
					</ThemedText>
					<TouchableOpacity
						style={styles.okButton}
						onPress={() => setShowModal(false)}
					>
						<ThemedText style={styles.okButtonText}>OK</ThemedText>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);

	return (
		<CustomBody
			backRoute="/offline/(auth)/home"
			title="Reminders"
			headerImage={reminder}
			headerImageStyle="absolute w-64 left-[14%] h-64 mx-auto"
			fileName=""
			// onDownloadFunction={generatePDF}
		>
			{showModal && <ReminderModal />}

			<View className="px-5 pb-5">
				{selectedBabyId == null ? (
					<View className="mx-2 mt-[20%] flex justify-center items-center">
						<Image source={noData} className="w-36 h-44 mb-2" />
						<ThemedText type="default" className="text-base">
							No reminders available.
						</ThemedText>

						<ThemedText type="default" className="text-base">
							<ThemedText
								type="link"
								className="text-base underline"
							>
								<Link href={"/online/(auth)/profile"}>
									Register or set{" "}
								</Link>
							</ThemedText>
							first your children in your account.
						</ThemedText>
					</View>
				) : loading ? (
					<View className="flex mt-[50%] items-center justify-center">
						<ActivityIndicator size="large" color="#456B72" />
					</View>
				) : (
					<>
						{groupedMilestones.map(([age, vaccines]) => (
							<CustomCard key={age}>
								<ThemedText
									type="cardHeader"
									className="border-b-[1px] pb-3 border-[#d6d6d6]"
								>
									{formatAge(Number(age))}
								</ThemedText>
								{vaccines.map((vaccine, index) => (
									<View
										key={index}
										className={`mx-2 mt-2 ${
											index !== vaccines.length - 1
												? "border-b-[1px] border-[#d6d6d6] pb-2"
												: ""
										}`}
									>
										<ThemedText type="default">
											<ThemedText
												type="default"
												className="font-bold"
											>
												Vaccine:{" "}
											</ThemedText>
											{vaccine.vaccine}
										</ThemedText>
										<View className="flex flex-row justify-between">
											<ThemedText type="default">
												<ThemedText
													type="default"
													className="font-bold"
												>
													Expected Date:{" "}
												</ThemedText>

												<ThemedText type="default">
													{OfflineformatExpectedDate(
														vaccine.expectedDate
													)}
												</ThemedText>
											</ThemedText>
											{vaccine.received ? (
												<Ionicons
													name="checkmark-circle"
													size={20}
													color="#4CAF50"
												/>
											) : (
												<Ionicons
													name="close-circle"
													size={20}
													color="#F44336"
												/>
											)}
										</View>
									</View>
								))}
							</CustomCard>
						))}
					</>
				)}
			</View>
		</CustomBody>
	);
}

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		// alignItems: 'center',
		width: 300,
		padding: 20,
		backgroundColor: "white",
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center",
		fontSize: 16,
	},
	okButton: {
		backgroundColor: "#456B72",
		padding: 8,
		borderRadius: 5,
		alignItems: "center",
	},
	okButtonText: {
		color: "white",
		fontWeight: "bold",
	},
});
