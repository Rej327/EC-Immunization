import { View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import CustomBody from "@/components/body/CustomBody";
import { reminder } from "@/assets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/db/firebaseConfig";
import CustomCard from "@/components/CustomCard";
import { Ionicons } from "@expo/vector-icons";
import { Timestamp } from "firebase/firestore"; // Import Timestamp if using Firestore dates
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

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
	const [loading, setLoading] = useState(false); // Loading state
	const [babyDetails, setBabyDetails] = useState<BabyDetails | null>(null);

	const fetchBabyId = async () => {
		try {
			const babyId = await AsyncStorage.getItem("selectedBabyId");
			if (babyId) {
				setSelectedBabyId(babyId);
				fetchMilestones(babyId);
				fetchBabyDetails(babyId); // Fetch baby details
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
						// birthday: babyData.birthday, // Fetch birthday
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

	useEffect(() => {
		fetchBabyId();
	}, [selectedBabyId]);

	// Group milestones by ageInMonths
	const groupedMilestones = milestones.reduce((acc, milestone) => {
		const age = milestone.ageInMonths;
		if (!acc[age]) {
			acc[age] = [];
		}
		acc[age].push(milestone);
		return acc;
	}, {} as Record<number, MilestoneList[]>);

	// Helper function to format date
	const formatDate = (date: Timestamp | Date) => {
		const jsDate = date instanceof Timestamp ? date.toDate() : date;
		return jsDate.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

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
          
          ${Object.entries(groupedMilestones)
				.map(
					([age, vaccines]) => `
                <div class="card">
                    <div class="header">${
						age === "0" ? "At Birth" : `${age} month's`
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

	return (
		<CustomBody
			backRoute="/online/(auth)/home"
			title="Reminders"
			headerImage={reminder}
			headerImageStyle="absolute w-64 left-[14%] h-64 mx-auto"
			fileName=""
			onDownloadFunction={generatePDF}
		>
			{selectedBabyId == null ? (
				<View className="mx-2 mt-2 flex justify-center items-center">
					<ThemedText type="default">
						No reminders available.
					</ThemedText>
					<ThemedText type="default">
						Register or select first your baby in your profile.
					</ThemedText>
				</View>
			) : loading ? (
				<View className="flex mt-[50%] items-center justify-center">
					<ActivityIndicator size="large" color="#456B72" />
				</View>
			) : (
				<>
					{Object.entries(groupedMilestones).map(
						([age, vaccines]) => (
							<CustomCard key={age}>
								<ThemedText
									type="cardHeader"
									className="border-b-[1px] pb-3 border-[#d6d6d6]"
								>
									{age === "0"
										? "At Birth"
										: `${age} month's`}
								</ThemedText>
								{vaccines.map((vaccine, index) => (
									<View
										key={index}
										className={`mx-2 mt-2  ${
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
						)
					)}
				</>
			)}
		</CustomBody>
	);
}
