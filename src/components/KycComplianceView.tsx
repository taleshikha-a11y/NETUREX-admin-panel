import { useState, useMemo } from 'react'
import {
  FileBadge,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Search,
  Eye,
  Check,
  XCircle,
  Trash2,
  Ban,
  RotateCcw,
  ShieldCheck,
  X,
  Send,
  FileCheck2,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Download,
  QrCode,
} from 'lucide-react'
import kycInitialData from '../data/kycData.json'
import type { UserRecord } from './UserManagementView'
import CustomDropdown from './CustomDropdown'

export interface KycRecord {
  id: string
  userId: string
  userName: string
  userPhone: string
  userRole: string
  roleCode: string
  organization: string
  location: string
  submittedAt: string
  status: string
  documentType: string
  documentNumber: string
  frontUpload: string | null
  backUpload: string | null
  dpdpConsent: {
    consented: boolean
    version: string
    timestamp: string
    jurisdiction: string
    purpose: string
  }
  ocrVerification: {
    confidence: string
    nameMatch: string
    addressVerified: boolean
    tamperingRisk: string
  }
  clarificationQuestion?: string | null
  rejectionReason?: string | null
  adminDecisionNote?: string | null
  auditTrail: {
    timestamp: string
    action: string
    performedBy: string
    note: string
  }[]
}

interface KycComplianceViewProps {
  initialSubTab?: string
  onNavigateSubTab?: (subTabKey: string) => void
  onUpdateUsers?: React.Dispatch<React.SetStateAction<UserRecord[]>>
}

// Minimal, executive status badge with soft dot indicator
function renderMinimalKycStatusBadge(status: string) {
  const norm = (status || '').toUpperCase()
  if (norm === 'APPROVED' || norm === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#5E8256] flex-shrink-0" />
        <span>Approved</span>
      </span>
    )
  }
  if (norm === 'SUBMITTED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0F9FF] border border-[#E0F2FE] text-[#0284C7]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] flex-shrink-0" />
        <span>Submitted</span>
      </span>
    )
  }
  if (norm === 'CLARIFICATION') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFFBEB] border border-[#FEF3C7] text-[#B45309]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
        <span>Clarification</span>
      </span>
    )
  }
  if (norm === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#C49563] border border-[#8D4E22] text-[#2B1405]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#6E3812] flex-shrink-0" />
        <span>Rejected</span>
      </span>
    )
  }
  if (norm === 'SUSPENDED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#738679]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#99ABA0] flex-shrink-0" />
        <span>Suspended</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#C49563] border border-[#8D4E22] text-[#2B1405]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#8D4E22] flex-shrink-0" />
      <span>{status}</span>
    </span>
  )
}

