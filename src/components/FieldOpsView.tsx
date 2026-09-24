import { useState, useMemo, useEffect } from 'react'
import {
  Compass,
  Calendar,
  Check,
  Trash2,
  Eye,
  AlertTriangle,
  Search,
  X,
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Radio,
} from 'lucide-react'
import fieldOpsData from '../data/fieldOpsData.json'
import CustomDropdown from './CustomDropdown'

interface FieldOpsViewProps {
  initialSubTab?: string
  onNavigateSubTab?: (subTabKey: string) => void
}

type SubTabKey = 'field-visits' | 'offline-sync'

export interface VisitRecord {
  id: string
  projectId: string
  projectName: string
  farmerId: string
  farmerName: string
  farmerPhone: string
  parcelId: string
  surveyNumber: string
  location: string
  assignedAgent: string
  agentPhone: string
  scheduledDate: string
  purpose: string
  status: string
  priority: string
  requiredChecklist: number
  completedChecklist: number
  offlineCached: boolean
  notes: string
  evidenceCount: number
}

export interface SyncPacketRecord {
  id: string
  deviceId: string
  agentName: string
  deviceModel: string
  osVersion: string
  batteryLevel: string
  connectivity: string
  payloadType: string
  payloadSize: string
  pendingItems: number
  retryCount: number
  maxRetries: number
  syncStatus: string
  lastSyncAttempt: string
  errorMessage: string | null
  checksum: string
  village: string
}

