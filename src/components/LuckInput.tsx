import React, { useState } from 'react';

interface LogFormProps {
  label: string;
  onAdd: (data: { text: string; intensity: number }) => void;
  icon: React.ReactNode;
  color: 'green' | 'slate';
  value: string;
  onTextChange: (text: string) => void;
}

const LogForm: React.FC<LogFormProps> = ({ label, onAdd, icon, color, value, onTextChange }) => {
  const [intensity, setIntensity] = useState(5);

  const placeholderText = color === 'green'
    ? "어떤 좋은 말을 하셨나요?"
    : "어떤 나쁜 말을 하셨나요?";

  const handleAddClick = () => {
    const finalText = value.trim() || (color === 'slate' ? '짜증' : '그냥');
    onAdd({
      text: finalText,
      intensity,
    });
    setIntensity(5);
  };
  
  const colorClasses = {
    green: {
      accent: 'accent-green-500',
      text: 'text-green-600',
      bg: 'bg-green-600',
      hoverBg: 'hover:bg-green-700',
      ring: 'focus:ring-green-500',
      border: 'focus:border-green-500'
    },
    slate: {
      accent: 'accent-slate-500',
      text: 'text-slate-600',
      bg: 'bg-slate-600',
      hoverBg: 'hover:bg-slate-700',
      ring: 'focus:ring-slate-500',
      border: 'focus:border-slate-500'
    },
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className={`text-lg font-semibold ${colorClasses[color].text}`}>{label}</h3>
      </div>
      
      <div className="space-y-2">
        <label htmlFor={`${label}-text`} className="block text-sm font-medium text-slate-700">
          문장
        </label>
        <textarea
          id={`${label}-text`}
          value={value}
          onChange={(e) => onTextChange(e.target.value)}
          rows={2}
          className={`w-full p-2 border border-slate-300 rounded-md focus:ring-1 transition ${colorClasses[color].ring} ${colorClasses[color].border}`}
          placeholder={placeholderText}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`${label}-intensity`} className="block text-sm font-medium text-slate-700">
          강도: <span className={`font-bold ${colorClasses[color].text}`}>{intensity}</span>
        </label>
        <input
          id={`${label}-intensity`}
          type="range"
          min="1"
          max="10"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${colorClasses[color].accent}`}
        />
      </div>
      <button
        onClick={handleAddClick}
        className={`w-full text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses[color].bg} ${colorClasses[color].hoverBg} ${colorClasses[color].ring} transition-colors duration-300`}
      >
        기록 추가
      </button>
    </div>
  );
};

export default LogForm;