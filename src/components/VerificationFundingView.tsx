import { useState, useMemo, useEffect } from 'react'
import {
  Award,
  Building2,
  Check,
  Eye,
  AlertTriangle,
  Search,
  X,
  Download,
  Plus,
  FileText,
  Layers,
} from 'lucide-react'
import verificationFundingData from '../data/verificationFundingData.json'
import CustomDropdown from './CustomDropdown'

interface VerificationFundingViewProps {
  initialSubTab?: string
  onNavigateSubTab?: (subTabKey: string) => void
}

type SubTabKey = 'acva-verification' | 'funding-programs'

export interface AcvaCaseRecord {
  id: string
  projectId: string
  projectName: string
  standard: string
  accreditedAgency: string
  leadAuditor: string
  auditorEmail: string
  scopePeriod: string
  claimedVolume: string
  verifiedVolume: string
  hectaresAudited: number
  deskReviewDate: string
  siteVisitDate: string
  status: string
  findings: Array<{
    id: string
    type: string
    description: string
    status: string
  }>
  verificationStatementNumber: string
  statementDate: string
  location: string
}

export interface FundingProgramRecord {
  id: string
  sponsorName: string
  sponsorLogo: string
  focusArea: string
  totalBudget: number
  disbursedAmount: number
  committedProjects: number
  participatingFarmers: number
  targetState: string
  esgMetricTarget: string
  status: string
  trancheSchedule: string
  directFarmerShare: string
  description: string
}

