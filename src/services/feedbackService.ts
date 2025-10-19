/**
 * 피드백 서비스 - Google Sheets에 사용자 피드백을 저장합니다.
 * ===============================================================
 * Google Sheets CSV API를 사용하여 피드백을 저장합니다.
 * 
 * 사용 방법:
 * 1. Google Sheets에서 피드백용 시트를 생성합니다.
 * 2. 시트 ID를 확인하고 아래 FEEDBACK_SHEET_GRID_ID를 설정합니다.
 * 3. 시트를 "Anyone with the link can view"로 공유합니다.
 * 4. 첫 번째 행에 헤더를 추가합니다: Timestamp, Email, Content, UserAgent, Page, FeedbackId
 */

// Google Sheets ID (same as advice service)
export const GOOGLE_SHEET_ID = (process.env.GOOGLE_SHEET_ID as string) || '';
const FEEDBACK_SHEET_GRID_ID = '1775510369'; // 피드백용 시트의 Grid ID (URL의 gid 값)

// Google Sheets CSV URL for feedback
const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${FEEDBACK_SHEET_GRID_ID}`;

export interface FeedbackData {
  email: string;
  content: string;
  page?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedbackId?: string;
}

/**
 * Google Sheets 설정 방법:
 * 
 * 1. Google Sheets에서 피드백용 새 시트를 생성합니다.
 * 2. 시트 이름을 "Feedback" 또는 원하는 이름으로 설정합니다.
 * 3. URL에서 gid 값을 확인하고 아래 FEEDBACK_SHEET_GRID_ID에 설정합니다.
 * 4. 첫 번째 행에 다음 헤더를 추가합니다:
 *    Timestamp, Email, Content, UserAgent, Page, FeedbackId
 * 5. 시트를 "Anyone with the link can view"로 공유합니다.
 * 
 * 참고: 현재는 읽기 전용 API를 사용하므로 로컬 스토리지에 저장됩니다.
 * 실제 쓰기 기능을 위해서는 Google Apps Script나 서버 사이드 API가 필요합니다.
 */

/**
 * 피드백을 로컬 스토리지에 저장합니다.
 * 실제 Google Sheets 쓰기는 서버 사이드에서 처리해야 합니다.
 */
export async function submitFeedback(feedbackData: FeedbackData): Promise<FeedbackResponse> {
  try {
    // 피드백 ID 생성
    const feedbackId = generateFeedbackId();
    const timestamp = new Date();
    
    // 피드백 객체 생성
    const feedback = {
      id: feedbackId,
      timestamp: timestamp,
      email: feedbackData.email,
      content: feedbackData.content,
      userAgent: navigator.userAgent,
      page: feedbackData.page || window.location.pathname
    };
    
    // 로컬 스토리지에 저장
    const existingFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('feedback', JSON.stringify(existingFeedback));
    
    console.log('피드백이 로컬에 저장되었습니다:', feedback);
    
    // TODO: 실제 서버로 전송하는 로직 추가 필요
    // await sendToServer(feedback);
    
    return {
      success: true,
      message: '피드백이 성공적으로 저장되었습니다! 감사합니다.',
      feedbackId: feedbackId
    };
    
  } catch (error) {
    console.error('피드백 저장 오류:', error);
    return {
      success: false,
      message: '피드백 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    };
  }
}

/**
 * 피드백 ID를 생성합니다.
 */
function generateFeedbackId(): string {
  return 'feedback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 저장된 피드백을 조회합니다 (로컬 스토리지에서).
 */
export function getStoredFeedback(): any[] {
  try {
    return JSON.parse(localStorage.getItem('feedback') || '[]');
  } catch (error) {
    console.error('피드백 조회 오류:', error);
    return [];
  }
}

/**
 * 피드백을 초기화합니다.
 */
export function clearStoredFeedback(): void {
  localStorage.removeItem('feedback');
}

/**
 * 피드백을 Google Sheets에서 조회합니다 (읽기 전용).
 * 실제 서버에서 구현해야 하는 기능입니다.
 */
export async function fetchFeedbackFromSheet(): Promise<any[]> {
  try {
    if (!GOOGLE_SHEET_ID) {
      console.warn('Google Sheets ID가 설정되지 않았습니다.');
      return [];
    }
    
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch feedback from Google Sheet: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const rows = csvText.split(/\r?\n/).slice(1); // 헤더 제거
    const feedbackData = [];
    
    for (const row of rows) {
      if (!row.trim()) continue;
      const [timestamp, email, content, userAgent, page, feedbackId] = parseCsvRow(row);
      if (email && content) {
        feedbackData.push({
          timestamp: new Date(timestamp),
          email,
          content,
          userAgent,
          page,
          feedbackId
        });
      }
    }
    
    return feedbackData;
  } catch (error) {
    console.error('Google Sheets에서 피드백 조회 오류:', error);
    return [];
  }
}

/**
 * CSV 행을 파싱합니다 (adviceService와 동일한 로직).
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
  return result.map(val => val.replace(/^"|"$/g, '')); // 따옴표 제거
}
