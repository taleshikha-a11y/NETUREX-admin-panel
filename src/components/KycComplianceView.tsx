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
} from 'lucide-react'
import kycInitialData from '../data/kycData.json'
import type { UserRecord } from './UserManagementView'

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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] flex-shrink-0" />
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF2F2] border border-[#FEE2E2] text-[#B91C1C]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] flex-shrink-0" />
        <span>Rejected</span>
      </span>
    )
  }
  if (norm === 'SUSPENDED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] flex-shrink-0" />
        <span>Suspended</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF8F5] border border-[#E5DFD5] text-[#475569]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] flex-shrink-0" />
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
            activeTab === 'kyc-queue' ? 'ring-2 ring-[#3AA88E] border-[#3AA88E]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155]">Pending Review (A05)</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
              <Clock className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">{summary.pending}</span>
            <span className="text-[11px] font-bold text-[#0369A1]">Awaiting Gate Decision</span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium flex items-center justify-between pt-1 border-t border-[#82CEBA]/30">
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
            activeTab === 'kyc-action' ? 'ring-2 ring-[#3AA88E] border-[#3AA88E]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155]">Action Required</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#B45309] flex items-center justify-center font-bold shadow-2xs">
              <HelpCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">{summary.actionReq}</span>
            <span className="text-[11px] font-bold text-[#B45309]">Clarify / Rejected</span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium flex items-center justify-between pt-1 border-t border-[#82CEBA]/30">
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
            activeTab === 'kyc-approved' ? 'ring-2 ring-[#3AA88E] border-[#3AA88E]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155]">Approved &amp; Unlocked</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#15803D] flex items-center justify-center font-bold shadow-2xs">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">{summary.approved}</span>
            <span className="text-[11px] font-bold text-[#15803D]">Gate Passed</span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium flex items-center justify-between pt-1 border-t border-[#82CEBA]/30">
            <span>Payout &amp; Land Unlocked</span>
            <span className="text-[10px] font-semibold text-[#15803D] bg-[#F0FDF4] border border-[#DCFCE7] px-2 py-0.5 rounded-full">
              F08 / F10 Open
            </span>
          </div>
        </div>

        {/* Metric 4: DPDP 2025 Compliance */}
        <div className="harmony-kpi-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155]">DPDP 2025 Consent</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#166534] flex items-center justify-center font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">100%</span>
            <span className="text-[11px] font-bold text-[#2D6A4F]">Legally Consented</span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium flex items-center justify-between pt-1 border-t border-[#82CEBA]/30">
            <span>Act Compliance v1.2</span>
            <span className="text-[10px] font-semibold text-[#166534] bg-[#F0FDF4] border border-[#DCFCE7] px-2 py-0.5 rounded-full">
              India Law
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub-module Navigation Tabs (from navigation.json) */}
      <div className="bg-white border border-[#E2DDD5] rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => handleTabChange('kyc-queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'kyc-queue'
              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] shadow-2xs'
              : 'text-[#475569] hover:bg-[#F3EDE4]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Verification</span>
          <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-full border border-black/10 font-bold">
            {summary.pending}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('kyc-action')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'kyc-action'
              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] shadow-2xs'
              : 'text-[#475569] hover:bg-[#F3EDE4]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Action Required (Clarify / Reject)</span>
          <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-full border border-black/10 font-bold">
            {summary.actionReq}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('kyc-approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'kyc-approved'
              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] shadow-2xs'
              : 'text-[#475569] hover:bg-[#F3EDE4]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approved Records</span>
          <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-full border border-black/10 font-bold">
            {summary.approved}
          </span>
        </button>
      </div>

      {/* 3. Main Data Container & Filter Bar */}
      <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2">
              <FileBadge className="w-5 h-5 text-[#2D6A4F]" />
              <span>
                {activeTab === 'kyc-queue' && 'Pending Verification Queue (PRD §15 Module A05)'}
                {activeTab === 'kyc-action' && 'Action Required Queue (PRD §2 Clarify & Rejection)'}
                {activeTab === 'kyc-approved' && 'Approved & Compliant Records (PRD Gate Passed)'}
              </span>
            </h3>
            <p className="text-xs text-[#475569] font-semibold">
              Universal Approval Gate screening for India DPDP Act 2025 consent, Aadhaar/PAN validation, and downstream stage unlocking
            </p>
          </div>

          {/* Filters: Search, Role Filter, Document Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="bg-[#FAF8F5] border border-[#D6CBC0] rounded-xl px-3 py-1.5 flex items-center gap-2 w-56">
              <Search className="w-3.5 h-3.5 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search user, mobile, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-[#0F172A] font-medium w-full placeholder:text-[#64748B]"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#D6CBC0] rounded-xl px-3 py-1.5 text-xs text-[#0F172A] font-medium outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="FARMER">Farmers</option>
              <option value="ORG_ADMIN">Organization Admins</option>
              <option value="FIELD_AGENT">Field Agents</option>
            </select>

            {/* Document Type Filter */}
            <select
              value={docFilter}
              onChange={(e) => setDocFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#D6CBC0] rounded-xl px-3 py-1.5 text-xs text-[#0F172A] font-medium outline-none cursor-pointer"
            >
              <option value="ALL">All Documents</option>
              <option value="Aadhaar">Aadhaar Card</option>
              <option value="PAN">PAN Card</option>
              <option value="Kisan">Kisan Credit Card</option>
              <option value="FPO">FPO Certificate</option>
              <option value="Driving">Driving License</option>
            </select>
          </div>
        </div>

        {/* Master KYC Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#334155] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
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
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    No KYC submissions found in this queue.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-[#F9F6F1] transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(rec)}
                  >
                    {/* User & Organization */}
                    <td className="p-3.5">
                      <div className="font-black text-[#0F172A] text-sm flex items-center gap-2">
                        <span>{rec.userName}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#475569] font-bold">
                        {rec.userId} • {rec.userPhone}
                      </div>
                      <div className="text-[10px] text-[#2D6A4F] font-semibold mt-0.5">
                        {rec.organization}
                      </div>
                    </td>

                    {/* Document Details */}
                    <td className="p-3.5">
                      <div className="font-bold text-[#0F172A]">{rec.documentType}</div>
                      <div className="text-[11px] font-mono text-[#475569] font-bold">
                        {rec.documentNumber}
                      </div>
                      <div className="text-[10px] text-[#64748B]">{rec.location}</div>
                    </td>

                    {/* DPDP 2025 Consent */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#475569] bg-[#FAF8F5] border border-[#E2DDD5] px-2.5 py-1 rounded-full">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            rec.dpdpConsent.consented ? 'bg-[#16A34A]' : 'bg-[#F59E0B]'
                          }`}
                        />
                        <span>{rec.dpdpConsent.consented ? 'DPDP Consented' : 'Pending Consent'}</span>
                      </span>
                      <span className="block text-[10px] text-[#64748B] mt-0.5">
                        {rec.dpdpConsent.version}
                      </span>
                    </td>

                    {/* OCR Automated Screening */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#0F172A] text-xs">
                          {rec.ocrVerification.confidence}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                            rec.ocrVerification.tamperingRisk === 'LOW'
                              ? 'bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]'
                              : rec.ocrVerification.tamperingRisk === 'MEDIUM'
                              ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]'
                              : 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FEE2E2]'
                          }`}
                        >
                          {rec.ocrVerification.tamperingRisk} Risk
                        </span>
                      </div>
                      <div className="text-[10px] text-[#475569] truncate max-w-xs mt-0.5">
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
                          className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#D6CBC0] hover:border-[#2D6A4F] text-[#475569] hover:text-[#0F172A] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>

                        {/* 2. Approve KYC Button */}
                        {rec.status !== 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(rec.id)}
                            title="Approve KYC (Unlock Downstream Stages)"
                            className="w-7.5 h-7.5 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}

                        {/* 3. Clarify Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setModalAction('clarify')
                            setModalTargetId(rec.id)
                            setModalText(rec.clarificationQuestion || '')
                          }}
                          title="Request Clarification (Section 2 Prompt)"
                          className="w-7.5 h-7.5 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>

                        {/* 4. Reject Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setModalAction('reject')
                            setModalTargetId(rec.id)
                            setModalText(rec.rejectionReason || '')
                          }}
                          title="Reject Submission (Mandatory Reason Required)"
                          className="w-7.5 h-7.5 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
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
                              ? 'bg-[#F0FDF4] hover:bg-[#DCFCE7] border-[#BBF7D0] text-[#15803D]'
                              : 'bg-[#FAF8F5] hover:bg-[#EDE8E1] border-[#D6CBC0] text-[#64748B]'
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
                          className="w-7.5 h-7.5 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
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
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col justify-between border-l border-[#E2DDD5]">
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E8E0D5] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
                  <FileBadge className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-black text-[#0F172A] text-lg">
                    {selectedRecord.userName}
                  </h3>
                  <p className="text-xs font-mono text-[#475569] font-bold">
                    {selectedRecord.id} • {selectedRecord.userId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-xl bg-[#F5EFEB] hover:bg-[#EAE0D3] flex items-center justify-center text-[#334155] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* Gate Status & Quick Actions */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B]">Universal Approval Gate:</span>
                  {renderMinimalKycStatusBadge(selectedRecord.status)}
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {selectedRecord.status !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedRecord.id)}
                      title="Approve KYC Gate (Universal Approval)"
                      className="w-9 h-9 rounded-xl bg-[#2D6A4F] hover:bg-[#1E4D39] text-white cursor-pointer shadow-xs transition-colors flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setModalAction('clarify')
                      setModalTargetId(selectedRecord.id)
                      setModalText(selectedRecord.clarificationQuestion || '')
                    }}
                    title="Request Clarification"
                    className="w-9 h-9 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                  >
                    <HelpCircle className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalAction('reject')
                      setModalTargetId(selectedRecord.id)
                      setModalText(selectedRecord.rejectionReason || '')
                    }}
                    title="Reject Submission"
                    className="w-9 h-9 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSuspend(selectedRecord.id)}
                    title={selectedRecord.status === 'SUSPENDED' ? 'Restore User Access' : 'Suspend User Account'}
                    className={`w-9 h-9 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${
                      selectedRecord.status === 'SUSPENDED'
                        ? 'bg-[#F0FDF4] hover:bg-[#DCFCE7] border-[#BBF7D0] text-[#15803D]'
                        : 'bg-white hover:bg-[#FAF8F5] border-[#D6CBC0] text-[#334155]'
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
                    className="w-9 h-9 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Document Screening Cards (Front & Back) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                  <div className="flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-[#2D6A4F]" />
                    <span>Uploaded Identity Document Artifacts</span>
                  </div>
                  <span className="text-[10px] text-[#64748B] font-normal">
                    {selectedRecord.documentType}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Front Upload */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                      Document Front Side
                    </span>
                    <div className="h-28 rounded-xl bg-white border border-[#D6CBC0] flex flex-col items-center justify-center text-center p-2">
                      <FileBadge className="w-6 h-6 text-[#2D6A4F] mb-1" />
                      <span className="font-mono text-[10px] font-bold text-[#0F172A] truncate w-full">
                        {selectedRecord.frontUpload || 'No front document'}
                      </span>
                      <span className="text-[9px] text-[#64748B]">Digital Verification Passed</span>
                    </div>
                  </div>

                  {/* Back Upload */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                      Document Back / Reverse
                    </span>
                    <div className="h-28 rounded-xl bg-white border border-[#D6CBC0] flex flex-col items-center justify-center text-center p-2">
                      <FileBadge className="w-6 h-6 text-[#0369A1] mb-1" />
                      <span className="font-mono text-[10px] font-bold text-[#0F172A] truncate w-full">
                        {selectedRecord.backUpload || 'Single-sided document'}
                      </span>
                      <span className="text-[9px] text-[#64748B]">Address QR Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* OCR Automated Screening & Integrity */}
              <div className="p-4 rounded-2xl bg-[#F8F5F0] border border-[#D6CBC0] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#0F172A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>OCR Automated Screening Results</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#15803D]">
                    {selectedRecord.ocrVerification.confidence} Match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#64748B] block text-[10px]">Name Match:</span>
                    <strong className="text-[#0F172A]">{selectedRecord.ocrVerification.nameMatch}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px]">Tampering Risk:</span>
                    <strong className="text-[#15803D] uppercase">
                      {selectedRecord.ocrVerification.tamperingRisk} Risk
                    </strong>
                  </div>
                </div>
              </div>

              {/* DPDP 2025 Consent Proof */}
              <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#166534] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                  <span>Digital Personal Data Protection (DPDP) Act 2025 Enforced</span>
                </div>
                <div className="space-y-1 text-[11px] text-[#334155]">
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
                <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] space-y-1 text-xs">
                  <span className="font-bold text-[#B91C1C] block">
                    Mandatory Rejection Reason:
                  </span>
                  <p className="text-[11px] text-[#991B1B]">
                    {selectedRecord.rejectionReason}
                  </p>
                </div>
              )}

              {/* Immutable Audit Log */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#0F172A] block">
                  Immutable Governance Audit Trail (PRD §2)
                </span>
                <div className="space-y-2">
                  {selectedRecord.auditTrail.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[#64748B]">
                        <span className="font-mono">{ev.timestamp}</span>
                        <span className="font-bold text-[#2D6A4F]">{ev.action}</span>
                      </div>
                      <p className="text-[#334155]">{ev.note}</p>
                      <span className="text-[10px] text-[#64748B] block italic">
                        By {ev.performedBy}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E8E0D5] bg-[#FAF8F5]">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-[#F3EDE4] border border-[#D6CBC0] text-[#334155] text-xs font-bold cursor-pointer transition-colors"
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
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#E2DDD5] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D6CBC0]">
              <h4 className="text-base font-black text-[#0F172A]">
                {modalAction === 'clarify' && 'Request Clarification (KYC_CLARIFICATION)'}
                {modalAction === 'reject' && 'Reject Submission (KYC_REJECTED)'}
              </h4>
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="w-8 h-8 rounded-xl bg-[#F5EFEB] hover:bg-[#EAE0D3] flex items-center justify-center text-[#334155] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              {modalAction === 'clarify'
                ? 'Enter the specific question or missing document requirement. The user will be notified to resolve the request.'
                : 'PRD Section 2 Mandate: A clear rejection reason code and explanation is required so the user can edit and resubmit.'}
            </p>

            <div>
              <label className="text-[11px] font-bold text-[#0F172A] block mb-1">
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
                className="w-full p-3 rounded-xl border border-[#D6CBC0] text-xs text-[#0F172A] font-medium outline-none focus:border-[#2D6A4F] bg-[#FAF8F5]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D6CBC0]">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#475569] hover:bg-[#F3EDE4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmModalAction}
                disabled={!modalText.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  modalAction === 'reject'
                    ? 'bg-[#C53030] hover:bg-[#9B2C2C]'
                    : 'bg-[#2D6A4F] hover:bg-[#1E4D39]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
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
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#FECACA] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D6CBC0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] flex items-center justify-center font-black">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h4 className="text-base font-black text-[#0F172A]">Delete KYC Record?</h4>
              </div>
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="w-8 h-8 rounded-xl bg-[#F5EFEB] hover:bg-[#EAE0D3] flex items-center justify-center text-[#334155] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              Are you sure you want to delete KYC submission{' '}
              <code className="bg-[#FAF7F2] px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-[#991B1B] border border-[#FCA5A5]">
                {recordToDelete.id}
              </code>{' '}
              for <strong className="text-[#0F172A]">{recordToDelete.userName}</strong>?
            </p>

            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl text-[11px] text-[#991B1B] font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Identity proof will be revoked and user will need to restart F07 KYC onboarding.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D6CBC0]">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#475569] hover:bg-[#F3EDE4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#C53030] hover:bg-[#9B2C2C] flex items-center gap-1.5 cursor-pointer shadow-xs"
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
