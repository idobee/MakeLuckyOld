/**
 * This service fetches ad data from a public Google Sheet.
 * It uses the same Google Sheet ID as the advice service.
 * ===============================================================
 * PLEASE CONFIGURE YOUR ADS SHEET TAB
 * ===============================================================
 * 1. Open the same Google Sheet used for advice.
 * 2. Click on your ADS data sheet tab (e.g., "Ads").
 * 3. Get the Grid ID (gid) from the URL (e.g., #gid=123456789).
 *    - Replace 'GOOGLE_SHEET_GRID_ID_FOR_ADS' with this value.
 * 4. The sheet must have these headers: `text` in column A, `link` in column B.
 */
import { GOOGLE_SHEET_ID } from './localAdviceService';

const GOOGLE_SHEET_GRID_ID_FOR_ADS = '1937325946'; // This is for the ads data sheet.

const GOOGLE_SHEET_ADS_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GOOGLE_SHEET_GRID_ID_FOR_ADS}`;


export interface AdItem {
  text: string;
  link: string;
}

// Cached ads
let allAds: AdItem[] | null = null;
let isFetching = false;
let fetchPromise: Promise<void> | null = null;

/**
 * A simple CSV row parser that handles quoted fields.
 */
function parseCsvRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, '')); // Trim quotes from start/end
}

async function fetchAndParseAdData(): Promise<void> {
    if (allAds) return;
    if (isFetching && fetchPromise) return fetchPromise;

    isFetching = true;
    fetchPromise = (async () => {
        try {
            // FIX: Removed the check for placeholder sheet IDs.
            // The constants are already set with actual values, so this check was redundant
            // and caused a TypeScript error because the comparison was always false.
            const response = await fetch(GOOGLE_SHEET_ADS_CSV_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch Ads Google Sheet: ${response.statusText}.`);
            }
            const csvText = await response.text();
            
            const rows = csvText.split(/\r?\n/).slice(1); // Split by newline and remove header
            const parsedAds: AdItem[] = [];

            for (const row of rows) {
                if (!row.trim()) continue;
                const [text, link] = parseCsvRow(row);
                if (text && link) {
                     parsedAds.push({ text, link });
                }
            }
            allAds = parsedAds;
        } catch (error) {
            console.error("Error fetching or parsing ad data:", error);
            allAds = []; // Set to empty on error to prevent refetching
            throw error;
        } finally {
            isFetching = false;
            fetchPromise = null;
        }
    })();
    return fetchPromise;
}

export async function fetchAds(): Promise<AdItem[]> {
    // This function ensures data is fetched only once.
    if (!allAds) {
        await fetchAndParseAdData();
    }
    return allAds || [];
}