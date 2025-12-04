
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  subLabel?: string;
  error?: string;
  tooltip?: string;
}

export const Input: React.FC<InputProps> = ({ label, subLabel, error, tooltip, className = '', ...props }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 ${className} relative`}>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="text-cyan-400 ml-1">*</span>}
        </label>
        {tooltip && (
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)} // Mobile support
          >
            <HelpCircle className="w-4 h-4 text-slate-500 hover:text-cyan-400 cursor-help transition-colors" />
            {showTooltip && (
              <div className="absolute left-0 bottom-full mb-2 w-56 p-2.5 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-slate-600 z-50 leading-relaxed">
                {tooltip}
                <div className="absolute left-1.5 -bottom-1 w-2 h-2 bg-slate-800 border-b border-r border-slate-600 rotate-45"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <input
        className={`bg-slate-800/50 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        {...props}
      />
      {subLabel && <span className="text-xs text-slate-500">{subLabel}</span>}
      {error && <span className="text-xs text-red-400 font-medium animate-pulse">{error}</span>}
    </div>
  );
};
