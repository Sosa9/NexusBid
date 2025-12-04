import React from 'react';
import { CalculatorStep } from '../types';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

interface StepWizardProps {
  currentStep: CalculatorStep;
  steps: { id: CalculatorStep; label: string }[];
}

export const StepWizard: React.FC<StepWizardProps> = ({ currentStep, steps }) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full -z-10" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-cyan-500/50 rounded-full transition-all duration-500 -z-10"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-900 px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isActive ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400 scale-110' : 
                    isCompleted ? 'border-green-500 bg-green-500/20 text-green-500' : 
                    'border-slate-700 bg-slate-800 text-slate-500'}
                `}
              >
                {isCompleted ? <CheckCircle2 size={20} /> : <span className="font-bold">{index + 1}</span>}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
