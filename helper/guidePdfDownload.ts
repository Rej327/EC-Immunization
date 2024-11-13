// guidePdfOnline.ts
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

// Define Vaccination type if needed
interface Vaccination {
    ageRange: string;
    vaccines: {
        name: string;
        description: string;
        details: string;
    }[];
}

export async function guidePdfDownload(vaccinationGuide: Vaccination[], filename: string) {
    try {
        // Generate HTML content for the PDF
        const htmlContent = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { color: #456B72; text-align: center; }
                        .age-range { font-weight: bold; font-size: 18px; margin-top: 20px; }
                        .vaccine { margin-top: 10px; }
                        .vaccine-name { font-weight: bold; }
                        .vaccine-detail, .vaccine-description { margin-left: 10px; }
                    </style>
                </head>
                <body>
                    <h2>Childhood Immunization Guide</h2>
                    ${vaccinationGuide
                        .map(
                            (vaccination) => `
                                <div class="age-range">${vaccination.ageRange}</div>
                                ${vaccination.vaccines
                                    .map(
                                        (vaccine) => `
                                            <div class="vaccine">
                                                <div class="vaccine-name">${vaccine.name}</div>
                                                <div class="vaccine-detail"><strong>When:</strong> ${vaccine.details}</div>
                                                <div class="vaccine-description"><strong>Description:</strong> ${vaccine.description}</div>
                                            </div>
                                        `
                                    )
                                    .join("")}
                            `
                        )
                        .join("")}
                </body>
            </html>
        `;

        // Print to PDF and get URI
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        
        // Share the generated PDF if available
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `${filename}.pdf` });
        } else {
            Alert.alert("Sharing not available", "The PDF was saved at: " + uri);
        }
    } catch (error) {
        console.error("Error generating PDF:", error);
        Alert.alert("PDF Generation Failed", "An error occurred while generating the PDF.");
    }
}
