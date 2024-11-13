import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Timestamp } from "firebase/firestore";
import { OfflineformatExpectedDate } from "./helper";

export interface MilestoneData {
	ageInMonths: number;
	vaccine: string;
	description: string;
	received: boolean;
	expectedDate: Timestamp | Date | string;
	updatedAt: Date;
}

// Utility function to format age
const formatAge = (age: number): string => {
	return `${age} ${age === 1 ? "month" : "months"}`;
};

// Utility function to format date
const formatDate = (date: Timestamp | Date): string => {
	const parsedDate =
		date instanceof Date ? date : new Date(date.seconds * 1000); // Handle Firestore Timestamp
	return parsedDate.toLocaleDateString(); // Format as needed
};

interface BabyDetails {
	firstName: string;
	lastName: string;
}

export const reminderOfflineDownload = async (
	babyDetails: BabyDetails | undefined,
	groupedMilestones: [string, MilestoneData[]][] // Updated type
): Promise<void> => {
	if (!babyDetails || !groupedMilestones) {
		console.error("Missing baby details or grouped milestones.");
		return;
	}

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
					age === "0" ? "At Birth" : `${formatAge(Number(age))}`
				}</div>
                ${vaccines
					.map(
						(vaccine) => `
                      <div class="vaccineData">
                          <p class="list"><span class="bold">Vaccine:</span> ${
								vaccine.vaccine
							}</p>
                          <p class="list"><span class="bold">Expected Date:</span> ${OfflineformatExpectedDate(
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
	try {
		const { uri } = await Print.printToFileAsync({ html: htmlContent });
		console.log("PDF generated at:", uri);

		// Share PDF
		await Sharing.shareAsync(uri);
	} catch (error) {
		console.error("Error generating or sharing PDF:", error);
	}
};
