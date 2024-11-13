import {
	View,
	Image,
	ScrollView,
	ActivityIndicator,
	Modal,
	TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import CustomBody from "@/components/body/CustomBody";
import { guide } from "@/assets";
import { Collapsible } from "@/components/Collapsible";
import { ThemedText } from "@/components/ThemedText";
import {
	healthTipsData,
	vaccinationTips,
	vaccinationGuide,
} from "@/assets/data/data";
import { Link } from "expo-router";
import { FlatList } from "react-native-gesture-handler";
import { guidePdfDownload } from "@/helper/guidePdfDownload";

// Define a type for health tips data
interface HealthTip {
	category: string;
	icon: string;
	tips: string[];
}

// Define a type for vaccination tip
interface VaccinationTip {
	title: string;
	content: string;
}

// Define a type for vaccination guide data
interface Vaccination {
	ageRange: string;
	vaccines: {
		name: string;
		description: string;
		details: string;
	}[];
}

export default function Guide() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<HealthTip[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedVaccination, setSelectedVaccination] =
		useState<Vaccination | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setData(healthTipsData);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleAgeRangePress = (vaccination: Vaccination) => {
		setSelectedVaccination(vaccination);
		setModalVisible(true);
	};

	const closeModal = () => {
		setModalVisible(false);
		setSelectedVaccination(null);
	};

	// Update the type of the item parameter
	const renderTip = ({ item }: { item: VaccinationTip }) => (
		<View className="bg-white p-4 rounded-xl w-80 mr-4 h-auto">
			<Link href="https://www.unilab.com.ph/health-tips/child-vaccination-guide">
				<ThemedText type="link">Children's Health</ThemedText>
			</Link>
			<ThemedText type="cardHeader" className="mt-2">
				{item.title}
			</ThemedText>
			<ThemedText type="default" className="text-justify mt-2">
				{item.content}
			</ThemedText>
		</View>
	);

	const handleDownloadPdf = () => {
		guidePdfDownload(vaccinationGuide, "Baby_Vaccination_Guide");
	};

	return (
		<CustomBody
			backRoute="/online/(auth)/home"
			title="Guide"
			headerImage={guide}
			headerImageStyle="absolute w-80 h-60 mx-auto left-[10%]"
			fileName=""
			onDownloadFunction={handleDownloadPdf}
		>
			{loading ? (
				<View className="flex -mt-10 items-center justify-center h-full">
					<ActivityIndicator size="large" color="#456B72" />
				</View>
			) : (
				<>
					<ScrollView
						showsVerticalScrollIndicator={false}
						className="bg-[#f5f4f7] h-auto rounded-t-2xl px-4"
					>
						<FlatList
							data={vaccinationTips}
							renderItem={renderTip}
							keyExtractor={(item, index) => index.toString()}
							horizontal={true}
							showsHorizontalScrollIndicator={false}
							snapToInterval={320} // Ensure this matches the width of each item
							pagingEnabled={true}
							contentContainerStyle={{ paddingRight: 16 }} // Add padding if needed
							className="mt-4"
						/>
						{/* Add the vaccination guide here */}
						<View className="mt-4">
							<ThemedText type="header" className="mb-2">
								Childhood Immunization Guide
							</ThemedText>
							<View className="rounded-xl overflow-hidden">
								{vaccinationGuide.map((vaccination, index) => (
									<TouchableOpacity
										key={index}
										onPress={() =>
											handleAgeRangePress(vaccination)
										}
									>
										<View className="bg-white p-4 border-b-[1px] border-[#d6d6d6]">
											<ThemedText type="cardHeader">
												{vaccination.ageRange}
											</ThemedText>
										</View>
									</TouchableOpacity>
								))}
							</View>
						</View>
					</ScrollView>

					{/* Modal for vaccination details */}
					<Modal
						visible={modalVisible}
						animationType="fade"
						transparent={true}
					>
						<View className="flex-1 justify-center items-center bg-black/50">
							<View className="bg-white rounded-lg p-4 w-4/5">
								{selectedVaccination && (
									<>
										<ThemedText
											type="cardHeader"
											className="border-b-[1px] pb-3 border-[#d6d6d6] mb-2"
										>
											{selectedVaccination.ageRange}
										</ThemedText>
										{selectedVaccination.vaccines.map(
											(vaccine, index) => (
												<View
													key={index}
													className={`${
														index ===
														selectedVaccination
															.vaccines.length -
															1
															? ""
															: "border-b-[1px] pb-2 mb-2 border-[#d6d6d628]"
													}`}
												>
													<ThemedText
														type="default"
														className="font-bold"
													>
														{vaccine.name}
													</ThemedText>
													<ThemedText
														type="default"
														className="font-bold italic"
													>
														When: {vaccine.details}
													</ThemedText>
													<ThemedText type="default">
														Description:{" "}
														{vaccine.description}
													</ThemedText>
												</View>
											)
										)}
									</>
								)}
								<TouchableOpacity
									onPress={closeModal}
									className="mt-4 bg-[#456B72] rounded-lg p-2"
								>
									<ThemedText
										type="default"
										className="text-white text-center"
									>
										Close
									</ThemedText>
								</TouchableOpacity>
							</View>
						</View>
					</Modal>
				</>
			)}
		</CustomBody>
	);
}