export default function KycComplianceView({
  initialSubTab = 'kyc-queue',
  onNavigateSubTab,
  onUpdateUsers,
}: KycComplianceViewProps) {
  // Navigation tabs matching navigation.json
  const [activeTab, setActiveTab] = useState<'kyc-queue' | 'kyc-action' | 'kyc-approved'>(() => {
    if (initialSubTab === 'kyc-action' || initialSubTab === 'kyc-approved') {
      return initialSubTab
    }
    return 'kyc-queue'
  })

  // Synchronize when initialSubTab changes from parent
  const handleTabChange = (tab: 'kyc-queue' | 'kyc-action' | 'kyc-approved') => {
    setActiveTab(tab)
    if (onNavigateSubTab) {
      onNavigateSubTab(tab)
    }
  }

  // Master State for KYC records
  const [records, setRecords] = useState<KycRecord[]>(kycInitialData.records as KycRecord[])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [docFilter, setDocFilter] = useState('ALL')

  // Inspection Drawer State
  const [selectedRecord, setSelectedRecord] = useState<KycRecord | null>(null)

  // Document Inspection State
  const [inspectingDoc, setInspectingDoc] = useState<{
    record: KycRecord
    side: 'front' | 'back'
    fileName: string
  } | null>(null)
  const [verifiedDocKeys, setVerifiedDocKeys] = useState<Record<string, boolean>>({})
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const isDocVerified = (recId: string, side: 'front' | 'back', defaultVerified: boolean) => {
    const key = `${recId}_${side}`
    if (typeof verifiedDocKeys[key] === 'boolean') {
      return verifiedDocKeys[key]
    }
    return defaultVerified
  }

  const toggleDocVerified = (recId: string, side: 'front' | 'back', currentVal: boolean) => {
    const key = `${recId}_${side}`
    const newVal = !currentVal
    setVerifiedDocKeys((prev) => ({
      ...prev,
      [key]: newVal,
    }))

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16)
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === recId) {
          const updated: KycRecord = {
            ...r,
            auditTrail: [
              ...r.auditTrail,
              {
                timestamp: nowStr,
                action: newVal ? 'DOC_VERIFIED' : 'DOC_VERIFICATION_REVOKED',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: `${side.toUpperCase()} document (${side === 'front' ? r.frontUpload : r.backUpload}) marked ${
                  newVal ? 'VERIFIED' : 'PENDING'
                } after visual artifact inspection.`,
              },
            ],
          }
          if (selectedRecord?.id === recId) setSelectedRecord(updated)
          return updated
        }
        return r
      })
    )
  }

  // Modals for Clarify / Reject
  const [modalAction, setModalAction] = useState<'clarify' | 'reject' | null>(null)
  const [modalTargetId, setModalTargetId] = useState<string | null>(null)
  const [modalText, setModalText] = useState('')

  // Delete Record Confirmation
  const [recordToDelete, setRecordToDelete] = useState<KycRecord | null>(null)

  // Summary Metrics
  const summary = useMemo(() => {
    const total = records.length
    const pending = records.filter((r) => r.status === 'SUBMITTED').length
    const actionReq = records.filter((r) => r.status === 'CLARIFICATION' || r.status === 'REJECTED').length
    const approved = records.filter((r) => r.status === 'APPROVED').length
    const dpdpCount = records.filter((r) => r.dpdpConsent?.consented).length
    return { total, pending, actionReq, approved, dpdpCount }
  }, [records])

  // Filtered Records based on Tab & Search
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Tab filter
      if (activeTab === 'kyc-queue' && rec.status !== 'SUBMITTED') return false
      if (activeTab === 'kyc-action' && rec.status !== 'CLARIFICATION' && rec.status !== 'REJECTED') return false
      if (activeTab === 'kyc-approved' && rec.status !== 'APPROVED') return false

      // Search Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matches =
          rec.userName.toLowerCase().includes(q) ||
          rec.userId.toLowerCase().includes(q) ||
          rec.id.toLowerCase().includes(q) ||
          rec.userPhone.includes(q) ||
          rec.documentNumber.toLowerCase().includes(q) ||
          rec.location.toLowerCase().includes(q)
        if (!matches) return false
      }

      // Role Filter
      if (roleFilter !== 'ALL' && rec.roleCode !== roleFilter) return false

      // Document Filter
      if (docFilter !== 'ALL' && !rec.documentType.toLowerCase().includes(docFilter.toLowerCase())) return false

      return true
    })
  }, [records, activeTab, searchTerm, roleFilter, docFilter])

  // Gate Decision Handlers (Approve, Clarify, Reject, Suspend, Delete)
  const handleApprove = (recId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16)
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === recId) {
          const updated: KycRecord = {
            ...r,
            status: 'APPROVED',
            adminDecisionNote: 'Approved under PRD §2 Universal Gate. Downstream access unlocked.',
            clarificationQuestion: null,
            rejectionReason: null,
            auditTrail: [
              ...r.auditTrail,
              {
                timestamp: nowStr,
                action: 'KYC_APPROVED',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: 'Identity verified. Payout profile & Land registration eligibility granted.',
              },
            ],
          }
          if (selectedRecord?.id === recId) setSelectedRecord(updated)
          return updated
        }
        return r
      })
    )

    // Sync with Master Users List if parent prop provided
    if (onUpdateUsers) {
      const target = records.find((r) => r.id === recId)
      if (target) {
        onUpdateUsers((prevUsers) =>
          prevUsers.map((u) => {
            if (u.id === target.userId) {
              return {
                ...u,
                universalStatus: 'APPROVED',
                kyc: {
                  ...u.kyc,
                  status: 'APPROVED',
                  adminDecisionNote: 'KYC Approved under Universal Approval Gate.',
                },
              }
            }
            return u
          })
        )
      }
    }
  }

  const handleSuspend = (recId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16)
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === recId) {
          const isSusp = r.status === 'SUSPENDED'
          const newStatus = isSusp ? 'APPROVED' : 'SUSPENDED'
          const updated: KycRecord = {
            ...r,
            status: newStatus,
            auditTrail: [
              ...r.auditTrail,
              {
                timestamp: nowStr,
                action: isSusp ? 'RESTORE_ACCESS' : 'SUSPEND_ACCESS',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: isSusp
                  ? 'Access restored under Super Admin governance decision.'
                  : 'Account suspended under PRD §2 Universal Approval Gate.',
              },
            ],
          }
          if (selectedRecord?.id === recId) setSelectedRecord(updated)
          return updated
        }
        return r
      })
    )
  }

  const handleConfirmModalAction = () => {
    if (!modalTargetId || !modalText.trim()) return
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16)

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === modalTargetId) {
          const isReject = modalAction === 'reject'
          const newStatus = isReject ? 'REJECTED' : 'CLARIFICATION'
          const updated: KycRecord = {
            ...r,
            status: newStatus,
            clarificationQuestion: isReject ? null : modalText.trim(),
            rejectionReason: isReject ? modalText.trim() : null,
            adminDecisionNote: isReject
              ? `Rejected: ${modalText.trim()}`
              : `Clarification requested: ${modalText.trim()}`,
            auditTrail: [
              ...r.auditTrail,
              {
                timestamp: nowStr,
                action: isReject ? 'KYC_REJECTED' : 'KYC_CLARIFICATION_REQUESTED',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: modalText.trim(),
              },
            ],
          }
          if (selectedRecord?.id === modalTargetId) setSelectedRecord(updated)
          return updated
        }
        return r
      })
    )

    // Sync with Master Users List if parent prop provided
    if (onUpdateUsers) {
      const target = records.find((r) => r.id === modalTargetId)
      if (target) {
        onUpdateUsers((prevUsers) =>
          prevUsers.map((u) => {
            if (u.id === target.userId) {
              const isReject = modalAction === 'reject'
              return {
                ...u,
                universalStatus: isReject ? 'REJECTED' : 'CLARIFICATION',
                kyc: {
                  ...u.kyc,
                  status: isReject ? 'REJECTED' : 'CLARIFICATION',
                  clarificationQuestion: isReject ? null : modalText.trim(),
                  rejectionReason: isReject ? modalText.trim() : null,
                },
              }
            }
            return u
          })
        )
      }
    }

    setModalAction(null)
    setModalTargetId(null)
    setModalText('')
  }

  const handleDelete = () => {
    if (!recordToDelete) return
    const delId = recordToDelete.id
    setRecords((prev) => prev.filter((r) => r.id !== delId))
    if (selectedRecord?.id === delId) setSelectedRecord(null)
    setRecordToDelete(null)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Metric Strip (PRD §15 Module A05 & §2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Queue */}
        <div
          onClick={() => handleTabChange('kyc-queue')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'kyc-queue' ? 'ring-2 ring-[#8D4E22] border-[#8D4E22]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B50]">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
              <Clock className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#18221B]">{summary.pending}</span>
            <span className="text-[11px] font-bold text-[#0369A1]">Awaiting Gate Decision</span>
          </div>
          <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
            <span>PRD §2 Gate Queue</span>
            <span className="text-[10px] font-semibold text-[#0369A1] bg-[#F0F9FF] border border-[#E0F2FE] px-2 py-0.5 rounded-full">
              Avg 4.2h
            </span>
          </div>
        </div>

        {/* Metric 2: Action Required / Clarifications */}
        <div
          onClick={() => handleTabChange('kyc-action')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'kyc-action' ? 'ring-2 ring-[#8D4E22] border-[#8D4E22]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B50]">Action Required</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#B45309] flex items-center justify-center font-bold shadow-2xs">
              <HelpCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#18221B]">{summary.actionReq}</span>
            <span className="text-[11px] font-bold text-[#B45309]">Clarify / Rejected</span>
          </div>
          <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
            <span>Edit &amp; Resubmit Flow</span>
            <span className="text-[10px] font-semibold text-[#B45309] bg-[#FFFBEB] border border-[#FEF3C7] px-2 py-0.5 rounded-full">
              User Resolving
            </span>
          </div>
        </div>

        {/* Metric 3: Approved Records */}
        <div
          onClick={() => handleTabChange('kyc-approved')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'kyc-approved' ? 'ring-2 ring-[#8D4E22] border-[#8D4E22]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B50]">Approved &amp; Unlocked</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#18221B]">{summary.approved}</span>
            <span className="text-[11px] font-bold text-[#3E5F36]">Gate Passed</span>
          </div>
          <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
            <span>Payout &amp; Land Unlocked</span>
            <span className="text-[10px] font-semibold text-[#3E5F36] bg-[#E6EFE4] border border-[#C1D6BD] px-2 py-0.5 rounded-full">
              F08 / F10 Open
            </span>
          </div>
        </div>

        {/* Metric 4: DPDP 2025 Compliance */}
        <div className="harmony-kpi-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B50]">DPDP 2025 Consent</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#18221B]">100%</span>
            <span className="text-[11px] font-bold text-[#8D4E22]">Legally Consented</span>
          </div>
          <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
            <span>Digital Vault Record</span>
            <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
              DPDP Gate Passed
            </span>
          </div>
        </div>
      </div>

      {/* 2. Submodule Navigation Bar */}
      <div className="bg-white border border-[#D19E77] rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => handleTabChange('kyc-queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'kyc-queue'
              ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Verification</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
              activeTab === 'kyc-queue'
                ? 'bg-[#6E3812] text-white border-white/20'
                : 'bg-white/80 text-[#4A5B50] border-black/10'
            }`}
          >
            {summary.pending}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('kyc-action')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'kyc-action'
              ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Action Required (Clarify / Reject)</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
              activeTab === 'kyc-action'
                ? 'bg-[#6E3812] text-white border-white/20'
                : 'bg-white/80 text-[#4A5B50] border-black/10'
            }`}
          >
            {summary.actionReq}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('kyc-approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'kyc-approved'
              ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approved Records</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
              activeTab === 'kyc-approved'
                ? 'bg-[#6E3812] text-white border-white/20'
                : 'bg-white/80 text-[#4A5B50] border-black/10'
            }`}
          >
            {summary.approved}
          </span>
        </button>
      </div>

      {/* 3. Main Data Container & Filter Bar */}
      <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-[#18221B] tracking-tight flex items-center gap-2">
              <FileBadge className="w-5 h-5 text-[#8D4E22]" />
              <span>
                {activeTab === 'kyc-queue' && 'Pending Verification Queue (PRD §15 Module A05)'}
                {activeTab === 'kyc-action' && 'Action Required Queue (PRD §2 Clarify & Rejection)'}
                {activeTab === 'kyc-approved' && 'Approved & Compliant Records (PRD Gate Passed)'}
              </span>
            </h3>
            <p className="text-xs text-[#4A5B50] font-semibold">
              Universal Approval Gate screening for India DPDP Act 2025 consent, Aadhaar/PAN validation, and downstream stage unlocking
            </p>
          </div>

          {/* Filters: Search, Role Filter, Document Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="bg-[#F5E5D5] border border-[#D8B293] rounded-xl px-3 py-1.5 flex items-center gap-2 w-56">
              <Search className="w-3.5 h-3.5 text-[#738679]" />
              <input
                type="text"
                placeholder="Search user, mobile, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-[#18221B] font-medium w-full placeholder:text-[#738679]"
              />
            </div>

            {/* Role Filter */}
            <CustomDropdown
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
              options={[
                { value: 'ALL', label: 'All Roles', dotColor: '#8D4E22' },
                { value: 'FARMER', label: 'Farmers', dotColor: '#5E8256' },
                { value: 'ORG_ADMIN', label: 'Organization Admins', dotColor: '#0284C7' },
                { value: 'FIELD_AGENT', label: 'Field Agents', dotColor: '#D97706' },
              ]}
              className="w-44"
            />

            {/* Document Type Filter */}
            <CustomDropdown
              value={docFilter}
              onChange={(val) => setDocFilter(val)}
              options={[
                { value: 'ALL', label: 'All Documents', dotColor: '#8D4E22' },
                { value: 'Aadhaar', label: 'Aadhaar Card', dotColor: '#5E8256' },
                { value: 'PAN', label: 'PAN Card', dotColor: '#0284C7' },
                { value: 'Kisan', label: 'Kisan Credit Card', dotColor: '#D97706' },
                { value: 'FPO', label: 'FPO Certificate', dotColor: '#8B5CF6' },
                { value: 'Driving', label: 'Driving License', dotColor: '#64748B' },
              ]}
              className="w-48"
            />
          </div>
        </div>

        {/* Master KYC Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#8D4E22]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#C49563] text-[#2B1405] font-black border-b border-[#8D4E22] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">User &amp; Organization</th>
                <th className="p-3.5">Document Details</th>
                <th className="p-3.5">DPDP 2025 Consent</th>
                <th className="p-3.5">OCR Confidence</th>
                <th className="p-3.5">Universal Gate Status</th>
                <th className="p-3.5 text-right">Gate Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFD5]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#738679]">
                    No KYC submissions found in this queue.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-[#C49563]/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(rec)}
                  >
                    {/* User & Organization */}
                    <td className="p-3.5">
                      <div className="font-black text-[#18221B] text-sm flex items-center gap-2">
                        <span>{rec.userName}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#4A5B50] font-bold">
                        {rec.userId} • {rec.userPhone}
                      </div>
                      <div className="text-[10px] text-[#8D4E22] font-semibold mt-0.5">
                        {rec.organization}
                      </div>
                    </td>

                    {/* Document Details */}
                    <td className="p-3.5">
                      <div className="font-bold text-[#18221B]">{rec.documentType}</div>
                      <div className="text-[11px] font-mono text-[#4A5B50] font-bold">
                        {rec.documentNumber}
                      </div>
                      <div className="text-[10px] text-[#738679] mb-1.5">{rec.location}</div>
                      <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        {rec.frontUpload && (
                          <button
                            type="button"
                            onClick={() => {
                              setZoomLevel(100)
                              setInspectingDoc({
                                record: rec,
                                side: 'front',
                                fileName: rec.frontUpload!,
                              })
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] text-[#2B1405] transition-colors cursor-pointer"
                            title={`Inspect ${rec.frontUpload}`}
                          >
                            <Eye className="w-2.5 h-2.5" />
                            <span>Front</span>
                          </button>
                        )}
                        {rec.backUpload && (
                          <button
                            type="button"
                            onClick={() => {
                              setZoomLevel(100)
                              setInspectingDoc({
                                record: rec,
                                side: 'back',
                                fileName: rec.backUpload!,
                              })
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] text-[#2B1405] transition-colors cursor-pointer"
                            title={`Inspect ${rec.backUpload}`}
                          >
                            <Eye className="w-2.5 h-2.5" />
                            <span>Back</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* DPDP 2025 Consent */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2B1405] bg-[#C49563] border border-[#8D4E22] px-2.5 py-1 rounded-full">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            rec.dpdpConsent.consented ? 'bg-[#5E8256]' : 'bg-[#F59E0B]'
                          }`}
                        />
                        <span>{rec.dpdpConsent.consented ? 'DPDP Consented' : 'Pending Consent'}</span>
                      </span>
                      <span className="block text-[10px] text-[#738679] mt-0.5">
                        {rec.dpdpConsent.version}
                      </span>
                    </td>

                    {/* OCR Automated Screening */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#18221B] text-xs">
                          {rec.ocrVerification.confidence}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                            rec.ocrVerification.tamperingRisk === 'LOW'
                              ? 'bg-[#E6EFE4] text-[#3E5F36] border border-[#C1D6BD]'
                              : rec.ocrVerification.tamperingRisk === 'MEDIUM'
                              ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]'
                              : 'bg-[#C49563] text-[#2B1405] border border-[#8D4E22]'
                          }`}
                        >
                          {rec.ocrVerification.tamperingRisk} Risk
                        </span>
                      </div>
                      <div className="text-[10px] text-[#4A5B50] truncate max-w-xs mt-0.5">
                        {rec.ocrVerification.nameMatch}
                      </div>
                    </td>

                    {/* Universal Gate Status */}
                    <td className="p-3.5">
                      {renderMinimalKycStatusBadge(rec.status)}
                    </td>

                    {/* Gate Actions (Icon buttons with tooltips as requested) */}
                    <td className="p-3.5 text-right">
                      <div
                        className="inline-flex items-center gap-1.5 justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* 1. Inspect Document Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(rec)}
                          title="Inspect Document & Full KYC Drawer"
                          className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>

                        {/* 2. Approve KYC Button */}
                        {rec.status !== 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(rec.id)}
                            title="Approve KYC (Unlock Downstream Stages)"
                            className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}

                        {/* 3. Reject / Clarify Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setModalAction('reject')
                            setModalTargetId(rec.id)
                            setModalText(rec.rejectionReason || rec.clarificationQuestion || '')
                          }}
                          title="Reject / Clarification"
                          className="w-7.5 h-7.5 rounded-xl bg-[#C49563] hover:bg-[#8D4E22] hover:text-white border border-[#8D4E22] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>

                        {/* 5. Suspend / Restore Button */}
                        <button
                          type="button"
                          onClick={() => handleSuspend(rec.id)}
                          title={rec.status === 'SUSPENDED' ? 'Restore Access' : 'Suspend Account'}
                          className={`w-7.5 h-7.5 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${
                            rec.status === 'SUSPENDED'
                              ? 'bg-[#E6EFE4] hover:bg-[#C1D6BD] border-[#BED2BB] text-[#3E5F36]'
                              : 'bg-[#B6814C] hover:bg-[#8D4E22] hover:text-white border border-[#8D4E22] text-[#2B1405]'
                          }`}
                        >
                          {rec.status === 'SUSPENDED' ? (
                            <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                          ) : (
                            <Ban className="w-3.5 h-3.5 stroke-[2.2]" />
                          )}
                        </button>

                        {/* 6. Delete Button */}
                        <button
                          type="button"
                          onClick={() => setRecordToDelete(rec)}
                          title="Delete KYC Record"
                          className="w-7.5 h-7.5 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Slide-over Inspection Drawer for Deep Document Review */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col justify-between border-l border-[#D19E77]">
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E8E0D5] bg-[#F5E5D5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <FileBadge className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-black text-[#18221B] text-lg">
                    {selectedRecord.userName}
                  </h3>
                  <p className="text-xs font-mono text-[#4A5B50] font-bold">
                    {selectedRecord.id} • {selectedRecord.userId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-xl bg-[#F5EFEB] hover:bg-[#EAE0D3] flex items-center justify-center text-[#4A5B50] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* Gate Status & Quick Actions */}
              <div className="p-4 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#738679]">Universal Approval Gate:</span>
                  {renderMinimalKycStatusBadge(selectedRecord.status)}
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {selectedRecord.status !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedRecord.id)}
                      title="Approve KYC Gate (Universal Approval)"
                      className="w-9 h-9 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white cursor-pointer shadow-xs transition-colors flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setModalAction('reject')
                      setModalTargetId(selectedRecord.id)
                      setModalText(selectedRecord.rejectionReason || selectedRecord.clarificationQuestion || '')
                    }}
                    title="Reject / Clarification"
                    className="w-9 h-9 rounded-xl bg-[#C49563] hover:bg-[#8D4E22] hover:text-white border border-[#8D4E22] text-[#2B1405] cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSuspend(selectedRecord.id)}
                    title={selectedRecord.status === 'SUSPENDED' ? 'Restore User Access' : 'Suspend User Account'}
                    className={`w-9 h-9 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${
                      selectedRecord.status === 'SUSPENDED'
                        ? 'bg-[#E6EFE4] hover:bg-[#C1D6BD] border-[#BED2BB] text-[#3E5F36]'
                        : 'bg-[#B6814C] hover:bg-[#8D4E22] hover:text-white border border-[#8D4E22] text-[#2B1405]'
                    }`}
                  >
                    {selectedRecord.status === 'SUSPENDED' ? (
                      <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                    ) : (
                      <Ban className="w-4 h-4 stroke-[2.2]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecordToDelete(selectedRecord)}
                    title="Delete KYC Record"
                    className="w-9 h-9 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Document Screening Cards (Front & Back) - Fully Clickable & Inspectable */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#18221B]">
                  <div className="flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-[#8D4E22]" />
                    <span>Uploaded Identity Document Artifacts</span>
                  </div>
                  <span className="text-[10px] text-[#2B1405] font-black bg-[#C49563] px-2 py-0.5 rounded-full border border-[#8D4E22]">
                    Click any document to inspect
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Front Upload Card */}
                  {(() => {
                    const isVerified = isDocVerified(
                      selectedRecord.id,
                      'front',
                      selectedRecord.status === 'APPROVED'
                    )
                    return (
                      <div
                        onClick={() => {
                          if (selectedRecord.frontUpload) {
                            setZoomLevel(100)
                            setInspectingDoc({
                              record: selectedRecord,
                              side: 'front',
                              fileName: selectedRecord.frontUpload,
                            })
                          }
                        }}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer group shadow-2xs hover:shadow-md active:scale-[0.99] flex flex-col justify-between ${
                          isVerified
                            ? 'bg-[#F2F7F0] border-[#A9C8A3] hover:border-[#5E8256]'
                            : 'bg-[#C49563]/25 border-[#8D4E22] hover:border-[#6E3812] hover:bg-[#C49563]/35'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="text-[10px] font-bold text-[#738679] uppercase tracking-wider">
                              Document Front Side
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                isVerified
                                  ? 'bg-[#E6EFE4] text-[#3E5F36] border-[#C1D6BD]'
                                  : 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]'
                              }`}
                            >
                              {isVerified ? (
                                <>
                                  <CheckCircle2 className="w-2.5 h-2.5 text-[#5E8256]" />
                                  <span>Verified</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-2.5 h-2.5 text-[#B45309]" />
                                  <span>Pending Check</span>
                                </>
                              )}
                            </span>
                          </div>

                          <div className="h-28 rounded-xl bg-white border border-[#C89B75] group-hover:border-[#8D4E22] flex flex-col items-center justify-center text-center p-2.5 transition-colors relative overflow-hidden">
                            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#8D4E22] text-white p-1 rounded-md shadow-xs">
                              <Eye className="w-3 h-3" />
                            </div>
                            <FileBadge className="w-6 h-6 text-[#8D4E22] mb-1 group-hover:scale-110 transition-transform" />
                            <span className="font-mono text-[10px] font-bold text-[#18221B] truncate w-full px-1">
                              {selectedRecord.frontUpload || 'No front document'}
                            </span>
                            <span className="text-[9px] text-[#738679] mt-0.5">
                              Digital Verification Passed • 1.4 MB
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (selectedRecord.frontUpload) {
                              setZoomLevel(100)
                              setInspectingDoc({
                                record: selectedRecord,
                                side: 'front',
                                fileName: selectedRecord.frontUpload,
                              })
                            }
                          }}
                          className="mt-2.5 w-full py-1.5 px-2 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Click to Inspect Document</span>
                        </button>
                      </div>
                    )
                  })()}

                  {/* Back Upload Card */}
                  {(() => {
                    const isVerified = isDocVerified(
                      selectedRecord.id,
                      'back',
                      selectedRecord.status === 'APPROVED'
                    )
                    const hasBack = Boolean(selectedRecord.backUpload)
                    return (
                      <div
                        onClick={() => {
                          if (hasBack) {
                            setZoomLevel(100)
                            setInspectingDoc({
                              record: selectedRecord,
                              side: 'back',
                              fileName: selectedRecord.backUpload!,
                            })
                          }
                        }}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                          !hasBack
                            ? 'bg-[#C49563]/15 border-[#8D4E22] opacity-80 cursor-not-allowed'
                            : isVerified
                            ? 'bg-[#F2F7F0] border-[#A9C8A3] hover:border-[#5E8256] cursor-pointer group shadow-2xs hover:shadow-md active:scale-[0.99]'
                            : 'bg-[#C49563]/25 border-[#8D4E22] hover:border-[#6E3812] hover:bg-[#C49563]/35 cursor-pointer group shadow-2xs hover:shadow-md active:scale-[0.99]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="text-[10px] font-bold text-[#738679] uppercase tracking-wider">
                              Document Back / Reverse
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                !hasBack
                                  ? 'bg-gray-100 text-gray-500 border-gray-200'
                                  : isVerified
                                  ? 'bg-[#E6EFE4] text-[#3E5F36] border-[#C1D6BD]'
                                  : 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]'
                              }`}
                            >
                              {!hasBack ? (
                                <span>Single-Sided</span>
                              ) : isVerified ? (
                                <>
                                  <CheckCircle2 className="w-2.5 h-2.5 text-[#5E8256]" />
                                  <span>Verified</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-2.5 h-2.5 text-[#B45309]" />
                                  <span>Pending Check</span>
                                </>
                              )}
                            </span>
                          </div>

                          <div className="h-28 rounded-xl bg-white border border-[#D8B293] group-hover:border-[#0369A1] flex flex-col items-center justify-center text-center p-2.5 transition-colors relative overflow-hidden">
                            {hasBack && (
                              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0369A1] text-white p-1 rounded-md shadow-xs">
                                <Eye className="w-3 h-3" />
                              </div>
                            )}
                            <FileBadge className="w-6 h-6 text-[#0369A1] mb-1 group-hover:scale-110 transition-transform" />
                            <span className="font-mono text-[10px] font-bold text-[#18221B] truncate w-full px-1">
                              {selectedRecord.backUpload || 'Single-sided document'}
                            </span>
                            <span className="text-[9px] text-[#738679] mt-0.5">
                              {hasBack ? 'Address QR Verified • 1.1 MB' : 'Not required for this format'}
                            </span>
                          </div>
                        </div>

                        {hasBack ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setZoomLevel(100)
                              setInspectingDoc({
                                record: selectedRecord,
                                side: 'back',
                                fileName: selectedRecord.backUpload!,
                              })
                            }}
                            className="mt-2.5 w-full py-1.5 px-2 rounded-xl bg-[#0369A1] hover:bg-[#0284C7] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Click to Inspect Document</span>
                          </button>
                        ) : (
                          <div className="mt-2.5 w-full py-1.5 text-center text-[10px] text-[#738679] italic">
                            No reverse page needed
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* OCR Automated Screening & Integrity */}
              <div className="p-4 rounded-2xl bg-[#F8F5F0] border border-[#D8B293] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#18221B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8D4E22]" />
                    <span>OCR Automated Screening Results</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#3E5F36]">
                    {selectedRecord.ocrVerification.confidence} Match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#738679] block text-[10px]">Name Match:</span>
                    <strong className="text-[#18221B]">{selectedRecord.ocrVerification.nameMatch}</strong>
                  </div>
                  <div>
                    <span className="text-[#738679] block text-[10px]">Tampering Risk:</span>
                    <strong className="text-[#3E5F36] uppercase">
                      {selectedRecord.ocrVerification.tamperingRisk} Risk
                    </strong>
                  </div>
                </div>
              </div>

              {/* DPDP 2025 Consent Proof */}
              <div className="p-4 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#3E5F36] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#5E8256] flex-shrink-0" />
                  <span>Digital Personal Data Protection (DPDP) Act 2025 Enforced</span>
                </div>
                <div className="space-y-1 text-[11px] text-[#4A5B50]">
                  <p>
                    <strong>Consent Version:</strong> {selectedRecord.dpdpConsent.version}
                  </p>
                  <p>
                    <strong>Timestamp:</strong> {selectedRecord.dpdpConsent.timestamp}
                  </p>
                  <p>
                    <strong>Purpose:</strong> {selectedRecord.dpdpConsent.purpose}
                  </p>
                </div>
              </div>

              {/* Active Clarification or Rejection Note */}
              {selectedRecord.clarificationQuestion && (
                <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FEF3C7] space-y-1 text-xs">
                  <span className="font-bold text-[#B45309] block">
                    Active Clarification Request:
                  </span>
                  <p className="text-[11px] text-[#92400E]">
                    {selectedRecord.clarificationQuestion}
                  </p>
                </div>
              )}

              {selectedRecord.rejectionReason && (
                <div className="p-3.5 rounded-2xl bg-[#C49563] border border-[#8D4E22] space-y-1 text-xs">
                  <span className="font-bold text-[#6E3812] block">
                    Mandatory Rejection Reason:
                  </span>
                  <p className="text-[11px] text-[#2B1405] font-semibold">
                    {selectedRecord.rejectionReason}
                  </p>
                </div>
              )}

              {/* Immutable Audit Log */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#18221B] block">
                  Immutable Governance Audit Trail (PRD §2)
                </span>
                <div className="space-y-2">
                  {selectedRecord.auditTrail.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#C49563]/20 border border-[#8D4E22] text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[#738679]">
                        <span className="font-mono">{ev.timestamp}</span>
                        <span className="font-bold text-[#8D4E22]">{ev.action}</span>
                      </div>
                      <p className="text-[#4A5B50]">{ev.note}</p>
                      <span className="text-[10px] text-[#738679] block italic">
                        By {ev.performedBy}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#8D4E22] bg-[#C49563]/25">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-[#C49563] hover:text-[#2B1405] border border-[#8D4E22] text-[#4A5B50] text-xs font-bold cursor-pointer transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Clarify / Reject Action Modal */}
      {modalAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#B88258] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#C89B75]">
              <h4 className="text-base font-black text-[#18221B]">
                {modalAction === 'clarify' && 'Request Clarification (KYC_CLARIFICATION)'}
                {modalAction === 'reject' && 'Reject Submission (KYC_REJECTED)'}
              </h4>
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="w-8 h-8 rounded-xl bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] flex items-center justify-center text-[#2B1405] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#4A5B50] font-medium leading-relaxed">
              {modalAction === 'clarify'
                ? 'Enter the specific question or missing document requirement. The user will be notified to resolve the request.'
                : 'PRD Section 2 Mandate: A clear rejection reason code and explanation is required so the user can edit and resubmit.'}
            </p>

            <div>
              <label className="text-[11px] font-bold text-[#18221B] block mb-1">
                {modalAction === 'clarify' ? 'Clarification Question' : 'Mandatory Rejection Reason'}
              </label>
              <textarea
                rows={3}
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
                placeholder={
                  modalAction === 'clarify'
                    ? 'e.g. Please upload clear front side of Aadhaar card...'
                    : 'e.g. Document expired or name mismatch with revenue record...'
                }
                className="w-full p-3 rounded-xl border border-[#8D4E22] text-xs text-[#18221B] font-medium outline-none focus:border-[#6E3812] bg-[#C49563]/20 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C89B75]">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#C49563] hover:text-[#2B1405] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmModalAction}
                disabled={!modalText.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-xs bg-[#8D4E22] hover:bg-[#6E3812] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm &amp; Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#B88258] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#C89B75]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#C49563] border border-[#8D4E22] text-[#2B1405] flex items-center justify-center font-black">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h4 className="text-base font-black text-[#18221B]">Delete KYC Record?</h4>
              </div>
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="w-8 h-8 rounded-xl bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] flex items-center justify-center text-[#2B1405] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#4A5B50] font-medium leading-relaxed">
              Are you sure you want to delete KYC submission{' '}
              <code className="bg-[#C49563] px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-[#2B1405] border border-[#8D4E22]">
                {recordToDelete.id}
              </code>{' '}
              for <strong className="text-[#18221B]">{recordToDelete.userName}</strong>?
            </p>

            <div className="p-3 bg-[#C49563] border border-[#8D4E22] rounded-2xl text-[11px] text-[#2B1405] font-black flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Identity proof will be revoked and user will need to restart F07 KYC onboarding.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C89B75]">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#C49563] hover:text-[#2B1405] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. High-Fidelity Document Inspection & Verification Modal */}
      {inspectingDoc && (() => {
        const isVerified = isDocVerified(
          inspectingDoc.record.id,
          inspectingDoc.side,
          inspectingDoc.record.status === 'APPROVED'
        )
        const isAadhaar = inspectingDoc.record.documentType.toLowerCase().includes('aadhaar')

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-[#D19E77] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="px-6 py-4 bg-[#F8F5F0] border-b border-[#D8B293] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F5E5D5] border border-[#D8B293] text-[#8D4E22] flex items-center justify-center font-bold shadow-2xs">
                    <FileBadge className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-[#18221B]">
                        {inspectingDoc.fileName}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isVerified
                            ? 'bg-[#E6EFE4] text-[#3E5F36] border-[#C1D6BD]'
                            : 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]'
                        }`}
                      >
                        {isVerified ? '✓ Document Verified' : 'Inspection Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-[#738679] font-medium">
                      {inspectingDoc.record.documentType} •{' '}
                      {inspectingDoc.side === 'front' ? 'Front Side' : 'Address & QR Reverse'} •{' '}
                      <strong className="text-[#18221B]">{inspectingDoc.record.userName}</strong> ({inspectingDoc.record.userId})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectingDoc(null)}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-[#EAE0D3] border border-[#D8B293] flex items-center justify-center text-[#4A5B50] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Inspection Toolbar */}
              <div className="px-6 py-2.5 bg-[#C49563] border-b border-[#8D4E22] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#2B1405] text-[11px] font-black">Zoom:</span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(75, z - 25))}
                    className="p-1 rounded bg-white border border-[#8D4E22] hover:bg-[#B6814C] text-[#2B1405] cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-[11px] text-[#2B1405] px-1">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 25))}
                    className="p-1 rounded bg-white border border-[#8D4E22] hover:bg-[#B6814C] text-[#2B1405] cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    className="px-2 py-0.5 rounded bg-white border border-[#8D4E22] hover:bg-[#B6814C] text-[#2B1405] text-[10px] font-bold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-[#2B1405] hidden sm:inline font-bold">
                    SHA-256: e3b0c442...9247 (OK)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage(`Downloaded ${inspectingDoc.fileName} to local cache.`)
                      setTimeout(() => setToastMessage(null), 3000)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#B6814C] border border-[#8D4E22] text-[#2B1405] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Artifact</span>
                  </button>
                </div>
              </div>

              {/* Main Document Preview Display */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#1E2620]">
                <div
                  className="mx-auto transition-transform duration-200 origin-top shadow-2xl rounded-2xl overflow-hidden"
                  style={{ transform: `scale(${zoomLevel / 100})`, maxWidth: '560px' }}
                >
                  {/* Visual Document Replica: Aadhaar Front */}
                  {isAadhaar && inspectingDoc.side === 'front' && (
                    <div className="bg-[#FFFDF9] border-2 border-[#B88258] rounded-2xl p-5 text-[#18221B] relative overflow-hidden shadow-xl select-none font-sans">
                      {/* Tricolor Security Top Ribbon */}
                      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] absolute top-0 left-0" />

                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3] mt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#C49563] border border-[#8D4E22] flex items-center justify-center font-bold text-[10px] text-[#2B1405]">
                            🇮🇳
                          </div>
                          <div>
                            <div className="text-[11px] font-black tracking-tight text-[#18221B] leading-none">
                              भारत सरकार
                            </div>
                            <div className="text-[9px] font-bold text-[#4A5B50] uppercase tracking-wider">
                              Government of India
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[12px] font-black text-[#C2410C] tracking-wide leading-none">
                            आधार
                          </div>
                          <div className="text-[8px] font-bold text-[#738679] uppercase">
                            UIDAI • Mera Aadhaar
                          </div>
                        </div>
                      </div>

                      {/* Card Content: Photo + Personal Details */}
                      <div className="flex items-center gap-4 py-4">
                        {/* Farmer Photo Portrait */}
                        <div className="w-24 h-28 rounded-xl bg-gradient-to-b from-[#E6EFE4] to-[#C1D6BD] border-2 border-[#8D4E22] flex flex-col items-center justify-center relative overflow-hidden shadow-inner flex-shrink-0">
                          <div className="w-14 h-14 rounded-full bg-[#5E8256]/30 border-2 border-[#3E5F36] flex items-center justify-center text-lg mb-1">
                            👩‍🌾
                          </div>
                          <span className="text-[8px] font-black text-[#3E5F36] uppercase tracking-widest">
                            VERIFIED
                          </span>
                          <div className="absolute inset-0 bg-repeat bg-[radial-gradient(#8D4E22_0.5px,transparent_0.5px)] opacity-20" />
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5 flex-1">
                          <div>
                            <span className="text-[9px] text-[#738679] block">नाम / Name</span>
                            <div className="text-sm font-black text-[#18221B] tracking-tight">
                              {inspectingDoc.record.userName}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[9px] text-[#738679] block">जन्म तिथि / DOB</span>
                              <strong className="text-[11px] text-[#18221B]">12/04/1982</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-[#738679] block">लिंग / Gender</span>
                              <strong className="text-[11px] text-[#18221B]">महिला / FEMALE</strong>
                            </div>
                          </div>

                          <div className="pt-1">
                            <span className="text-[9px] text-[#738679] block">आधार संख्या / Aadhaar No.</span>
                            <div className="text-base font-black font-mono tracking-widest text-[#8D4E22]">
                              XXXX XXXX {inspectingDoc.record.documentNumber.slice(-4) || '8912'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Official Watermark & Security Ribbon */}
                      <div className="pt-2 border-t border-[#E8DFD3] flex items-center justify-between text-[8px] text-[#738679]">
                        <span className="font-bold text-[#5E8256]">✓ Digital Signature Verified</span>
                        <span>आधार - आम आदमी का अधिकार</span>
                      </div>

                      {/* Diagonal Watermark */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-8 rotate-[-25deg]">
                        <span className="text-3xl font-black text-[#8D4E22] tracking-widest uppercase">
                          NATUREX VERIFIED
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Visual Document Replica: Aadhaar Back */}
                  {isAadhaar && inspectingDoc.side === 'back' && (
                    <div className="bg-[#FFFDF9] border-2 border-[#D19E77] rounded-2xl p-5 text-[#18221B] relative overflow-hidden shadow-xl select-none font-sans">
                      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] absolute top-0 left-0" />

                      <div className="pb-3 border-b border-[#E8DFD3] mt-1 text-center">
                        <div className="text-[11px] font-black text-[#18221B]">
                          भारतीय विशिष्ट पहचान प्राधिकरण
                        </div>
                        <div className="text-[9px] font-bold text-[#738679] uppercase">
                          Unique Identification Authority of India
                        </div>
                      </div>

                      <div className="flex items-start gap-4 py-4">
                        {/* Address */}
                        <div className="space-y-1 text-xs flex-1">
                          <span className="text-[9px] text-[#738679] font-bold uppercase block">
                            पता / Address:
                          </span>
                          <p className="text-[11px] text-[#18221B] font-semibold leading-relaxed">
                            आत्मज / W/O: Rameshwar Kurmi
                            <br />
                            मकान नं. 42, ग्राम पिपलिया, पोस्ट आष्टा
                            <br />
                            तहसील सीहोर, जिला सीहोर
                            <br />
                            Madhya Pradesh - 466001
                          </p>
                          <div className="pt-2">
                            <span className="text-[9px] text-[#738679] block">Aadhaar No.</span>
                            <div className="text-sm font-black font-mono tracking-wider text-[#8D4E22]">
                              XXXX XXXX {inspectingDoc.record.documentNumber.slice(-4) || '8912'}
                            </div>
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="w-28 h-28 rounded-xl bg-white border-2 border-[#18221B] p-2 flex flex-col items-center justify-center flex-shrink-0 shadow-xs">
                          <QrCode className="w-16 h-16 text-[#18221B]" />
                          <span className="text-[7px] font-mono text-[#738679] font-bold mt-1">
                            UIDAI 2D SECURE
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E8DFD3] flex items-center justify-between text-[8px] text-[#738679]">
                        <span>📞 1947 | help@uidai.gov.in</span>
                        <span>www.uidai.gov.in</span>
                      </div>

                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-8 rotate-[-25deg]">
                        <span className="text-3xl font-black text-[#8D4E22] tracking-widest uppercase">
                          NATUREX VERIFIED
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Non-Aadhaar Document Preview (PAN / Kisan / Certificate) */}
                  {!isAadhaar && (
                    <div className="bg-[#FFFDF9] border-2 border-[#D19E77] rounded-2xl p-5 text-[#18221B] relative overflow-hidden shadow-xl select-none font-sans">
                      <div className="h-1.5 w-full bg-[#8D4E22] absolute top-0 left-0" />
                      <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3] mt-1">
                        <div className="flex items-center gap-2">
                          <FileBadge className="w-6 h-6 text-[#8D4E22]" />
                          <div>
                            <div className="text-xs font-black text-[#18221B]">
                              {inspectingDoc.record.documentType}
                            </div>
                            <div className="text-[9px] text-[#738679]">
                              Official Verified Registry Certificate
                            </div>
                          </div>
                        </div>
                        <div className="font-mono text-xs font-black text-[#8D4E22]">
                          {inspectingDoc.record.documentNumber}
                        </div>
                      </div>

                      <div className="py-4 space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] text-[#738679] block">Applicant / Owner</span>
                            <strong className="text-sm text-[#18221B]">{inspectingDoc.record.userName}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#738679] block">Organization / Entity</span>
                            <strong className="text-xs text-[#18221B]">{inspectingDoc.record.organization}</strong>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8F5F0] border border-[#E8DFD3] space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#738679]">Registration Number:</span>
                            <strong className="font-mono text-[#8D4E22]">{inspectingDoc.record.documentNumber}</strong>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#738679]">Territory / District:</span>
                            <span className="font-semibold text-[#18221B]">{inspectingDoc.record.location}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#738679]">DPDP Compliance:</span>
                            <span className="font-bold text-[#5E8256]">Act 2025 Consented (v1.2)</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E8DFD3] flex items-center justify-between text-[9px] text-[#738679]">
                        <span>Registry Node: Naturex Central Compliance</span>
                        <span className="font-bold text-[#5E8256]">✓ Cryptographic Seal Valid</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Forensic Metadata & Verification Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-white space-y-1">
                    <span className="text-[10px] text-white/70 block uppercase font-bold">OCR Integrity</span>
                    <div className="font-bold text-[#A7F3D0]">
                      {inspectingDoc.record.ocrVerification.confidence} Match
                    </div>
                    <p className="text-[10px] text-white/80">
                      Name: {inspectingDoc.record.ocrVerification.nameMatch}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-white space-y-1">
                    <span className="text-[10px] text-white/70 block uppercase font-bold">Tampering Risk</span>
                    <div className="font-bold text-white uppercase">
                      {inspectingDoc.record.ocrVerification.tamperingRisk} Risk
                    </div>
                    <p className="text-[10px] text-white/80">Guilloche wave pattern intact</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-white space-y-1">
                    <span className="text-[10px] text-white/70 block uppercase font-bold">DPDP 2025 Lawfulness</span>
                    <div className="font-bold text-[#A7F3D0]">Explicit Consent Given</div>
                    <p className="text-[10px] text-white/80">
                      Version: {inspectingDoc.record.dpdpConsent.version}
                    </p>
                  </div>
                </div>
              </div>

              {/* Toast message if any */}
              {toastMessage && (
                <div className="px-6 py-2 bg-[#E6EFE4] text-[#3E5F36] text-xs font-bold flex items-center gap-1.5 border-t border-[#C1D6BD]">
                  <CheckCircle2 className="w-4 h-4 text-[#5E8256]" />
                  <span>{toastMessage}</span>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 bg-[#F8F5F0] border-t border-[#D8B293] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setInspectingDoc(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#EFE9E0] border border-[#D8B293] cursor-pointer"
                >
                  Close Preview
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      toggleDocVerified(
                        inspectingDoc.record.id,
                        inspectingDoc.side,
                        isVerified
                      )
                      setToastMessage(
                        !isVerified
                          ? `✓ Document verified and logged to immutable audit trail.`
                          : `Document verification status reverted to pending.`
                      )
                      setTimeout(() => setToastMessage(null), 3500)
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs transition-all ${
                      isVerified
                        ? 'bg-[#E6EFE4] text-[#3E5F36] hover:bg-[#C1D6BD] border border-[#BED2BB]'
                        : 'bg-[#8D4E22] text-white hover:bg-[#6E3812]'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {isVerified
                        ? '✓ Verified by Admin (Click to Revoke)'
                        : 'Mark as Verified'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
