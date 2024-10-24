import {
	View,
	ActivityIndicator,
	Image,
	Alert,
	Modal,
	Text,
	TouchableOpacity,
	StyleSheet,
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
import { formatAge, formatDate, isTodayOrTomorrow } from "@/helper/helper";

type MilestoneList = {
	ageInMonths: number;
	expectedDate: Timestamp | Date; // Allow Firestore Timestamp or JS Date
	vaccine: string;
	description: string;
	received: boolean;
};

type BabyDetails = {
	firstName: string;
	lastName: string;
	// birthday: Timestamp | Date; // Add birthday field
};

export default function Reminder() {
	const [milestones, setMilestones] = useState<MilestoneList[]>([]);
	const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [babyDetails, setBabyDetails] = useState<BabyDetails | null>(null);
	const [showModal, setShowModal] = useState(false); 
	const [reminderMessage, setReminderMessage] = useState<string | null>(null); 

	const fetchBabyId = async () => {
		try {
			const babyId = await AsyncStorage.getItem("selectedBabyId");
			if (babyId) {
				setSelectedBabyId(babyId);
				await fetchMilestones(babyId);
				await fetchBabyDetails(babyId);
			}
		} catch (error) {
			console.error("Error fetching baby ID from storage: ", error);
		}
	};

	const fetchBabyDetails = async (babyId: string) => {
		const babyRef = query(
			collection(db, "milestones"),
			where("babyId", "==", babyId)
		);
		try {
			const querySnapshot = await getDocs(babyRef);
			querySnapshot.forEach((doc) => {
				const babyData = doc.data();
				if (babyData) {
					setBabyDetails({
						firstName: babyData.firstName,
						lastName: babyData.lastName,
					});
				}
			});
		} catch (error) {
			console.error("Error fetching baby details: ", error);
		}
	};

	const fetchMilestones = async (babyId: string) => {
		setLoading(true); // Start loading spinner
		const milestonesRef = query(
			collection(db, "milestones"),
			where("babyId", "==", babyId)
		);

		try {
			const querySnapshot = await getDocs(milestonesRef);
			const fetchedMilestones: MilestoneList[] = [];

			querySnapshot.docs.forEach((doc) => {
				const milestoneData = doc.data();
				if (milestoneData.milestone) {
					fetchedMilestones.push(...milestoneData.milestone);
				}
			});

			setMilestones(fetchedMilestones);
		} catch (error) {
			console.error("Error fetching milestones: ", error);
		} finally {
			setLoading(false); // Stop loading spinner
		}
	};

	const alertReminder = () => {
		if (milestones.length > 0) {
			milestones.forEach((milestone) => {
				if (
					isTodayOrTomorrow(milestone.expectedDate) &&
					milestone.received === false
				) {
					const today = new Date();
					const expectedDate = new Date();
					const isToday =
						expectedDate.toDateString() === today.toDateString();

					// Set the message based on whether it's today or tomorrow
					const message = isToday
						? `The vaccine ${milestone.vaccine} is due today.`
						: `The vaccine ${milestone.vaccine} is due tomorrow.`;

					setReminderMessage(message);
					setShowModal(true); // Show the modal
				}
			});
		}
	};

	// UseEffect to handle alertReminder
	useEffect(() => {
		if (milestones.length > 0) {
			alertReminder();
		}
	}, [milestones]);

	useEffect(() => {
		fetchBabyId();
	}, []);

	// Group milestones by ageInMonths
	const groupedMilestones = Object.entries(
		milestones.reduce((acc, milestone) => {
			const age = milestone.ageInMonths;
			if (!acc[age]) {
				acc[age] = [];
			}
			acc[age].push(milestone);

			return acc;
		}, {} as Record<number, MilestoneList[]>)
	).sort(([ageA], [ageB]) => Number(ageA) - Number(ageB));

	// Generate PDF
	const generatePDF = async (): Promise<void> => {
		const htmlContent = `
      <html>
      <head>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  padding: 10px; 
              }
              h1 {
                  text-align: center; 
                  margin-bottom: 10px; 
              }
              h3 {
                  margin-bottom: 20px; 
              }
              .card { 
                  border: 1px solid #d6d6d6; 
                  padding: 15px; 
                  margin-bottom: 10px; 
                  border-radius: 5px; 
              }
              .header { 
                  font-size: 18px; 
                  font-weight: bold; 
                  margin-bottom: 10px; 
              }
              .bold { 
                  font-weight: bold; 
              }
              .vaccineData {
                  margin-bottom: 25px;
              }
              .vaccineData .list {
                  line-height: .7;
              }
          </style>
      </head>
      <body>
          <h1>Baby Vaccination Reminders</h1>
					<h3>Name: ${babyDetails?.firstName} ${babyDetails?.lastName}</h3>
          
          ${groupedMilestones
				.map(
					([age, vaccines]) => `
                <div class="card">
                    <div class="header">${
						age === "0"
							? "At Birth"
							: `${formatAge(Number(age))} month's`
					}</div>
                    ${vaccines
						.map(
							(vaccine) => `
                        <div class="vaccineData">
                            <p class="list"><span class="bold">Vaccine:</span> ${
								vaccine.vaccine
							}</p>
                            <p class="list"><span class="bold">Expected Date:</span> ${formatDate(
								vaccine.expectedDate
							)}</p>
                            <p class="list"><span class="bold">Received:</span> ${
								vaccine.received ? "✅" : "❌"
							}</p>
                        </div>
                        `
						)
						.join("")}
                </div>
                `
				)
				.join("")}
      </body>
      </html>
    `;

		// Create PDF
		const { uri } = await Print.printToFileAsync({ html: htmlContent });
		console.log("PDF generated at:", uri);

		// Share PDF
		await Sharing.shareAsync(uri);
	};

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
			backRoute="/online/(auth)/home"
			title="Reminders"
			headerImage={reminder}
			headerImageStyle="absolute w-64 left-[14%] h-64 mx-auto"
			fileName=""
			onDownloadFunction={generatePDF}
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
												{formatDate(
													vaccine.expectedDate
												)}
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