export default function VerificationFundingView({
  initialSubTab = 'acva-verification',
  onNavigateSubTab,
}: VerificationFundingViewProps) {
  const [activeTab, setActiveTab] = useState<SubTabKey>(() => {
    if (initialSubTab === 'funding-programs') return 'funding-programs'
    return 'acva-verification'
  })

  // Sync tab when initialSubTab changes from parent or sidebar navigation
  useEffect(() => {
    if (initialSubTab === 'acva-verification' || initialSubTab === 'funding-programs') {
      setActiveTab(initialSubTab as SubTabKey)
    }
  }, [initialSubTab])

  const handleTabChange = (tab: SubTabKey) => {
    setActiveTab(tab)
    if (onNavigateSubTab) {
      onNavigateSubTab(tab)
    }
  }

  // Local state
  const [acvaCases, setAcvaCases] = useState<AcvaCaseRecord[]>(
    verificationFundingData.acvaCases as AcvaCaseRecord[]
  )
  const [fundingPrograms, setFundingPrograms] = useState<FundingProgramRecord[]>(
    verificationFundingData.fundingPrograms as FundingProgramRecord[]
  )

  // -------------------------------------------------------------
  // TAB 1: ACVA Verification Filters & State
  // -------------------------------------------------------------
  const [acvaSearch, setAcvaSearch] = useState('')
  const [acvaAgencyFilter, setAcvaAgencyFilter] = useState('ALL')
  const [acvaStatusFilter, setAcvaStatusFilter] = useState('ALL')
  const [selectedAcvaCase, setSelectedAcvaCase] = useState<AcvaCaseRecord | null>(null)
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false)
  const [onboardForm, setOnboardForm] = useState({
    projectName: 'Indore-Dewas Agroforestry Carbon Sequestration',
    standard: 'BEE CCTS India / VM0042',
    accreditedAgency: 'TUV SUD South Asia Pvt Ltd',
    leadAuditor: 'Dr. H. S. Murthy (Lead GHG Verifier)',
    claimedVolume: '10,000 tCO2e',
    scopePeriod: 'Monitoring Period 2 (2026-2027)',
    location: 'Sehore & Dewas (MP)',
  })

  // -------------------------------------------------------------
  // TAB 2: Funding Programs Filters & State
  // -------------------------------------------------------------
  const [fundingSearch, setFundingSearch] = useState('')
  const [focusAreaFilter, setFocusAreaFilter] = useState('ALL')
  const [fundingStatusFilter, setFundingStatusFilter] = useState('ALL')
  const [selectedProgram, setSelectedProgram] = useState<FundingProgramRecord | null>(null)
  const [isCreateProgramModalOpen, setIsCreateProgramModalOpen] = useState(false)
  const [newProgramForm, setNewProgramForm] = useState({
    sponsorName: '',
    focusArea: 'Agroforestry & Carbon Insetting',
    totalBudget: '10.0',
    targetState: 'Madhya Pradesh',
    esgMetricTarget: '20,000 tCO2e Inset',
    description: '',
  })

  // -------------------------------------------------------------
  // Filtered ACVA Cases
  // -------------------------------------------------------------
  const filteredAcvaCases = useMemo(() => {
    return acvaCases.filter((c) => {
      const q = acvaSearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.projectName.toLowerCase().includes(q) ||
        c.accreditedAgency.toLowerCase().includes(q) ||
        c.leadAuditor.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)

      const matchesAgency =
        acvaAgencyFilter === 'ALL' || c.accreditedAgency.includes(acvaAgencyFilter)
      const matchesStatus =
        acvaStatusFilter === 'ALL' || c.status === acvaStatusFilter

      return matchesSearch && matchesAgency && matchesStatus
    })
  }, [acvaCases, acvaSearch, acvaAgencyFilter, acvaStatusFilter])

  // -------------------------------------------------------------
  // Filtered Funding Programs
  // -------------------------------------------------------------
  const filteredFundingPrograms = useMemo(() => {
    return fundingPrograms.filter((p) => {
      const q = fundingSearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.sponsorName.toLowerCase().includes(q) ||
        p.focusArea.toLowerCase().includes(q) ||
        p.targetState.toLowerCase().includes(q)

      const matchesFocus =
        focusAreaFilter === 'ALL' || p.focusArea.toLowerCase().includes(focusAreaFilter.toLowerCase())
      const matchesStatus =
        fundingStatusFilter === 'ALL' || p.status === fundingStatusFilter

      return matchesSearch && matchesFocus && matchesStatus
    })
  }, [fundingPrograms, fundingSearch, focusAreaFilter, fundingStatusFilter])

  // -------------------------------------------------------------
  // Actions: ACVA
  // -------------------------------------------------------------
  const handleApproveVerification = (caseId: string) => {
    setAcvaCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: 'VERIFIED_APPROVED',
              verificationStatementNumber: `BEE-CCTS-VS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              statementDate: 'Today (Super Admin Signoff)',
            }
          : c
      )
    )
    if (selectedAcvaCase?.id === caseId) {
      setSelectedAcvaCase((prev) =>
        prev
          ? {
              ...prev,
              status: 'VERIFIED_APPROVED',
              verificationStatementNumber: `BEE-CCTS-VS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              statementDate: 'Today (Super Admin Signoff)',
            }
          : null
      )
    }
  }

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newCase: AcvaCaseRecord = {
      id: `ACVA-2026-${Math.floor(100 + Math.random() * 900)}`,
      projectId: 'PRJ-CAR-2026-001',
      projectName: onboardForm.projectName,
      standard: onboardForm.standard,
      accreditedAgency: onboardForm.accreditedAgency,
      leadAuditor: onboardForm.leadAuditor,
      auditorEmail: 'auditor@agency.com',
      scopePeriod: onboardForm.scopePeriod,
      claimedVolume: onboardForm.claimedVolume,
      verifiedVolume: 'Audit in Progress',
      hectaresAudited: 210.0,
      deskReviewDate: 'Today',
      siteVisitDate: 'Scheduled 15 Oct 2026',
      status: 'UNDER_AUDIT',
      findings: [],
      verificationStatementNumber: 'PENDING',
      statementDate: '-',
      location: onboardForm.location,
    }

    setAcvaCases((prev) => [newCase, ...prev])
    setIsOnboardModalOpen(false)
  }

  // -------------------------------------------------------------
  // Actions: Funding
  // -------------------------------------------------------------
  const handleAuthorizeTranche = (programId: string) => {
    setFundingPrograms((prev) =>
      prev.map((p) =>
        p.id === programId
          ? {
              ...p,
              disbursedAmount: +(Math.min(p.totalBudget, p.disbursedAmount + 1.2)).toFixed(1),
              trancheSchedule: 'Next Tranche Disbursed',
            }
          : p
      )
    )
    if (selectedProgram?.id === programId) {
      setSelectedProgram((prev) =>
        prev
          ? {
              ...prev,
              disbursedAmount: +(Math.min(prev.totalBudget, prev.disbursedAmount + 1.2)).toFixed(1),
              trancheSchedule: 'Next Tranche Disbursed',
            }
          : null
      )
    }
  }

  const handleCreateProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProgramForm.sponsorName) return

    const budget = parseFloat(newProgramForm.totalBudget) || 10.0
    const newProg: FundingProgramRecord = {
      id: `PRG-ESG-${Math.floor(10 + Math.random() * 90)}`,
      sponsorName: newProgramForm.sponsorName,
      sponsorLogo: newProgramForm.sponsorName.split(' ')[0],
      focusArea: newProgramForm.focusArea,
      totalBudget: budget,
      disbursedAmount: 1.5,
      committedProjects: 1,
      participatingFarmers: 180,
      targetState: newProgramForm.targetState,
      esgMetricTarget: newProgramForm.esgMetricTarget,
      status: 'ACTIVE_DEPLOYING',
      trancheSchedule: 'Tranche 1 Disbursed (Advance)',
      directFarmerShare: '70% Direct Benefit Transfer',
      description: newProgramForm.description || 'Corporate ESG Impact Endowment.',
    }

    setFundingPrograms((prev) => [newProg, ...prev])
    setIsCreateProgramModalOpen(false)
    setNewProgramForm({
      sponsorName: '',
      focusArea: 'Agroforestry & Carbon Insetting',
      totalBudget: '10.0',
      targetState: 'Madhya Pradesh',
      esgMetricTarget: '20,000 tCO2e Inset',
      description: '',
    })
  }

  // -------------------------------------------------------------
  // Minimalist Badge Helpers
  // -------------------------------------------------------------
  const renderAcvaStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase()
    if (s === 'VERIFIED_APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5E8256] flex-shrink-0" />
          <span>Verified &amp; Issued</span>
        </span>
      )
    }
    if (s === 'UNDER_AUDIT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] flex-shrink-0 animate-ping" />
          <span>Under Audit</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFFBEB] border border-[#FEF3C7] text-[#B45309]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
        <span>Desk Review</span>
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Submodule Navigation Bar (matching Exact Sea Green Harmony Theme) */}
      <div className="bg-white border border-[#D19E77] rounded-2xl p-1.5 shadow-xs flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleTabChange('acva-verification')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'acva-verification'
                ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
                : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>ACVA Verification Engine</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                activeTab === 'acva-verification'
                  ? 'bg-[#6E3812] text-white border-white/20'
                  : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
            >
              {acvaCases.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('funding-programs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'funding-programs'
                ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
                : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Corporate ESG Programs</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                activeTab === 'funding-programs'
                  ? 'bg-[#6E3812] text-white border-white/20'
                  : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
            >
              {fundingPrograms.length}
            </span>
          </button>
        </div>

        {/* Top Action Button */}
        <div>
          {activeTab === 'acva-verification' ? (
            <button
              type="button"
              onClick={() => setIsOnboardModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Assign ACVA Case</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreateProgramModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create ESG Program</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. SUB-PAGE 1: ACVA VERIFICATION (PRD A16)                     */}
      {/* ============================================================= */}
      {activeTab === 'acva-verification' && (
        <div className="space-y-6">
          {/* Sea Green Tinted KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Active ACVA Cases</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Award className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">{acvaCases.length}</span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Accredited Audits</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>
                  {acvaCases.filter((c) => c.status === 'VERIFIED_APPROVED').length} Issued
                </span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  BEE/CCTS Standard
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Verified Credit Issuance</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {verificationFundingData.summaryStats.acva.verifiedCredits}
                </span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Registry Minted</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  Tamper-proof
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Accredited Agencies</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
                  <Building2 className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">6</span>
                <span className="text-[11px] font-bold text-[#0369A1]">ACVA Bodies</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>TUV SUD, DNV, Epic, SGS</span>
                <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
                  BEE Empaneled
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Average Audit SLA</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Layers className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">18.4</span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Days Turnaround</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Desk Review + On-Ground</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  ISO 14065
                </span>
              </div>
            </div>
          </div>

          {/* ACVA Cases Table Card */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#8D4E22]" />
                  <span>Independent ACVA Verification Cases (PRD A16)</span>
                </h3>
                <p className="text-xs text-[#4A5B50] font-semibold">
                  Third-party BEE/CCTS and international carbon registry verification audits, auditor sampling, and formal issuance statements
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search case ID, project..."
                    value={acvaSearch}
                    onChange={(e) => setAcvaSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#8D4E22] bg-[#C49563]/25 text-xs text-[#2B1405] font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>

                <CustomDropdown
                  value={acvaAgencyFilter}
                  onChange={(val) => setAcvaAgencyFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Agencies', dotColor: '#8D4E22' },
                    { value: 'TUV SUD', label: 'TUV SUD', dotColor: '#0284C7' },
                    { value: 'Epic', label: 'Epic Sustainability', dotColor: '#5E8256' },
                    { value: 'DNV', label: 'DNV GL', dotColor: '#D97706' },
                    { value: 'KPMG', label: 'KPMG India', dotColor: '#8B5CF6' },
                    { value: 'SGS', label: 'SGS India', dotColor: '#10B981' },
                  ]}
                  className="w-48"
                />

                <CustomDropdown
                  value={acvaStatusFilter}
                  onChange={(val) => setAcvaStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Audit Status', dotColor: '#8D4E22' },
                    { value: 'VERIFIED_APPROVED', label: 'Verified & Issued', dotColor: '#5E8256' },
                    { value: 'UNDER_AUDIT', label: 'Under Audit', dotColor: '#0284C7' },
                    { value: 'DESK_REVIEW', label: 'Desk Review', dotColor: '#F59E0B' },
                  ]}
                  className="w-48"
                />
              </div>
            </div>

            {/* Cases Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#8D4E22]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#C49563]/30 text-[#2B1405] font-bold border-b border-[#8D4E22] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Case ID &amp; Standard</th>
                    <th className="p-3.5">Project Name &amp; Location</th>
                    <th className="p-3.5">Accredited Agency &amp; Auditor</th>
                    <th className="p-3.5">Claimed vs Verified</th>
                    <th className="p-3.5">Statement Reference</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFD5]">
                  {filteredAcvaCases.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-[#F9F6F1] transition-colors cursor-pointer"
                      onClick={() => setSelectedAcvaCase(c)}
                    >
                      {/* Case ID & Standard */}
                      <td className="p-3.5">
                        <div className="font-black text-[#18221B] text-sm">{c.id}</div>
                        <div className="text-[10px] font-bold text-[#8D4E22]">{c.standard}</div>
                      </td>

                      {/* Project & Location */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B] max-w-xs truncate">
                          {c.projectName}
                        </div>
                        <div className="text-[10px] text-[#4A5B50]">{c.location}</div>
                      </td>

                      {/* Agency & Auditor */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{c.accreditedAgency}</div>
                        <div className="text-[10px] text-[#738679]">{c.leadAuditor}</div>
                      </td>

                      {/* Claimed vs Verified */}
                      <td className="p-3.5">
                        <div className="font-black text-[#3E5F36]">
                          {c.verifiedVolume}
                        </div>
                        <div className="text-[10px] text-[#738679]">Claimed: {c.claimedVolume}</div>
                      </td>

                      {/* Statement Reference */}
                      <td className="p-3.5">
                        <div className="font-mono text-xs font-bold text-[#18221B]">
                          {c.verificationStatementNumber}
                        </div>
                        <div className="text-[10px] text-[#738679]">{c.statementDate}</div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">{renderAcvaStatusBadge(c.status)}</td>

                      {/* Strictly Icon-Only Actions */}
                      <td className="p-3.5 text-right">
                        <div
                          className="inline-flex items-center gap-1.5 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedAcvaCase(c)}
                            title="Inspect ACVA Audit Dossier Drawer"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#C49563]/25 border border-[#8D4E22] hover:border-[#6E3812] text-[#4A5B50] hover:text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {c.status !== 'VERIFIED_APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handleApproveVerification(c.id)}
                              title="Record Formal Verification Signoff"
                              className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                `Generating official ACVA Verification Statement Certificate for ${c.id}...`
                              )
                            }
                            title="Download Verification Statement PDF"
                            className="w-7.5 h-7.5 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. SUB-PAGE 2: CORPORATE ESG PROGRAMS (PRD A17)               */}
      {/* ============================================================= */}
      {activeTab === 'funding-programs' && (
        <div className="space-y-6">
          {/* Sea Green Tinted KPI Summary Cards for Funding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Total Committed Capital</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Building2 className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {verificationFundingData.summaryStats.funding.committedCapital}
                </span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Corporate ESG Facility</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  A17 Endowment
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Disbursed Funding</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {verificationFundingData.summaryStats.funding.disbursedCapital}
                </span>
                <span className="text-[11px] font-bold text-[#3E5F36]">Tranches Executed</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Direct Farmer DBT</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  Bank Escrow
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Corporate Sponsors</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
                  <Award className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">14</span>
                <span className="text-[11px] font-bold text-[#0369A1]">Blue-Chip Partners</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Tata, Infosys, Mahindra, ITC</span>
                <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
                  Scope 3 Insetting
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Farmers Benefited</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Layers className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {verificationFundingData.summaryStats.funding.farmersBenefited}
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Smallholders</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Avg ₹72,000 / Farmer Payout</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  Incentives Paid
                </span>
              </div>
            </div>
          </div>

          {/* Corporate Programs Grid & Table */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#8D4E22]" />
                  <span>Corporate ESG Programs &amp; Capital Allocations (PRD A17)</span>
                </h3>
                <p className="text-xs text-[#4A5B50] font-semibold">
                  Manage corporate sponsor commitments, milestone financial tranches, and farmer direct benefit matching
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search sponsor, focus area..."
                    value={fundingSearch}
                    onChange={(e) => setFundingSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#8D4E22] bg-[#C49563]/25 text-xs text-[#2B1405] font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>

                <CustomDropdown
                  value={focusAreaFilter}
                  onChange={(val) => setFocusAreaFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Focus Areas', dotColor: '#8D4E22' },
                    { value: 'Agroforestry', label: 'Agroforestry', dotColor: '#5E8256' },
                    { value: 'Water', label: 'Water Stewardship', dotColor: '#0284C7' },
                    { value: 'Silvopasture', label: 'Silvopasture', dotColor: '#D97706' },
                    { value: 'Soil', label: 'Soil Organic Carbon', dotColor: '#8B5CF6' },
                    { value: 'Biodiversity', label: 'Biodiversity', dotColor: '#10B981' },
                  ]}
                  className="w-48"
                />

                <CustomDropdown
                  value={fundingStatusFilter}
                  onChange={(val) => setFundingStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Program Status', dotColor: '#8D4E22' },
                    { value: 'ACTIVE_DEPLOYING', label: 'Active Deploying', dotColor: '#5E8256' },
                  ]}
                  className="w-48"
                />
              </div>
            </div>

            {/* Programs Cards Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredFundingPrograms.map((prog) => {
                const percentDisbursed = Math.round((prog.disbursedAmount / prog.totalBudget) * 100)

                return (
                  <div
                    key={prog.id}
                    className="p-5 rounded-2xl bg-white border border-[#B88258] space-y-4 hover:border-[#8D4E22] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#738679]">
                              {prog.id}
                            </span>
                            <h4 className="text-sm font-black text-[#18221B]">
                              {prog.sponsorName}
                            </h4>
                          </div>
                          <p className="text-xs font-bold text-[#8D4E22]">{prog.focusArea}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge-mint-tint px-2.5 py-0.5 rounded-full text-[10px] font-black">
                          ₹{prog.totalBudget} Cr Facility
                        </span>
                        <span className="badge-sky-tint px-2.5 py-0.5 rounded-full text-[10px] font-black">
                          {prog.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Tranche Stats */}
                    <div className="p-3.5 rounded-xl bg-[#C49563]/25 border border-[#8D4E22] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#18221B]">
                        <span>Capital Deployment Progress</span>
                        <span className="text-[#8D4E22]">
                          ₹{prog.disbursedAmount} Cr of ₹{prog.totalBudget} Cr ({percentDisbursed}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#E5DFD5] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#8D4E22] h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentDisbursed}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#4A5B50] pt-1">
                        <span>{prog.trancheSchedule}</span>
                        <span className="font-bold text-[#3E5F36]">
                          {prog.directFarmerShare}
                        </span>
                      </div>
                    </div>

                    {/* Metrics Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-[#738679] font-bold uppercase block">
                          Committed Projects
                        </span>
                        <span className="font-bold text-[#18221B]">
                          {prog.committedProjects} Active Sites
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#738679] font-bold uppercase block">
                          Enrolled Farmers
                        </span>
                        <span className="font-bold text-[#18221B]">
                          {prog.participatingFarmers} Smallholders
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#738679] font-bold uppercase block">
                          Impact Metric Target
                        </span>
                        <span className="font-black text-[#3E5F36]">
                          {prog.esgMetricTarget}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#738679] font-bold uppercase block">
                          Target Geography
                        </span>
                        <span className="font-bold text-[#18221B]">{prog.targetState}</span>
                      </div>
                    </div>

                    {/* Bottom Action Strip - Strictly Icon-Only Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#EAE4DC] text-xs">
                      <p className="text-[11px] text-[#738679] max-w-xl truncate">
                        {prog.description}
                      </p>

                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedProgram(prog)}
                          title="Inspect Program Charter Drawer"
                          className="w-8 h-8 rounded-xl bg-white hover:bg-[#C49563]/25 border border-[#8D4E22] hover:border-[#6E3812] text-[#4A5B50] hover:text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                        >
                          <Eye className="w-4 h-4 stroke-[2.2]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAuthorizeTranche(prog.id)}
                          title="Authorize Milestone Tranche Disbursement"
                          className="w-8 h-8 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            alert(`Generating ESG Impact Factsheet PDF for ${prog.sponsorName}...`)
                          }
                          title="Download ESG Impact Factsheet PDF"
                          className="w-8 h-8 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                        >
                          <Download className="w-4 h-4 stroke-[2.2]" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. SLIDE-OVER DRAWER: ACVA AUDIT DOSSIER                       */}
      {/* ============================================================= */}
      {selectedAcvaCase && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto custom-scrollbar flex flex-col border-l border-[#D8B293]">
            {/* Header */}
            <div className="p-5 border-b border-[#8D4E22] flex items-center justify-between bg-[#C49563]/30 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Award className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#18221B]">{selectedAcvaCase.id}</h3>
                  <p className="text-xs text-[#738679] font-medium">
                    {selectedAcvaCase.standard} • {selectedAcvaCase.accreditedAgency}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAcvaCase(null)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 flex-1 text-xs">
              {/* Status and Action Strip */}
              <div className="p-3.5 rounded-2xl bg-[#C49563]/25 border border-[#8D4E22] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#738679]">Audit Status:</span>
                  {renderAcvaStatusBadge(selectedAcvaCase.status)}
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedAcvaCase.status !== 'VERIFIED_APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleApproveVerification(selectedAcvaCase.id)}
                      title="Approve Formal Issuance"
                      className="w-9 h-9 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white cursor-pointer shadow-xs flex items-center justify-center transition-colors"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        `Printing official verification statement ${selectedAcvaCase.verificationStatementNumber}`
                      )
                    }
                    title="Download Statement"
                    className="w-9 h-9 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                  >
                    <Download className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Case Specifications */}
              <div className="p-4 rounded-2xl bg-[#C49563]/25 border border-[#8D4E22] space-y-3">
                <h4 className="font-black text-[#18221B]">ACVA Audit Dossier (PRD A16)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Lead Auditor
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedAcvaCase.leadAuditor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Auditor Email
                    </span>
                    <span className="font-bold text-[#18221B]">
                      {selectedAcvaCase.auditorEmail}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Claimed Volume
                    </span>
                    <span className="font-bold text-[#18221B]">
                      {selectedAcvaCase.claimedVolume}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Verified Volume
                    </span>
                    <span className="font-black text-[#3E5F36]">
                      {selectedAcvaCase.verifiedVolume}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Statement Badge */}
              <div className="p-4 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#3E5F36]">Formal Verification Statement</span>
                  <span className="text-[10px] font-mono text-[#3E5F36]">BEE Empaneled</span>
                </div>
                <div className="font-mono text-xs font-bold text-[#18221B]">
                  Statement #{selectedAcvaCase.verificationStatementNumber}
                </div>
                <div className="text-[11px] text-[#4A5B50]">
                  Date of Certification: {selectedAcvaCase.statementDate} • Audited Hectares:{' '}
                  {selectedAcvaCase.hectaresAudited} ha
                </div>
              </div>

              {/* Findings if any */}
              {selectedAcvaCase.findings.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#C49563]/25 border border-[#8D4E22] space-y-2">
                  <span className="font-black text-[#2B1405] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#8D4E22]" /> Auditor Findings &amp; Clarifications
                  </span>
                  {selectedAcvaCase.findings.map((fnd) => (
                    <div
                      key={fnd.id}
                      className="p-2.5 rounded-xl bg-white border border-[#8D4E22] text-[11px]"
                    >
                      <div className="flex items-center justify-between font-bold text-[#18221B]">
                        <span>
                          {fnd.id} ({fnd.type})
                        </span>
                        <span className="text-[#3E5F36] font-mono">{fnd.status}</span>
                      </div>
                      <p className="text-[#4A5B50] mt-0.5 leading-relaxed">{fnd.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 5. SLIDE-OVER DRAWER: PROGRAM CHARTER DETAILS                  */}
      {/* ============================================================= */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto custom-scrollbar flex flex-col border-l border-[#D8B293]">
            <div className="p-5 border-b border-[#8D4E22] flex items-center justify-between bg-[#C49563]/30 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Building2 className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#18221B]">
                    {selectedProgram.sponsorName}
                  </h3>
                  <p className="text-xs text-[#738679] font-medium">{selectedProgram.focusArea}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 text-xs">
              <div className="p-4 rounded-2xl bg-[#C49563]/25 border border-[#8D4E22] space-y-3">
                <h4 className="font-black text-[#18221B]">Program Financial Parameters</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Total Endowment
                    </span>
                    <span className="font-black text-sm text-[#18221B]">
                      ₹{selectedProgram.totalBudget} Crores
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Disbursed to Date
                    </span>
                    <span className="font-black text-sm text-[#3E5F36]">
                      ₹{selectedProgram.disbursedAmount} Crores
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Farmer Benefit Ratio
                    </span>
                    <span className="font-bold text-[#18221B]">
                      {selectedProgram.directFarmerShare}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Participating Smallholders
                    </span>
                    <span className="font-bold text-[#18221B]">
                      {selectedProgram.participatingFarmers} Farmers
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#C49563]/25 border border-[#8D4E22] space-y-2">
                <h4 className="font-black text-[#18221B]">Charter Scope &amp; Target Impact</h4>
                <p className="text-[11px] text-[#4A5B50] leading-relaxed">
                  {selectedProgram.description}
                </p>
                <div className="pt-2 border-t border-[#8D4E22] flex items-center justify-between text-[11px] font-bold text-[#8D4E22]">
                  <span>Metric Target: {selectedProgram.esgMetricTarget}</span>
                  <span>Region: {selectedProgram.targetState}</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleAuthorizeTranche(selectedProgram.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Authorize Milestone Tranche (₹1.2 Cr)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 6. MODAL: ONBOARD ACVA CASE                                   */}
      {/* ============================================================= */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">Assign ACVA Verification Case</h4>
                  <p className="text-xs text-[#738679]">BEE / CCTS Accredited Auditor Onboarding</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOnboardModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#C49563]/20 border border-[#8D4E22] text-[#2B1405] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                  Accredited Agency *
                </label>
                <CustomDropdown
                  value={onboardForm.accreditedAgency}
                  onChange={(val) => setOnboardForm({ ...onboardForm, accreditedAgency: val })}
                  options={[
                    { value: 'TUV SUD South Asia Pvt Ltd', label: 'TUV SUD South Asia Pvt Ltd' },
                    { value: 'Epic Sustainability Services (ACVA)', label: 'Epic Sustainability Services (ACVA)' },
                    { value: 'DNV Business Assurance India', label: 'DNV Business Assurance India' },
                    { value: 'KPMG India ESG Assurance', label: 'KPMG India ESG Assurance' },
                    { value: 'SGS India Industrial Services', label: 'SGS India Industrial Services' },
                  ]}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Standard Registry
                  </label>
                  <input
                    type="text"
                    value={onboardForm.standard}
                    onChange={(e) =>
                      setOnboardForm({ ...onboardForm, standard: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#8D4E22] bg-[#C49563]/20 text-[#2B1405] text-xs font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Claimed Volume
                  </label>
                  <input
                    type="text"
                    value={onboardForm.claimedVolume}
                    onChange={(e) =>
                      setOnboardForm({ ...onboardForm, claimedVolume: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#8D4E22] bg-[#C49563]/20 text-[#2B1405] text-xs font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                  Lead GHG Auditor Name
                </label>
                <input
                  type="text"
                  value={onboardForm.leadAuditor}
                  onChange={(e) =>
                    setOnboardForm({ ...onboardForm, leadAuditor: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#8D4E22] bg-[#C49563]/20 text-[#2B1405] text-xs font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE4DC]">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Assign Case</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 7. MODAL: CREATE CORPORATE ESG PROGRAM                        */}
      {/* ============================================================= */}
      {isCreateProgramModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">Create Corporate ESG Program</h4>
                  <p className="text-xs text-[#738679]">Corporate Endowment &amp; Project Matching</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateProgramModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#C49563]/20 border border-[#8D4E22] text-[#2B1405] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProgramSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                  Corporate Sponsor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reliance Foundation / Wipro Climate"
                  value={newProgramForm.sponsorName}
                  onChange={(e) =>
                    setNewProgramForm({ ...newProgramForm, sponsorName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#8D4E22] bg-[#C49563]/20 text-[#2B1405] text-xs font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Thematic Focus Area
                  </label>
                  <CustomDropdown
                    value={newProgramForm.focusArea}
                    onChange={(val) => setNewProgramForm({ ...newProgramForm, focusArea: val })}
                    options={[
                      { value: 'Agroforestry & Carbon Insetting', label: 'Agroforestry & Carbon Insetting' },
                      { value: 'Bundelkhand Water & Community Wells', label: 'Bundelkhand Water & Community Wells' },
                      { value: 'Arid Agroforestry & Silvopasture', label: 'Arid Agroforestry & Silvopasture' },
                      { value: 'Soil Organic Carbon & No-Till Farming', label: 'Soil Organic Carbon & No-Till Farming' },
                      { value: 'Western Ghats Ecological Corridors', label: 'Western Ghats Ecological Corridors' },
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Total Budget (₹ Crores) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newProgramForm.totalBudget}
                    onChange={(e) =>
                      setNewProgramForm({ ...newProgramForm, totalBudget: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#8D4E22] bg-[#C49563]/20 text-[#2B1405] text-xs font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Target State
                  </label>
                  <input
                    type="text"
                    value={newProgramForm.targetState}
                    onChange={(e) =>
                      setNewProgramForm({ ...newProgramForm, targetState: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#8D4E22] bg-[#C49563]/20 text-[#2B1405] text-xs font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Impact Metric Goal
                  </label>
                  <input
                    type="text"
                    value={newProgramForm.esgMetricTarget}
                    onChange={(e) =>
                      setNewProgramForm({ ...newProgramForm, esgMetricTarget: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#8D4E22] bg-[#C49563]/20 text-[#2B1405] text-xs font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE4DC]">
                <button
                  type="button"
                  onClick={() => setIsCreateProgramModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Establish Program</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