export default function FieldOpsView({
  initialSubTab = 'field-visits',
  onNavigateSubTab,
}: FieldOpsViewProps) {
  const [activeTab, setActiveTab] = useState<SubTabKey>(() => {
    if (initialSubTab === 'offline-sync') return 'offline-sync'
    return 'field-visits'
  })

  // Sync tab when initialSubTab changes from parent or sidebar navigation
  useEffect(() => {
    if (initialSubTab === 'field-visits' || initialSubTab === 'offline-sync') {
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
  const [visits, setVisits] = useState<VisitRecord[]>(
    fieldOpsData.visits as VisitRecord[]
  )
  const [syncPackets, setSyncPackets] = useState<SyncPacketRecord[]>(
    fieldOpsData.syncQueue as SyncPacketRecord[]
  )

  // -------------------------------------------------------------
  // TAB 1: Field Visits Filters & State
  // -------------------------------------------------------------
  const [visitSearch, setVisitSearch] = useState('')
  const [visitStatusFilter, setVisitStatusFilter] = useState('ALL')
  const [visitPriorityFilter, setVisitPriorityFilter] = useState('ALL')
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null)
  const [visitToDelete, setVisitToDelete] = useState<VisitRecord | null>(null)
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)
  const [dispatchForm, setDispatchForm] = useState({
    farmerName: '',
    farmerPhone: '+91 98000 12345',
    surveyNumber: 'Khasra 101/2',
    location: 'Bhonrasa, Ashta (MP)',
    assignedAgent: 'Sanjay Mandloi (FA-0041)',
    purpose: 'Biomass Caliper & Soil Core Audit',
    priority: 'HIGH',
    scheduledDate: '25 Sept 2026',
  })

  // -------------------------------------------------------------
  // TAB 2: Offline Sync Filters & State
  // -------------------------------------------------------------
  const [syncSearch, setSyncSearch] = useState('')
  const [syncConnectivityFilter, setSyncConnectivityFilter] = useState('ALL')
  const [syncStatusFilter, setSyncStatusFilter] = useState('ALL')
  const [selectedSyncPacket, setSelectedSyncPacket] = useState<SyncPacketRecord | null>(null)
  const [syncToDelete, setSyncToDelete] = useState<SyncPacketRecord | null>(null)

  // -------------------------------------------------------------
  // Filtered Visits
  // -------------------------------------------------------------
  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const q = visitSearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        v.id.toLowerCase().includes(q) ||
        v.farmerName.toLowerCase().includes(q) ||
        v.assignedAgent.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.purpose.toLowerCase().includes(q) ||
        v.projectName.toLowerCase().includes(q)

      const matchesStatus =
        visitStatusFilter === 'ALL' || v.status === visitStatusFilter
      const matchesPriority =
        visitPriorityFilter === 'ALL' || v.priority === visitPriorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [visits, visitSearch, visitStatusFilter, visitPriorityFilter])

  // -------------------------------------------------------------
  // Filtered Sync Queue
  // -------------------------------------------------------------
  const filteredSyncPackets = useMemo(() => {
    return syncPackets.filter((p) => {
      const q = syncSearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.agentName.toLowerCase().includes(q) ||
        p.deviceId.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.payloadType.toLowerCase().includes(q)

      const matchesConnectivity =
        syncConnectivityFilter === 'ALL' || p.connectivity === syncConnectivityFilter
      const matchesStatus =
        syncStatusFilter === 'ALL' || p.syncStatus === syncStatusFilter

      return matchesSearch && matchesConnectivity && matchesStatus
    })
  }, [syncPackets, syncSearch, syncConnectivityFilter, syncStatusFilter])

  // -------------------------------------------------------------
  // Actions: Visits
  // -------------------------------------------------------------
  const handleCompleteVisit = (visitId: string) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? {
              ...v,
              status: 'COMPLETED',
              completedChecklist: v.requiredChecklist,
              notes: 'Marked completed and ground evidence synced.',
            }
          : v
      )
    )
    if (selectedVisit?.id === visitId) {
      setSelectedVisit((prev) =>
        prev
          ? {
              ...prev,
              status: 'COMPLETED',
              completedChecklist: prev.requiredChecklist,
            }
          : null
      )
    }
  }

  const handleDeleteVisit = () => {
    if (!visitToDelete) return
    const id = visitToDelete.id
    setVisits((prev) => prev.filter((v) => v.id !== id))
    if (selectedVisit?.id === id) setSelectedVisit(null)
    setVisitToDelete(null)
  }

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dispatchForm.farmerName) return

    const newVisit: VisitRecord = {
      id: `VISIT-2026-${Math.floor(490 + Math.random() * 90)}`,
      projectId: 'PRJ-CAR-2026-001',
      projectName: 'Indore-Dewas Agroforestry Carbon Sequestration',
      farmerId: `USR-FARM-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerName: dispatchForm.farmerName,
      farmerPhone: dispatchForm.farmerPhone,
      parcelId: `PARCEL-MP-${Math.floor(1000 + Math.random() * 9000)}`,
      surveyNumber: dispatchForm.surveyNumber,
      location: dispatchForm.location,
      assignedAgent: dispatchForm.assignedAgent,
      agentPhone: '+91 98260 11223',
      scheduledDate: dispatchForm.scheduledDate,
      purpose: dispatchForm.purpose,
      status: 'SCHEDULED',
      priority: dispatchForm.priority,
      requiredChecklist: 4,
      completedChecklist: 0,
      offlineCached: true,
      notes: 'New site visit dispatched by Super Admin. Agent notified via SMS & Push.',
      evidenceCount: 0,
    }

    setVisits((prev) => [newVisit, ...prev])
    setIsDispatchModalOpen(false)
    setDispatchForm({
      farmerName: '',
      farmerPhone: '+91 98000 12345',
      surveyNumber: 'Khasra 101/2',
      location: 'Bhonrasa, Ashta (MP)',
      assignedAgent: 'Sanjay Mandloi (FA-0041)',
      purpose: 'Biomass Caliper & Soil Core Audit',
      priority: 'HIGH',
      scheduledDate: '25 Sept 2026',
    })
  }

  // -------------------------------------------------------------
  // Actions: Sync
  // -------------------------------------------------------------
  const handleForceSyncRetry = (packetId: string) => {
    setSyncPackets((prev) =>
      prev.map((p) =>
        p.id === packetId
          ? {
              ...p,
              syncStatus: 'SYNCED',
              retryCount: p.retryCount + 1,
              errorMessage: null,
              lastSyncAttempt: 'Just Now (Manual Force)',
            }
          : p
      )
    )
    if (selectedSyncPacket?.id === packetId) {
      setSelectedSyncPacket((prev) =>
        prev
          ? {
              ...prev,
              syncStatus: 'SYNCED',
              retryCount: prev.retryCount + 1,
              errorMessage: null,
              lastSyncAttempt: 'Just Now (Manual Force)',
            }
          : null
      )
    }
  }

  const handleDeleteSyncPacket = () => {
    if (!syncToDelete) return
    const id = syncToDelete.id
    setSyncPackets((prev) => prev.filter((p) => p.id !== id))
    if (selectedSyncPacket?.id === id) setSelectedSyncPacket(null)
    setSyncToDelete(null)
  }

  // -------------------------------------------------------------
  // Status Badge Helpers
  // -------------------------------------------------------------
  const renderVisitStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase()
    if (s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5E8256] flex-shrink-0" />
          <span>Completed</span>
        </span>
      )
    }
    if (s === 'OVERDUE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#C49563] border border-[#8D4E22] text-[#2B1405]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6E3812] flex-shrink-0" />
          <span>Overdue</span>
        </span>
      )
    }
    if (s === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] flex-shrink-0 animate-ping" />
          <span>On Site</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFFBEB] border border-[#FEF3C7] text-[#B45309]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
        <span>Scheduled</span>
      </span>
    )
  }

  const renderConnectivityBadge = (conn: string) => {
    if (conn === 'ONLINE_4G') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6EFE4] text-[#3E5F36] border border-[#C1D6BD]">
          <Wifi className="w-3 h-3" /> 4G LTE
        </span>
      )
    }
    if (conn === 'WEAK_2G') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]">
          <Radio className="w-3 h-3" /> Weak 2G
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#C49563] text-[#2B1405] border border-[#8D4E22]">
        <WifiOff className="w-3 h-3" /> Offline Local
      </span>
    )
  }

  const renderSyncStatusBadge = (status: string) => {
    if (status === 'SYNCED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6EFE4] text-[#3E5F36] border border-[#C1D6BD]">
          <span>✓ Synced</span>
        </span>
      )
    }
    if (status === 'PENDING_RETRY') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]">
          <span>⏳ Queued</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#C49563] text-[#2B1405] border border-[#8D4E22]">
        <span>⚠ Timeout</span>
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
            onClick={() => handleTabChange('field-visits')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'field-visits'
                ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
                : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Site Visit Dispatch</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                activeTab === 'field-visits'
                  ? 'bg-[#6E3812] text-white border-white/20'
                  : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
            >
              {visits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('offline-sync')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'offline-sync'
                ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
                : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Offline Sync Monitor</span>
            <span className="text-[10px] bg-[#C49563] text-[#2B1405] px-2 py-0.5 rounded-full border border-[#8D4E22] font-black">
              {syncPackets.filter((p) => p.syncStatus !== 'SYNCED').length} Pending
            </span>
          </button>
        </div>

        {/* Action Button for Active Sub-page */}
        <div>
          {activeTab === 'field-visits' ? (
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Dispatch Site Visit</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSyncPackets((prev) =>
                  prev.map((p) => ({
                    ...p,
                    syncStatus: 'SYNCED',
                    errorMessage: null,
                    lastSyncAttempt: 'Just Now (Batch Push)',
                  }))
                )
                alert('Triggered remote sync push to 28 active field handhelds. All queued packets synced.')
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#8D4E22] bg-[#F5E5D5] hover:bg-[#F2DFC9] border border-[#D8B293] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Force Remote Sync All</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. SUB-PAGE 1: SITE VISIT DISPATCH (PRD A15 & FA03-FA06)      */}
      {/* ============================================================= */}
      {activeTab === 'field-visits' && (
        <div className="space-y-6">
          {/* Sea Green Tinted KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Total Field Visits</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Compass className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {fieldOpsData.summaryStats.totalVisits.count}
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Dispatched</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>{fieldOpsData.summaryStats.totalVisits.completedCount} Completed</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  FA06 Engine
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Scheduled This Week</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
                  <Calendar className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {fieldOpsData.summaryStats.totalVisits.scheduledThisWeek}
                </span>
                <span className="text-[11px] font-bold text-[#0369A1]">In Route</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>4.6 Visits / Day / Agent</span>
                <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
                  Route Optimized
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Overdue Ground Visits</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#8D4E22] flex items-center justify-center font-bold shadow-2xs">
                  <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#8D4E22]">
                  {visits.filter((v) => v.status === 'OVERDUE').length}
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">SLA Breached</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Re-assignment Required</span>
                <span className="badge-alert-tint px-2 py-0.5 rounded-full text-[10px]">
                  PRD §14 Alert
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Active Surveyors</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Smartphone className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {fieldOpsData.summaryStats.fieldEfficiency.activeSurveyors}
                </span>
                <span className="text-[11px] font-bold text-[#3E5F36]">Handheld Terminals</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>94.8% SLA Adherence</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  Live GPS Track
                </span>
              </div>
            </div>
          </div>

          {/* Visits Dispatch Table Card */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#8D4E22]" />
                  <span>Site Visit Dispatch &amp; Surveyor Coordination (PRD A15 &amp; §14)</span>
                </h3>
                <p className="text-xs text-[#4A5B50] font-semibold">
                  Manage field agent route assignments, scheduled site visits, offline package caching, and ground telemetry checklists
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search visit, farmer, agent..."
                    value={visitSearch}
                    onChange={(e) => setVisitSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs text-[#18221B] font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>

                <CustomDropdown
                  value={visitStatusFilter}
                  onChange={(val) => setVisitStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Statuses', dotColor: '#8D4E22' },
                    { value: 'SCHEDULED', label: 'Scheduled', dotColor: '#0284C7' },
                    { value: 'IN_PROGRESS', label: 'On Site', dotColor: '#F59E0B' },
                    { value: 'COMPLETED', label: 'Completed', dotColor: '#5E8256' },
                    { value: 'OVERDUE', label: 'Overdue', dotColor: '#EF4444' },
                  ]}
                  className="w-44"
                />

                <CustomDropdown
                  value={visitPriorityFilter}
                  onChange={(val) => setVisitPriorityFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Priorities', dotColor: '#8D4E22' },
                    { value: 'CRITICAL', label: 'Critical', dotColor: '#EF4444' },
                    { value: 'HIGH', label: 'High Priority', dotColor: '#F59E0B' },
                    { value: 'MEDIUM', label: 'Medium', dotColor: '#0284C7' },
                    { value: 'LOW', label: 'Low', dotColor: '#10B981' },
                  ]}
                  className="w-44"
                />
              </div>
            </div>

            {/* Visits Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Visit &amp; Landholder</th>
                    <th className="p-3.5">Parcel &amp; Location</th>
                    <th className="p-3.5">Visit Purpose &amp; Project</th>
                    <th className="p-3.5">Assigned Agent</th>
                    <th className="p-3.5">Date &amp; Checklist</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFD5]">
                  {filteredVisits.map((visit) => (
                    <tr
                      key={visit.id}
                      className="hover:bg-[#F9F6F1] transition-colors cursor-pointer"
                      onClick={() => setSelectedVisit(visit)}
                    >
                      {/* Visit & Landholder */}
                      <td className="p-3.5">
                        <div className="font-black text-[#18221B] text-sm">
                          {visit.farmerName}
                        </div>
                        <div className="text-[11px] font-mono text-[#4A5B50] font-bold flex items-center gap-1.5">
                          <span className="text-[#8D4E22]">{visit.id}</span>
                          <span>•</span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                              visit.priority === 'CRITICAL'
                                ? 'bg-[#C49563] text-[#2B1405] border border-[#8D4E22]'
                                : visit.priority === 'HIGH'
                                ? 'bg-[#FFFBEB] text-[#B45309]'
                                : 'bg-[#F1F5F9] text-[#4A5B50]'
                            }`}
                          >
                            {visit.priority}
                          </span>
                        </div>
                      </td>

                      {/* Parcel & Location */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-[#18221B]">
                          {visit.surveyNumber}
                        </div>
                        <div className="text-[10px] text-[#4A5B50]">{visit.location}</div>
                      </td>

                      {/* Purpose & Project */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{visit.purpose}</div>
                        <div className="text-[10px] text-[#8D4E22] font-bold truncate max-w-xs">
                          {visit.projectName}
                        </div>
                      </td>

                      {/* Field Agent */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{visit.assignedAgent}</div>
                        <div className="text-[10px] text-[#738679] font-mono">
                          {visit.agentPhone}
                        </div>
                      </td>

                      {/* Date & Checklist Progress */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#738679]" />
                          <span>{visit.scheduledDate}</span>
                        </div>
                        <div className="text-[10px] text-[#4A5B50] mt-0.5">
                          Checklist: {visit.completedChecklist}/{visit.requiredChecklist} done
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">{renderVisitStatusBadge(visit.status)}</td>

                      {/* Strictly Icon-Only Actions */}
                      <td className="p-3.5 text-right">
                        <div
                          className="inline-flex items-center gap-1.5 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedVisit(visit)}
                            title="Inspect Visit Dossier & Route Drawer"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {visit.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => handleCompleteVisit(visit.id)}
                              title="Mark Visit Completed & Sync Manifest"
                              className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setVisitToDelete(visit)}
                            title="Cancel / Reschedule Visit"
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
      {/* 3. SUB-PAGE 2: OFFLINE SYNC MONITOR (PRD QA10 & QA14)         */}
      {/* ============================================================= */}
      {activeTab === 'offline-sync' && (
        <div className="space-y-6">
          {/* Sea Green Tinted KPI Summary Cards for Offline Sync */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Queued Device Payloads</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Smartphone className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {syncPackets.filter((p) => p.syncStatus !== 'SYNCED').length}
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Packets Pending</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>{fieldOpsData.summaryStats.offlineSync.queuedMegabytes} Cached</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  QA10 Store
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Sync Success Rate</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {fieldOpsData.summaryStats.offlineSync.successRate}
                </span>
                <span className="text-[11px] font-bold text-[#3E5F36]">Zero Duplication</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Idempotent SHA-256</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  QA13 Safe
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Network Timeout Alerts</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#8D4E22] flex items-center justify-center font-bold shadow-2xs">
                  <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#8D4E22]">
                  {syncPackets.filter((p) => p.syncStatus === 'FAILED_TIMEOUT').length}
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Stalled Uploads</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Auto-Retry with Backoff</span>
                <span className="badge-alert-tint px-2 py-0.5 rounded-full text-[10px]">
                  QA14 Retry
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Active Handheld Fleet</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
                  <Radio className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">28</span>
                <span className="text-[11px] font-bold text-[#0369A1]">Active Devices</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Avg Battery: 84%</span>
                <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
                  Field v2.4.1
                </span>
              </div>
            </div>
          </div>

          {/* Sync Queue Table Card */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#8D4E22]" />
                  <span>Device Fleet &amp; Offline Sync Queue (PRD QA10 &amp; QA14)</span>
                </h3>
                <p className="text-xs text-[#4A5B50] font-semibold">
                  Monitor mobile offline data packages, network timeout retry logs, and cryptographic chunk integrity
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search device, agent, packet..."
                    value={syncSearch}
                    onChange={(e) => setSyncSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs text-[#18221B] font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>

                <CustomDropdown
                  value={syncConnectivityFilter}
                  onChange={(val) => setSyncConnectivityFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Connectivity', dotColor: '#8D4E22' },
                    { value: 'ONLINE_4G', label: 'Online 4G', dotColor: '#5E8256' },
                    { value: 'WEAK_2G', label: 'Weak 2G', dotColor: '#F59E0B' },
                    { value: 'OFFLINE_LOCAL', label: 'Offline Local', dotColor: '#64748B' },
                  ]}
                  className="w-48"
                />

                <CustomDropdown
                  value={syncStatusFilter}
                  onChange={(val) => setSyncStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Sync Status', dotColor: '#8D4E22' },
                    { value: 'SYNCED', label: 'Synced', dotColor: '#5E8256' },
                    { value: 'PENDING_RETRY', label: 'Pending Retry', dotColor: '#F59E0B' },
                    { value: 'FAILED_TIMEOUT', label: 'Timeout Failed', dotColor: '#EF4444' },
                  ]}
                  className="w-48"
                />
              </div>
            </div>

            {/* Sync Queue Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Packet ID &amp; Device</th>
                    <th className="p-3.5">Surveyor &amp; Village</th>
                    <th className="p-3.5">Connectivity &amp; Battery</th>
                    <th className="p-3.5">Payload &amp; Size</th>
                    <th className="p-3.5">Retry &amp; SLA</th>
                    <th className="p-3.5">Sync Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFD5]">
                  {filteredSyncPackets.map((pkt) => (
                    <tr
                      key={pkt.id}
                      className="hover:bg-[#F9F6F1] transition-colors cursor-pointer"
                      onClick={() => setSelectedSyncPacket(pkt)}
                    >
                      {/* Packet & Device */}
                      <td className="p-3.5">
                        <div className="font-black text-[#18221B] text-sm">{pkt.id}</div>
                        <div className="text-[10px] text-[#738679] font-mono">
                          {pkt.deviceModel} ({pkt.deviceId})
                        </div>
                      </td>

                      {/* Surveyor & Village */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{pkt.agentName}</div>
                        <div className="text-[10px] text-[#4A5B50]">{pkt.village}</div>
                      </td>

                      {/* Connectivity & Battery */}
                      <td className="p-3.5">
                        <div>{renderConnectivityBadge(pkt.connectivity)}</div>
                        <div className="text-[10px] text-[#4A5B50] font-mono mt-0.5">
                          Battery: {pkt.batteryLevel}
                        </div>
                      </td>

                      {/* Payload & Size */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{pkt.payloadType}</div>
                        <div className="text-[10px] text-[#738679]">
                          {pkt.payloadSize} ({pkt.pendingItems} items)
                        </div>
                      </td>

                      {/* Retry & SLA */}
                      <td className="p-3.5">
                        <div className="font-mono text-xs font-bold text-[#18221B]">
                          {pkt.retryCount}/{pkt.maxRetries} Retries
                        </div>
                        <div className="text-[10px] text-[#738679]">{pkt.lastSyncAttempt}</div>
                      </td>

                      {/* Sync Status */}
                      <td className="p-3.5">{renderSyncStatusBadge(pkt.syncStatus)}</td>

                      {/* Strictly Icon-Only Actions */}
                      <td className="p-3.5 text-right">
                        <div
                          className="inline-flex items-center gap-1.5 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedSyncPacket(pkt)}
                            title="Inspect Packet Checksum & Transmission Log"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {pkt.syncStatus !== 'SYNCED' && (
                            <button
                              type="button"
                              onClick={() => handleForceSyncRetry(pkt.id)}
                              title="Force Remote Retry Transmission"
                              className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSyncToDelete(pkt)}
                            title="Purge / Remove Packet"
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
      {/* 4. SLIDE-OVER DRAWER: VISIT DOSSIER & ROUTE                   */}
      {/* ============================================================= */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto custom-scrollbar flex flex-col border-l border-[#D8B293]">
            {/* Header */}
            <div className="p-5 border-b border-[#EAE4DC] flex items-center justify-between bg-[#F5E5D5] sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Compass className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#18221B]">{selectedVisit.id}</h3>
                  <p className="text-xs text-[#738679] font-medium">
                    {selectedVisit.surveyNumber} • {selectedVisit.location}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 flex-1 text-xs">
              {/* Status and Action Strip */}
              <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#738679]">Status:</span>
                  {renderVisitStatusBadge(selectedVisit.status)}
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedVisit.status !== 'COMPLETED' && (
                    <button
                      type="button"
                      onClick={() => handleCompleteVisit(selectedVisit.id)}
                      title="Mark Completed"
                      className="w-9 h-9 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white cursor-pointer shadow-xs flex items-center justify-center transition-colors"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setVisitToDelete(selectedVisit)}
                    title="Cancel Visit"
                    className="w-9 h-9 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Visit Details */}
              <div className="p-4 rounded-2xl bg-[#C49563]/25 border border-[#8D4E22] space-y-3">
                <h4 className="font-black text-[#18221B]">Site Visit Parameters (PRD A15)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Landholder
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedVisit.farmerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Phone Number
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedVisit.farmerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Assigned Agent
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedVisit.assignedAgent}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Scheduled Date
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedVisit.scheduledDate}</span>
                  </div>
                </div>
              </div>

              {/* Purpose & Project */}
              <div className="p-4 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-2">
                <h4 className="font-black text-[#18221B]">Visit Purpose &amp; Field Scope</h4>
                <div className="font-bold text-[#8D4E22]">{selectedVisit.purpose}</div>
                <p className="text-[11px] text-[#4A5B50] leading-relaxed">
                  {selectedVisit.notes}
                </p>
                <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between text-[11px]">
                  <span>Project: {selectedVisit.projectName}</span>
                  <span className="font-bold text-[#3E5F36]">
                    Offline Package:{' '}
                    {selectedVisit.offlineCached ? '✓ Cached Locally' : '⚠ Remote Only'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 5. MODAL: SYNC PACKET INSPECTOR                               */}
      {/* ============================================================= */}
      {selectedSyncPacket && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">
                    Offline Packet: {selectedSyncPacket.id}
                  </h4>
                  <p className="text-xs text-[#738679]">
                    {selectedSyncPacket.deviceModel} • {selectedSyncPacket.agentName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSyncPacket(null)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Packet Specs */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5]">
              <div>
                <span className="text-[10px] text-[#738679] font-bold uppercase block">
                  Payload Type
                </span>
                <span className="font-bold text-[#18221B]">
                  {selectedSyncPacket.payloadType}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#738679] font-bold uppercase block">
                  Payload Size
                </span>
                <span className="font-bold text-[#18221B]">
                  {selectedSyncPacket.payloadSize} ({selectedSyncPacket.pendingItems} items)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#738679] font-bold uppercase block">
                  Device Hardware ID
                </span>
                <span className="font-mono text-[#18221B]">{selectedSyncPacket.deviceId}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#738679] font-bold uppercase block">
                  Retry Status
                </span>
                <span className="font-bold text-[#B45309]">
                  {selectedSyncPacket.retryCount} of {selectedSyncPacket.maxRetries} Retries
                </span>
              </div>
            </div>

            {/* Error trace if any */}
            {selectedSyncPacket.errorMessage && (
              <div className="p-3 rounded-2xl bg-[#C49563] border border-[#8D4E22] space-y-1">
                <span className="text-[11px] font-black text-[#2B1405] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#6E3812]" /> Transmission Exception Trace
                </span>
                <p className="text-[11px] text-[#2B1405] font-semibold leading-relaxed">
                  {selectedSyncPacket.errorMessage}
                </p>
              </div>
            )}

            {/* Checksum */}
            <div className="p-3 rounded-2xl bg-[#C49563]/25 border border-[#8D4E22] space-y-1">
              <span className="text-[10px] font-bold text-[#738679] uppercase block">
                SHA-256 Checksum
              </span>
              <div className="p-2 rounded-xl bg-white border border-[#D8B293] font-mono text-[10px] text-[#4A5B50] break-all">
                {selectedSyncPacket.checksum}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EAE4DC]">
              <span className="text-xs text-[#738679]">
                Last Sync Attempt: <strong>{selectedSyncPacket.lastSyncAttempt}</strong>
              </span>

              <div className="flex items-center gap-2">
                {selectedSyncPacket.syncStatus !== 'SYNCED' && (
                  <button
                    type="button"
                    onClick={() => handleForceSyncRetry(selectedSyncPacket.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Force Remote Retry</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedSyncPacket(null)}
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
      {/* 6. MODAL: DISPATCH NEW SITE VISIT                             */}
      {/* ============================================================= */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">Dispatch Site Visit</h4>
                  <p className="text-xs text-[#738679]">Assign Field Agent &amp; Mission Scope</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Landholder Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Patel"
                    value={dispatchForm.farmerName}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, farmerName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.farmerPhone}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, farmerPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Khasra / Survey #
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.surveyNumber}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, surveyNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">Location</label>
                  <input
                    type="text"
                    value={dispatchForm.location}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, location: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Assigned Field Agent
                  </label>
                  <CustomDropdown
                    value={dispatchForm.assignedAgent}
                    onChange={(val) => setDispatchForm({ ...dispatchForm, assignedAgent: val })}
                    options={[
                      { value: 'Sanjay Mandloi (FA-0041)', label: 'Sanjay Mandloi (FA-0041)' },
                      { value: 'Pankaj Tiwari (FA-0062)', label: 'Pankaj Tiwari (FA-0062)' },
                      { value: 'Vilasrao Deshmukh (FA-0019)', label: 'Vilasrao Deshmukh (FA-0019)' },
                      { value: 'B. Ramanjaneyulu (FA-0084)', label: 'B. Ramanjaneyulu (FA-0084)' },
                      { value: 'Harpreet Singh (FA-0072)', label: 'Harpreet Singh (FA-0072)' },
                      { value: 'Kishore Bishnoi (FA-0091)', label: 'Kishore Bishnoi (FA-0091)' },
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.scheduledDate}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, scheduledDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                  Visit Purpose &amp; Checklist Scope
                </label>
                <input
                  type="text"
                  value={dispatchForm.purpose}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, purpose: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE4DC]">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Dispatch &amp; Sync Route</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 7. MODAL: DELETE CONFIRMATIONS                                */}
      {/* ============================================================= */}
      {visitToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border-2 border-[#B88258] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C49563] border border-[#8D4E22] text-[#2B1405] flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#18221B]">Cancel Field Visit?</h4>
                <p className="text-xs text-[#738679]">Purges scheduled dispatch from agent queue</p>
              </div>
            </div>

            <p className="text-[#4A5B50] leading-relaxed">
              Are you sure you want to cancel visit{' '}
              <strong className="text-[#18221B]">{visitToDelete.id}</strong> for landowner{' '}
              <strong className="text-[#18221B]">{visitToDelete.farmerName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVisitToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#C49563] hover:text-[#2B1405] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVisit}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Cancel Visit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {syncToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border-2 border-[#B88258] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C49563] border border-[#8D4E22] text-[#2B1405] flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#18221B]">Purge Sync Packet?</h4>
                <p className="text-xs text-[#738679]">Removes packet from offline device queue</p>
              </div>
            </div>

            <p className="text-[#4A5B50] leading-relaxed">
              Are you sure you want to purge sync packet{' '}
              <strong className="text-[#18221B]">{syncToDelete.id}</strong> (
              {syncToDelete.payloadType}) from device{' '}
              <strong className="text-[#18221B]">{syncToDelete.deviceId}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSyncToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#C49563] hover:text-[#2B1405] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSyncPacket}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Packet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
