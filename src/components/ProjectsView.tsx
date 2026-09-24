import { useState, useMemo, useEffect } from 'react'
import {
  FolderKanban,
  Leaf,
  Droplets,
  Trees,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Trash2,
  Eye,
  Check,
  X,
  FileText,
  MapPin,
  ShieldCheck,
  Sparkles,
  Activity,
  Camera,
} from 'lucide-react'
import projectsInitialData from '../data/projectsData.json'
import CustomDropdown from './CustomDropdown'

interface ProjectsViewProps {
  initialSubTab?: 'project-queue' | 'carbon' | 'water' | 'biodiversity'
  onNavigateSubTab?: (subTabKey: string) => void
}

export interface ProjectRecord {
  id: string
  title: string
  type: string
  status: string
  developerOrg: {
    id: string
    name: string
    type: string
  }
  leadFarmer: {
    id: string
    name: string
    phone: string
    village: string
    district: string
    state: string
  }
  landParcel: {
    id: string
    surveyNumber: string
    acreage: number
    coordinates: string
  }
  methodology: string
  creditingPeriod: string
  submittedDate: string
  assignedAgent: string
  metrics: {
    carbonCreditsEstimated?: string
    carbonBaseline?: string
    projectedSocGain?: string
    treesPlanted?: string
    waterRechargedM3?: string
    waterSavedPercentage?: string
    dripCoverage?: string
    piezometerLevel?: string
    biodiversityHectares?: string
    canopyIndexGain?: string
    nativeSpeciesCount?: number
    iucnRedListSpecies?: string
  }
  questionnaire: Array<{
    question: string
    answer: string
    category: string
  }>
  evidenceList: Array<{
    id: string
    title: string
    type: string
    verified: boolean
    geoTag: string
    date: string
    hash: string
  }>
  auditTrail: Array<{
    timestamp: string
    action: string
    performedBy: string
    note: string
  }>
  clarificationQuestion?: string
  rejectionReason?: string
  adminDecisionNote?: string
}

