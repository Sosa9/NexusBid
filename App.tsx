
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calculator, 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Briefcase,
  TrendingUp,
  Info,
  Edit3,
  HelpCircle,
  Search,
  FileText
} from 'lucide-react';
import { 
  AppView, 
  CalculatorStep, 
  CompanyData, 
  Project, 
  TurnoverYear, 
  UPDATION_FACTORS 
} from './types';
import { 
  calculateA, 
  calculateB, 
  calculateBidCapacity, 
  calculateEffectiveBalance, 
  calculateAdjustedBalance,
  calculateUpdatedTurnover
} from './utils';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { StepWizard } from './components/StepWizard';

const INITIAL_TURNOVER: TurnoverYear[] = [
  { fiscalYear: '2020-21', amount: 0, updationFactor: 1.20, isNoFactor: false },
  { fiscalYear: '2021-22', amount: 0, updationFactor: 1.15, isNoFactor: false },
  { fiscalYear: '2022-23', amount: 0, updationFactor: 1.10, isNoFactor: false },
  { fiscalYear: '2023-24', amount: 0, updationFactor: 1.05, isNoFactor: false },
  { fiscalYear: '2024-25', amount: 0, updationFactor: 1.00, isNoFactor: false },
];

function App() {
  // State
  const [view, setView] = useState<AppView>('ONBOARDING');
  const [calcStep, setCalcStep] = useState<CalculatorStep>('TURNOVER');
  const [isLoading, setIsLoading] = useState(false);
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  
  // Data State
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  
  const [turnoverData, setTurnoverData] = useState<TurnoverYear[]>(INITIAL_TURNOVER);
  const [nValue, setNValue] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cValue, setCValue] = useState<number>(0);
  
  // Derived State (for Summary/Dashboard)
  const [savedData, setSavedData] = useState<CompanyData | null>(null);

  // Initialization
  useEffect(() => {
    const stored = localStorage.getItem('nexus_bid_data');
    if (stored) {
      const data = JSON.parse(stored);
      setSavedData(data);
      setCompanyName(data.companyName);
      setAddress(data.registeredAddress);
      // Pre-fill form if editing
      setTurnoverData(data.turnoverData);
      setNValue(data.nValue);
      setProjects(data.projects);
      setCValue(data.cValue);
      setView('DASHBOARD');
    }
  }, []);

  const handleSaveCompanyDetails = () => {
    if (!companyName.trim() || !address.trim()) return;
    
    setIsLoading(true);
    // Simulate API/Storage delay
    setTimeout(() => {
      setIsLoading(false);
      // If first time, go straight to calc
      if (!savedData) {
        setView('CALCULATOR');
      } else {
        setView('DASHBOARD');
      }
    }, 600);
  };

  const handleTurnoverChange = (index: number, field: keyof TurnoverYear, value: string) => {
    const newData = [...turnoverData];
    if (field === 'amount') {
      newData[index].amount = parseFloat(value) || 0;
    } else if (field === 'updationFactor') {
       if (value === 'NO_FACTOR') {
         newData[index].updationFactor = 1.00;
         newData[index].isNoFactor = true;
       } else {
         newData[index].updationFactor = parseFloat(value);
         newData[index].isNoFactor = false;
       }
    }
    setTurnoverData(newData);
  };

  const addProject = () => {
    setProjectSearchTerm(''); // Clear filter to show new project
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: '',
      participationPercentage: 100,
      startDate: '',
      constructionPeriodMonths: 12,
      contractValue: 0,
      completedValue: 0,
      anticipatedCompletionDate: ''
    };
    setProjects([...projects, newProject]);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const saveDraft = () => {
    setIsLoading(true);
    const data: CompanyData = {
      companyName,
      registeredAddress: address,
      turnoverData,
      nValue,
      projects,
      cValue,
      lastUpdated: new Date().toISOString()
    };
    
    setTimeout(() => {
      localStorage.setItem('nexus_bid_data', JSON.stringify(data));
      setSavedData(data); // Also update live data state
      setIsLoading(false);
    }, 500);
  };

  const saveData = () => {
    setIsLoading(true);
    const data: CompanyData = {
      companyName,
      registeredAddress: address,
      turnoverData,
      nValue,
      projects,
      cValue,
      lastUpdated: new Date().toISOString()
    };
    
    setTimeout(() => {
      localStorage.setItem('nexus_bid_data', JSON.stringify(data));
      setSavedData(data);
      setView('DASHBOARD');
      setCalcStep('TURNOVER'); // Reset wizard
      setIsLoading(false);
    }, 800);
  };

  const updateDashboardNValue = (val: number) => {
    if (!savedData) return;
    setIsLoading(true);
    
    // Simulate calculation time
    setTimeout(() => {
      const updatedData = { ...savedData, nValue: val };
      setSavedData(updatedData);
      setNValue(val); // Sync with wizard state
      localStorage.setItem('nexus_bid_data', JSON.stringify(updatedData));
      setIsLoading(false);
    }, 500);
  };

  // Helper validation for project
  const getProjectErrors = (p: Project) => {
    const errors: Record<string, string> = {};
    if (p.participationPercentage < 0 || p.participationPercentage > 100) errors.participationPercentage = "0 - 100%";
    if (p.constructionPeriodMonths < 0) errors.constructionPeriodMonths = "Cannot be negative";
    if (p.contractValue < 0) errors.contractValue = "Cannot be negative";
    if (p.completedValue < 0) errors.completedValue = "Cannot be negative";
    
    if (p.startDate && p.anticipatedCompletionDate) {
      if (new Date(p.anticipatedCompletionDate) <= new Date(p.startDate)) {
        errors.anticipatedCompletionDate = "Must be after Start Date";
      }
    }
    return errors;
  };

  // --- Views ---

  const renderLoadingOverlay = () => (
    isLoading && (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300">
        <div className="flex flex-col items-center gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyan-400 font-medium animate-pulse">Processing...</p>
        </div>
      </div>
    )
  );

  const renderOnboarding = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-cyan-500/20 p-4 rounded-full">
            <Building2 className="w-10 h-10 text-cyan-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-white">NexusBid</h1>
        <p className="text-slate-400 text-center mb-8">Enter your organization details to begin.</p>
        
        <div className="space-y-6">
          <Input 
            label="Company Name" 
            placeholder="e.g. Acme Constructions Pvt Ltd"
            value={companyName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
            required
            tooltip="The registered legal name of your entity."
          />
          <Input 
            label="Registered Address" 
            placeholder="Full business address"
            value={address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
            required
            tooltip="The official registered headquarters address."
          />
          <Button 
            fullWidth 
            onClick={handleSaveCompanyDetails}
            disabled={!companyName || !address}
          >
            Get Started <ArrowLeft className="rotate-180 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!savedData) return null;
    const bidCapacity = calculateBidCapacity(savedData);
    const A = calculateA(savedData.turnoverData);
    const B = calculateB(savedData.projects, savedData.nValue);

    return (
      <div className="max-w-5xl mx-auto p-6 pt-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-slate-400">{savedData.companyName}</p>
          </div>
          <Button variant="secondary" onClick={() => setView('CALCULATOR')}>
            <Calculator className="w-4 h-4" /> Edit Full Data
          </Button>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <p className="text-indigo-200 font-medium mb-2 uppercase tracking-wide text-sm">Available Bid Capacity</p>
              <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                <span className="text-2xl text-slate-400 mr-2">₹</span>
                {bidCapacity.toLocaleString('en-IN')}
                <span className="text-2xl text-slate-400 ml-2">Cr</span>
              </h2>
              <div className="mt-4 flex gap-4 text-sm text-slate-400">
                <p>Formula: (A × N × 2.5) - B + C</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <p className="text-xs text-slate-400 uppercase">Max Turnover (A)</p>
                <p className="text-xl font-bold text-cyan-300">₹ {A.toLocaleString('en-IN')} Cr</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10 relative group hover:bg-white/10 transition-colors">
                <p className="text-xs text-slate-400 uppercase mb-1 flex items-center gap-2">
                  Multiplier (N) <Edit3 className="w-3 h-3 text-slate-500" />
                </p>
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    className="bg-transparent border-b border-cyan-500/30 w-16 text-xl font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 p-0"
                    value={savedData.nValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDashboardNValue(parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-sm font-bold text-cyan-300">Years</span>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <p className="text-xs text-slate-400 uppercase">Commitments (B)</p>
                <p className="text-xl font-bold text-orange-400">₹ {B.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr</p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <p className="text-xs text-slate-400 uppercase">Bonus (C)</p>
                <p className="text-xl font-bold text-green-400">₹ {savedData.cValue.toLocaleString('en-IN')} Cr</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Financial Overview
              </h3>
              <div className="space-y-3">
                {savedData.turnoverData.map((t) => (
                   <div key={t.fiscalYear} className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
                      <span className="text-slate-400">{t.fiscalYear}</span>
                      <div className="text-right">
                        <span className="block text-white font-medium">₹ {t.amount} Cr</span>
                        <span className="text-xs text-slate-500">Updation: x{t.updationFactor}</span>
                      </div>
                   </div>
                ))}
              </div>
           </div>

           <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-400" />
                Active Commitments
              </h3>
              {savedData.projects.length === 0 ? (
                <p className="text-slate-500 italic">No ongoing projects recorded.</p>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {savedData.projects.map((p) => {
                     const effectiveBalance = calculateEffectiveBalance(p, savedData.nValue);
                     return (
                      <div key={p.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-200">{p.name}</span>
                          <span className="text-orange-300 text-sm">₹ {effectiveBalance.toFixed(2)} Cr</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{p.participationPercentage}% Share</span>
                          <span>Due: {p.anticipatedCompletionDate}</span>
                        </div>
                      </div>
                     )
                  })}
                </div>
              )}
           </div>
        </div>
      </div>
    );
  };

  // --- Calculator Steps ---

  const renderStepTurnover = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-cyan-900/20 border border-cyan-800/50 p-4 rounded-xl flex gap-3 items-start mb-6">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-sm text-cyan-200">
          Enter your company's Annual Turnover for the last 5 financial years. Select the appropriate Updation Factor to calculate the adjusted value at current price levels.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700 text-slate-300 text-sm">
              <th className="p-4 font-medium">Fiscal Year</th>
              <th className="p-4 font-medium">Turnover (Cr)</th>
              <th className="p-4 font-medium">Updation Factor</th>
              <th className="p-4 font-medium">Updated Value (Cr)</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800/30">
            {turnoverData.map((row, idx) => (
              <tr key={row.fiscalYear} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-medium text-slate-300">{row.fiscalYear}</td>
                <td className="p-4">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white w-32 focus:border-cyan-500 outline-none"
                    value={row.amount === 0 ? '0' : (row.amount || '')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTurnoverChange(idx, 'amount', e.target.value)}
                    placeholder="0.00"
                  />
                </td>
                <td className="p-4">
                  <select
                    className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white w-48 focus:border-cyan-500 outline-none"
                    value={row.isNoFactor ? 'NO_FACTOR' : row.updationFactor}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleTurnoverChange(idx, 'updationFactor', e.target.value)}
                  >
                    {UPDATION_FACTORS.map((f) => (
                      <option key={f.label} value={f.label === 'No Updation Factor' ? 'NO_FACTOR' : f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <span className="font-bold text-cyan-400">
                    {calculateUpdatedTurnover(row.amount, row.updationFactor).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={() => setCalcStep('N_VALUE')}>
          Next: Value of N <ArrowLeft className="rotate-180 w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderStepN = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-semibold mb-6">Completion Period (N)</h3>
        
        <div className="max-w-xs mx-auto mb-4">
          <Input
            label="Value of N (Years)"
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g. 2.5"
            value={nValue || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNValue(parseFloat(e.target.value))}
            className="text-center"
            tooltip="Number of years prescribed for Completion of the works for which current bids are invited."
          />
        </div>
        
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          "N" determines the effective balance of existing projects based on whether they complete within or after this period.
        </p>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={() => setCalcStep('TURNOVER')}>Back</Button>
        <Button onClick={() => setCalcStep('PROJECTS')} disabled={!nValue}>
          Next: Commitments <ArrowLeft className="rotate-180 w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderStepProjects = () => {
    const totalB = calculateB(projects, nValue);
    
    const filteredProjects = projects.filter(p => 
      p.name.toLowerCase().includes(projectSearchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold">Ongoing Commitments</h3>
            <p className="text-sm text-slate-400 mt-1">Add all ongoing project works to calculate Value B.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 focus:border-cyan-500 outline-none"
                value={projectSearchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProjectSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={addProject} className="bg-indigo-600 hover:bg-indigo-500 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Project
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No projects added yet.</p>
            <Button variant="ghost" onClick={addProject} className="mt-2 text-cyan-400">Add your first project</Button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 border border-slate-700 rounded-2xl bg-slate-800/20">
            <p className="text-slate-400">No projects match "{projectSearchTerm}"</p>
            <Button variant="ghost" onClick={() => setProjectSearchTerm('')} className="mt-2 text-cyan-400">Clear Search</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project, idx) => {
              const effectiveBalance = calculateEffectiveBalance(project, nValue);
              const adjustedBalance = calculateAdjustedBalance(project.participationPercentage, effectiveBalance);
              const errors = getProjectErrors(project);
              
              return (
              <div key={project.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 relative group transition-all hover:border-slate-600">
                <button 
                  onClick={() => removeProject(project.id)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <h4 className="font-medium text-slate-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                  Project {project.name ? `- ${project.name}` : ''}
                  {Object.keys(errors).length > 0 && <span className="text-xs text-red-400 bg-red-900/20 px-2 py-0.5 rounded">Action Required</span>}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <Input 
                    label="Project Name" 
                    value={project.name} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(project.id, 'name', e.target.value)} 
                    placeholder="Enter name"
                    tooltip="The official name of the work/contract."
                  />
                  <Input 
                    label="Participation (%)" 
                    type="number" 
                    min="0" max="100"
                    value={project.participationPercentage} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(project.id, 'participationPercentage', parseFloat(e.target.value))} 
                    error={errors.participationPercentage}
                    tooltip="Your share in the Joint Venture or Consortium. 100% for sole bidder."
                  />
                  <Input 
                    label="Start Date" 
                    type="date"
                    value={project.startDate} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(project.id, 'startDate', e.target.value)} 
                    tooltip="Date of commencement of the work."
                  />
                  <Input 
                    label="Construction Period (Months)" 
                    type="number"
                    value={project.constructionPeriodMonths} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(project.id, 'constructionPeriodMonths', parseFloat(e.target.value))}
                    error={errors.constructionPeriodMonths}
                    tooltip="Total period allowed for completion as per agreement."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-lg">
                   <Input 
                    label="Contract Value (Cr)" 
                    type="number"
                    value={project.contractValue === 0 ? '0' : (project.contractValue || '')} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(project.id, 'contractValue', parseFloat(e.target.value))}
                    error={errors.contractValue}
                    tooltip="Total value of the contract (in Crores)."
                  />
                   <Input 
                    label="Work Completed (Cr)" 
                    type="number"
                    value={project.completedValue === 0 ? '0' : (project.completedValue || '')} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(project.id, 'completedValue', parseFloat(e.target.value))}
                    error={errors.completedValue}
                    tooltip="Value of work executed/completed till date (in Crores)."
                  />
                   <div className="flex flex-col gap-1.5 opacity-70">
                      <div className="flex items-center gap-2">
                         <label className="text-sm font-medium text-slate-300">Balance Value (N)</label>
                         <HelpCircle className="w-3 h-3 text-slate-500 cursor-help" />
                      </div>
                      <div className="px-4 py-3 bg-slate-800 rounded-lg text-slate-300 border border-slate-700">
                        {effectiveBalance.toFixed(2)}
                      </div>
                   </div>
                   <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-cyan-400">Adj. Balance</label>
                      </div>
                      <div className="px-4 py-3 bg-cyan-900/20 rounded-lg text-cyan-300 font-bold border border-cyan-800/50">
                        {adjustedBalance.toFixed(2)}
                      </div>
                   </div>
                </div>

                <div className="mt-4">
                  <Input 
                    label="Anticipated Completion Date" 
                    type="date"
                    value={project.anticipatedCompletionDate} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(project.id, 'anticipatedCompletionDate', e.target.value)} 
                    required
                    error={errors.anticipatedCompletionDate}
                    tooltip="The likely date of completion. Must be later than the start date."
                  />
                </div>
              </div>
            )})}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex justify-between items-center sticky bottom-4 shadow-xl z-10">
          <span className="text-slate-400">Total Value B (Adjusted Balance)</span>
          <span className="text-2xl font-bold text-white">₹ {totalB.toFixed(2)} Cr</span>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="secondary" onClick={() => setCalcStep('N_VALUE')}>Back</Button>
          <Button onClick={() => setCalcStep('BONUS')}>
            Next: Bonus Value <ArrowLeft className="rotate-180 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderStepBonus = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-semibold mb-6">Bonus Received (C)</h3>
        
        <div className="max-w-xs mx-auto mb-4">
          <Input
            label="Value of C (Crores)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={cValue === 0 ? '0' : (cValue || '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCValue(parseFloat(e.target.value))}
            className="text-center"
            tooltip="Amount of bonus received in EPC projects during last 5 years (updated to current price level)."
          />
        </div>
        
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          The amount of Bonus Received, if any, in EPC Projects during last 5 years (updated to price level).
        </p>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={() => setCalcStep('PROJECTS')}>Back</Button>
        <Button onClick={() => setCalcStep('SUMMARY')}>
          Review & Calculate <ArrowLeft className="rotate-180 w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderStepSummary = () => {
    const A = calculateA(turnoverData);
    const B = calculateB(projects, nValue);
    const result = (A * nValue * 2.5) - B + cValue;

    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
          <h2 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Calculated Bid Capacity</h2>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            ₹ {result.toFixed(2)} Cr
          </div>
          <p className="text-slate-500 text-sm">Based on formula: (A × N × 2.5) - B + C</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-xs block mb-1">Max Updated Turnover (A)</span>
            <span className="text-xl font-semibold text-white">₹ {A.toFixed(2)}</span>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-xs block mb-1">Multiplier (N)</span>
            <span className="text-xl font-semibold text-white">{nValue} Years</span>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-xs block mb-1">Commitments (B)</span>
            <span className="text-xl font-semibold text-white">₹ {B.toFixed(2)}</span>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-xs block mb-1">Bonus (C)</span>
            <span className="text-xl font-semibold text-white">₹ {cValue.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="secondary" onClick={() => setCalcStep('BONUS')}>Back</Button>
          <Button onClick={saveData} className="gap-2">
            <Save className="w-4 h-4" /> Save to Dashboard
          </Button>
        </div>
      </div>
    );
  };

  const renderCalculator = () => {
    const steps: { id: CalculatorStep; label: string }[] = [
      { id: 'TURNOVER', label: 'Turnover' },
      { id: 'N_VALUE', label: 'N Value' },
      { id: 'PROJECTS', label: 'Projects' },
      { id: 'BONUS', label: 'Bonus' },
      { id: 'SUMMARY', label: 'Result' },
    ];

    return (
      <div className="max-w-5xl mx-auto p-6 pt-12 min-h-screen flex flex-col">
         <div className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => view === 'DASHBOARD' || savedData ? setView('DASHBOARD') : null} disabled={!savedData} className="!p-2">
                 <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                 <h1 className="text-2xl font-bold">Capacity Calculator</h1>
                 <p className="text-slate-400 text-sm">Complete the steps below</p>
              </div>
           </div>
           <Button variant="secondary" onClick={saveDraft} className="gap-2 text-sm">
             <FileText className="w-4 h-4" /> Save Draft
           </Button>
         </div>

         <StepWizard currentStep={calcStep} steps={steps} />

         <div className="flex-1 bg-slate-900/50 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-inner">
            {calcStep === 'TURNOVER' && renderStepTurnover()}
            {calcStep === 'N_VALUE' && renderStepN()}
            {calcStep === 'PROJECTS' && renderStepProjects()}
            {calcStep === 'BONUS' && renderStepBonus()}
            {calcStep === 'SUMMARY' && renderStepSummary()}
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 relative">
      {renderLoadingOverlay()}
      {view === 'ONBOARDING' && renderOnboarding()}
      {view === 'DASHBOARD' && renderDashboard()}
      {view === 'CALCULATOR' && renderCalculator()}
    </div>
  );
}

export default App;
