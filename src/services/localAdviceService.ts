/**
 * This service fetches advice data from a public Google Sheet.
 * ===============================================================
 * PLEASE CONFIGURE YOUR GOOGLE SHEET
 * ===============================================================
 * 1. Open your Google Sheet.
 * 2. Get the Sheet ID from the URL (the long string between "/d/" and "/edit").
 *    - Replace the value of GOOGLE_SHEET_ID with this ID.
 * 3. IMPORTANT: Share the sheet with "Anyone with the link can view".
 *
 * This file configures the ADVICE tab of the sheet.
 * ===============================================================
 * 1. Click on your ADVICE data sheet tab (e.g., "Sheet1").
 * 2. Get the Grid ID (gid) from the URL (e.g., #gid=0). The first sheet is always '0'.
 *    - Replace 'GOOGLE_ADVICE_SHEET_GRID_ID' with this value.
 * 3. The sheet must have these headers: `type`, `subtype`, `text`, `criteria`.
 */
export const GOOGLE_SHEET_ID = (process.env.GOOGLE_SHEET_ID as string) || '';
const GOOGLE_ADVICE_SHEET_GRID_ID = '0'; // This is for the advice data sheet. '0' is the first sheet.

// The final URL to fetch the advice data as a CSV file.
const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GOOGLE_ADVICE_SHEET_GRID_ID}`;


export interface LogSummaryForAdvice {
  goodThoughts: number;
  badThoughts: number;
  goodActions: number;
  badActions: number;
  goodWordsCount: number;
  badWordsCount: number;
  happyEvents: number;
  toughEvents: number;
}

interface AdviceItem {
  type: string;
  subtype: string;
  text: string;
  criteria: string;
}

let allAdvice: AdviceItem[] | null = null;
let isFetching = false;
let fetchPromise: Promise<void> | null = null;

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * A simple CSV row parser that handles quoted fields.
 * It does not handle escaped quotes inside a quoted field.
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


async function fetchAndParseAdviceData(): Promise<void> {
    if (allAdvice) return;
    if (isFetching && fetchPromise) return fetchPromise;

    isFetching = true;
    fetchPromise = (async () => {
        try {
            // FIX: Removed the check for placeholder sheet IDs.
            // The constants are already set with actual values, so this check was redundant
            // and caused a TypeScript error because the comparison was always false.
            const response = await fetch(GOOGLE_SHEET_CSV_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch Google Sheet: ${response.statusText}. Please ensure the sheet's sharing permission is 'Anyone with the link can view'.`);
            }
            const csvText = await response.text();
            
            const rows = csvText.split(/\r?\n/).slice(1); // Split by newline and remove header
            const parsedAdvice: AdviceItem[] = [];

            for (const row of rows) {
                if (!row.trim()) continue;
                const [type, subtype, text, criteria] = parseCsvRow(row);
                if (type && subtype && text && criteria) {
                     parsedAdvice.push({ type, subtype, text, criteria: criteria.trim() });
                }
            }
            allAdvice = parsedAdvice;
        } catch (error) {
            console.error("Error fetching or parsing advice data:", error);
            allAdvice = null;
            throw error;
        } finally {
            isFetching = false;
            fetchPromise = null;
        }
    })();
    return fetchPromise;
}

function evaluateCriteria(criteria: string, summary: LogSummaryForAdvice): boolean {
    if (criteria === 'ALWAYS_MATCH' || !criteria) {
        return true;
    }

    const parts = criteria.split(' ').map(p => p.trim());
    if (parts.length !== 3) {
        return false; 
    }

    const [leftOperandKey, operator, rightOperandRaw] = parts;

    const isValidKey = (key: string): key is keyof LogSummaryForAdvice => {
        return key in summary;
    };

    if (!isValidKey(leftOperandKey)) {
        return false;
    }

    const leftValue = summary[leftOperandKey];
    let rightValue: number;

    if (!isNaN(Number(rightOperandRaw))) {
        rightValue = Number(rightOperandRaw);
    } else if (isValidKey(rightOperandRaw)) {
        rightValue = summary[rightOperandRaw];
    } else {
        return false;
    }

    switch (operator) {
        case '>': return leftValue > rightValue;
        case '<': return leftValue < rightValue;
        case '>=': return leftValue >= rightValue;
        case '<=': return leftValue <= rightValue;
        case '==': return leftValue == rightValue;
        default: return false;
    }
}


