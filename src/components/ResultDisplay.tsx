import React, { useMemo } from 'react';
import { DailyLog } from '../types';
import { ShieldExclamationIcon, ShieldCheckIcon, PartyPopperIcon, CloudRainIcon } from './Icons';
import AdviceCoach from './AdviceCoach';

interface ResultDisplayProps {
  log: DailyLog | null;
  date: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ log, date }) => {
  const { goodLuckBlockProb, avoidBadLuckProb } = useMemo(() => {
    if (!log) {
      return { goodLuckBlockProb: 0, avoidBadLuckProb: 100 };
    }
    const goodWordScore = log.goodWords.reduce((sum, w) => sum + w.intensity, 0);
    const badWordScore = log.badWords.reduce((sum, w) => sum + w.intensity, 0);

    const goodEnergy = (log.goodThoughts * 6) + goodWordScore + (log.goodActions * 20) + (log.happyEvents * 10);
    const badEnergy = (log.badThoughts * 6) + badWordScore + (log.badActions * 20) + (log.toughEvents * 10);

    const totalEnergy = goodEnergy + badEnergy;
    let goodLuckBlockProb = 0;
    let avoidBadLuckProb = 100;

    if (totalEnergy > 0) {
        goodLuckBlockProb = Math.round((badEnergy / totalEnergy) * 100);
        avoidBadLuckProb = 100 - goodLuckBlockProb;
    }
    
    return { goodLuckBlockProb, avoidBadLuckProb };
  }, [log]);

  const hasData = log && (log.goodWords.length > 0 || log.badWords.length > 0 || log.goodThoughts > 0 || log.badThoughts > 0 || log.goodActions > 0 || log.badActions > 0 || log.happyEvents > 0 || log.toughEvents > 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">{date}</h2>
      
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-slate-500">
             <p className="text-lg">이 날짜의 기록이 없습니다.</p>
            <p>위쪽에서 기운을 기록해보세요.</p>
        </div>
      ) : (
        <div className="space-y-8">
            <div className="flex justify-around text-center">
                <div className="flex items-center gap-2">
                    <PartyPopperIcon className="w-7 h-7 text-amber-500"/>
                    <div>
                        <p className="font-semibold text-slate-600">흐뭇한소식</p>
                        <p className="text-2xl font-bold text-amber-600">{log.happyEvents}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <CloudRainIcon className="w-7 h-7 text-sky-500"/>
                    <div>
                        <p className="font-semibold text-slate-600">힘겨운소식</p>
                        <p className="text-2xl font-bold text-sky-600">{log.toughEvents}</p>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 text-center mb-3">오늘의 기운 균형</h3>
                <div className="flex w-full h-5 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={avoidBadLuckProb} aria-valuemin={0} aria-valuemax={100}>
                    <div className="bg-sky-500 transition-all duration-500" style={{ width: `${avoidBadLuckProb}%` }} title={`나쁜 운 피할 확률: ${avoidBadLuckProb}%`}></div>
                    <div className="bg-rose-500 transition-all duration-500" style={{ width: `${goodLuckBlockProb}%` }} title={`좋은 운 막을 확률: ${goodLuckBlockProb}%`}></div>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm font-semibold">
                    <div className="flex items-center gap-2 text-sky-700">
                        <ShieldCheckIcon className="w-5 h-5"/>
                        <span>나쁜 운 피할 확률: {avoidBadLuckProb}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-rose-700">
                        <ShieldExclamationIcon className="w-5 h-5"/>
                        <span>좋은 운 막을 확률: {goodLuckBlockProb}%</span>
                    </div>
                </div>
            </div>
            
            <AdviceCoach logSummary={log} periodLabel="오늘" />

            <div className="grid grid-cols-2 gap-6">
                <div>
                <h3 className="text-xl font-semibold text-green-600 mb-3 text-center">내가 한 좋은말</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 bg-slate-50 p-2 rounded-md">
                    {log.goodWords.length > 0 ? (
                    log.goodWords.map((item) => (
                        <div key={item.id} className="bg-green-100 p-2 rounded-lg flex justify-between items-center text-sm">
                        <span className="text-slate-800 flex-1 break-words mr-2">{item.text}</span>
                        <span className="font-semibold text-green-700 bg-white px-2 py-1 rounded-full">{item.intensity}</span>
                        </div>
                    ))
                    ) : (
                    <p className="text-center text-slate-500 italic py-4">기록 없음</p>
                    )}
                </div>
                </div>
                <div>
                <h3 className="text-xl font-semibold text-rose-600 mb-3 text-center">내가 한 나쁜말</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 bg-slate-50 p-2 rounded-md">
                    {log.badWords.length > 0 ? (
                    log.badWords.map((item) => (
                        <div key={item.id} className="bg-rose-100 p-2 rounded-lg flex justify-between items-center text-sm">
                        <span className="text-slate-800 flex-1 break-words mr-2">{item.text}</span>
                        <span className="font-semibold text-rose-700 bg-white px-2 py-1 rounded-full">{item.intensity}</span>
                        </div>
                    ))
                    ) : (
                    <p className="text-center text-slate-500 italic py-4">기록 없음</p>
                    )}
                </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;