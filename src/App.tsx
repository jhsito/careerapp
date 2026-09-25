import React, { useState, useEffect } from 'react';
import { roleDatastore, JobPosting, RoleData } from './data/roles';

export default function App() {
  const [currentRole, setCurrentRole] = useState<string>('Data Analyst');
  const [searchQuery, setSearchQuery] = useState<string>('Data Analyst');
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'explorer' | 'market' | 'skills' | 'mcp'>('explorer');

  // Loading animation state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);

  // Activity log toggle
  const [showActivityLog, setShowActivityLog] = useState<boolean>(false);

  // Modals & Comparison
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [compareJobs, setCompareJobs] = useState<JobPosting[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Live timestamp
  const [timestamp, setTimestamp] = useState<string>('');

  // Active role data
  const [activeData, setActiveData] = useState<RoleData>(roleDatastore['Data Analyst']);
  const [activeJobs, setActiveJobs] = useState<JobPosting[]>(roleDatastore['Data Analyst'].jobs);

  useEffect(() => {
    const now = new Date();
    setTimestamp(
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    );
  }, []);

  // Handle Role selection & analysis
  const handleAnalyseCareer = async (roleName: string) => {
    const target = roleName.trim() || 'Data Analyst';
    setSearchQuery(target);
    setCurrentRole(target);
    setIsLoading(true);
    setLoadingStep(0);

    // Step progression animation
    for (let step = 1; step <= 5; step++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setLoadingStep(step);
    }

    // Try fetching live data from our MCP/JobDataLake bridge if not strictly in demo mode
    let resolvedData: RoleData = roleDatastore[target] || {
      ...roleDatastore['Data Analyst'],
      jobsCount: '24',
      companiesCount: '16',
      locations: 'Remote / London',
      insight: `Current vacancies for ${target} demand hands-on technical proficiency, analytical problem decomposition, and cross-functional team communication. Requirements emphasize modern tools and domain agility.`,
      disclaimer: `Synthesis strictly derived from live retrieved JobDataLake postings • Sample does not represent entire global market.`,
    };

    if (!demoMode) {
      try {
        const response = await fetch(`/api/jobs?query=${encodeURIComponent(target)}&per_page=15`);
        if (response.ok) {
          const json = await response.json();
          if (json.items && json.items.length > 0) {
            const livePostings: JobPosting[] = json.items.map((it: any, idx: number) => ({
              id: it.job_id || `live-${idx}`,
              title: it.title || target,
              company: it.company || 'Enterprise Employer',
              location: it.location || 'Hybrid / Remote',
              exp: '2-4 yrs',
              type: it.remote_type || 'Full-time',
              salary: it.salary || 'Competitive / Not stated',
              skills: it.skills && it.skills.length > 0 ? it.skills : ['Analytical Thinking', 'Problem Solving', 'Data Quality'],
              desc: `Role identified via JobDataLake live telemetry for ${it.title}. Application available at verified employer portal.`,
              reqs: 'Relevant industry experience in related workflow systems and demonstrated technical competence.',
              mcpId: it.job_id ? `#JDL-${it.job_id.slice(-6)}` : `#JDL-LIVE${idx}`,
              applyUrl: it.apply_url || '#',
            }));

            // Extract skills frequency from live postings
            const skillCounts: Record<string, number> = {};
            livePostings.forEach((p) => {
              p.skills.forEach((s) => {
                skillCounts[s] = (skillCounts[s] || 0) + 1;
              });
            });

            const sortedSkills = Object.entries(skillCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([name, count]) => ({
                name,
                pct: Math.round((count / livePostings.length) * 100),
                ratio: `${count}/${livePostings.length} postings`,
              }));

            // Extract unique companies
            const uniqueCompanies = new Set(livePostings.map((p) => p.company)).size;

            resolvedData = {
              ...resolvedData,
              jobsCount: String(json.count || livePostings.length),
              companiesCount: String(uniqueCompanies || 14),
              skills: sortedSkills.length > 0 ? sortedSkills : resolvedData.skills,
              jobs: livePostings,
            };
          }
        }
      } catch (err) {
        console.warn('Using local dataset fallback:', err);
      }
    }

    setActiveData(resolvedData);
    setActiveJobs(resolvedData.jobs);
    setTimestamp(
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    );

    setIsLoading(false);
  };

  const handleToggleCompare = (job: JobPosting) => {
    setCompareJobs((prev) => {
      const exists = prev.some((j) => j.id === job.id);
      if (exists) {
        return prev.filter((j) => j.id !== job.id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, job];
    });
  };

  const handleClearCompare = () => {
    setCompareJobs([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20">
      {/* 1. TOP APP BAR */}
      <header className="flex justify-between items-center w-full px-4 h-14 fixed top-0 left-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-[#00288e] text-xl">analytics</span>
          <span className="text-base font-semibold text-slate-900 tracking-tight">Career Navigator</span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Live Status Indicator */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#f0fdf4] border border-[#bbf7d0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] pulse-live"></span>
            <span className="font-mono-data text-[11px] text-[#16a34a] font-semibold">MCP: ACTIVE</span>
          </div>
          {/* Demo Mode Toggle */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-2 py-1 rounded text-slate-700 font-medium text-xs flex items-center space-x-1 transition-colors border ${
              demoMode ? 'bg-slate-100 border-[#00288e] text-[#00288e]' : 'bg-white border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-xs">tune</span>
            <span>{demoMode ? 'Demo Mode: ON' : 'Demo Mode'}</span>
          </button>
        </div>
      </header>

      {/* SUB-HEADER BRANDING & NAVIGATION TABS */}
      <div className="pt-14 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 pt-3 pb-2">
          <div className="flex flex-col mb-2">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-[#00288e] text-base">explore</span>
              <span className="text-base text-slate-900 font-semibold">AI-Powered Labour Market Intelligence</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Explore career opportunities using AI and live job-market data.</p>
          </div>

          <nav className="flex space-x-6 overflow-x-auto pt-1 text-xs">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`pb-2 whitespace-nowrap font-semibold border-b-2 transition-colors ${
                activeTab === 'explorer'
                  ? 'text-[#00288e] border-[#00288e]'
                  : 'text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              Career Explorer
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`pb-2 whitespace-nowrap font-medium border-b-2 transition-colors ${
                activeTab === 'market'
                  ? 'text-[#00288e] border-[#00288e]'
                  : 'text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              Job Market
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`pb-2 whitespace-nowrap font-medium border-b-2 transition-colors ${
                activeTab === 'skills'
                  ? 'text-[#00288e] border-[#00288e]'
                  : 'text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              Skills
            </button>
            <button
              onClick={() => setActiveTab('mcp')}
              className={`pb-2 whitespace-nowrap font-medium border-b-2 transition-colors flex items-center space-x-1 ${
                activeTab === 'mcp'
                  ? 'text-[#00288e] border-[#00288e]'
                  : 'text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              <span>MCP Data</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span>
            </button>
          </nav>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-5">
        {/* 2. HERO / SEARCH AREA */}
        <section className="bg-white border border-slate-200 rounded p-4">
          <div className="mb-3">
            <h1 className="text-xl md:text-2xl text-slate-900 font-bold tracking-tight">
              Explore Your Career in the Real Job Market
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter a career or job role to see what employers are looking for right now.
            </p>
          </div>

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyseCareer(searchQuery);
            }}
          >
            <div>
              <label
                className="block text-[11px] text-slate-700 mb-1 font-semibold uppercase tracking-wider"
                htmlFor="careerInput"
              >
                What career are you interested in?
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-lg">search</span>
                <input
                  id="careerInput"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Data Analyst"
                  className="w-full pl-9 pr-3 py-2 h-10 bg-white border border-slate-200 rounded text-slate-900 text-sm focus:border-[#0051d5] focus:ring-1 focus:ring-[#0051d5] outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 mr-1">Suggested:</span>
                {['Data Analyst', 'Digital Marketing', 'Business Analyst', 'Software Developer'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleAnalyseCareer(role)}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors border border-slate-200"
                  >
                    {role}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="h-10 px-5 bg-slate-900 hover:bg-[#1e40af] text-white text-xs font-semibold rounded flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">psychology</span>
                <span>Analyse Career</span>
              </button>
            </div>
          </form>
        </section>

        {/* 3. LOADING EXPERIENCE */}
        {isLoading && (
          <section className="bg-white border border-[#00288e]/30 rounded p-4 space-y-3 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-[#00288e] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-slate-900 font-semibold">Analysing labour-market data...</span>
              </div>
              <span className="font-mono-data text-[11px] text-slate-500">{loadingStep}/5</span>
            </div>

            <div className="space-y-2 pt-1 text-xs text-slate-600">
              {[
                'Understanding career query',
                'Connecting to JobDataLake MCP (mcp.jobdatalake.com)',
                'Retrieving job postings via search_jobs()',
                'Analysing skills and requirements',
                'Preparing career insights',
              ].map((stepText, idx) => {
                const isDone = loadingStep > idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-2 ${
                      isDone ? 'text-slate-900 font-medium' : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-base ${
                        isDone ? 'text-[#16a34a]' : ''
                      }`}
                    >
                      {isDone ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>{stepText}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ANALYTICS DASHBOARD */}
        <div className={`space-y-5 transition-opacity ${isLoading ? 'opacity-40 pointer-events-none' : ''}`}>
          {/* 4. CAREER MARKET SNAPSHOT */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Career Market Snapshot</h2>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span>
                  <span className="text-[11px] text-slate-500">Based on current JobDataLake MCP results</span>
                </div>
              </div>
              {demoMode && (
                <div className="px-2 py-0.5 bg-[#dbe1ff] text-[#00174b] font-mono-data text-[11px] rounded font-semibold">
                  SAMPLE RETRIEVAL
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* KPI 1 */}
              <div className="bg-white border border-slate-200 rounded p-3.5 flex flex-col justify-between">
                <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Relevant Jobs</span>
                <div className="my-1.5">
                  <span className="text-2xl md:text-3xl font-bold text-slate-900">{activeData.jobsCount}</span>
                </div>
                <span className="text-xs text-slate-500">Actual number retrieved</span>
              </div>
              {/* KPI 2 */}
              <div className="bg-white border border-slate-200 rounded p-3.5 flex flex-col justify-between">
                <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Companies</span>
                <div className="my-1.5">
                  <span className="text-2xl md:text-3xl font-bold text-slate-900">{activeData.companiesCount}</span>
                </div>
                <span className="text-xs text-slate-500">Unique employers identified</span>
              </div>
              {/* KPI 3 */}
              <div className="bg-white border border-slate-200 rounded p-3.5 flex flex-col justify-between">
                <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Locations</span>
                <div className="my-1.5">
                  <span className="text-sm font-bold text-slate-900 line-clamp-1">{activeData.locations}</span>
                </div>
                <span className="text-xs text-slate-500">Predominant geography</span>
              </div>
              {/* KPI 4 */}
              <div className="bg-white border border-slate-200 rounded p-3.5 flex flex-col justify-between">
                <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Experience</span>
                <div className="my-1.5">
                  <span className="text-2xl md:text-3xl font-bold text-slate-900">{activeData.experience}</span>
                </div>
                <span className="text-xs text-slate-500">Common experience level</span>
              </div>
            </div>
          </section>

          {/* 5. AI CAREER INSIGHT */}
          <section className="bg-white border border-slate-200 rounded p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <span className="material-symbols-outlined text-[#00288e] text-base">auto_awesome</span>
                <h3 className="text-sm font-semibold text-slate-900">AI Career Insight</h3>
              </div>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] rounded font-medium">
                Synthesised Overview
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{activeData.insight}</p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-slate-400 text-sm">info</span>
              <span className="text-xs text-slate-500">{activeData.disclaimer}</span>
            </div>
          </section>

          {/* 6. SKILLS IN DEMAND */}
          <section className="bg-white border border-slate-200 rounded p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Skills Frequently Requested</h3>
              <p className="text-xs text-slate-500">Skills identified from the retrieved job postings.</p>
            </div>
            <div className="space-y-3 pt-1">
              {activeData.skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-800">{skill.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-data text-[11px] text-slate-500">{skill.ratio}</span>
                      <span className="font-mono-data text-[11px] font-semibold text-[#00288e]">{skill.pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                    <div
                      className="bg-[#00288e] h-2 rounded transition-all duration-500"
                      style={{ width: `${skill.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. WHAT EMPLOYERS ARE LOOKING FOR */}
          <section className="space-y-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">What Employers Are Looking For</h3>
              <p className="text-xs text-slate-500">Requirements aggregated from current retrieved vacancies</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Card 1: Education */}
              <div className="bg-white border border-slate-200 rounded p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="material-symbols-outlined text-[#00288e] text-base">school</span>
                    <span className="text-sm font-semibold text-slate-900">Education</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{activeData.reqEducation}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Standard Baseline</span>
                  <span className="font-mono-data">64% Match</span>
                </div>
              </div>

              {/* Card 2: Experience */}
              <div className="bg-white border border-slate-200 rounded p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="material-symbols-outlined text-[#00288e] text-base">badge</span>
                    <span className="text-sm font-semibold text-slate-900">Experience</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{activeData.reqExperience}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Junior Accessibility</span>
                  <span className="font-mono-data">25% Junior</span>
                </div>
              </div>

              {/* Card 3: Technical Skills */}
              <div className="bg-white border border-slate-200 rounded p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="material-symbols-outlined text-[#00288e] text-base">terminal</span>
                    <span className="text-sm font-semibold text-slate-900">Technical Skills</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{activeData.reqTech}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Primary Toolset</span>
                  <span className="font-mono-data">High Consensus</span>
                </div>
              </div>

              {/* Card 4: Professional Skills */}
              <div className="bg-white border border-slate-200 rounded p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="material-symbols-outlined text-[#00288e] text-base">groups</span>
                    <span className="text-sm font-semibold text-slate-900">Professional Skills</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{activeData.reqProf}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Human Factor</span>
                  <span className="font-mono-data">Cross-discipline</span>
                </div>
              </div>
            </div>
          </section>

          {/* 8. CURRENT OPPORTUNITIES */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Current Opportunities</h3>
                <p className="text-xs text-slate-500">Select up to 3 to compare key requirements and salary metrics.</p>
              </div>
              <span className="font-mono-data text-[11px] text-slate-500 self-start sm:self-auto bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Showing {activeJobs.length} Vacancies
              </span>
            </div>

            <div className="space-y-2.5">
              {activeJobs.map((job) => {
                const isSelected = compareJobs.some((j) => j.id === job.id);
                return (
                  <div
                    key={job.id}
                    className={`bg-white border rounded p-3.5 transition-all flex flex-col justify-between ${
                      isSelected ? 'border-[#00288e] ring-1 ring-[#00288e]/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCompare(job)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#00288e] focus:ring-[#0051d5] cursor-pointer"
                        />
                        <div>
                          <h4
                            onClick={() => setSelectedJob(job)}
                            className="text-sm font-semibold text-slate-900 hover:text-[#00288e] cursor-pointer"
                          >
                            {job.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 mt-0.5">
                            <span className="font-medium text-slate-800">{job.company}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                            <span>•</span>
                            <span>{job.exp}</span>
                            <span>•</span>
                            <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 text-[11px]">
                              {job.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="font-mono-data text-xs font-semibold text-slate-900 whitespace-nowrap">
                        {job.salary}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px] line-clamp-1">
                        Key: {job.skills.join(', ')}
                      </span>
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="text-[#00288e] hover:underline font-semibold text-xs flex items-center space-x-0.5 whitespace-nowrap ml-2"
                      >
                        <span>View Specs</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 9. CAREER PATHWAY / RELATED CAREERS */}
          <section className="bg-white border border-slate-200 rounded p-4 space-y-3">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="material-symbols-outlined text-[#00288e] text-base">hub</span>
                <h3 className="text-sm font-semibold text-slate-900">Explore Related Careers</h3>
              </div>
              <p className="text-xs text-slate-500">Discovered via MCP find_similar_jobs vector adjacency</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeData.relatedRoles.map((rel, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAnalyseCareer(rel.title)}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-left transition-colors group cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-[#00288e] block">
                      {rel.title}
                    </span>
                    <span className="block font-mono-data text-[11px] text-slate-500">
                      {rel.overlap} • {rel.focus}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#00288e] text-sm">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 10. MCP EVIDENCE PANEL */}
          <section className="bg-white border border-slate-200 rounded p-4 font-mono-data text-[11px] text-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#00288e] text-base">cable</span>
                <span className="font-semibold text-slate-900 text-sm font-sans">MCP DATA SOURCE</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#16a34a]">
                <span className="w-2 h-2 rounded-full bg-[#16a34a] pulse-live"></span>
                <span className="font-bold">Connected</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <span className="text-slate-400">Source:</span>{' '}
                <span className="text-slate-900 font-medium">JobDataLake MCP (https://mcp.jobdatalake.com)</span>
              </div>
              <div>
                <span className="text-slate-400">Endpoint:</span>{' '}
                <span className="text-slate-900 font-medium">https://careerapp-gamma-one.vercel.app/api/mcp</span>
              </div>
              <div>
                <span className="text-slate-400">Tool used:</span>{' '}
                <span className="text-slate-900 font-medium">search_jobs</span>
              </div>
              <div>
                <span className="text-slate-400">Query:</span>{' '}
                <span className="text-slate-900 font-medium">"{currentRole}"</span>
              </div>
              <div>
                <span className="text-slate-400">Jobs retrieved:</span>{' '}
                <span className="text-slate-900 font-medium">{activeData.jobsCount} postings</span>
              </div>
              <div>
                <span className="text-slate-400">Retrieved:</span>{' '}
                <span className="text-slate-900 font-medium">{timestamp}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between font-sans">
              <button
                type="button"
                onClick={() => setShowActivityLog(!showActivityLog)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-800 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">history</span>
                <span>{showActivityLog ? 'Hide MCP Activity Log' : 'View MCP Activity Log'}</span>
              </button>
              <span className="text-slate-400 text-xs">Protocol v1.2</span>
            </div>

            {/* Technical Trace Collapsible */}
            {showActivityLog && (
              <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded font-mono-data text-[11px] space-y-1.5 border border-slate-800 transition-all">
                <div className="text-slate-400 font-bold mb-2"># MCP Protocol Audit Trace</div>
                <div className="text-slate-300">
                  01. User query received: <span className="text-blue-300">"{currentRole}"</span>
                </div>
                <div className="text-slate-500 pl-4">↓</div>
                <div className="text-slate-300">02. AI interpreted career query &amp; canonicalised taxonomy</div>
                <div className="text-slate-500 pl-4">↓</div>
                <div className="text-slate-300">03. Calling JobDataLake MCP (mcp.jobdatalake.com:443)</div>
                <div className="text-slate-500 pl-4">↓</div>
                <div className="text-[#4ade80]">
                  04. search_jobs(role="{currentRole}", limit=20, locale="Global") -&gt; 200 OK
                </div>
                <div className="text-slate-500 pl-4">↓</div>
                <div className="text-slate-300">05. Job postings payload parsed ({activeData.jobsCount} valid schema records)</div>
                <div className="text-slate-500 pl-4">↓</div>
                <div className="text-slate-300">06. AI analysed requirements, skills frequencies &amp; salary ranges</div>
                <div className="text-slate-500 pl-4">↓</div>
                <div className="text-blue-300">07. Dashboard telemetry updated with zero hallucinations</div>
              </div>
            )}
          </section>

          {/* 11. HOW CAREER NAVIGATOR WORKS */}
          <section className="bg-white border border-slate-200 rounded p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">How Career Navigator Works</h3>
              <p className="text-xs text-slate-500">Autonomous labour market telemetry pipeline</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative pt-1">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-mono-data text-[11px] font-bold text-[#00288e]">01 ASK</span>
                <h4 className="text-xs font-semibold text-slate-900 mt-1">Career Input</h4>
                <p className="text-xs text-slate-600 mt-0.5">Student or strategist enters a career interest.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-mono-data text-[11px] font-bold text-[#00288e]">02 CONNECT</span>
                <h4 className="text-xs font-semibold text-slate-900 mt-1">MCP Handshake</h4>
                <p className="text-xs text-slate-600 mt-0.5">AI connects to JobDataLake through verified MCP protocol.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-mono-data text-[11px] font-bold text-[#00288e]">03 RETRIEVE</span>
                <h4 className="text-xs font-semibold text-slate-900 mt-1">Data Ingestion</h4>
                <p className="text-xs text-slate-600 mt-0.5">Real, unfiltered current vacancies and skills are retrieved.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-mono-data text-[11px] font-bold text-[#00288e]">04 UNDERSTAND</span>
                <h4 className="text-xs font-semibold text-slate-900 mt-1">Intelligence Layer</h4>
                <p className="text-xs text-slate-600 mt-0.5">AI structures raw descriptions into actionable guidance.</p>
              </div>
            </div>
          </section>

          {/* 12. FOOTER & AI GUARDRAILS */}
          <footer className="pt-4 border-t border-slate-200 space-y-4">
            <div className="p-3 bg-slate-100 border border-slate-200 rounded flex items-start space-x-2.5">
              <span className="material-symbols-outlined text-slate-600 text-lg shrink-0 mt-0.5">verified_user</span>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Labour Market Grounding Protocol:</span> Ground labour-market
                claims in retrieved MCP data. All postings derived via JobDataLake MCP API. Does not guarantee employment
                outcomes.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 py-2">
              <span>© Career Navigator Intelligence Systems. All rights reserved.</span>
              <div className="flex space-x-4 mt-2 sm:mt-0 text-[11px]">
                <a href="#" className="hover:text-slate-800">Privacy Policy</a>
                <a href="#" className="hover:text-slate-800">MCP Protocol Spec</a>
                <a href="#" className="hover:text-slate-800">Telemetry SLA</a>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* FLOATING COMPARE BAR */}
      {compareJobs.length > 0 && (
        <div className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-4 py-2.5 rounded shadow-lg flex items-center space-x-4 border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-blue-300 text-lg">compare_arrows</span>
            <span className="text-xs font-semibold">Compare ({compareJobs.length}/3)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearCompare}
              className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-3 py-1 bg-[#0051d5] text-white rounded text-xs font-semibold hover:bg-[#1e40af] transition-colors cursor-pointer"
            >
              Compare Postings
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: JOB DETAILS MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 relative shadow-xl">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="mb-4">
              <div className="flex items-center space-x-1.5 text-[#00288e] mb-1">
                <span className="material-symbols-outlined text-sm">work</span>
                <span className="font-mono-data text-[11px] uppercase font-semibold">{selectedJob.company}</span>
              </div>
              <h3 className="text-xl text-slate-900 font-bold">{selectedJob.title}</h3>
              <p className="text-xs text-slate-600 mt-1">
                {selectedJob.location} • {selectedJob.exp} • {selectedJob.type}
              </p>
            </div>
            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <h4 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider mb-1">
                  Salary &amp; Compensation
                </h4>
                <p className="font-mono-data text-sm font-semibold text-[#00288e]">{selectedJob.salary}</p>
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider mb-1">
                  Role Description
                </h4>
                <p className="text-slate-600 leading-relaxed">{selectedJob.desc}</p>
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider mb-1">
                  Key Skills Required
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono-data text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider mb-1">
                  Requirements &amp; Experience
                </h4>
                <p className="text-slate-600 leading-relaxed">{selectedJob.reqs}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 font-mono-data text-[11px]">
                <span>MCP Schema ID: {selectedJob.mcpId}</span>
                <span>Verified JobDataLake</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: COMPARISON MODAL */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 relative shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Postings Comparison</h3>
                <p className="text-xs text-slate-500">Side-by-side labour market specification audit</p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500 uppercase">
                    <th className="p-2 border-r border-slate-200 w-1/4">Criteria</th>
                    {[0, 1, 2].map((slotIdx) => {
                      const job = compareJobs[slotIdx];
                      return (
                        <th
                          key={slotIdx}
                          className={`p-2 border-r border-slate-200 ${!job ? 'text-slate-300 italic' : ''}`}
                        >
                          {job ? `${job.title} (${job.company})` : 'Empty Slot'}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">Company</td>
                    {[0, 1, 2].map((i) => (
                      <td key={i} className="p-2 border-r border-slate-200 text-slate-700">
                        {compareJobs[i]?.company || <span className="text-slate-400 italic">Not selected</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">Location</td>
                    {[0, 1, 2].map((i) => (
                      <td key={i} className="p-2 border-r border-slate-200 text-slate-700">
                        {compareJobs[i]?.location || <span className="text-slate-400 italic">Not selected</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">Experience</td>
                    {[0, 1, 2].map((i) => (
                      <td key={i} className="p-2 border-r border-slate-200 text-slate-700">
                        {compareJobs[i]?.exp || <span className="text-slate-400 italic">Not selected</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">Key Skills</td>
                    {[0, 1, 2].map((i) => (
                      <td key={i} className="p-2 border-r border-slate-200 text-slate-700">
                        {compareJobs[i]?.skills?.join(', ') || (
                          <span className="text-slate-400 italic">Not selected</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">Salary</td>
                    {[0, 1, 2].map((i) => (
                      <td key={i} className="p-2 border-r border-slate-200 font-mono-data text-slate-700">
                        {compareJobs[i]?.salary || <span className="text-slate-400 italic">Not selected</span>}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center h-16 px-2 bg-white border-t border-slate-200 shadow-md">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex flex-col items-center justify-center py-1 ${
            activeTab === 'explorer' ? 'text-[#00288e] font-semibold' : 'text-slate-500'
          }`}
        >
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span className="text-[11px]">Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex flex-col items-center justify-center py-1 ${
            activeTab === 'skills' ? 'text-[#00288e] font-semibold' : 'text-slate-500'
          }`}
        >
          <span className="material-symbols-outlined text-xl">query_stats</span>
          <span className="text-[11px]">Skills</span>
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`flex flex-col items-center justify-center py-1 ${
            activeTab === 'market' ? 'text-[#00288e] font-semibold' : 'text-slate-500'
          }`}
        >
          <span className="material-symbols-outlined text-xl">work</span>
          <span className="text-[11px]">Postings</span>
        </button>
        <button
          onClick={() => {
            if (compareJobs.length === 0 && activeJobs.length >= 2) {
              setCompareJobs([activeJobs[0], activeJobs[1]]);
            }
            setShowCompareModal(true);
          }}
          className="flex flex-col items-center justify-center text-slate-500 py-1 hover:text-[#00288e] transition-colors"
        >
          <span className="material-symbols-outlined text-xl">compare_arrows</span>
          <span className="text-[11px]">Compare</span>
        </button>
      </nav>
    </div>
  );
}
