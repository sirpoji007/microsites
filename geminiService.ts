import { GoogleGenAI, Type } from "@google/genai";
import { Qualification, Course, CourseCategory, GdpData, LabourData, Recommendation } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recommendationSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            rank: { type: Type.INTEGER },
            courseName: { type: Type.STRING },
            university: { type: Type.STRING },
            matchScore: {
                type: Type.NUMBER,
                description: "A score from 0-100 indicating how well the student's profile matches the course requirements and potential."
            },
            rationale: {
                type: Type.STRING,
                description: "A detailed explanation of why this course is a good match, considering academic fit, job market, and economic factors."
            },
            pros: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of 2-3 key advantages for this choice."
            },
            cons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of 2-3 potential challenges or disadvantages."
            },
            careerProspects: {
                type: Type.STRING,
                description: "A summary of potential job roles and career paths after graduation."
            },
            employabilityTrend: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "The 5-year employability trend data points [2019, 2020, 2021, 2022, 2023] for the associated course category."
            },
            sectorGrowth: {
                type: Type.NUMBER,
                description: "The year-on-year growth percentage for the economic sector related to the course."
            }
        },
        required: ["rank", "courseName", "university", "matchScore", "rationale", "pros", "cons", "careerProspects", "employabilityTrend", "sectorGrowth"]
    },
};


export const generateRecommendations = async (
    qualifications: Qualification,
    courses: Course[],
    categories: CourseCategory[],
    gdpData: GdpData,
    labourData: LabourData
): Promise<Recommendation[]> => {

    const systemInstruction = `You are an expert career and education counselor for Malaysian students. Your goal is to provide data-driven, insightful, and realistic university course recommendations based on the user's academic profile and extensive contextual data about courses and the economy. You must analyze all provided information and return a JSON array of the top 5 course recommendations, strictly following the provided JSON schema. Ensure that the 'courseName' and 'university' in your response exist in the provided course list. For each recommendation, find the corresponding 'employabilityTrend' and 'sectorGrowth' from the data.`;
    
    const requestContents = `
        Here is the student's academic profile and the contextual data needed for the analysis.

        **Student's Academic Profile:**
        ${JSON.stringify(qualifications, null, 2)}

        **Contextual Data:**
        This data includes all available university courses, their categories with 5-year employability trends, economic sector growth (GDP YoY %), and regional labour market data (unemployment rate % by state).

        ${JSON.stringify({ courses, categories, gdpData, labourData }, null, 2)}
        
        **Your Task:**
        Analyze all the data above. Generate the TOP 5 most suitable university course recommendations for this student.
        Return your analysis as a JSON array of 5 recommendation objects.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: requestContents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: recommendationSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        
        // Basic validation and type casting
        if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
            console.error("AI returned an invalid or empty array:", parsedResponse);
            throw new Error("AI returned an invalid format. Expected an array of recommendations.");
        }
        
        const recommendations: Recommendation[] = parsedResponse;

        if (!recommendations.every(rec => 'courseName' in rec && 'university' in rec)) {
             console.error("AI response missing required fields:", recommendations);
            throw new Error("AI returned objects missing required properties.");
        }

        return recommendations.sort((a, b) => a.rank - b.rank);

    } catch (error) {
        console.error("Error generating or parsing AI recommendations:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse the AI's response. The format was invalid JSON.");
        }
        throw new Error("The AI failed to generate recommendations. This might be a temporary issue with the service. Please try again.");
    }
};
