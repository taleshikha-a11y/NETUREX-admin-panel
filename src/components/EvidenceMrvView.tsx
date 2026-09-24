import { useState, useMemo, useEffect } from 'react'
import {
  FileCheck2,
  Eye,
  Check,
  Trash2,
  HelpCircle,
  Download,
  Upload,
  X,
  Search,
  Camera,
  Video,
  FileText,
  MapPin,
  Compass,
  AlertTriangle,
  Layers,
  Award,
  Plus,
  Hash,
  Smartphone,
} from 'lucide-react'
import evidenceMrvData from '../data/evidenceMrvData.json'
import CustomDropdown from './CustomDropdown'

interface EvidenceMrvViewProps {
  initialSubTab?: string
  onNavigateSubTab?: (subTabKey: string) => void
}

type SubTabKey = 'evidence-review' | 'mrv-control'

export interface EvidenceItem {
  id: string
  projectId: string
  projectName: string
  farmerId: string
  farmerName: string
  parcelId: string
  visitId: string
  fieldAgent: string
  captureType: string
  category: string
  caption: string
  timestamp: string
  deviceModel: string
  gps: {
    lat: number
    lng: number
    altitude: string
    accuracy: string
    bearing: string
  }
  geofenceStatus: string
  sha256Hash: string
  tamperStatus: string
  fileSize: string
  status: string
  reviewerNotes: string
  evidenceScore: number
  location: string
}

export interface MrvTask {
  id: string
  projectId: string
  projectName: string
  monitoringPeriod: string
  methodology: string
  leadReviewer: string
  reviewerEmail: string
  status: string
  dueDate: string
  completenessScore: string
  accreditedBody: string
  checklist: Array<{
    item: string
    required: number
    submitted: number
    status: string
  }>
  findings: Array<{
    id: string
    severity: string
    description: string
    status: string
    createdAt: string
  }>
  totalHectares: number
  estimatedCredits: string
}

