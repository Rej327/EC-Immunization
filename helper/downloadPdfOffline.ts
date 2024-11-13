import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { todoLigtasLogo } from "./todoLigtasBase64";
import { dohLogo } from "./dohBase64";
import { f1Logo } from "./f1LogoBase64";
import { formatDate } from "./helper";
import { Card } from "@/types/types";
import { getBabiesData } from "@/middleware/GetFromLocalStorage";

// Function to generate the immunization PDF
export const generatePDF = async (): Promise<void> => {
	try {
		// Step 1: Retrieve the selected baby ID from local storage
		const selectedBabyId = await AsyncStorage.getItem("selectedBabyId");
		if (!selectedBabyId) {
			console.log("No baby ID found in local storage.");
			return;
		}

		// Step 2: Fetch babies data from local storage
		const babiesData = await getBabiesData();
		const selectedBaby = babiesData.find(
			(baby) => baby.id === selectedBabyId
		);
		if (!selectedBaby) {
			console.log("No baby data found for the selected ID.");
			return;
		}

		// Step 3: Map the baby data to populate the immunization card
		const immunizationRows = selectedBaby.card
			.map(
				(vaccine: Card) => `
      <tr>
        <td>${vaccine.vaccineName}</td>
        <td>${vaccine.doses}</td>
        <td class='petsa'>${vaccine.date.join(" ┃ ")}</td>
        <td></td>
        <td>${vaccine.remarks.join(" ┃ ")}</td>
      </tr>
    `
			)
			.join("");

		const htmlContent = `
    <html>
    <head>
        <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          width: 794px;
          margin: 0 auto;
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f9f9f9;
        }

        .immunization-card {
          width: 680px;
          background-color: #fff;
          border: 1px solid #ddd;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          margin: 20px 0;
          page-break-inside: avoid;
        }

        .header {
          display: flex;
          justify-content: space-between;
        }

        .slogan {
          font-size: 10px;
          color: rgb(0, 141, 223);
          font-weight: 900;
          font-style: italic;
        }

        .todoLigtasLogo {
          width: 100px;
        }

        .leftHeader {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin: 1rem;
          gap: 2px;
        }

        .rightTitleContainer {
          display: flex;
          align-items: center;
          justify-content: space-evenly;
          width: 500px;
          padding: 5px 10px;
          border-bottom-left-radius: 20px;
          background-color: rgb(0, 141, 223);
        }

        .title {
          color: white;
          font-size: 25px;
          letter-spacing: 1px;
          font-weight: 700;
          text-align: center;
        }

        .petsa {
          text-align: center;
        }

        .otherLogoContainer {
          display: flex;
          gap: 5px;
          justify-content: center;
        }

        .otherLogo {
          width: 40px;
        }

        .rightInfoContainer {
          display: flex;
          justify-content: center;
          align-items: start;
          gap: 2px;
          margin: 5px;
        }

        .rightInfoContainer p {
          font-size: 9px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .info-text {
          padding-left: 5px;
          width: 100%;
          text-underline-offset: 2px;
        }

        .leftInfo {
          width: 50%;
        }

        .rightInfo {
          width: 50%;
        }

        .immunization-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 5px;
        }

        .immunization-table th {
          background-color: rgb(211, 211, 0);
        }

        #longHeader {
          font-size: 8px;
          text-wrap: wrap;
          width: 140px;
        }

        .immunization-table th,
        .immunization-table td {
          border: 1px solid #ddd;
          padding: 8px;
          font-size: 10px;
        }

        .immunization-table th {
         text-align: center;
        }

        .split-cell {
          display: flex;
          padding: 0;
        }

        .split {
          flex: 1;
          padding: 4px 0;
          font-size: 8px;
          border-right: 1px solid #ddd; /* Add right border to Split 1 */
        }

        .split:last-child {
          border-right: none; /* Remove right border from the last split */
        }

        </style>
    </head>
    <body>
        <div class="immunization-card" id="immunizationCard">
        <section class="header">
          <div class="leftHeader">
            <img
              class="todoLigtasLogo"
              src="${todoLigtasLogo}"
              alt="Todo Ligtas"
            />
            <p class="slogan">Pag Kumpleto, Protektado</p>
          </div>
          <div class="rightHeader">
            <div class="rightTitleContainer">
              <h1 class="title">IMMUNIZATION CARD</h1>
              <div class="otherLogoContainer">
                <img
                  class="otherLogo"
                  src="${dohLogo}"
                  alt="DOH Logo"
                />
                <img
                  class="otherLogo"
                  src="${f1Logo}"
                  alt="F1 Logo"
                />
              </div>
            </div>

            <div class="rightInfoContainer">
              <div class="leftInfo">
                <p>NAME: <span class="info-text">${selectedBaby.firstName} ${
			selectedBaby.lastName
		}</span></p>
                <p>SEX: <span class="info-text">${
					selectedBaby.gender
				}</span></p>
                <p>DATE OF BIRTH: <span class="info-text">${new Date(
					selectedBaby.birthday
				).toLocaleDateString("en-US", {
					month: "long",
					day: "2-digit",
					year: "numeric",
				})}
        
        	
        </span></p>
                <p>PLACE OF BIRTH: <span class="info-text">${
					selectedBaby.birthPlace
				}</span></p>
                <p>ADDRESS: <span class="info-text">${
					selectedBaby.address
				}</span></p>
              </div>
              <div class="rightInfo">
                <p>MOTHER'S NAME: <span class="info-text">${
					selectedBaby.motherName
				}</span></p>
                <p>FATHER'S NAME: <span class="info-text">${
					selectedBaby.fatherName
				}</span></p>
                <p>BIRTH HEIGHT: <span class="info-text">${
					selectedBaby.height
				}</span></p>
                <p>BIRTH WEIGHT: <span class="info-text">${
					selectedBaby.weight
				}</span></p>
                <p>CONTACT: <span class="info-text">${
					selectedBaby.contact
				}</span></p>
              </div>
            </div>
          </div>
        </section>

        <!-- Add table here -->
        <table class="immunization-table">
          <tr>
              <th>BAKUNA</th>
              <th>DOSES</th>
              <th>PETSA NG BAKUNA</th>
              <th id="longHeader">SUPPLEMENTAL IMMUNIZATION ACTIVITY (SIA)</th>
              <th>REMARKS</th>
          </tr>
          ${immunizationRows}
        </table>
        
        </div>
      </body>
      </html>
    `;

		// Step 4: Create PDF
		const { uri } = await Print.printToFileAsync({ html: htmlContent });
		console.log("PDF generated at:", uri);

		// Step 5: Share PDF
		await Sharing.shareAsync(uri);
	} catch (error) {
		console.error("Error generating PDF:", error);
	}
};
