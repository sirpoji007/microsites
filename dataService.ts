
import { Course, CourseCategory, UniversityMap, GdpData, LabourData, ExternalData } from '../types';

// Data fetching from Google Sheets
const SHEET_ID = '1S-h9tki5B_uGZ3EREyFsU6vu_BmXoGK4lMGs_z7UeLw';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=`;
const COURSES_URL = `${BASE_URL}courses_list`;
const CATEGORIES_URL = `${BASE_URL}course_categories`;
const UNIVERSITIES_URL = `${BASE_URL}university_state_map`;

// Helper function to fetch and parse CSV data
const fetchAndParseCsv = async <T,>(url: string): Promise<T[]> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch CSV from ${url}. Status: ${response.status}`);
    }
    const text = await response.text();
    
    const cleanedText = text.replace(/"/g, '').replace(/\r/g, '');
    const lines = cleanedText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        if (values.length === headers.length) {
            return headers.reduce((obj, header, index) => {
                const value = values[index].trim();
                // Convert numeric values from string to number type
                (obj as any)[header] = !isNaN(Number(value)) && value !== '' ? Number(value) : value;
                return obj;
            }, {} as T);
        }
        return null;
    }).filter((item): item is T => item !== null);
};


export const fetchExternalData = async (): Promise<ExternalData> => {
    try {
        // Fetching from Google Sheets
        const coursesPromise = fetchAndParseCsv<Course>(COURSES_URL);
        const categoriesPromise = fetchAndParseCsv<any>(CATEGORIES_URL); // Fetch as any first
        const universitiesPromise = fetchAndParseCsv<{university: string, state: string}>(UNIVERSITIES_URL);

        // Fetching from Live Data APIs
        const gdpApiPromise = fetch("https://api.data.gov.my/data-catalogue?id=gdp_qtr_real_supply&limit=50").then(res => res.json());
        const labourApiPromise = fetch("https://api.data.gov.my/data-catalogue?id=lfs_qtr_state&limit=50").then(res => res.json());

        const [
            rawCourses, rawCategoriesData, rawUniversities, gdpResult, labourResult
        ] = await Promise.all([coursesPromise, categoriesPromise, universitiesPromise, gdpApiPromise, labourApiPromise]);

        // Process Google Sheet Data
        const universityMap: UniversityMap = rawUniversities.reduce((map, item) => {
            map[item.university] = item.state;
            return map;
        }, {} as UniversityMap);

        const categories: CourseCategory[] = rawCategoriesData.map((cat: any) => ({
            id: cat.id,
            category: cat.category,
            api_sector: cat.api_sector,
            employability: {
                2019: cat.employability_2019,
                2020: cat.employability_2020,
                2021: cat.employability_2021,
                2022: cat.employability_2022,
                2023: cat.employability_2023,
            },
        }));

        // Process Live API Data
        const latestGdpDate = gdpResult.reduce((max: string, item: { date: string }) => (item.date > max ? item.date : max), gdpResult[0]?.date);
        const latestGdp = gdpResult.filter((item: { date: string }) => item.date === latestGdpDate);
        const gdpData: GdpData = {};
        latestGdp.forEach((item: { sector: string, yoy: number }) => { gdpData[item.sector] = item.yoy; });

        const latestLabourDate = labourResult.reduce((max: string, item: { date: string }) => (item.date > max ? item.date : max), labourResult[0]?.date);
        const latestLabour = labourResult.filter((item: { date: string }) => item.date === latestLabourDate);
        const labourData: LabourData = {};
        latestLabour.forEach((item: { state: string, unemp_rate: number }) => { labourData[item.state] = { unemp_rate: item.unemp_rate }; });

        return {
            courses: rawCourses,
            categories,
            universityMap,
            gdpData,
            labourData
        };

    } catch (error) {
        console.error("Error fetching external data:", error);
        throw new Error("Could not load required data from external sources. Please check your internet connection and try again.");
    }
};
