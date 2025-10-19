import React, { useMemo } from 'react';
import { ChartBarIcon, ShieldCheckIcon, ShieldExclamationIcon } from './Icons';
import AdviceCoach from './AdviceCoach';

interface MonthlyReportProps {
  data: {
    weeklyEnergies: { goodEnergy: number; badEnergy: number; totalEnergy: number }[];
    maxEnergy: number;
    totals: {
      goodThoughts: number; badThoughts: number; goodActions: number; badActions: number;
      goodWords: number; badWords: number; happyEvents: number; toughEvents: number;
      goodWordScore: number; badWordScore: number;
    };
    monthLabel: string;
  };
}

const StatItem: React.FC<{ label: string; value: number; }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-bold text-slate-800">{value}</span>
    </div>
);

const MonthlyReport: React.FC<MonthlyReportProps> = ({ data }) => {
    const { weeklyEnergies, maxEnergy, totals, monthLabel } = data;
    const weekLabels = ['1주차', '2주차', '3주차', '4주차', '5주차'];

    const { goodLuckBlockProb, avoidBadLuckProb } = useMemo(() => {
        const totalGoodEnergy = (totals.goodThoughts * 6) + totals.goodWordScore + (totals.goodActions * 20) + (totals.happyEvents * 10);
        const totalBadEnergy = (totals.badThoughts * 6) + totals.badWordScore + (totals.badActions * 20) + (totals.toughEvents * 10);

        const totalEnergy = totalGoodEnergy + totalBadEnergy;
        let goodLuckBlockProb = 0;
        let avoidBadLuckProb = 100;

        if (totalEnergy > 0) {
            goodLuckBlockProb = Math.round((totalBadEnergy / totalEnergy) * 100);
            avoidBadLuckProb = 100 - goodLuckBlockProb;
        }
        return { goodLuckBlockProb, avoidBadLuckProb };
    }, [totals]);
    
    const hasData = useMemo(() => {
        // FIX: The type of `val` from `Object.values` is `unknown`, which cannot be compared with `>`.
        // Added a `typeof val === 'number'` check to ensure type safety.
        return Object.values(totals).some(val => typeof val === 'number' && val > 0);
    }, [totals]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">{monthLabel} 리포트</h2>
            
            {!hasData ? (
                 <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-slate-500">
                    <p className="text-lg">이 기간의 기록이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="p-3 bg-slate-100 rounded-lg">
                        <h3 className="text-lg font-semibold text-slate-700 mb-2 text-center">월간 종합 확률</h3>
                        <div className="flex w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-2" role="progressbar" aria-valuenow={avoidBadLuckProb} aria-valuemin={0} aria-valuemax={100}>
                            <div className="bg-green-500" style={{ width: `${avoidBadLuckProb}%` }} title={`나쁜 운 피할 확률 ${avoidBadLuckProb}%`}></div>
                            <div className="bg-slate-400" style={{ width: `${goodLuckBlockProb}%` }} title={`좋은 운 막을 확률 ${goodLuckBlockProb}%`}></div>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold">
                            <div className="flex items-center gap-1 text-green-700">
                                <ShieldCheckIcon className="w-4 h-4"/>
                                <span>나쁜 운 피할 확률 {avoidBadLuckProb}%</span>
                            </div>
                             <div className="flex items-center gap-1 text-slate-600">
                                <ShieldExclamationIcon className="w-4 h-4"/>
                                <span>좋은 운 막을 확률 {goodLuckBlockProb}%</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <ChartBarIcon className="w-5 h-5" />
                            주차별 기운 변화
                        </h3>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="flex justify-around items-end h-40 border-b border-slate-200">
                                {weeklyEnergies.map((week, index) => (
                                    <div key={index} className="flex flex-col items-center justify-end flex-1 h-full">
                                        <div 
                                            className="w-8 flex flex-col bg-slate-200 rounded-t-md overflow-hidden transition-all duration-300"
                                            style={{ height: `${(week.totalEnergy / maxEnergy) * 100}%` }}
                                            title={`총 기운: ${week.totalEnergy}`}
                                        >
                                            <div 
                                                className="bg-slate-400"
                                                style={{ height: `${week.totalEnergy > 0 ? (week.badEnergy / week.totalEnergy) * 100 : 0}%` }}
                                                title={`나쁜 기운: ${week.badEnergy}`}
                                            ></div>
                                            <div 
                                                className="bg-green-500"
                                                style={{ height: `${week.totalEnergy > 0 ? (week.goodEnergy / week.totalEnergy) * 100 : 0}%` }}
                                                title={`좋은 기운: ${week.goodEnergy}`}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-500 mt-2">{weekLabels[index]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                            <h4 className="font-bold text-center text-green-600">좋은 운을 부르기</h4>
                            <StatItem label="좋은 생각" value={totals.goodThoughts} />
                            <StatItem label="좋은 행동" value={totals.goodActions} />
                            <StatItem label="좋은 말" value={totals.goodWords} />
                             <hr className="my-1"/>
                            <StatItem label="흐뭇한소식" value={totals.happyEvents} />
                        </div>
                         <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                            <h4 className="font-bold text-center text-rose-600">나쁜 운을 부르기</h4>
                            <StatItem label="나쁜 생각" value={totals.badThoughts} />
                            <StatItem label="나쁜 행동" value={totals.badActions} />
                            <StatItem label="나쁜 말" value={totals.badWords} />
                            <hr className="my-1"/>
                            <StatItem label="힘겨운소식" value={totals.toughEvents} />
                        </div>
                    </div>
                     <AdviceCoach logSummary={totals} periodLabel={monthLabel} />
                </div>
            )}
        </div>
    );
};

export default MonthlyReport;