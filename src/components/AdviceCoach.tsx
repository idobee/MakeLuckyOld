import React, { useMemo, useState } from 'react';
import { DailyLog } from '../types';
import { generateDetailedAdvice, LogSummaryForAdvice } from '../services/localAdviceService';
import { SparklesIcon } from './Icons';

// This represents the aggregated logs from weekly/monthly reports
interface AggregatedLog {
    goodThoughts: number;
    badThoughts: number;
    goodActions: number;
    badActions: number;
    goodWords: number; // This is a count
    badWords: number; // This is a count
    happyEvents: number;
    toughEvents: number;
}

interface AdviceCoachProps {
  logSummary: DailyLog | AggregatedLog | null;
  periodLabel: string;
}

const AdviceCoach: React.FC<AdviceCoachProps> = ({ logSummary, periodLabel }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalActions = useMemo(() => {
    if (!logSummary) return 0;
     const summaryForAdvice: LogSummaryForAdvice = {
      goodThoughts: logSummary.goodThoughts || 0,
      badThoughts: logSummary.badThoughts || 0,
      goodActions: logSummary.goodActions || 0,
      badActions: logSummary.badActions || 0,
      goodWordsCount: Array.isArray(logSummary.goodWords) ? logSummary.goodWords.length : logSummary.goodWords || 0,
      badWordsCount: Array.isArray(logSummary.badWords) ? logSummary.badWords.length : logSummary.badWords || 0,
      happyEvents: logSummary.happyEvents || 0,
      toughEvents: logSummary.toughEvents || 0,
    };
    return Object.values(summaryForAdvice).reduce((sum, val) => sum + val, 0);
  },[logSummary]);
  
  const handleGetAdvice = async () => {
    if (!logSummary) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const summaryForAdvice: LogSummaryForAdvice = {
        goodThoughts: logSummary.goodThoughts || 0,
        badThoughts: logSummary.badThoughts || 0,
        goodActions: logSummary.goodActions || 0,
        badActions: logSummary.badActions || 0,
        goodWordsCount: Array.isArray(logSummary.goodWords) ? logSummary.goodWords.length : logSummary.goodWords || 0,
        badWordsCount: Array.isArray(logSummary.badWords) ? logSummary.badWords.length : logSummary.badWords || 0,
        happyEvents: logSummary.happyEvents || 0,
        toughEvents: logSummary.toughEvents || 0,
      };
      const newAdvice = await generateDetailedAdvice(summaryForAdvice, periodLabel);
      setAdvice(newAdvice);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
        setError(`조언을 불러오지 못했습니다: ${errorMessage}`);
        setAdvice(null);
    } finally {
        setIsLoading(false);
    }
  };

  if (totalActions === 0) {
    return null;
  }

  return (
    <div className="bg-indigo-50 p-4 sm:p-5 rounded-lg">
      <h3 className="text-lg font-bold text-indigo-800 mb-3 flex items-center gap-2">
        <SparklesIcon className="w-6 h-6 text-indigo-500" />
        기운 코치
      </h3>
      {advice && (
        <div className="text-indigo-800 text-sm sm:text-base leading-relaxed space-y-2" style={{ whiteSpace: 'pre-wrap' }}>
          {advice}
        </div>
      )}
       {error && (
        <div className="text-red-700 bg-red-100 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      {!advice && !error && (
        <div className="text-center">
            <p className="text-indigo-700 text-sm mb-4">
                {periodLabel}의 기록을 바탕으로<br/>기운 코치가 맞춤 조언을 해드려요.
            </p>
            <button 
                onClick={handleGetAdvice}
                disabled={isLoading}
                className="bg-indigo-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
            >
                {isLoading ? '분석 중...' : '조언 보기'}
            </button>
        </div>
      )}
    </div>
  );
};

export default AdviceCoach;