export async function generateDetailedAdvice(logSummary: LogSummaryForAdvice | null, periodLabel: string): Promise<string> {
    try {
        if (!allAdvice) {
            await fetchAndParseAdviceData();
        }
        if (!allAdvice || !logSummary) {
            return "조언 데이터를 불러오지 못했습니다. 인터넷 연결을 확인하거나 관리자에게 문의하세요.";
        }

        const totalActions = Object.values(logSummary).reduce((sum, val) => sum + (val || 0), 0);
        if (totalActions === 0) {
            return "기록이 없습니다. 자신의 기운을 기록하고 맞춤 조언을 받아보세요.";
        }

        const findAndPick = (type: string, subtype: string | null = null): AdviceItem | null => {
            let pool = allAdvice.filter(item => item.type === type);
            if (subtype) {
                pool = pool.filter(item => item.subtype === subtype);
            }
            const suitable = pool.filter(item => evaluateCriteria(item.criteria, logSummary));
            return suitable.length > 0 ? pickRandom(suitable) : null;
        };

        let periodType: 'daily' | 'weekly' | 'monthly' = 'daily';
        if (periodLabel.includes('주')) periodType = 'weekly';
        else if (periodLabel.includes('월')) periodType = 'monthly';
        
        let advice = "";
        
        const intro = findAndPick('intro', periodType) || findAndPick('intro', 'default');
        advice += intro ? intro.text.replace('{periodLabel}', periodLabel) + "\n\n" : "";

        advice += "✨ **당신이 정말 잘하고 있는 것들:**\n";
        const strength = findAndPick('strength');
        if (strength) {
             advice += "1. " + strength.text + "\n\n";
        } else {
            const fallbackStrength = findAndPick('strength', 'balance');
            advice += fallbackStrength ? "1. " + fallbackStrength.text + "\n\n" : "꾸준히 기록하는 당신의 노력을 응원합니다!\n\n";
        }

        const growth = findAndPick('growth');
        let growthSubtype: string | null = null;
        if (growth) {
            growthSubtype = growth.subtype;
            advice += "☁️ **우리 함께 채워나갈 부분:**\n";
            advice += growth.text + "\n\n";
        }
        
        advice += "🌱 **당신을 위한 따뜻하고 실천 가능한 조언:**\n";
        const tipsList: string[] = [];
        if (growthSubtype) {
            const growthTip = findAndPick('tip', growthSubtype);
            if (growthTip) tipsList.push(growthTip.text);
        }
        const maintainTip = findAndPick('tip', 'maintainStrengths');
        if (maintainTip) tipsList.push(maintainTip.text);

        if (tipsList.length === 0) { // Ensure at least one tip
            const fallbackTip = allAdvice.filter(a => a.type === 'tip' && a.subtype !== 'maintainStrengths');
            if(fallbackTip.length > 0) tipsList.push(pickRandom(fallbackTip).text);
        }

        tipsList.forEach((tip, index) => {
            advice += `${index + 1}. ${tip}\n`;
        });
        advice += "\n";

        const closing = findAndPick('closing');
        advice += closing ? closing.text : "";
        
        // Final replacement of all placeholders
        return advice
          .replace(/{goodWordsCount}/g, String(logSummary.goodWordsCount))
          .replace(/{badWordsCount}/g, String(logSummary.badWordsCount))
          .replace(/{goodActions}/g, String(logSummary.goodActions))
          .replace(/{badActions}/g, String(logSummary.badActions))
          .replace(/{goodThoughts}/g, String(logSummary.goodThoughts))
          .replace(/{badThoughts}/g, String(logSummary.badThoughts))
          .replace(/{happyEvents}/g, String(logSummary.happyEvents))
          .replace(/{toughEvents}/g, String(logSummary.toughEvents));

    } catch(e) {
        console.error("Failed to generate advice", e);
        return "조언을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    }
}