import { View, Image, ScrollView, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react"; // Import useState and useEffect
import CustomBody from "@/components/body/CustomBody";
import { healthTips } from "@/assets"; // Assuming healthTips is your JSON array
import { Collapsible } from "@/components/Collapsible";
import { ThemedText } from "@/components/ThemedText";
import { healthTipsData } from "@/assets/data/data";

// Define a type for health tips data
interface HealthTip {
	category: string;
	icon: string;
	tips: string[];
}

export default function Health() {
	const [loading, setLoading] = useState(true); // State to manage loading
	const [data, setData] = useState<HealthTip[]>([]); // State to hold health tips data

	useEffect(() => {
		const fetchData = async () => {
			// Simulate a data fetching process
			try {
				// You can replace this with your actual data fetching logic
				setData(healthTipsData); // Set your data here
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false); // Set loading to false after data fetching
			}
		};

		fetchData();
	}, []); // Empty dependency array to run effect only once

	return (
		<CustomBody
			backRoute="/online/(auth)/home"
			title="Health"
			headerImage={healthTips}
			headerImageStyle="absolute w-72 h-72 mx-auto left-[15%]"
			fileName="Baby Health Tips.pdf"
			url="https://drive.google.com/uc?export=download&id=1qBQb_IPfNDtu7SX8Q1yoF1YJLO96tlmD"
		>
			{loading ? ( // Conditional rendering based on loading state
				<View className="flex -mt-10 items-center justify-center h-full">
					<ActivityIndicator size="large" color="#456B72" />
				</View>
			) : (
				<>
					<ScrollView className="rounded-t-2xl p-5">
						<View className="rounded-xl overflow-hidden">
							{data.map((item, index) => (
								<Collapsible
									key={index}
									title={item.category}
									icon={item.icon}
									isLast={index === data.length - 1}
								>
									{item.tips.map((tip, tipIndex) => (
										<ThemedText
											key={tipIndex}
											className="mb-2 text-justify pr-6"
										>
											{tip}
										</ThemedText>
									))}
								</Collapsible>
							))}
						</View>
					</ScrollView>
				</>
			)}
		</CustomBody>
	);
}
