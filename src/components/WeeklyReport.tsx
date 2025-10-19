import React, { useMemo } from 'react';
import { DailyLog } from '../types';
import AdviceCoach from './AdviceCoach';
import { ShieldCheckIcon, ShieldExclamationIcon } from './Icons';

interface WeeklyReportProps {
  data: {
    date: Date;
    log: DailyLog;
  }[];
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ data }) => {
    const { weeklyTotals, dailyEnergies, maxTotalEnergy, weekLabel, maxEventCount } = useMemo(() => {
        const totals = {
            goodThoughts: 0, badThoughts: 0, goodActions: 0, badActions: 0,
            goodWords: 0, badWords: 0, happyEvents: 0, toughEvents: 0,
            goodWordScore: 0, badWordScore: 0
        };

        const energies = data.map(dayData => {
            const { log } = dayData;
            const goodWordScore = log.goodWords.reduce((sum, w) => sum + w.intensity, 0);
            const badWordScore = log.badWords.reduce((sum, w) => sum + w.intensity, 0);

            totals.goodThoughts += log.goodThoughts;
            totals.badThoughts += log.badThoughts;
            totals.goodActions += log.goodActions;
            totals.badActions += log.badActions;
            totals.goodWords += log.goodWords.length;
            totals.badWords += log.badWords.length;
            totals.happyEvents += log.happyEvents;
            totals.toughEvents += log.toughEvents;
            totals.goodWordScore += goodWordScore;
            totals.badWordScore += badWordScore;

            const goodEnergy = (log.goodThoughts * 6) + goodWordScore + (log.goodActions * 20) + (log.happyEvents * 10);
            const badEnergy = (log.badThoughts * 6) + badWordScore + (log.badActions * 20) + (log.toughEvents * 10);
            const totalEnergy = goodEnergy + badEnergy;

            return { 
                goodEnergy, 
                badEnergy, 
                totalEnergy, 
                date: dayData.date,
                happyEvents: log.happyEvents,
                toughEvents: log.toughEvents,
            };
        });

        const maxEnergy = Math.max(...energies.map(e => e.totalEnergy), 10);
        const maxEvent = Math.max(...energies.map(e => e.happyEvents), ...energies.map(e => e.toughEvents), 1);
        
        const startDate = data[0].date;
        const endDate = data[6].date;
        
        const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;
        
        const label = `주간 (${formatDate(startDate)} ~ ${formatDate(endDate)})`;

        return { weeklyTotals: totals, dailyEnergies: energies, maxTotalEnergy: maxEnergy, weekLabel: label, maxEventCount: maxEvent };
    }, [data]);

    const { goodLuckBlockProb, avoidBadLuckProb } = useMemo(() => {
        const totalGoodEnergy = (weeklyTotals.goodThoughts * 6) + weeklyTotals.goodWordScore + (weeklyTotals.goodActions * 20) + (weeklyTotals.happyEvents * 10);
        const totalBadEnergy = (weeklyTotals.badThoughts * 6) + weeklyTotals.badWordScore + (weeklyTotals.badActions * 20) + (weeklyTotals.toughEvents * 10);
        const totalEnergy = totalGoodEnergy + totalBadEnergy;
        
        if (totalEnergy === 0) {
            return { goodLuckBlockProb: 0, avoidBadLuckProb: 100 };
        }
        
        const blockProb = Math.round((totalBadEnergy / totalEnergy) * 100);
        return { goodLuckBlockProb: blockProb, avoidBadLuckProb: 100 - blockProb };
    }, [weeklyTotals]);

    const weekDayLabels = ['일', '월', '화', '수', '목', '금', '토'];

    const hasData = useMemo(() => {
        // FIX: The type of `val` from `Object.values` is `unknown`, which cannot be compared with `>`.
        // Added a `typeof val === 'number'` check to ensure type safety.
        return data.some(d => Object.values(d.log).some(val => (Array.isArray(val) ? val.length > 0 : typeof val === 'number' && val > 0)));
    }, [data]);

    const lineChartData = useMemo(() => {
        const viewBoxWidth = 70;
        const viewBoxHeight = 32;
        const slotWidth = viewBoxWidth / 7;

        const calculatePoints = (eventCounts: number[]) => {
            return eventCounts.map((count, i) => ({
                x: i * slotWidth + slotWidth / 2,
                y: viewBoxHeight - (count / maxEventCount) * viewBoxHeight,
                count: count,
            }));
        };

        const happyPoints = calculatePoints(dailyEnergies.map(d => d.happyEvents));
        const toughPoints = calculatePoints(dailyEnergies.map(d => d.toughEvents));
        
        return {
            viewBox: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
            happyPoints,
            toughPoints,
            happyPointsString: happyPoints.map(p => `${p.x},${p.y}`).join(' '),
            toughPointsString: toughPoints.map(p => `${p.x},${p.y}`).join(' '),
        };

    }, [dailyEnergies, maxEventCount]);


    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">{weekLabel} 리포트</h2>
            
            {!hasData ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-slate-500">
                    <p className="text-lg">이 기간의 기록이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="p-3 bg-slate-100 rounded-lg">
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
                         <h3 className="text-lg font-semibold text-slate-700 mb-3">일별 기운 및 소식 변화</h3>
                         <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="relative h-32">
                                <svg 
                                    className="absolute top-0 left-0 w-full h-full pointer-events-none" 
                                    viewBox={lineChartData.viewBox}
                                    preserveAspectRatio="none"
                                >
                                    <polyline 
                                        points={lineChartData.toughPointsString}
                                        fill="none"
                                        stroke="#38bdf8" // sky-500
                                        strokeWidth="0.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    {lineChartData.toughPoints.map((p, i) => (
                                       p.count > 0 && <circle key={`tough-${i}`} cx={p.x} cy={p.y} r="0.8" fill="#38bdf8" stroke="white" strokeWidth="0.2" />
                                    ))}

                                    <polyline 
                                        points={lineChartData.happyPointsString}
                                        fill="none"
                                        stroke="#f59e0b" // amber-500
                                        strokeWidth="0.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                     {lineChartData.happyPoints.map((p, i) => (
                                       p.count > 0 && <circle key={`happy-${i}`} cx={p.x} cy={p.y} r="0.8" fill="#f59e0b" stroke="white" strokeWidth="0.2" />
                                    ))}
                                </svg>
                                
                                <div className="flex justify-around items-end h-full border-b border-slate-200 px-2">
                                    {dailyEnergies.map((day, index) => (
                                        <div key={index} className="flex flex-col items-center justify-end h-full w-full">
                                            <div 
                                                className="w-6 flex flex-col bg-slate-200 rounded-t-md overflow-hidden transition-all duration-300"
                                                style={{ height: `${(day.totalEnergy / maxTotalEnergy) * 100}%` }}
                                                title={`총 기운: ${day.totalEnergy}`}
                                            >
                                                <div 
                                                    className="bg-slate-400"
                                                    style={{ height: `${day.totalEnergy > 0 ? (day.badEnergy / day.totalEnergy) * 100 : 0}%` }}
                                                    title={`나쁜 기운: ${day.badEnergy}`}
                                                ></div>
                                                <div 
                                                    className="bg-green-500"
                                                    style={{ height: `${day.totalEnergy > 0 ? (day.goodEnergy / day.totalEnergy) * 100 : 0}%` }}
                                                    title={`좋은 기운: ${day.goodEnergy}`}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-slate-500 mt-2">{weekDayLabels[day.date.getDay()]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-center items-center gap-x-3 sm:gap-x-4 flex-wrap mt-3 text-xs text-slate-600">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-green-500"></span>
                                    <span>좋은 기운</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-400"></span>
                                    <span>나쁜 기운</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 border-t border-amber-500 relative flex justify-center">
                                        <div className="absolute -top-[3px] w-1 h-1 bg-amber-500 rounded-full"></div>
                                    </div>
                                    <span>흐뭇한소식</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 border-t border-sky-500 relative flex justify-center">
                                        <div className="absolute -top-[3px] w-1 h-1 bg-sky-500 rounded-full"></div>
                                    </div>
                                    <span>힘겨운소식</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <AdviceCoach logSummary={weeklyTotals} periodLabel="이번 주" />
                </div>
            )}
        </div>
    );
};

export default WeeklyReport;