export default function ProjectsView({
  initialSubTab = 'project-queue',
  onNavigateSubTab,
}: ProjectsViewProps) {
  const [activeTab, setActiveTab] = useState<
    'project-queue' | 'carbon' | 'water' | 'biodiversity'
  >(initialSubTab)

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab)
    }
  }, [initialSubTab])

  // Local state initialized from JSON
  const [projects, setProjects] = useState<ProjectRecord[]>(
    projectsInitialData.projects as ProjectRecord[]
  )
  const [carbonList, setCarbonList] = useState(projectsInitialData.carbonProjects)
  const [waterList, setWaterList] = useState(projectsInitialData.waterProjects)
  const [bioList, setBioList] = useState(projectsInitialData.biodiversityProjects)

  // Filters for Tab 1 (Lifecycle & Screening)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  // Filters for Tab 2 (Carbon)
  const [carbonSearch, setCarbonSearch] = useState('')
  const [carbonMethodFilter, setCarbonMethodFilter] = useState('ALL')

  // Filters for Tab 3 (Water)
  const [waterSearch, setWaterSearch] = useState('')
  const [waterBasinFilter, setWaterBasinFilter] = useState('ALL')

  // Filters for Tab 4 (Biodiversity)
  const [bioSearch, setBioSearch] = useState('')
  const [bioZoneFilter, setBioZoneFilter] = useState('ALL')

  // Selected Project for Inspection Drawer
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)

  // Modals
  const [modalAction, setModalAction] = useState<'clarify' | 'reject' | null>(null)
  const [modalTargetId, setModalTargetId] = useState<string | null>(null)
  const [modalText, setModalText] = useState('')
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; title: string } | null>(
    null
  )

  // Tab switcher
  const handleTabChange = (tab: 'project-queue' | 'carbon' | 'water' | 'biodiversity') => {
    setActiveTab(tab)
    if (onNavigateSubTab) onNavigateSubTab(tab)
  }

  // Filtered Lifecycle Projects (Tab 1)
  const filteredLifecycleProjects = useMemo(() => {
    return projects.filter((p) => {
      if (typeFilter !== 'ALL' && p.type !== typeFilter) return false
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false

      const q = searchTerm.toLowerCase().trim()
      if (!q) return true

      return (
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.developerOrg.name.toLowerCase().includes(q) ||
        p.leadFarmer.name.toLowerCase().includes(q) ||
        p.landParcel.surveyNumber.toLowerCase().includes(q) ||
        p.methodology.toLowerCase().includes(q) ||
        p.leadFarmer.district.toLowerCase().includes(q)
      )
    })
  }, [projects, typeFilter, statusFilter, searchTerm])

  // Filtered Carbon Projects (Tab 2)
  const filteredCarbonProjects = useMemo(() => {
    return carbonList.filter((p) => {
      if (carbonMethodFilter !== 'ALL' && !p.methodology.includes(carbonMethodFilter)) return false
      const q = carbonSearch.toLowerCase().trim()
      if (!q) return true
      return (
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.developerOrg.toLowerCase().includes(q) ||
        p.leadFarmer.toLowerCase().includes(q) ||
        p.registryStandard.toLowerCase().includes(q) ||
        p.registrySerial.toLowerCase().includes(q)
      )
    })
  }, [carbonList, carbonMethodFilter, carbonSearch])

  // Filtered Water Projects (Tab 3)
  const filteredWaterProjects = useMemo(() => {
    return waterList.filter((p) => {
      if (waterBasinFilter !== 'ALL' && !p.basin.includes(waterBasinFilter)) return false
      const q = waterSearch.toLowerCase().trim()
      if (!q) return true
      return (
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.developerOrg.toLowerCase().includes(q) ||
        p.leadFarmer.toLowerCase().includes(q) ||
        p.basin.toLowerCase().includes(q) ||
        p.interventionType.toLowerCase().includes(q)
      )
    })
  }, [waterList, waterBasinFilter, waterSearch])

  // Filtered Biodiversity Projects (Tab 4)
  const filteredBioProjects = useMemo(() => {
    return bioList.filter((p) => {
      if (bioZoneFilter !== 'ALL' && !p.ecologicalZone.includes(bioZoneFilter)) return false
      const q = bioSearch.toLowerCase().trim()
      if (!q) return true
      return (
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.developerOrg.toLowerCase().includes(q) ||
        p.leadFarmer.toLowerCase().includes(q) ||
        p.ecologicalZone.toLowerCase().includes(q) ||
        p.restorationType.toLowerCase().includes(q)
      )
    })
  }, [bioList, bioZoneFilter, bioSearch])

  // Screening Gate Decision Handlers
  const handleApprove = (projectId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16)
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updated: ProjectRecord = {
            ...p,
            status: 'APPROVED_FOR_DATA_COLLECTION',
            adminDecisionNote:
              'Approved for Data Collection under PRD §15.3. Field visit assignment unlocked.',
            clarificationQuestion: undefined,
            rejectionReason: undefined,
            auditTrail: [
              ...p.auditTrail,
              {
                timestamp: nowStr,
                action: 'SCREENING_APPROVED',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: 'Screening passed. Approved for field data collection and monitoring.',
              },
            ],
          }
          if (selectedProject?.id === projectId) setSelectedProject(updated)
          return updated
        }
        return p
      })
    )
  }


  const handleOpenReject = (projectId: string) => {
    setModalTargetId(projectId)
    setModalAction('reject')
    setModalText('')
  }

  const handleModalSubmit = () => {
    if (!modalTargetId || !modalAction || !modalText.trim()) return
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16)
    const isReject = modalAction === 'reject'

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === modalTargetId) {
          const updated: ProjectRecord = {
            ...p,
            status: isReject ? 'REJECTED' : 'CLARIFICATION',
            clarificationQuestion: isReject ? undefined : modalText.trim(),
            rejectionReason: isReject ? modalText.trim() : undefined,
            adminDecisionNote: isReject
              ? `Rejected: ${modalText.trim()}`
              : `Clarification requested: ${modalText.trim()}`,
            auditTrail: [
              ...p.auditTrail,
              {
                timestamp: nowStr,
                action: isReject ? 'PROJECT_REJECTED' : 'CLARIFICATION_REQUESTED',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: modalText.trim(),
              },
            ],
          }
          if (selectedProject?.id === modalTargetId) setSelectedProject(updated)
          return updated
        }
        return p
      })
    )

    setModalAction(null)
    setModalTargetId(null)
    setModalText('')
  }

  const handleDeleteConfirmed = () => {
    if (!projectToDelete) return
    const id = projectToDelete.id
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setCarbonList((prev) => prev.filter((p) => p.id !== id))
    setWaterList((prev) => prev.filter((p) => p.id !== id))
    setBioList((prev) => prev.filter((p) => p.id !== id))
    if (selectedProject?.id === id) setSelectedProject(null)
    setProjectToDelete(null)
  }

  // Minimalist Status Badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED_FOR_DATA_COLLECTION':
        return (
          <span className="badge-mint-tint px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
            <span>Visits Open</span>
          </span>
        )
      case 'VERIFIED_ELIGIBLE':
        return (
          <span className="badge-mint-tint px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
            <span>Verified Eligible</span>
          </span>
        )
      case 'MONITORING_MRV':
        return (
          <span className="badge-sky-tint px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
            <Clock className="w-3 h-3 stroke-[2.2]" />
            <span>Monitoring MRV</span>
          </span>
        )
      case 'SCREENING':
      case 'SUBMITTED':
        return (
          <span className="badge-warning-tint px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
            <Clock className="w-3 h-3 stroke-[2.2]" />
            <span>Screening Queue</span>
          </span>
        )
      case 'CLARIFICATION':
        return (
          <span className="badge-warning-tint px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
            <HelpCircle className="w-3 h-3 stroke-[2.2]" />
            <span>Clarification</span>
          </span>
        )
      case 'REJECTED':
        return (
          <span className="badge-alert-tint px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 stroke-[2.2]" />
            <span>Rejected</span>
          </span>
        )
      default:
        return (
          <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px] font-bold">
            {status}
          </span>
        )
    }
  }

  // Type badge with clean pastels
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case 'CARBON':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#F2DFC9] border border-[#C1D6BD] text-[#3E5F36] flex items-center gap-1">
            <Leaf className="w-3 h-3 text-[#3E5F36]" />
            <span>Carbon</span>
          </span>
        )
      case 'WATER':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] flex items-center gap-1">
            <Droplets className="w-3 h-3 text-[#0369A1]" />
            <span>Water</span>
          </span>
        )
      case 'BIODIVERSITY':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#FAF5FF] border border-[#E9D5FF] text-[#7E22CE] flex items-center gap-1">
            <Trees className="w-3 h-3 text-[#7E22CE]" />
            <span>Biodiversity</span>
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Metric Strip (Exact Sea Green Harmony Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Projects Lifecycle */}
        <div
          onClick={() => handleTabChange('project-queue')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'project-queue' ? 'ring-2 ring-[#8D4E22] border-[#8D4E22]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B50]">Project Lifecycle</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
              <FolderKanban className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#18221B]">
              {projectsInitialData.summaryStats.totalProjects.count}
            </span>
            <span className="text-[11px] font-bold text-[#8D4E22]">
              {projectsInitialData.summaryStats.totalProjects.approvedCount} Active / Approved
            </span>
          </div>
          <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
            <span>{projectsInitialData.summaryStats.totalProjects.underScreening} In Screening</span>
            <span className="badge-warning-tint px-2 py-0.5 rounded-full text-[10px]">
              Gate §15.3
            </span>
          </div>
        </div>

        {/* KPI 2: Carbon Offsets Pipeline */}
        <div
          onClick={() => handleTabChange('carbon')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'carbon' ? 'ring-2 ring-[#8D4E22] border-[#8D4E22]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B50]">Carbon Portfolio</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
              <Leaf className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#18221B]">
              {projectsInitialData.summaryStats.carbonPortfolio.activeProjects}
            </span>
            <span className="text-[11px] font-bold text-[#3E5F36]">
              {projectsInitialData.summaryStats.carbonPortfolio.estimatedCredits}
            </span>
          </div>
          <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
            <span>Buffer Withheld: {projectsInitialData.summaryStats.carbonPortfolio.bufferPoolWithheld}</span>
            <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
              PRD §6
            </span>
          </div>
        </div>

        {/* KPI 3: Water Replenishment */}
        <div
          onClick={() => handleTabChange('water')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'water' ? 'ring-2 ring-[#8D4E22] border-[#8D4E22]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B50]">Water Impact</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
              <Droplets className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#18221B]">
              {projectsInitialData.summaryStats.waterPortfolio.activeProjects}
            </span>
            <span className="text-[11px] font-bold text-[#0369A1]">
              {projectsInitialData.summaryStats.waterPortfolio.totalVolumetricRecharge}
            </span>
          </div>
          <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
            <span>Aquifer Recovery: {projectsInitialData.summaryStats.waterPortfolio.aquiferRecoveryAvg}</span>
            <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
              PRD §7
            </span>
          </div>
        </div>

        {/* KPI 4: Biodiversity Flora & Habitats */}
        <div
          onClick={() => handleTabChange('biodiversity')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'biodiversity' ? 'ring-2 ring-[#8D4E22] border-[#8D4E22]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B50]">Biodiversity</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#7E22CE] flex items-center justify-center font-bold shadow-2xs">
              <Trees className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#18221B]">
              {projectsInitialData.summaryStats.biodiversityPortfolio.hectaresRestored}
            </span>
            <span className="text-[11px] font-bold text-[#7E22CE]">
              {projectsInitialData.summaryStats.biodiversityPortfolio.speciesProtected} Species
            </span>
          </div>
          <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
            <span>Saplings: {projectsInitialData.summaryStats.biodiversityPortfolio.nativeTreesCount}</span>
            <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
              PRD §8
            </span>
          </div>
        </div>
      </div>

      {/* 2. Submodule Tab Bar Navigation (PRD Page 10 Section 15 Modules) */}
      <div className="bg-white border border-[#D19E77] rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => handleTabChange('project-queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'project-queue'
              ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>Project Lifecycle</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
              activeTab === 'project-queue'
                ? 'bg-[#6E3812] text-white border-white/20'
                : 'bg-white/80 text-[#4A5B50] border-black/10'
            }`}
          >
            {projects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('carbon')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'carbon'
              ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
          }`}
        >
          <Leaf className={`w-3.5 h-3.5 ${activeTab === 'carbon' ? 'text-white' : 'text-[#8D4E22]'}`} />
          <span>Carbon Projects</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
              activeTab === 'carbon'
                ? 'bg-[#6E3812] text-white border-white/20'
                : 'bg-white/80 text-[#4A5B50] border-black/10'
            }`}
          >
            {carbonList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('water')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'water'
              ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
          }`}
        >
          <Droplets className={`w-3.5 h-3.5 ${activeTab === 'water' ? 'text-white' : 'text-[#0369A1]'}`} />
          <span>Water Impact</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
              activeTab === 'water'
                ? 'bg-[#6E3812] text-white border-white/20'
                : 'bg-white/80 text-[#4A5B50] border-black/10'
            }`}
          >
            {waterList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('biodiversity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'biodiversity'
              ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
          }`}
        >
          <Trees className={`w-3.5 h-3.5 ${activeTab === 'biodiversity' ? 'text-white' : 'text-[#7E22CE]'}`} />
          <span>Biodiversity</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
              activeTab === 'biodiversity'
                ? 'bg-[#6E3812] text-white border-white/20'
                : 'bg-white/80 text-[#4A5B50] border-black/10'
            }`}
          >
            {bioList.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. PAGE 1: DEDICATED PROJECT LIFECYCLE & SCREENING QUEUE (PRD §15.3, A08)  */}
      {/* ========================================================================= */}
      {activeTab === 'project-queue' && (
        <div className="space-y-6">
          {/* Stage Funnel Visual Cards (Draft -> Screening -> Visits -> MRV -> Verified) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {projectsInitialData.lifecycleFunnel.map((f, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#D19E77] rounded-2xl p-3.5 shadow-2xs space-y-1 hover:border-[#C1D6BD] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#738679]">
                    STAGE 0{idx + 1}
                  </span>
                  <span className="w-6 h-6 rounded-lg bg-[#F5E5D5] border border-[#D19E77] text-xs font-black text-[#18221B] flex items-center justify-center">
                    {f.count}
                  </span>
                </div>
                <div className="font-black text-xs text-[#18221B]">{f.label}</div>
                <p className="text-[10px] text-[#4A5B50] leading-snug">{f.description}</p>
              </div>
            ))}
          </div>

          {/* PRD §15.3 Screening Checklist Panel */}
          <div className="bg-[#F5E5D5] border border-[#D19E77] rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-[#18221B]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8D4E22]" />
                <span>PRD §15.3 Super Admin Mandatory Screening Verification Rules</span>
              </span>
              <span className="text-[10px] text-[#3E5F36] font-bold">
                Universal Gate Compliance Enforced
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {projectsInitialData.screeningChecklist.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-[#E5DFD5] rounded-xl p-2.5 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3E5F36] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#18221B] text-[11px] block">{c.name}</strong>
                    <span className="text-[10px] text-[#738679]">{c.rule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Screening Master Table */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight">
                  Project Screening &amp; Decision Queue (Module A08)
                </h3>
                <p className="text-xs text-[#4A5B50] font-semibold">
                  Review applicant baseline questionnaires, inspect evidence, and issue gate decisions
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="bg-[#F5E5D5] border border-[#D8B293] rounded-xl px-3 py-1.5 flex items-center gap-2 w-56">
                  <Search className="w-3.5 h-3.5 text-[#738679]" />
                  <input
                    type="text"
                    placeholder="Search lifecycle queue..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-[#18221B] font-bold w-full"
                  />
                </div>

                <CustomDropdown
                  value={typeFilter}
                  onChange={(val) => setTypeFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Impact Types', dotColor: '#8D4E22' },
                    { value: 'CARBON', label: 'Carbon (ARR/Biochar)', dotColor: '#5E8256' },
                    { value: 'WATER', label: 'Water (VWBA/Drip)', dotColor: '#0284C7' },
                    { value: 'BIODIVERSITY', label: 'Biodiversity (Corridors)', dotColor: '#8B5CF6' },
                  ]}
                  className="w-52"
                />

                <CustomDropdown
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Lifecycle Statuses', dotColor: '#8D4E22' },
                    { value: 'SUBMITTED', label: 'SUBMITTED (Screening)', dotColor: '#0284C7' },
                    { value: 'APPROVED_FOR_DATA_COLLECTION', label: 'APPROVED (Visits Open)', dotColor: '#5E8256' },
                    { value: 'MONITORING_MRV', label: 'MONITORING (MRV)', dotColor: '#0EA5E9' },
                    { value: 'VERIFIED_ELIGIBLE', label: 'VERIFIED (Eligible)', dotColor: '#10B981' },
                    { value: 'CLARIFICATION', label: 'CLARIFICATION (Hold)', dotColor: '#F59E0B' },
                    { value: 'REJECTED', label: 'REJECTED', dotColor: '#EF4444' },
                  ]}
                  className="w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Project &amp; Type</th>
                    <th className="p-3.5">Developer Org &amp; Lead Farmer</th>
                    <th className="p-3.5">Land Parcel</th>
                    <th className="p-3.5">Methodology &amp; Metric</th>
                    <th className="p-3.5">Lifecycle Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFD5]">
                  {filteredLifecycleProjects.map((proj) => (
                    <tr
                      key={proj.id}
                      className="hover:bg-[#F9F6F1] transition-colors cursor-pointer"
                      onClick={() => setSelectedProject(proj)}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2 mb-1">
                          {renderTypeBadge(proj.type)}
                          <span className="font-mono text-[11px] font-bold text-[#738679]">
                            {proj.id}
                          </span>
                        </div>
                        <div className="font-black text-[#18221B] text-xs max-w-xs leading-snug">
                          {proj.title}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{proj.developerOrg.name}</div>
                        <div className="text-[11px] text-[#4A5B50]">
                          Farmer: {proj.leadFarmer.name} ({proj.leadFarmer.district})
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-black text-sm text-[#18221B]">
                          {proj.landParcel.acreage} Acres
                        </div>
                        <div className="text-[11px] font-mono text-[#738679]">
                          {proj.landParcel.id} • {proj.landParcel.surveyNumber}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B] max-w-xs truncate">
                          {proj.methodology}
                        </div>
                        <div className="text-[11px] text-[#3E5F36] font-black">
                          {proj.type === 'CARBON'
                            ? proj.metrics.carbonCreditsEstimated
                            : proj.type === 'WATER'
                            ? proj.metrics.waterRechargedM3
                            : proj.metrics.biodiversityHectares}
                        </div>
                      </td>
                      <td className="p-3.5">{renderStatusBadge(proj.status)}</td>
                      <td className="p-3.5 text-right">
                        <div
                          className="inline-flex items-center gap-1.5 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedProject(proj)}
                            title="Inspect Details, Questionnaire & Evidence"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>
                          {proj.status !== 'APPROVED_FOR_DATA_COLLECTION' &&
                            proj.status !== 'VERIFIED_ELIGIBLE' && (
                              <button
                                type="button"
                                onClick={() => handleApprove(proj.id)}
                                title="Approve for Field Data Collection"
                                className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            )}
                          {proj.status !== 'REJECTED' &&
                            proj.status !== 'VERIFIED_ELIGIBLE' && (
                              <button
                                type="button"
                                onClick={() => handleOpenReject(proj.id)}
                                title="Reject / Clarification"
                                className="w-7.5 h-7.5 rounded-xl bg-[#C49563] hover:bg-[#8D4E22] hover:text-white border border-[#8D4E22] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                              >
                                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            )}
                          <button
                            type="button"
                            onClick={() => setProjectToDelete({ id: proj.id, title: proj.title })}
                            title="Purge Project Record"
                            className="w-7.5 h-7.5 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
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

      {/* ========================================================================= */}
      {/* 4. PAGE 2: DEDICATED CARBON METHODOLOGIES & CREDITING (PRD §6, A10)       */}
      {/* ========================================================================= */}
      {activeTab === 'carbon' && (
        <div className="space-y-6">
          {/* Carbon Header Banner & Methodology Tokens */}
          <div className="bg-[#F5E5D5] border border-[#D19E77] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#F2DFC9] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Leaf className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight">
                  Carbon Removal &amp; Sequestration Portfolio (PRD §6 &amp; Module A10)
                </h3>
              </div>
              <p className="text-xs text-[#4A5B50] font-medium max-w-2xl">
                Carbon accounting across Verra VM0042 Agroforestry, Gold Standard Biochar Pyrolysis, and India Carbon Credit Trading Scheme (CCTS)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-mint-tint px-3 py-1 rounded-full text-xs font-bold">
                15% Non-Permanence Buffer Pool Active
              </span>
            </div>
          </div>

          {/* Carbon Master Table */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-black text-[#18221B]">Carbon Methodological Registry</h4>
                <p className="text-xs text-[#738679]">Estimated tCO₂e/year, SOC baseline deltas, and registry serials</p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="bg-[#F5E5D5] border border-[#D8B293] rounded-xl px-3 py-1.5 flex items-center gap-2 w-56">
                  <Search className="w-3.5 h-3.5 text-[#738679]" />
                  <input
                    type="text"
                    placeholder="Search carbon registry..."
                    value={carbonSearch}
                    onChange={(e) => setCarbonSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-[#18221B] font-bold w-full"
                  />
                </div>

                <CustomDropdown
                  value={carbonMethodFilter}
                  onChange={(val) => setCarbonMethodFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Methodologies', dotColor: '#8D4E22' },
                    { value: 'VM0042', label: 'VM0042 Agroforestry', dotColor: '#5E8256' },
                    { value: 'Biochar', label: 'Biochar (AR-ACM0003)', dotColor: '#0284C7' },
                    { value: 'Afforestation', label: 'Bamboo Afforestation', dotColor: '#10B981' },
                  ]}
                  className="w-52"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Carbon Project &amp; Serial</th>
                    <th className="p-3.5">Methodology &amp; Developer</th>
                    <th className="p-3.5">Soil Organic Carbon (SOC)</th>
                    <th className="p-3.5">Annual / 20-Yr Removals</th>
                    <th className="p-3.5">Buffer Pool</th>
                    <th className="p-3.5">Registry Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFD5]">
                  {filteredCarbonProjects.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F9F6F1] transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono text-[10px] text-[#738679] font-bold">{c.id}</div>
                        <div className="font-black text-xs text-[#18221B] max-w-xs">{c.title}</div>
                        <div className="text-[10px] text-[#3E5F36] font-mono mt-0.5">
                          {c.registryStandard}: {c.registrySerial}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{c.methodology}</div>
                        <div className="text-[11px] text-[#4A5B50]">{c.developerOrg}</div>
                        <div className="text-[10px] text-[#738679] font-mono">{c.landParcel}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-bold text-[#18221B]">
                          <span>{c.currentSocLevel}</span>
                          <span className="text-[#3E5F36]">➔</span>
                          <span className="text-[#3E5F36] font-black">{c.targetSocGain}</span>
                        </div>
                        <div className="text-[10px] text-[#738679]">{c.treesPlanted}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-black text-sm text-[#18221B]">{c.annualRemoval}</div>
                        <div className="text-[10px] text-[#738679]">20-Yr: {c.totalEstimated20Yr}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="badge-warning-tint px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {c.bufferPool}
                        </span>
                      </td>
                      <td className="p-3.5">{renderStatusBadge(c.status)}</td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const found = projects.find((p) => p.id === c.id)
                              if (found) setSelectedProject(found)
                            }}
                            title="Inspect Carbon Methodology Dossier"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProjectToDelete({ id: c.id, title: c.title })}
                            title="Delete Carbon Record"
                            className="w-7.5 h-7.5 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
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

      {/* ========================================================================= */}
      {/* 5. PAGE 3: DEDICATED WATER VOLUMETRIC BENEFIT (PRD §7, A11)               */}
      {/* ========================================================================= */}
      {activeTab === 'water' && (
        <div className="space-y-6">
          {/* Water Header Strip */}
          <div className="bg-[#F5E5D5] border border-[#D19E77] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] flex items-center justify-center font-bold">
                  <Droplets className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight">
                  Volumetric Water Benefit Accounting (PRD §7 &amp; Module A11)
                </h3>
              </div>
              <p className="text-xs text-[#4A5B50] font-medium max-w-2xl">
                Groundwater aquifer replenishment, piezometric monitoring networks, and AWS v2.0 micro-irrigation compliance
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-sky-tint px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#0369A1]" />
                <span>IoT Flow Telemetry Online</span>
              </span>
            </div>
          </div>

          {/* Water Table */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-black text-[#18221B]">Aquifer Recharge &amp; Watershed Registry</h4>
                <p className="text-xs text-[#738679]">Volumetric benefit (m³/yr), piezometric water table recovery, and telemetry meters</p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="bg-[#F5E5D5] border border-[#D8B293] rounded-xl px-3 py-1.5 flex items-center gap-2 w-56">
                  <Search className="w-3.5 h-3.5 text-[#738679]" />
                  <input
                    type="text"
                    placeholder="Search water watershed..."
                    value={waterSearch}
                    onChange={(e) => setWaterSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-[#18221B] font-bold w-full"
                  />
                </div>

                <CustomDropdown
                  value={waterBasinFilter}
                  onChange={(val) => setWaterBasinFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Watershed Basins', dotColor: '#8D4E22' },
                    { value: 'Narmada', label: 'Narmada Basin', dotColor: '#0284C7' },
                    { value: 'Thar', label: 'Thar Endorheic Basin', dotColor: '#D97706' },
                    { value: 'Godavari', label: 'Godavari Upper Catchment', dotColor: '#5E8256' },
                  ]}
                  className="w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Water Project &amp; River Basin</th>
                    <th className="p-3.5">Intervention Engineering</th>
                    <th className="p-3.5">Annual Recharge (m³)</th>
                    <th className="p-3.5">Piezometer Level</th>
                    <th className="p-3.5">Drip Coverage</th>
                    <th className="p-3.5">Compliance</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFD5]">
                  {filteredWaterProjects.map((w) => (
                    <tr key={w.id} className="hover:bg-[#F9F6F1] transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono text-[10px] text-[#738679] font-bold">{w.id}</div>
                        <div className="font-black text-xs text-[#18221B] max-w-xs">{w.title}</div>
                        <div className="text-[10px] text-[#0369A1] font-medium">{w.basin}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{w.interventionType}</div>
                        <div className="text-[10px] text-[#738679]">Extraction: {w.baselineExtraction}</div>
                        <div className="text-[10px] text-[#3E5F36] font-bold">{w.waterSavedPct}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-black text-sm text-[#18221B]">{w.annualRechargeM3}</div>
                        <div className="text-[10px] text-[#0369A1]">{w.iotFlowMeters}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{w.piezometerDepth}</div>
                        <div className="text-[10px] text-[#3E5F36]">CGWB Calibrated</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{w.dripCoverage}</div>
                        <div className="text-[10px] text-[#738679]">100% Micro-Tubed</div>
                      </td>
                      <td className="p-3.5">
                        <span className="badge-sky-tint px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          {w.complianceStandard}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const found = projects.find((p) => p.id === w.id)
                              if (found) setSelectedProject(found)
                            }}
                            title="Inspect Water Hydrological Model"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProjectToDelete({ id: w.id, title: w.title })}
                            title="Delete Water Record"
                            className="w-7.5 h-7.5 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
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

      {/* ========================================================================= */}
      {/* 6. PAGE 4: DEDICATED BIODIVERSITY & HABITAT CORRIDORS (PRD §8, A12)       */}
      {/* ========================================================================= */}
      {activeTab === 'biodiversity' && (
        <div className="space-y-6">
          {/* Biodiversity Header Strip */}
          <div className="bg-[#F5E5D5] border border-[#D19E77] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-[#7E22CE] flex items-center justify-center font-bold">
                  <Trees className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight">
                  Biodiversity Habitat Corridors &amp; Native Flora (PRD §8 &amp; Module A12)
                </h3>
              </div>
              <p className="text-xs text-[#4A5B50] font-medium max-w-2xl">
                Native species reforestation, IUCN Red List fauna corridors, and elimination of invasive monocultures
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-mint-tint px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#3E5F36]" />
                <span>Camera Trap AI Corroboration</span>
              </span>
            </div>
          </div>

          {/* Biodiversity Table */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-black text-[#18221B]">Ecological Corridor Registry</h4>
                <p className="text-xs text-[#738679]">Hectares protected, native species matrix, and ACVA verifier audits</p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="bg-[#F5E5D5] border border-[#D8B293] rounded-xl px-3 py-1.5 flex items-center gap-2 w-56">
                  <Search className="w-3.5 h-3.5 text-[#738679]" />
                  <input
                    type="text"
                    placeholder="Search biodiversity..."
                    value={bioSearch}
                    onChange={(e) => setBioSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-[#18221B] font-bold w-full"
                  />
                </div>

                <CustomDropdown
                  value={bioZoneFilter}
                  onChange={(val) => setBioZoneFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Ecological Zones', dotColor: '#8D4E22' },
                    { value: 'Central', label: 'Central Indian Scrub', dotColor: '#D97706' },
                    { value: 'Western Ghats', label: 'Western Ghats Hotspot', dotColor: '#5E8256' },
                    { value: 'Gir', label: 'Kathiawar-Gir Shrubland', dotColor: '#0284C7' },
                  ]}
                  className="w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Corridor Project &amp; Zone</th>
                    <th className="p-3.5">Restoration Strategy</th>
                    <th className="p-3.5">Protected Area &amp; Canopy</th>
                    <th className="p-3.5">Native Flora Matrix</th>
                    <th className="p-3.5">IUCN Species &amp; Cameras</th>
                    <th className="p-3.5">Third-Party Verifier</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFD5]">
                  {filteredBioProjects.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F9F6F1] transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono text-[10px] text-[#738679] font-bold">{b.id}</div>
                        <div className="font-black text-xs text-[#18221B] max-w-xs">{b.title}</div>
                        <div className="text-[10px] text-[#7E22CE] font-semibold">{b.ecologicalZone}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{b.restorationType}</div>
                        <div className="text-[10px] text-[#738679]">{b.developerOrg}</div>
                        <div className="text-[10px] text-[#3E5F36] font-medium">{b.methodology}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-black text-sm text-[#18221B]">{b.hectaresProtected}</div>
                        <div className="text-[10px] text-[#3E5F36] font-bold">
                          Canopy Gain: {b.canopyCoverGain}
                        </div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-[#18221B]">
                          {b.nativeSpeciesCount} Native Species
                        </div>
                        <div className="text-[10px] text-[#4A5B50] truncate">
                          {b.nativeSpeciesList}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{b.iucnTargetSpecies}</div>
                        <div className="text-[10px] text-[#738679]">{b.cameraTrapsInstalled}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="badge-mint-tint px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          {b.verifierOrganization}
                        </span>
                        <div className="mt-1">{renderStatusBadge(b.status)}</div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const found = projects.find((p) => p.id === b.id)
                              if (found) setSelectedProject(found)
                            }}
                            title="Inspect Biodiversity Ecological Dossier"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProjectToDelete({ id: b.id, title: b.title })}
                            title="Delete Biodiversity Record"
                            className="w-7.5 h-7.5 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
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

      {/* ========================================================================= */}
      {/* 7. PRD §15.3 SLIDE-OVER DETAIL DRAWER                                      */}
      {/* ========================================================================= */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-5 border-l border-[#D19E77]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE4DC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F2DFC9] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  {selectedProject.type === 'CARBON' ? (
                    <Leaf className="w-5 h-5 text-[#3E5F36]" />
                  ) : selectedProject.type === 'WATER' ? (
                    <Droplets className="w-5 h-5 text-[#0369A1]" />
                  ) : (
                    <Trees className="w-5 h-5 text-[#7E22CE]" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B] leading-tight">
                    {selectedProject.title}
                  </h4>
                  <p className="text-xs font-mono text-[#4A5B50] font-bold">
                    {selectedProject.id} • Crediting: {selectedProject.creditingPeriod}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#EFE9E0] border border-[#D19E77] flex items-center justify-center text-[#4A5B50] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#738679]">PRD §15.3 Screening Gate:</span>
                {renderStatusBadge(selectedProject.status)}
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {selectedProject.status !== 'APPROVED_FOR_DATA_COLLECTION' &&
                  selectedProject.status !== 'VERIFIED_ELIGIBLE' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedProject.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Approve for Visits</span>
                    </button>
                  )}

                {selectedProject.status !== 'REJECTED' &&
                  selectedProject.status !== 'VERIFIED_ELIGIBLE' && (
                    <button
                      type="button"
                      onClick={() => handleOpenReject(selectedProject.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#C49563] hover:bg-[#8D4E22] hover:text-white border border-[#8D4E22] text-[#2B1405] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Reject / Clarify</span>
                    </button>
                  )}
              </div>
            </div>

            {selectedProject.clarificationQuestion && (
              <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] space-y-1">
                <strong className="block font-black flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Active Technical Clarification:
                </strong>
                <p>{selectedProject.clarificationQuestion}</p>
              </div>
            )}

            {selectedProject.rejectionReason && (
              <div className="p-3.5 rounded-2xl bg-[#C49563] border border-[#8D4E22] text-xs text-[#2B1405] font-black space-y-1">
                <strong className="block font-black flex items-center gap-1.5 text-[#6E3812]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Official Rejection Compliance Reason:
                </strong>
                <p className="font-semibold text-[#2B1405]">{selectedProject.rejectionReason}</p>
              </div>
            )}

            {/* Land Geometry Section */}
            <div className="p-4 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-2 text-xs">
              <div className="flex items-center justify-between font-black text-[#18221B]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#8D4E22]" />
                  <span>Bound Land Parcel (PostGIS Linked)</span>
                </span>
                <span className="text-[11px] font-mono text-[#8D4E22] font-bold">
                  {selectedProject.landParcel.acreage} Acres
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-[#738679] font-bold uppercase block">
                    Parcel ID
                  </span>
                  <span className="font-bold text-[#18221B]">{selectedProject.landParcel.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#738679] font-bold uppercase block">
                    Survey / Khasra
                  </span>
                  <span className="font-bold text-[#18221B]">
                    {selectedProject.landParcel.surveyNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#738679] font-bold uppercase block">
                    Coordinates
                  </span>
                  <span className="font-mono text-[11px] text-[#18221B]">
                    {selectedProject.landParcel.coordinates}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#738679] font-bold uppercase block">
                    Assigned Field Agent
                  </span>
                  <span className="font-bold text-[#18221B]">{selectedProject.assignedAgent}</span>
                </div>
              </div>
            </div>

            {/* Questionnaire */}
            <div className="space-y-3">
              <h4 className="font-black text-[#18221B] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#8D4E22]" />
                <span>Type-Specific Questionnaire Responses</span>
              </h4>
              <div className="space-y-2.5">
                {selectedProject.questionnaire.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-1 text-xs"
                  >
                    <span className="text-[10px] font-bold text-[#738679] uppercase">
                      {q.category}
                    </span>
                    <div className="font-bold text-[#18221B]">{q.question}</div>
                    <p className="text-[#4A5B50] leading-relaxed pt-0.5">{q.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence List */}
            <div className="space-y-3">
              <h4 className="font-black text-[#18221B] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#8D4E22]" />
                <span>Geotagged Baseline Evidence &amp; Lab Audits</span>
              </h4>
              <div className="space-y-2">
                {selectedProject.evidenceList.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-2xl bg-white border border-[#E5DFD5] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-[#F5E5D5] border border-[#D8B293] px-1.5 py-0.5 rounded font-bold text-[#18221B]">
                          {ev.type}
                        </span>
                        <div className="font-bold text-[#18221B] truncate">{ev.title}</div>
                      </div>
                      <div className="text-[10px] text-[#738679] mt-0.5">
                        {ev.geoTag} • {ev.date} • <span className="font-mono">{ev.hash}</span>
                      </div>
                    </div>
                    <div>
                      {ev.verified ? (
                        <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Verified
                        </span>
                      ) : (
                        <span className="badge-warning-tint px-2 py-0.5 rounded-full text-[9px] font-bold">
                          Pending Audit
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="space-y-3">
              <h4 className="font-black text-[#18221B] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8D4E22]" />
                <span>Immutable Decision Audit Log</span>
              </h4>
              <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-2.5 text-xs">
                {selectedProject.auditTrail.map((log, idx) => (
                  <div
                    key={idx}
                    className="border-b last:border-b-0 border-[#E5DFD5] pb-2 last:pb-0 space-y-0.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-[#18221B]">{log.action}</span>
                      <span className="text-[#738679]">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#4A5B50]">{log.note}</p>
                    <span className="text-[10px] text-[#738679] block">
                      Actor: {log.performedBy}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. CLARIFICATION & REJECTION INTERACTIVE MODAL                             */}
      {/* ========================================================================= */}
      {modalAction && modalTargetId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#D8B293] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-[#18221B] flex items-center gap-2">
                {modalAction === 'clarify' ? (
                  <>
                    <HelpCircle className="w-5 h-5 text-[#B45309]" />
                    <span>Request Technical Clarification</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-[#8D4E22]" />
                    <span>Reject Project Filing</span>
                  </>
                )}
              </h4>
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="text-[#738679] hover:text-[#18221B]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#4A5B50]">
              {modalAction === 'clarify'
                ? 'This inquiry will be dispatched to the Project Developer and lead farmer with an active resubmission token.'
                : 'Please specify the exact regulatory or technical non-compliance reason according to PRD criteria.'}
            </p>

            <textarea
              rows={4}
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
              placeholder={
                modalAction === 'clarify'
                  ? 'Enter specific technical question or required document...'
                  : 'Enter mandatory rejection justification...'
              }
              className="w-full p-3 rounded-2xl bg-[#F5E5D5] border border-[#D8B293] text-xs text-[#18221B] font-medium outline-none focus:border-[#8D4E22] focus:bg-white resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSubmit}
                disabled={!modalText.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 ${
                  modalAction === 'clarify'
                    ? 'bg-[#D97706] hover:bg-[#B45309]'
                    : 'bg-[#C53030] hover:bg-[#9B2C2C]'
                }`}
              >
                <span>{modalAction === 'clarify' ? 'Send Inquiry' : 'Confirm Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. DELETE PROJECT RECORD MODAL                                            */}
      {/* ========================================================================= */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border-2 border-[#B88258] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C49563] border border-[#8D4E22] text-[#2B1405] flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#18221B]">Delete Project Record?</h4>
                <p className="text-xs text-[#738679]">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-[#4A5B50] leading-relaxed">
              Are you sure you want to permanently purge{' '}
              <strong className="text-[#18221B]">{projectToDelete.id}</strong> (
              {projectToDelete.title})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#C49563] hover:text-[#2B1405] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
