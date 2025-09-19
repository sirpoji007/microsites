
export interface Qualification {
    type: 'SPM' | 'STPM' | 'Diploma' | 'Matriculation';
    cgpa?: number;
    spmSubjects: { name: string; grade: string }[];
}

export interface Course {
    id: number;
    name: string;
    university: string;
    categoryId: number;
}

export interface CourseCategory {
    id: number;
    category: string;
    api_sector: string;
    employability: {
        2019: number;
        2020: number;
        2021: number;
        2022: number;
        2023: number;
    };
}

export interface UniversityMap {
    [university: string]: string; // university name -> state
}

export interface GdpData {
    [sector: string]: number; // sector -> year-on-year growth
}

export interface LabourData {
    [state: string]: {
        unemp_rate: number;
    };
}

export interface ExternalData {
    courses: Course[];
    categories: CourseCategory[];
    universityMap: UniversityMap;
    gdpData: GdpData;
    labourData: LabourData;
}

export interface Recommendation {
    rank: number;
    courseName: string;
    university: string;
    matchScore: number;
    rationale: string;
    pros: string[];
    cons: string[];
    careerProspects: string;
    employabilityTrend: number[];
    sectorGrowth: number;
}