export default function EvidenceMrvView({
  initialSubTab = 'evidence-review',
  onNavigateSubTab,
}: EvidenceMrvViewProps) {
  const [activeTab, setActiveTab] = useState<SubTabKey>(() => {
    if (initialSubTab === 'mrv-control') return 'mrv-control'
    return 'evidence-review'
  })

  // Sync tab when initialSubTab changes from parent or sidebar navigation
  useEffect(() => {
    if (initialSubTab === 'evidence-review' || initialSubTab === 'mrv-control') {
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
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(
    evidenceMrvData.evidenceItems as EvidenceItem[]
  )
  const [mrvTasks, setMrvTasks] = useState<MrvTask[]>(
    evidenceMrvData.mrvMonitoringTasks as MrvTask[]
  )

  // -------------------------------------------------------------
  // TAB 1: Evidence Review State & Filters
  // -------------------------------------------------------------
  const [evidenceSearch, setEvidenceSearch] = useState('')
  const [mediaTypeFilter, setMediaTypeFilter] = useState('ALL')
  const [evidenceStatusFilter, setEvidenceStatusFilter] = useState('ALL')
  const [geofenceFilter, setGeofenceFilter] = useState('ALL')
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null)
  const [evidenceToDelete, setEvidenceToDelete] = useState<EvidenceItem | null>(null)
  const [isSimulateUploadOpen, setIsSimulateUploadOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    farmerName: '',
    projectName: 'Indore-Dewas Agroforestry Carbon Sequestration',
    category: 'Tree DBH & Height Caliper',
    captureType: 'Photo',
    location: 'Sehore, MP',
  })

  // -------------------------------------------------------------
  // TAB 2: MRV Control State & Filters
  // -------------------------------------------------------------
  const [mrvSearch, setMrvSearch] = useState('')
  const [mrvStatusFilter, setMrvStatusFilter] = useState('ALL')
  const [selectedMrvTask, setSelectedMrvTask] = useState<MrvTask | null>(null)
  const [isCreateMrvModalOpen, setIsCreateMrvModalOpen] = useState(false)
  const [newMrvForm, setNewMrvForm] = useState({
    projectName: 'Indore-Dewas Agroforestry Carbon Sequestration',
    monitoringPeriod: 'Q4 2026 (Oct - Dec)',
    methodology: 'VM0042 / NatureX Soil Carbon Protocol v1.4',
    leadReviewer: 'Dr. Sunita Rao (MRV Specialist)',
  })

  // -------------------------------------------------------------
  // Filtered Evidence
  // -------------------------------------------------------------
  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((item) => {
      const q = evidenceSearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.farmerName.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.fieldAgent.toLowerCase().includes(q)

      const matchesType =
        mediaTypeFilter === 'ALL' ||
        item.captureType.toLowerCase() === mediaTypeFilter.toLowerCase()
      const matchesStatus =
        evidenceStatusFilter === 'ALL' || item.status === evidenceStatusFilter
      const matchesGeofence =
        geofenceFilter === 'ALL' || item.geofenceStatus === geofenceFilter

      return matchesSearch && matchesType && matchesStatus && matchesGeofence
    })
  }, [evidenceList, evidenceSearch, mediaTypeFilter, evidenceStatusFilter, geofenceFilter])

  // -------------------------------------------------------------
  // Filtered MRV Tasks
  // -------------------------------------------------------------
  const filteredMrvTasks = useMemo(() => {
    return mrvTasks.filter((task) => {
      const q = mrvSearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        task.id.toLowerCase().includes(q) ||
        task.projectName.toLowerCase().includes(q) ||
        task.methodology.toLowerCase().includes(q) ||
        task.leadReviewer.toLowerCase().includes(q) ||
        task.monitoringPeriod.toLowerCase().includes(q)

      const matchesStatus =
        mrvStatusFilter === 'ALL' || task.status === mrvStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [mrvTasks, mrvSearch, mrvStatusFilter])

  // -------------------------------------------------------------
  // Actions: Evidence Review
  // -------------------------------------------------------------
  const handleVerifyEvidence = (id: string) => {
    setEvidenceList((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'VERIFIED',
              reviewerNotes: 'Verified by Super Admin. GPS inside geofence & SHA-256 match.',
            }
          : e
      )
    )
    if (selectedEvidence?.id === id) {
      setSelectedEvidence((prev) =>
        prev
          ? {
              ...prev,
              status: 'VERIFIED',
              reviewerNotes: 'Verified by Super Admin. GPS inside geofence & SHA-256 match.',
            }
          : null
      )
    }
  }

  const handleFlagEvidence = (id: string) => {
    setEvidenceList((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'FLAGGED',
              reviewerNotes: 'Flagged for field clarification. GPS accuracy or sightline issue.',
            }
          : e
      )
    )
    if (selectedEvidence?.id === id) {
      setSelectedEvidence((prev) =>
        prev
          ? {
              ...prev,
              status: 'FLAGGED',
              reviewerNotes: 'Flagged for field clarification. GPS accuracy or sightline issue.',
            }
          : null
      )
    }
  }

  const handleDeleteEvidence = () => {
    if (!evidenceToDelete) return
    const id = evidenceToDelete.id
    setEvidenceList((prev) => prev.filter((e) => e.id !== id))
    if (selectedEvidence?.id === id) setSelectedEvidence(null)
    setEvidenceToDelete(null)
  }

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.farmerName) return

    const newEvidence: EvidenceItem = {
      id: `EVD-2026-${Math.floor(98200 + Math.random() * 900)}`,
      projectId: 'PRJ-CAR-2026-001',
      projectName: uploadForm.projectName,
      farmerId: `USR-FARM-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerName: uploadForm.farmerName,
      parcelId: 'PARCEL-MP-0891',
      visitId: `VISIT-2026-${Math.floor(480 + Math.random() * 50)}`,
      fieldAgent: 'Sanjay Mandloi (FA-0041)',
      captureType: uploadForm.captureType,
      category: uploadForm.category,
      caption: 'Field verification evidence upload with cryptographic GPS audit',
      timestamp: 'Today (Live Field Sync)',
      deviceModel: 'Samsung Galaxy M34 5G (Android 14, NatureX v2.4.1)',
      gps: {
        lat: 22.9825,
        lng: 76.5422,
        altitude: '494.0 m',
        accuracy: '±1.6 m (RTK Fixed)',
        bearing: '135° SE',
      },
      geofenceStatus: 'INSIDE_PARCEL',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      tamperStatus: 'VALID_INTEGRITY',
      fileSize: '4.5 MB RAW',
      status: 'VERIFIED',
      reviewerNotes: 'Auto-verified with RTK ground station fix and PostGIS ST_Contains check.',
      evidenceScore: 99,
      location: uploadForm.location,
    }

    setEvidenceList((prev) => [newEvidence, ...prev])
    setIsSimulateUploadOpen(false)
    setUploadForm({
      farmerName: '',
      projectName: 'Indore-Dewas Agroforestry Carbon Sequestration',
      category: 'Tree DBH & Height Caliper',
      captureType: 'Photo',
      location: 'Sehore, MP',
    })
  }

  // -------------------------------------------------------------
  // Actions: MRV Control
  // -------------------------------------------------------------
  const handleApproveMrvCycle = (taskId: string) => {
    setMrvTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'APPROVED' } : t))
    )
    if (selectedMrvTask?.id === taskId) {
      setSelectedMrvTask((prev) => (prev ? { ...prev, status: 'APPROVED' } : null))
    }
  }

  const handleIssueCAR = (taskId: string) => {
    setMrvTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'CAR_ISSUED' } : t))
    )
    if (selectedMrvTask?.id === taskId) {
      setSelectedMrvTask((prev) => (prev ? { ...prev, status: 'CAR_ISSUED' } : null))
    }
  }

  const handleCreateMrvSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const createdTask: MrvTask = {
      id: `MRV-CYC-2026-${Math.floor(10 + Math.random() * 90)}`,
      projectId: 'PRJ-CAR-2026-001',
      projectName: newMrvForm.projectName,
      monitoringPeriod: newMrvForm.monitoringPeriod,
      methodology: newMrvForm.methodology,
      leadReviewer: newMrvForm.leadReviewer,
      reviewerEmail: 'sunita.rao@naturex.io',
      status: 'UNDER_REVIEW',
      dueDate: '15 Nov 2026',
      completenessScore: '94.0%',
      accreditedBody: 'BEE India / CCTS Verification Board',
      checklist: [
        { item: 'Drone Orthomosaic Photogrammetry', required: 1, submitted: 1, status: 'VERIFIED' },
        { item: 'Soil Core Lab Assays', required: 20, submitted: 19, status: 'IN_PROGRESS' },
        { item: 'Tree Caliper Measurements', required: 100, submitted: 95, status: 'IN_PROGRESS' },
      ],
      findings: [],
      totalHectares: 220.0,
      estimatedCredits: '2,950 tCO2e',
    }

    setMrvTasks((prev) => [createdTask, ...prev])
    setIsCreateMrvModalOpen(false)
  }

  // -------------------------------------------------------------
  // Minimalist Badge Helpers
  // -------------------------------------------------------------
  const renderEvidenceStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase()
    if (s === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5E8256] flex-shrink-0" />
          <span>Verified</span>
        </span>
      )
    }
    if (s === 'FLAGGED' || s === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#C49563] border border-[#8D4E22] text-[#2B1405]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6E3812] flex-shrink-0" />
          <span>{s === 'FLAGGED' ? 'Flagged' : 'Rejected'}</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFFBEB] border border-[#FEF3C7] text-[#B45309]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
        <span>Pending Review</span>
      </span>
    )
  }

  const renderGeofenceBadge = (status: string) => {
    if (status === 'INSIDE_PARCEL') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6EFE4] text-[#3E5F36] border border-[#C1D6BD]">
          <span>✓ In-Bounds</span>
        </span>
      )
    }
    if (status === 'MARGINAL_5M') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]">
          <span>⚠ Marginal (&lt;5m)</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#C49563] text-[#2B1405] border border-[#8D4E22]">
        <span>✕ Outside Parcel</span>
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
            onClick={() => handleTabChange('evidence-review')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'evidence-review'
                ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
                : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Evidence Review (FA10/FA13)</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                activeTab === 'evidence-review'
                  ? 'bg-[#6E3812] text-white border-white/20'
                  : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
            >
              {evidenceList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('mrv-control')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'mrv-control'
                ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
                : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>MRV Control &amp; Monitoring Plans</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                activeTab === 'mrv-control'
                  ? 'bg-[#6E3812] text-white border-white/20'
                  : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
            >
              {mrvTasks.length} Cycles
            </span>
          </button>
        </div>

        {/* Top Action Button */}
        <div>
          {activeTab === 'evidence-review' ? (
            <button
              type="button"
              onClick={() => setIsSimulateUploadOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Simulate Evidence Ingest</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreateMrvModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Initialize Monitoring Cycle</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. SUB-PAGE 1: EVIDENCE REVIEW (FA10 / FA13 / PRD A13)        */}
      {/* ============================================================= */}
      {activeTab === 'evidence-review' && (
        <div className="space-y-6">
          {/* Sea Green Tinted KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Total Evidence Uploads</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Camera className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {evidenceMrvData.summaryStats.totalEvidence.count}
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Geotagged Files</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>{evidenceMrvData.summaryStats.totalEvidence.verifiedCount} Verified</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  FA10 Engine
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Geofence Accuracy</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <MapPin className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {evidenceMrvData.summaryStats.geofenceAccuracy.percentage}
                </span>
                <span className="text-[11px] font-bold text-[#3E5F36]">In-Bounds</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>PostGIS ST_Contains Check</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  F10 Cadastral
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Cryptographic Integrity</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
                  <Hash className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">100%</span>
                <span className="text-[11px] font-bold text-[#0369A1]">SHA-256 Valid</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Zero Tamper Alerts</span>
                <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
                  Immutable EXIF
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Pending Review</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#8D4E22] flex items-center justify-center font-bold shadow-2xs">
                  <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {evidenceList.filter((e) => e.status === 'PENDING_REVIEW').length}
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Awaiting Audit</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>
                  {evidenceList.filter((e) => e.status === 'FLAGGED').length} Flagged Queries
                </span>
                <span className="badge-alert-tint px-2 py-0.5 rounded-full text-[10px]">
                  PRD §11 Task
                </span>
              </div>
            </div>
          </div>

          {/* Evidence Master Review Table Card */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#8D4E22]" />
                  <span>Field Evidence Review &amp; Tamper Verification (PRD A13 &amp; FA13)</span>
                </h3>
                <p className="text-xs text-[#4A5B50] font-semibold">
                  Inspection of field photos, telemetry videos, and sensor logs with PostGIS geofence checks and SHA-256 verification
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search evidence ID, farmer, project..."
                    value={evidenceSearch}
                    onChange={(e) => setEvidenceSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs text-[#18221B] font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>

                <CustomDropdown
                  value={mediaTypeFilter}
                  onChange={(val) => setMediaTypeFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Media', dotColor: '#8D4E22' },
                    { value: 'Photo', label: 'Photos', dotColor: '#5E8256' },
                    { value: 'Video', label: 'Videos', dotColor: '#0284C7' },
                    { value: 'Document', label: 'Sensor Logs', dotColor: '#8B5CF6' },
                  ]}
                  className="w-40"
                />

                <CustomDropdown
                  value={geofenceFilter}
                  onChange={(val) => setGeofenceFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Geofence Status', dotColor: '#8D4E22' },
                    { value: 'INSIDE_PARCEL', label: 'Inside Parcel', dotColor: '#5E8256' },
                    { value: 'MARGINAL_5M', label: 'Marginal (<5m)', dotColor: '#F59E0B' },
                    { value: 'OUTSIDE_PARCEL', label: 'Outside Parcel', dotColor: '#EF4444' },
                  ]}
                  className="w-48"
                />

                <CustomDropdown
                  value={evidenceStatusFilter}
                  onChange={(val) => setEvidenceStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Review Status', dotColor: '#8D4E22' },
                    { value: 'PENDING_REVIEW', label: 'Pending Review', dotColor: '#F59E0B' },
                    { value: 'VERIFIED', label: 'Verified', dotColor: '#5E8256' },
                    { value: 'FLAGGED', label: 'Flagged', dotColor: '#EF4444' },
                  ]}
                  className="w-44"
                />
              </div>
            </div>

            {/* Evidence Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Evidence ID &amp; Media</th>
                    <th className="p-3.5">Category &amp; Caption</th>
                    <th className="p-3.5">Landholder &amp; Surveyor</th>
                    <th className="p-3.5">GPS &amp; Geofence</th>
                    <th className="p-3.5">Tamper &amp; Integrity</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFD5]">
                  {filteredEvidence.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F9F6F1] transition-colors cursor-pointer"
                      onClick={() => setSelectedEvidence(item)}
                    >
                      {/* Evidence ID & Media Mock */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          {/* Simulated Camera Viewfinder Thumbnail */}
                          <div className="w-12 h-10 rounded-xl bg-[#F2DFC9] border border-[#C1D6BD] relative flex items-center justify-center overflow-hidden shadow-2xs flex-shrink-0">
                            {item.captureType === 'Photo' ? (
                              <Camera className="w-4 h-4 text-[#8D4E22]" />
                            ) : item.captureType === 'Video' ? (
                              <Video className="w-4 h-4 text-[#0369A1]" />
                            ) : (
                              <FileText className="w-4 h-4 text-[#B45309]" />
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-[7px] text-white text-center font-mono py-0.2">
                              {item.captureType.toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="font-black text-[#18221B] text-sm">{item.id}</div>
                            <div className="text-[10px] text-[#738679] font-mono">
                              {item.fileSize}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Project */}
                      <td className="p-3.5">
                        <div className="font-black text-[#18221B]">{item.category}</div>
                        <div className="text-[10px] text-[#8D4E22] font-bold truncate max-w-xs">
                          {item.projectName}
                        </div>
                      </td>

                      {/* Landholder & Field Agent */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{item.farmerName}</div>
                        <div className="text-[10px] text-[#4A5B50]">Agent: {item.fieldAgent}</div>
                      </td>

                      {/* GPS & Geofence Status */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {renderGeofenceBadge(item.geofenceStatus)}
                        </div>
                        <div className="text-[10px] font-mono text-[#738679] mt-0.5">
                          {item.gps.lat.toFixed(4)}° N, {item.gps.lng.toFixed(4)}° E
                        </div>
                      </td>

                      {/* Tamper & Integrity */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#3E5F36]">
                          <Hash className="w-3 h-3" />
                          <span>SHA-256 Valid</span>
                        </div>
                        <div className="text-[10px] text-[#738679] truncate max-w-[130px] font-mono">
                          {item.sha256Hash}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">{renderEvidenceStatusBadge(item.status)}</td>

                      {/* Strictly Icon-Only Action Buttons */}
                      <td className="p-3.5 text-right">
                        <div
                          className="inline-flex items-center gap-1.5 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedEvidence(item)}
                            title="Inspect Full Media & Metadata EXIF Drawer"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {item.status !== 'VERIFIED' && (
                            <button
                              type="button"
                              onClick={() => handleVerifyEvidence(item.id)}
                              title="Approve Evidence Verification"
                              className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          {item.status !== 'FLAGGED' && (
                            <button
                              type="button"
                              onClick={() => handleFlagEvidence(item.id)}
                              title="Flag for Field Clarification"
                              className="w-7.5 h-7.5 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <HelpCircle className="w-3.5 h-3.5 stroke-[2.2]" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setEvidenceToDelete(item)}
                            title="Reject & Purge Evidence Entry"
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

      {/* ============================================================= */}
      {/* 3. SUB-PAGE 2: MRV CONTROL (PRD A14 & §11)                     */}
      {/* ============================================================= */}
      {activeTab === 'mrv-control' && (
        <div className="space-y-6">
          {/* Sea Green Tinted KPI Summary Cards for MRV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Active Monitoring Cycles</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <FileCheck2 className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">{mrvTasks.length}</span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Project Cycles</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>
                  {mrvTasks.filter((t) => t.status === 'APPROVED').length} Approved for Crediting
                </span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  PRD A14 Gate
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Overall Completeness</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Layers className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">95.4%</span>
                <span className="text-[11px] font-bold text-[#3E5F36]">Evidence SLA</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Checklist Ingestion</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  Multi-protocol
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Open Findings &amp; CARs</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#8D4E22] flex items-center justify-center font-bold shadow-2xs">
                  <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#8D4E22]">
                  {mrvTasks.reduce((acc, t) => acc + t.findings.length, 0)}
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Action Items</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>1 High Priority CAR</span>
                <span className="badge-alert-tint px-2 py-0.5 rounded-full text-[10px]">
                  Under Audit
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Crediting Readiness</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
                  <Award className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">19,760</span>
                <span className="text-[11px] font-bold text-[#0369A1]">Estimated Units</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>ACVA 3rd-Party Sync</span>
                <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
                  CCTS Compliant
                </span>
              </div>
            </div>
          </div>

          {/* MRV Monitoring Tasks & Cycles Queue */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#8D4E22]" />
                  <span>MRV Monitoring Plans &amp; Reviewer Decisions (PRD A14 &amp; §11)</span>
                </h3>
                <p className="text-xs text-[#4A5B50] font-semibold">
                  Track monitoring cycles, evidence completeness checklists, reviewer findings, and ACVA audit readiness
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search cycle ID, project..."
                    value={mrvSearch}
                    onChange={(e) => setMrvSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs text-[#18221B] font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>

                <CustomDropdown
                  value={mrvStatusFilter}
                  onChange={(val) => setMrvStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Statuses', dotColor: '#8D4E22' },
                    { value: 'UNDER_REVIEW', label: 'Under Review', dotColor: '#F59E0B' },
                    { value: 'APPROVED', label: 'Approved for Crediting', dotColor: '#5E8256' },
                    { value: 'CAR_ISSUED', label: 'CAR Issued (Corrective Action)', dotColor: '#EF4444' },
                  ]}
                  className="w-56"
                />
              </div>
            </div>

            {/* MRV Tasks Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredMrvTasks.map((task) => {
                const isApproved = task.status === 'APPROVED'
                const isCar = task.status === 'CAR_ISSUED'

                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-2xl border space-y-4 transition-all ${
                      isApproved
                        ? 'bg-[#E6EFE4] border-[#C1D6BD]'
                        : isCar
                        ? 'bg-[#C49563]/25 border-[#8D4E22]'
                        : 'bg-white border-[#E5DFD5]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-black text-[#8D4E22] bg-[#F5E5D5] border border-[#D8B293] px-2.5 py-0.5 rounded-lg shadow-2xs">
                          {task.id}
                        </span>
                        <h4 className="text-sm font-black text-[#18221B]">{task.projectName}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge-mint-tint px-2.5 py-0.5 rounded-full text-[10px] font-black">
                          {task.monitoringPeriod}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            isApproved
                              ? 'badge-mint-tint'
                              : isCar
                              ? 'bg-[#C49563] text-[#2B1405] border border-[#8D4E22]'
                              : 'badge-warning-tint'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>

                    {/* Protocol & Metadata Matrix */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#F5E5D5] border border-[#E5DFD5] text-xs">
                      <div>
                        <span className="text-[10px] text-[#738679] font-bold uppercase block">
                          Methodology
                        </span>
                        <span className="font-black text-[#18221B]">{task.methodology}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#738679] font-bold uppercase block">
                          Lead Reviewer
                        </span>
                        <span className="font-bold text-[#18221B]">{task.leadReviewer}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#738679] font-bold uppercase block">
                          Evidence Scorecard
                        </span>
                        <span className="font-black text-[#3E5F36]">
                          {task.completenessScore}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#738679] font-bold uppercase block">
                          Verification Body
                        </span>
                        <span className="font-bold text-[#18221B]">{task.accreditedBody}</span>
                      </div>
                    </div>

                    {/* Checkpoints Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#4A5B50]">
                          Checklist Completion &amp; Completeness Score
                        </span>
                        <span className="font-mono font-bold text-[#18221B]">
                          {task.completenessScore}
                        </span>
                      </div>
                      <div className="w-full bg-[#E5DFD5] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#8D4E22] h-full rounded-full transition-all duration-300"
                          style={{
                            width: task.completenessScore,
                          }}
                        />
                      </div>
                    </div>

                    {/* Metadata Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#EAE4DC] text-xs">
                      <div>
                        <span className="text-[10px] text-[#738679] block">Lead Reviewer</span>
                        <span className="font-bold text-[#18221B]">{task.leadReviewer}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#738679] block">Due Date</span>
                        <span className="font-bold text-[#8D4E22]">{task.dueDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#738679] block">Total Area</span>
                        <span className="font-mono text-[#4A5B50]">{task.totalHectares} ha</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#738679] block">Estimated Credits</span>
                        <span className="font-bold text-[#3E5F36]">{task.estimatedCredits}</span>
                      </div>
                    </div>

                    {/* Review Checkpoints Checklist */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-[#4A5B50] block">
                        Evidence Completeness Audit:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {task.checklist.map((chk, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-[#EAE4DC] text-xs"
                          >
                            <span className="font-medium text-[#18221B] truncate">{chk.item}</span>
                            <span className="font-bold text-[#8D4E22] text-[11px] shrink-0">
                              {chk.submitted}/{chk.required} ({chk.status})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Findings & CAR Strip if any */}
                    {task.findings.length > 0 && (
                      <div className="p-3 rounded-xl bg-[#C49563]/25 border border-[#8D4E22] space-y-1.5 text-xs">
                        <span className="text-[11px] font-black text-[#2B1405] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#6E3812]" /> Active Reviewer Findings &amp;
                          CARs ({task.findings.length})
                        </span>
                        {task.findings.map((fnd) => (
                          <div
                            key={fnd.id}
                            className="p-2 rounded-lg bg-white border border-[#8D4E22] text-[11px] text-[#4A5B50]"
                          >
                            <div className="flex items-center justify-between font-bold text-[#18221B]">
                              <span>
                                {fnd.id} • {fnd.severity} Severity
                              </span>
                              <span className="text-[#8D4E22] font-mono text-[10px]">
                                {fnd.createdAt}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#4A5B50] mt-0.5">{fnd.description}</p>
                            <span className="text-[9px] font-mono text-[#738679] block mt-0.5">
                              Status: {fnd.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions Strip */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#EAE4DC]">
                      <button
                        type="button"
                        onClick={() => setSelectedMrvTask(task)}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-xs font-bold text-[#4A5B50] hover:text-[#18221B] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Checkpoints &amp; Findings</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {!isCar && (
                          <button
                            type="button"
                            onClick={() => handleIssueCAR(task.id)}
                            title="Issue Corrective Action Request (CAR)"
                            className="w-8 h-8 rounded-xl bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              `Generating official MRV Synthesis Audit Certificate for ${task.id}...`
                            )
                          }
                          title="Download MRV Synthesis Report PDF"
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
      {/* 4. SLIDE-OVER DRAWER: EVIDENCE FULL MEDIA & EXIF INSPECTOR     */}
      {/* ============================================================= */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto custom-scrollbar flex flex-col border-l border-[#D8B293]">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#EAE4DC] flex items-center justify-between bg-[#F5E5D5] sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Camera className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#18221B]">{selectedEvidence.id}</h3>
                  <p className="text-xs text-[#738679] font-medium">
                    {selectedEvidence.category} • {selectedEvidence.farmerName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvidence(null)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-5 flex-1 text-xs">
              {/* Status and Action Strip */}
              <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#738679]">Status:</span>
                  {renderEvidenceStatusBadge(selectedEvidence.status)}
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedEvidence.status !== 'VERIFIED' && (
                    <button
                      type="button"
                      onClick={() => handleVerifyEvidence(selectedEvidence.id)}
                      title="Approve Evidence"
                      className="w-9 h-9 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white cursor-pointer shadow-xs flex items-center justify-center transition-colors"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleFlagEvidence(selectedEvidence.id)}
                    title="Flag for Clarification"
                    className="w-9 h-9 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvidenceToDelete(selectedEvidence)}
                    title="Reject Entry"
                    className="w-9 h-9 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Viewfinder Preview Box with EXIF Inset */}
              <div className="h-56 rounded-2xl bg-[#18221B] relative flex flex-col justify-between p-4 overflow-hidden border border-[#4A5B50] shadow-inner text-white">
                <div className="flex items-center justify-between z-10">
                  <span className="text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded-md text-emerald-400 font-bold flex items-center gap-1">
                    <Smartphone className="w-3 h-3" /> RTK GPS LOCK: 3D FIX
                  </span>
                  <span className="text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded-md text-slate-300">
                    {selectedEvidence.fileSize}
                  </span>
                </div>

                <div className="text-center z-10 space-y-1">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-emerald-400/80 mx-auto flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-xs font-black tracking-wide">
                    {selectedEvidence.caption}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Bearing: {selectedEvidence.gps.bearing} • Altitude:{' '}
                    {selectedEvidence.gps.altitude}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono z-10 text-slate-400 border-t border-white/10 pt-1.5">
                  <span>{selectedEvidence.timestamp}</span>
                  <span>{selectedEvidence.location}</span>
                </div>
              </div>

              {/* Geofence & PostGIS ST_Contains Analysis */}
              <div className="p-4 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-3">
                <div className="flex items-center justify-between font-bold text-[#18221B]">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#8D4E22]" />
                    <span>PostGIS Geofence Verification (PRD §5 / F10)</span>
                  </div>
                  {renderGeofenceBadge(selectedEvidence.geofenceStatus)}
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Target Parcel ID
                    </span>
                    <span className="font-mono font-bold text-[#8D4E22]">
                      {selectedEvidence.parcelId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      GPS Precision
                    </span>
                    <span className="font-mono font-bold text-[#18221B]">
                      {selectedEvidence.gps.accuracy}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Latitude
                    </span>
                    <span className="font-mono text-[#18221B]">{selectedEvidence.gps.lat}° N</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Longitude
                    </span>
                    <span className="font-mono text-[#18221B]">{selectedEvidence.gps.lng}° E</span>
                  </div>
                </div>
              </div>

              {/* Cryptographic SHA-256 Hash Card */}
              <div className="p-4 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-2">
                <div className="flex items-center justify-between font-bold text-[#18221B]">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-[#0369A1]" />
                    <span>Cryptographic Audit Hash</span>
                  </div>
                  <span className="text-[10px] font-black text-[#3E5F36] bg-[#E6EFE4] px-2 py-0.5 rounded-full border border-[#C1D6BD]">
                    ✓ No Tamper Detected
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#D8B293] font-mono text-[10px] text-[#4A5B50] break-all select-all">
                  {selectedEvidence.sha256Hash}
                </div>
                <div className="text-[10px] text-[#738679]">
                  Device Fingerprint: {selectedEvidence.deviceModel}
                </div>
              </div>

              {/* Reviewer Field Notes */}
              <div className="p-4 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-1.5">
                <h4 className="font-black text-[#18221B]">Reviewer &amp; QA Audit Notes</h4>
                <p className="text-[11px] text-[#4A5B50] leading-relaxed">
                  {selectedEvidence.reviewerNotes}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-[#8D4E22]">
                  <span>Quality Score: {selectedEvidence.evidenceScore}/100</span>
                  <span>Field Visit: {selectedEvidence.visitId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 5. MODAL: MRV MONITORING CYCLE AUDIT SHEET                    */}
      {/* ============================================================= */}
      {selectedMrvTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">
                    MRV Monitoring Cycle: {selectedMrvTask.id}
                  </h4>
                  <p className="text-xs text-[#738679]">
                    {selectedMrvTask.projectName} • {selectedMrvTask.monitoringPeriod}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMrvTask(null)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5]">
                <div>
                  <span className="text-[10px] text-[#738679] font-bold uppercase block">
                    Protocol Methodology
                  </span>
                  <span className="font-black text-[#18221B]">
                    {selectedMrvTask.methodology}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#738679] font-bold uppercase block">
                    Lead Reviewer
                  </span>
                  <span className="font-bold text-[#18221B]">
                    {selectedMrvTask.leadReviewer}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#738679] font-bold uppercase block">
                    Accredited Agency
                  </span>
                  <span className="font-bold text-[#18221B]">
                    {selectedMrvTask.accreditedBody}
                  </span>
                </div>
              </div>

              {/* Checklist Breakdown */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] space-y-2">
                <h5 className="font-black text-[#18221B]">Evidence Completeness Audit Trail</h5>
                <div className="space-y-1.5">
                  {selectedMrvTask.checklist.map((chk, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-[#F5E5D5] border border-[#E5DFD5] flex items-center justify-between text-xs"
                    >
                      <span className="text-[#4A5B50]">{chk.item}</span>
                      <span className="font-bold text-[#8D4E22]">
                        {chk.submitted} / {chk.required} items ({chk.status})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Findings */}
              {selectedMrvTask.findings.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#C49563]/25 border border-[#8D4E22] space-y-2">
                  <span className="font-black text-[#2B1405]">Reviewer Findings &amp; CARs</span>
                  {selectedMrvTask.findings.map((fnd) => (
                    <div
                      key={fnd.id}
                      className="p-2 rounded-xl bg-white border border-[#8D4E22] text-[11px]"
                    >
                      <span className="font-bold text-[#18221B]">
                        {fnd.id} ({fnd.severity})
                      </span>
                      <p className="text-[#4A5B50]">{fnd.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#EAE4DC]">
              <button
                type="button"
                onClick={() =>
                  alert(`Downloading official MRV report for ${selectedMrvTask.id}...`)
                }
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#0369A1] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedMrvTask.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleApproveMrvCycle(selectedMrvTask.id)
                      setSelectedMrvTask(null)
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Approve for Crediting</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedMrvTask(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 6. MODAL: SIMULATE EVIDENCE INGESTION                          */}
      {/* ============================================================= */}
      {isSimulateUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">
                    Simulate Geotagged Field Evidence
                  </h4>
                  <p className="text-xs text-[#738679]">
                    FA10 Offline Sync &amp; PostGIS Geofence Ingestion
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSimulateUploadOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulateUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                  Farmer / Landholder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={uploadForm.farmerName}
                  onChange={(e) => setUploadForm({ ...uploadForm, farmerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Capture Type
                  </label>
                  <CustomDropdown
                    value={uploadForm.captureType}
                    onChange={(val) => setUploadForm({ ...uploadForm, captureType: val })}
                    options={[
                      { value: 'Photo', label: 'Geotagged Photo' },
                      { value: 'Video', label: 'Continuous Video' },
                      { value: 'Document', label: 'Sensor Log Telemetry' },
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Evidence Category
                  </label>
                  <CustomDropdown
                    value={uploadForm.category}
                    onChange={(val) => setUploadForm({ ...uploadForm, category: val })}
                    options={[
                      { value: 'Tree DBH & Height Caliper', label: 'Tree DBH & Height Caliper' },
                      { value: 'Soil Core Sample 0-30cm', label: 'Soil Core Sample 0-30cm' },
                      { value: 'Flow Meter Reading', label: 'Flow Meter Reading' },
                      { value: 'Sapling Tag RFID Audit', label: 'Sapling Tag RFID Audit' },
                    ]}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">Location</label>
                <input
                  type="text"
                  value={uploadForm.location}
                  onChange={(e) => setUploadForm({ ...uploadForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border-2 border-dashed border-[#C1D6BD] text-center space-y-1">
                <Camera className="w-5 h-5 text-[#8D4E22] mx-auto" />
                <span className="text-xs font-bold text-[#18221B] block">
                  Simulated Hardware EXIF Package
                </span>
                <span className="text-[10px] text-[#738679] block">
                  Samsung Galaxy M34 • RTK GNSS Lock (±1.6m) • SHA-256 Calculated
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE4DC]">
                <button
                  type="button"
                  onClick={() => setIsSimulateUploadOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Ingest Field Evidence</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 7. MODAL: CREATE MONITORING CYCLE                              */}
      {/* ============================================================= */}
      {isCreateMrvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">
                    Initialize MRV Monitoring Plan
                  </h4>
                  <p className="text-xs text-[#738679]">Quarterly Evidence Synthesis Cycle</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateMrvModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMrvSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                  Monitoring Period *
                </label>
                <input
                  type="text"
                  required
                  value={newMrvForm.monitoringPeriod}
                  onChange={(e) =>
                    setNewMrvForm({ ...newMrvForm, monitoringPeriod: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                  Methodology Protocol
                </label>
                <input
                  type="text"
                  value={newMrvForm.methodology}
                  onChange={(e) =>
                    setNewMrvForm({ ...newMrvForm, methodology: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                  Lead MRV Reviewer
                </label>
                <input
                  type="text"
                  value={newMrvForm.leadReviewer}
                  onChange={(e) =>
                    setNewMrvForm({ ...newMrvForm, leadReviewer: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE4DC]">
                <button
                  type="button"
                  onClick={() => setIsCreateMrvModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Start Monitoring Cycle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 8. MODAL: DELETE CONFIRMATION                                 */}
      {/* ============================================================= */}
      {evidenceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border-2 border-[#8D4E22] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C49563]/30 border border-[#8D4E22] text-[#2B1405] flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#18221B]">Reject &amp; Purge Evidence?</h4>
                <p className="text-xs text-[#738679]">Removes media item from MRV registry</p>
              </div>
            </div>

            <p className="text-xs text-[#4A5B50] leading-relaxed">
              Are you sure you want to purge{' '}
              <strong className="text-[#18221B]">{evidenceToDelete.id}</strong> (
              {evidenceToDelete.category}) for landowner{' '}
              <strong className="text-[#18221B]">{evidenceToDelete.farmerName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEvidenceToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#C49563]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEvidence}
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
