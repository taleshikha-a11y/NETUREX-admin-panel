import { useState, useEffect } from 'react'
import {
  Users,
  Building2,
  Smartphone,
  Award,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  UserCheck,
  X,
  Send,
  Ban,
  FileText,
  CreditCard,
  Layers,
  HelpCircle,
  RotateCcw,
  Trash2,
  Eye,
  UserPlus,
  Check,
  XCircle,
} from 'lucide-react'
import usersData from '../data/usersData.json'

interface UserManagementViewProps {
  initialSubTab?: string
  onNavigateSubTab?: (subTabKey: string) => void
  usersList?: UserRecord[]
  onUpdateUsers?: React.Dispatch<React.SetStateAction<UserRecord[]>>
  onCreateUserClick?: () => void
}

type SubTabKey =
  | 'all-users'
  | 'farmers'
  | 'organizations'
  | 'field-agents'
  | 'reviewers'
  | 'roles-rbac'

export interface UserRecord {
  id: string
  name: string
  phone: string
  role: string
  roleCode: string
  avatar: string
  location: {
    village: string
    city: string
    district: string
    state: string
    country: string
  }
  dob: string
  age: number
  registeredDate: string
  universalStatus: string
  organization: {
    id: string
    name: string
    type: string
    roleInOrg: string
  }
  kyc: {
    status: string
    documentType: string
    documentNumber: string
    frontUpload: string
    backUpload: string
    consentChecked: boolean
    consentVersion: string
    consentTimestamp: string
    adminDecisionNote?: string | null
    clarificationQuestion?: string | null
    rejectionReason?: string | null
  }
  payoutProfile: {
    status: string
    accountHolder: string
    accountNumber: string
    ifsc: string
    bankName: string
    branch: string
  }
  lands: {
    landId: string
    name: string
    surveyNumber: string
    gisCalculatedArea: number
    unit: string
    ownershipType: string
    currentCrop: string
    irrigationSource: string
    approvalStatus: string
  }[]
  projects: {
    projectId: string
    name: string
    type: string
    typeLabel: string
    stage: string
    targetImpact: string
  }[]
  auditTrail: {
    timestamp: string
    action: string
    performedBy: string
    note: string
  }[]
}

// Minimal, elegant status pill with indicator dot - calm & uncongested
function renderStatusBadge(status: string) {
  const norm = (status || '').toUpperCase()
  if (norm === 'APPROVED' || norm === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] flex-shrink-0" />
        <span>{norm === 'APPROVED' ? 'Approved' : 'Verified'}</span>
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
  if (norm === 'CLARIFICATION' || norm === 'PENDING_REVIEW' || norm === 'PENDING REVIEW') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFFBEB] border border-[#FEF3C7] text-[#B45309]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
        <span>{norm === 'CLARIFICATION' ? 'Clarification' : 'Pending'}</span>
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

export default function UserManagementView({
  initialSubTab = 'all-users',
  onNavigateSubTab,
  usersList,
  onUpdateUsers,
  onCreateUserClick,
}: UserManagementViewProps) {
  const [activeTab, setActiveTab] = useState<SubTabKey>(() => {
    if (
      initialSubTab === 'all-users' ||
      initialSubTab === 'farmers' ||
      initialSubTab === 'organizations' ||
      initialSubTab === 'field-agents' ||
      initialSubTab === 'reviewers' ||
      initialSubTab === 'roles-rbac'
    ) {
      return initialSubTab
    }
    return 'all-users'
  })

  // Sync with initialSubTab from parent
  useEffect(() => {
    if (
      initialSubTab === 'all-users' ||
      initialSubTab === 'farmers' ||
      initialSubTab === 'organizations' ||
      initialSubTab === 'field-agents' ||
      initialSubTab === 'reviewers' ||
      initialSubTab === 'roles-rbac'
    ) {
      setActiveTab(initialSubTab)
    }
  }, [initialSubTab])

  const handleTabChange = (tab: SubTabKey) => {
    setActiveTab(tab)
    if (onNavigateSubTab) {
      onNavigateSubTab(tab)
    }
  }

  // Support either parent-managed state (from App.tsx) or self-contained state
  const [internalUserList, setInternalUserList] = useState<UserRecord[]>(usersData.users as UserRecord[])
  const userList = usersList ?? internalUserList
  const setUserList = onUpdateUsers ?? setInternalUserList

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Slide-over Drawer State
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)

  // Modals for Universal Approval Gate actions (PRD Page 2 & Page 10)
  const [modalAction, setModalAction] = useState<'clarify' | 'reject' | 'note' | null>(null)
  const [modalTargetUserId, setModalTargetUserId] = useState<string | null>(null)
  const [modalInputText, setModalInputText] = useState('')

  // Modal for Permanent Delete User Confirmation
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null)

  const handleConfirmDelete = () => {
    if (!userToDelete) return
    const deletedId = userToDelete.id
    setUserList((prev) => prev.filter((u) => u.id !== deletedId))
    if (selectedUser?.id === deletedId) {
      setSelectedUser(null)
    }
    setUserToDelete(null)
  }

  // Handle Universal Approval Gate Decisions
  const handleApproveUser = (userId: string) => {
    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = {
            ...u,
            universalStatus: 'APPROVED',
            kyc: {
              ...u.kyc,
              status: 'APPROVED',
              adminDecisionNote: 'Approved by Super Admin under Universal Approval Gate.',
              clarificationQuestion: null,
              rejectionReason: null,
            },
            auditTrail: [
              ...u.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                action: 'APPROVE',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: 'KYC_APPROVED. Payout profile and Land registration unlocked.',
              },
            ],
          }
          if (selectedUser?.id === userId) setSelectedUser(updated)
          return updated
        }
        return u
      })
    )
  }

  const handleSuspendUser = (userId: string) => {
    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const isCurrentlySuspended = u.universalStatus === 'SUSPENDED'
          const newStatus = isCurrentlySuspended ? 'APPROVED' : 'SUSPENDED'
          const updated = {
            ...u,
            universalStatus: newStatus,
            kyc: {
              ...u.kyc,
              status: newStatus,
            },
            auditTrail: [
              ...u.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                action: isCurrentlySuspended ? 'APPROVE' : 'SUSPEND',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: isCurrentlySuspended
                  ? 'User restored by Super Admin decision.'
                  : 'User temporarily suspended under Section 2 Universal Gate.',
              },
            ],
          }
          if (selectedUser?.id === userId) setSelectedUser(updated)
          return updated
        }
        return u
      })
    )
  }

  const handleOpenActionModal = (action: 'clarify' | 'reject' | 'note', userId: string) => {
    setModalAction(action)
    setModalTargetUserId(userId)
    setModalInputText('')
  }

  const handleConfirmModalAction = () => {
    if (!modalTargetUserId || !modalAction) return

    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === modalTargetUserId) {
          let updatedStatus = u.universalStatus
          let noteText = modalInputText || 'Admin action recorded.'

          if (modalAction === 'clarify') {
            updatedStatus = 'CLARIFICATION'
            u.kyc.status = 'CLARIFICATION'
            u.kyc.clarificationQuestion = modalInputText
            noteText = `Clarification Question Sent: ${modalInputText}`
          } else if (modalAction === 'reject') {
            updatedStatus = 'REJECTED'
            u.kyc.status = 'REJECTED'
            u.kyc.rejectionReason = modalInputText
            noteText = `KYC_REJECTED (Mandatory Reason): ${modalInputText}`
          }

          const updated = {
            ...u,
            universalStatus: updatedStatus,
            auditTrail: [
              ...u.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                action:
                  modalAction === 'clarify'
                    ? 'CLARIFY'
                    : modalAction === 'reject'
                    ? 'REJECT'
                    : 'NOTE',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: noteText,
              },
            ],
          }
          if (selectedUser?.id === modalTargetUserId) setSelectedUser(updated)
          return updated
        }
        return u
      })
    )

    setModalAction(null)
    setModalTargetUserId(null)
    setModalInputText('')
  }

  // Filtered Users List
  const filteredUsers = userList.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'FARMER' && user.roleCode === 'FARMER') ||
      (roleFilter === 'ORG_ADMIN' && user.roleCode === 'ORG_ADMIN') ||
      (roleFilter === 'FIELD_AGENT' && user.roleCode === 'FIELD_AGENT') ||
      (roleFilter === 'MRV_SPECIALIST' && user.roleCode === 'MRV_SPECIALIST') ||
      (roleFilter === 'ACVA_VERIFIER' && user.roleCode === 'ACVA_VERIFIER')

    const matchesStatus =
      statusFilter === 'ALL' || user.universalStatus === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Filtered Farmers specific to Farmers tab
  const farmersOnlyList = filteredUsers.filter((u) => u.roleCode === 'FARMER')

  return (
    <div className="space-y-6">
      {/* 1. Executive Summary KPIs Strip (PRD §13 & §15 Master IA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users KPI */}
        <div
          onClick={() => handleTabChange('all-users')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'all-users' ? 'ring-2 ring-[#3AA88E] border-[#3AA88E]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155]">Total Platform Users</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#0F3F32] flex items-center justify-center font-bold shadow-2xs">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">
              {usersData.summaryStats.totalUsers.count}
            </span>
            <span className="text-[11px] font-bold text-[#2D6A4F]">
              {usersData.summaryStats.totalUsers.growthThisMonth} active
            </span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium flex items-center justify-between pt-1 border-t border-[#82CEBA]/30">
            <span>{usersData.summaryStats.totalUsers.activeCount} Active</span>
            <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
              Master A02 Directory
            </span>
          </div>
        </div>

        {/* Farmers & Landowners KPI */}
        <div
          onClick={() => handleTabChange('farmers')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'farmers' ? 'ring-2 ring-[#3AA88E] border-[#3AA88E]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155]">Farmers &amp; Landowners</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#0F3F32] flex items-center justify-center font-bold shadow-2xs">
              <UserCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">
              {usersData.summaryStats.totalFarmers.count}
            </span>
            <span className="text-[11px] font-bold text-[#2D6A4F]">
              {usersData.summaryStats.totalFarmers.verificationRate} KYC Verified
            </span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium flex items-center justify-between pt-1 border-t border-[#82CEBA]/30">
            <span>{usersData.summaryStats.totalFarmers.totalAcreage}</span>
            <span className="badge-warning-tint px-2 py-0.5 rounded-full text-[10px]">
              {usersData.summaryStats.totalFarmers.pendingKyc} Pending KYC
            </span>
          </div>
        </div>

        {/* Organizations KPI */}
        <div
          onClick={() => handleTabChange('organizations')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'organizations' ? 'ring-2 ring-[#3AA88E] border-[#3AA88E]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155]">Organizations (FPO/NGO)</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#0F3F32] flex items-center justify-center font-bold shadow-2xs">
              <Building2 className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">
              {usersData.summaryStats.totalOrganizations.count}
            </span>
            <span className="text-[11px] font-bold text-[#2D6A4F]">
              {usersData.summaryStats.totalOrganizations.fpoCount} FPOs
            </span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium flex items-center justify-between pt-1 border-t border-[#82CEBA]/30">
            <span>{usersData.summaryStats.totalOrganizations.ngoCount} NGOs</span>
            <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
              A04 Verified
            </span>
          </div>
        </div>

        {/* Field Agents & Verifiers KPI */}
        <div
          onClick={() => handleTabChange('field-agents')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'field-agents' ? 'ring-2 ring-[#3AA88E] border-[#3AA88E]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155]">Field Agents &amp; Ops</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#0F3F32] flex items-center justify-center font-bold shadow-2xs">
              <Smartphone className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">
              {usersData.summaryStats.totalFieldAgents.count}
            </span>
            <span className="text-[11px] font-bold text-[#2D6A4F]">
              {usersData.summaryStats.totalFieldAgents.activeToday} in field
            </span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium flex items-center justify-between pt-1 border-t border-[#82CEBA]/30">
            <span>{usersData.summaryStats.totalFieldAgents.visitsCompletedMonth} visits</span>
            <span className="badge-alert-tint px-2 py-0.5 rounded-full text-[10px]">
              {usersData.summaryStats.totalFieldAgents.offlineSyncPending} Sync Pending
            </span>
          </div>
        </div>
      </div>

      {/* 2. Submodule Tab Bar Navigation (PRD Page 10 Section 15 Modules) */}
      <div className="bg-white border border-[#E2DDD5] rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => handleTabChange('all-users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'all-users'
              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] shadow-2xs'
              : 'text-[#475569] hover:bg-[#F3EDE4]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Users &amp; Directory (A02)</span>
          <span className="text-[10px] bg-white/80 px-2 py-0.2 rounded-full border border-black/10">
            {userList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('farmers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'farmers'
              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] shadow-2xs'
              : 'text-[#475569] hover:bg-[#F3EDE4]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Farmers &amp; Landowners</span>
          <span className="text-[10px] bg-white/80 px-2 py-0.2 rounded-full border border-black/10">
            {farmersOnlyList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('organizations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'organizations'
              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] shadow-2xs'
              : 'text-[#475569] hover:bg-[#F3EDE4]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Organizations (A04)</span>
          <span className="text-[10px] bg-white/80 px-2 py-0.2 rounded-full border border-black/10">
            {usersData.organizations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('field-agents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'field-agents'
              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] shadow-2xs'
              : 'text-[#475569] hover:bg-[#F3EDE4]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Field Agents (A15)</span>
          <span className="text-[10px] bg-white/80 px-2 py-0.2 rounded-full border border-black/10">
            {usersData.fieldAgents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('reviewers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'reviewers'
              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] shadow-2xs'
              : 'text-[#475569] hover:bg-[#F3EDE4]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Reviewers &amp; ACVAs (A16)</span>
          <span className="text-[10px] bg-white/80 px-2 py-0.2 rounded-full border border-black/10">
            {usersData.reviewers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('roles-rbac')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'roles-rbac'
              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] shadow-2xs'
              : 'text-[#475569] hover:bg-[#F3EDE4]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Roles &amp; Permissions (A03)</span>
        </button>
      </div>

      {/* 3. TAB 1: ALL USERS & DIRECTORY (PRD Module A02) */}
      {activeTab === 'all-users' && (
        <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tight">
                Master User Directory (PRD §15 Module A02)
              </h3>
              <p className="text-xs text-[#475569] font-semibold">
                Centralized registry with Universal Approval Gate, DPDP 2025 consent verification, and scoped management
              </p>
            </div>

            {/* Controls: Search, Role Filter, Status Filter */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="bg-[#FAF8F5] border border-[#D6CBC0] rounded-xl px-3 py-1.5 flex items-center gap-2 w-56">
                <Search className="w-3.5 h-3.5 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search user, mobile, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-[#0F172A] font-bold w-full placeholder:text-[#64748B]"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#FAF8F5] border border-[#D6CBC0] rounded-xl px-3 py-1.5 text-xs text-[#0F172A] font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="FARMER">Farmers &amp; Landowners</option>
                <option value="ORG_ADMIN">Organization Admins</option>
                <option value="FIELD_AGENT">Field Agents</option>
                <option value="MRV_SPECIALIST">MRV Specialists</option>
                <option value="ACVA_VERIFIER">ACVA Verifiers</option>
              </select>

              {/* Universal Gate Status Filter (PRD Page 2) */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FAF8F5] border border-[#D6CBC0] rounded-xl px-3 py-1.5 text-xs text-[#0F172A] font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">APPROVED (Gate Passed)</option>
                <option value="SUBMITTED">SUBMITTED (Waiting Review)</option>
                <option value="CLARIFICATION">CLARIFICATION (Info Required)</option>
                <option value="REJECTED">REJECTED (Failed Review)</option>
                <option value="SUSPENDED">SUSPENDED (Blocked)</option>
              </select>

              {onCreateUserClick && (
                <button
                  type="button"
                  onClick={onCreateUserClick}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#3AA88E] to-[#2D8E77] hover:from-[#339A82] hover:to-[#257964] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md transition-all border border-[#257964] active:scale-98"
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>+ Create Role &amp; User</span>
                </button>
              )}
            </div>
          </div>

          {/* Master Users Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#334155] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Actor / User</th>
                  <th className="p-3.5">Role &amp; Scope</th>
                  <th className="p-3.5">Organization Context</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Universal Gate Status</th>
                  <th className="p-3.5">Consent (DPDP)</th>
                  <th className="p-3.5 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFD5]">
                {filteredUsers.map((user) => {
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#F9F6F1] transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      {/* Name & ID */}
                      <td className="p-3.5">
                        <div className="font-black text-[#0F172A] text-sm flex items-center gap-2">
                          <span>{user.name}</span>
                        </div>
                        <div className="text-[11px] font-mono text-[#475569] font-bold">
                          {user.id} • {user.phone}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-3.5">
                        <span className="font-black text-[#0F172A] block">
                          {user.role}
                        </span>
                        <span className="text-[10px] font-bold text-[#64748B]">
                          Age: {user.age} • Reg: {user.registeredDate}
                        </span>
                      </td>

                      {/* Organization */}
                      <td className="p-3.5">
                        <div
                          className="font-bold text-[#0F172A] max-w-xs truncate"
                          title={user.organization.name}
                        >
                          {user.organization.name}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF5F1] text-[#0A3B2F] font-bold border border-[#A2D4C5]">
                          {user.organization.type} • {user.organization.roleInOrg}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-[#0F172A] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#2D6A4F]" />
                          <span>
                            {user.location.district}, {user.location.state}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#475569] font-medium">
                          {user.location.village}
                        </div>
                      </td>

                      {/* Universal Gate Status (PRD Page 2) */}
                      <td className="p-3.5">
                        {renderStatusBadge(user.universalStatus)}
                      </td>

                      {/* DPDP Consent */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#475569] bg-[#FAF8F5] border border-[#E2DDD5] px-2.5 py-1 rounded-full">
                          <span className={`w-1.5 h-1.5 rounded-full ${user.kyc.consentChecked ? 'bg-[#16A34A]' : 'bg-[#F59E0B]'}`} />
                          <span>{user.kyc.consentChecked ? 'DPDP Consented' : 'Pending Consent'}</span>
                        </span>
                      </td>

                      {/* Universal Approval Gate & Management Actions (Clean icon-only buttons with tooltips) */}
                      <td className="p-3.5 text-right">
                        <div
                          className="inline-flex items-center gap-1.5 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* 1. View Profile Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            title="View Full Profile & KYC Audit Drawer"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#D6CBC0] hover:border-[#2D6A4F] text-[#475569] hover:text-[#0F172A] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {/* 2. Approve Button */}
                          {user.universalStatus !== 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handleApproveUser(user.id)}
                              title="Approve User (KYC_APPROVED)"
                              className="w-7.5 h-7.5 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          {/* 3. Clarify Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal('clarify', user.id)}
                            title="Request Clarification (KYC_CLARIFICATION)"
                            className="w-7.5 h-7.5 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <HelpCircle className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {/* 4. Reject Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal('reject', user.id)}
                            title="Reject Submission (KYC_REJECTED)"
                            className="w-7.5 h-7.5 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {/* 5. Suspend / Restore Button */}
                          <button
                            type="button"
                            onClick={() => handleSuspendUser(user.id)}
                            title={user.universalStatus === 'SUSPENDED' ? 'Restore User Access' : 'Suspend User Account'}
                            className={`w-7.5 h-7.5 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${
                              user.universalStatus === 'SUSPENDED'
                                ? 'bg-[#F0FDF4] hover:bg-[#DCFCE7] border-[#BBF7D0] text-[#15803D]'
                                : 'bg-[#FAF8F5] hover:bg-[#EDE8E1] border-[#D6CBC0] text-[#64748B]'
                            }`}
                          >
                            {user.universalStatus === 'SUSPENDED' ? (
                              <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                            ) : (
                              <Ban className="w-3.5 h-3.5 stroke-[2.2]" />
                            )}
                          </button>

                          {/* 6. Delete Button */}
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            title="Permanently Delete User Account"
                            className="w-7.5 h-7.5 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB 2: FARMERS & LANDOWNERS (Section 4 Complete Flow) */}
      {activeTab === 'farmers' && (
        <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tight">
                Farmers &amp; Landowners Directory (PRD §4 Complete Flow)
              </h3>
              <p className="text-xs text-[#475569] font-semibold">
                F06 Profile → F07 KYC Gate → F08 Bank/Payout → F10 Land → F14 Projects
              </p>
            </div>

            <div className="text-xs font-bold text-[#475569] bg-[#FAF8F5] border border-[#E2DDD5] px-3 py-1.5 rounded-xl">
              Showing {farmersOnlyList.length} Registered Landholders
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#334155] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Farmer &amp; Contact</th>
                  <th className="p-3.5">Village &amp; Khasra (F10)</th>
                  <th className="p-3.5">GIS Calculated Acreage</th>
                  <th className="p-3.5">Payout Status (F08)</th>
                  <th className="p-3.5">Active Projects (F14)</th>
                  <th className="p-3.5">KYC Gate (F07)</th>
                  <th className="p-3.5 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFD5]">
                {farmersOnlyList.map((farmer) => {
                  return (
                    <tr
                      key={farmer.id}
                      className="hover:bg-[#F9F6F1] transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(farmer)}
                    >
                      <td className="p-3.5">
                        <div className="font-black text-[#0F172A] text-sm">
                          {farmer.name}
                        </div>
                        <div className="text-[11px] font-mono text-[#475569] font-bold">
                          {farmer.id} • {farmer.phone}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-extrabold text-[#0F172A]">
                          {farmer.location.village}, {farmer.location.district}
                        </div>
                        <div className="text-[10px] text-[#475569] font-mono font-bold">
                          {farmer.lands[0]?.surveyNumber || 'Pending Land Survey'}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-black text-[#0F172A] text-sm">
                          {farmer.lands[0]?.gisCalculatedArea || 0}
                        </span>{' '}
                        <span className="text-[11px] font-bold text-[#2D6A4F]">Acres</span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-[#0F172A] mb-1">
                          {farmer.payoutProfile.bankName}
                        </div>
                        {renderStatusBadge(farmer.payoutProfile.status)}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-[#0F172A] mb-1">
                          {farmer.projects.length > 0
                            ? farmer.projects[0].name
                            : 'No Active Projects'}
                        </div>
                        {farmer.projects.length > 0 && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#0284C7] bg-[#F0F9FF] border border-[#E0F2FE]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
                            <span>{farmer.projects[0].typeLabel}</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {renderStatusBadge(farmer.universalStatus)}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedUser(farmer)
                          }}
                          title="Review F06-F08 Profile, KYC & Land Survey"
                          className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#D6CBC0] hover:border-[#2D6A4F] text-[#334155] hover:text-[#2D6A4F] cursor-pointer shadow-2xs inline-flex items-center justify-center transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 3: ORGANIZATIONS (PRD §13 Module A04) */}
      {activeTab === 'organizations' && (
        <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black text-[#0F172A] tracking-tight">
              Organizations Directory (PRD §13 Module A04)
            </h3>
            <p className="text-xs text-[#475569] font-semibold">
              O01 Login → O02 Setup → O03 Legal Verification Gate → O04 Dashboard &amp; Farmers Portfolio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usersData.organizations.map((org) => {
              const isApproved = org.status === 'APPROVED'

              return (
                <div
                  key={org.id}
                  className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-3 hover:border-[#2D6A4F] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-[#0F172A]">{org.name}</h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full badge-sky-tint">
                          {org.type}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[#475569]">
                        {org.registrationNo} • {org.headquarters}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isApproved ? 'badge-mint-tint' : 'badge-warning-tint'
                      }`}
                    >
                      {org.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8DFD3] text-center">
                    <div className="p-2 rounded-xl bg-white border border-[#D6CBC0]">
                      <span className="text-xs font-black text-[#0F172A] block">
                        {org.farmersCount}
                      </span>
                      <span className="text-[10px] text-[#475569] font-bold">Onboarded</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#D6CBC0]">
                      <span className="text-xs font-black text-[#0F172A] block">
                        {org.managedAcreage}
                      </span>
                      <span className="text-[10px] text-[#475569] font-bold">Total Acreage</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#D6CBC0]">
                      <span className="text-xs font-black text-[#0F172A] block">
                        {org.projectsCount}
                      </span>
                      <span className="text-[10px] text-[#475569] font-bold">Projects</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-[#475569] font-bold">
                      Key Lead: <strong>{org.contactPerson}</strong>
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      Onboarded: {org.onboardedDate}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 6. TAB 4: FIELD AGENTS (PRD §14 Module A15) */}
      {activeTab === 'field-agents' && (
        <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tight">
                Field Agents &amp; Ground Surveyors (PRD §14 Offline-First Engine)
              </h3>
              <p className="text-xs text-[#475569] font-semibold">
                FA01 Login → FA02 Today Dashboard → FA06 Start Visit → FA10 Evidence Capture → FA16 Sync
              </p>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-full badge-mint-tint">
              68 Total Registered Agents
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usersData.fieldAgents.map((agent) => {
              const isDanger = agent.syncState === 'danger'
              const isWarning = agent.syncState === 'warning'

              return (
                <div
                  key={agent.id}
                  className={`p-5 rounded-2xl border space-y-3 transition-all ${
                    isDanger
                      ? 'bg-[#FFFBFB] border-[#FECACA]'
                      : isWarning
                      ? 'bg-[#FFFDF7] border-[#FEF08A]'
                      : 'bg-[#FAF8F5] border-[#E5DFD5]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-[#0F172A]">{agent.name}</span>
                        <span className="text-[10px] font-mono font-bold text-[#475569]">
                          {agent.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#334155] font-bold">
                        {agent.assignedRegion} • {agent.organization}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        isDanger
                          ? 'badge-alert-tint'
                          : isWarning
                          ? 'badge-warning-tint'
                          : 'badge-mint-tint'
                      }`}
                    >
                      {agent.syncStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E8DFD3]">
                    <div className="flex items-center gap-3">
                      <span>
                        Active Visits: <strong>{agent.activeVisits}</strong>
                      </span>
                      <span>
                        Completed: <strong>{agent.completedVisits}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-[#0A3B2F] font-bold">
                      {agent.lastActive}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 7. TAB 5: REVIEWERS & VERIFIERS (PRD §11 & §16 Module A16) */}
      {activeTab === 'reviewers' && (
        <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black text-[#0F172A] tracking-tight">
              Technical Reviewers &amp; Accredited Carbon Verifiers (ACVAs)
            </h3>
            <p className="text-xs text-[#475569] font-semibold">
              MRV Specialists + BEE / CCTS Accredited Independent Verification Agencies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usersData.reviewers.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-black text-[#0F172A]">{rev.name}</h4>
                    <p className="text-xs text-[#2D6A4F] font-bold">{rev.role}</p>
                    <p className="text-[11px] text-[#475569] font-medium">{rev.organization}</p>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full badge-sky-tint">
                    {rev.status}
                  </span>
                </div>

                <div className="text-[11px] p-2 rounded-xl bg-white border border-[#D6CBC0] text-[#334155] font-semibold">
                  {rev.accreditation}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-[#475569]">
                    Assigned: <strong>{rev.assignedProjects} Projects</strong>
                  </span>
                  <span className="badge-warning-tint px-2 py-0.5 rounded-full text-[10px] font-black">
                    {rev.pendingReviews} Audits Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB 6: ROLES & RBAC POLICY MATRIX (PRD §11 & §13 Module A03) */}
      {activeTab === 'roles-rbac' && (
        <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black text-[#0F172A] tracking-tight">
              Roles &amp; Permissions RBAC Policy Matrix (PRD §11 &amp; §13 Module A03)
            </h3>
            <p className="text-xs text-[#475569] font-semibold">
              Platform security scopes enforced across Super Admin, Organization Admin, MRV Specialist, and ACVA Verifier
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#334155] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Platform Module</th>
                  <th className="p-3.5">Super Admin (A01)</th>
                  <th className="p-3.5">Org Admin (FPO/NGO)</th>
                  <th className="p-3.5">MRV Specialist</th>
                  <th className="p-3.5">ACVA Verifier (A16)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFD5]">
                {usersData.rbacMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F9F6F1] transition-colors">
                    <td className="p-3.5 font-black text-[#0F172A]">{row.module}</td>
                    <td className="p-3.5">
                      <span className="badge-mint-tint px-2.5 py-0.5 rounded-full text-[10px] font-black">
                        {row.superAdmin}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="badge-sky-tint px-2.5 py-0.5 rounded-full text-[10px] font-black">
                        {row.orgAdmin}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="badge-warning-tint px-2.5 py-0.5 rounded-full text-[10px] font-black">
                        {row.mrvSpecialist}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="badge-mint-tint px-2.5 py-0.5 rounded-full text-[10px] font-black">
                        {row.acvaVerifier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. Slide-over Comprehensive Detail Drawer (PRD §4.1 - §4.3 & §20 Core Data Relationship) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-5 border-l border-[#E2DDD5]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE4DC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold shadow-2xs">
                  <UserCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#0F172A]">{selectedUser.name}</h4>
                  <p className="text-xs font-mono text-[#475569] font-bold">
                    {selectedUser.id} • {selectedUser.role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE9E0] border border-[#E2DDD5] flex items-center justify-center text-[#334155] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Pill & Approval Gate Actions */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B]">Universal Approval Gate:</span>
                {renderStatusBadge(selectedUser.universalStatus)}
              </div>

              {/* Action Buttons in Drawer (Strictly Icon Only) */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {selectedUser.universalStatus !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleApproveUser(selectedUser.id)}
                    title="Approve User (KYC_APPROVED)"
                    className="w-9 h-9 rounded-xl bg-[#2D6A4F] hover:bg-[#1E4D39] text-white cursor-pointer shadow-xs transition-colors flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenActionModal('clarify', selectedUser.id)}
                  title="Request Clarification (KYC_CLARIFICATION)"
                  className="w-9 h-9 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                >
                  <HelpCircle className="w-4 h-4 stroke-[2.2]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenActionModal('reject', selectedUser.id)}
                  title="Reject Submission (KYC_REJECTED)"
                  className="w-9 h-9 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                >
                  <XCircle className="w-4 h-4 stroke-[2.2]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSuspendUser(selectedUser.id)}
                  title={selectedUser.universalStatus === 'SUSPENDED' ? 'Restore User Access' : 'Suspend User Account'}
                  className={`w-9 h-9 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${
                    selectedUser.universalStatus === 'SUSPENDED'
                      ? 'bg-[#F0FDF4] hover:bg-[#DCFCE7] border-[#BBF7D0] text-[#15803D]'
                      : 'bg-white hover:bg-[#FAF8F5] border-[#D6CBC0] text-[#334155]'
                  }`}
                >
                  {selectedUser.universalStatus === 'SUSPENDED' ? (
                    <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                  ) : (
                    <Ban className="w-4 h-4 stroke-[2.2]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setUserToDelete(selectedUser)}
                  title="Permanently Delete User Account"
                  className="w-9 h-9 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Section 4.1 F06 Profile */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#0F172A]">
                <FileText className="w-4 h-4 text-[#2D6A4F]" />
                <span>F06 Profile Information</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D6CBC0] space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      Full Name
                    </span>
                    <span className="font-black text-[#0F172A]">{selectedUser.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      Mobile / Phone
                    </span>
                    <span className="font-bold text-[#0F172A]">{selectedUser.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      DOB / Age
                    </span>
                    <span className="font-bold text-[#0F172A]">
                      {selectedUser.dob} ({selectedUser.age} yrs)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      Registered Date
                    </span>
                    <span className="font-bold text-[#0F172A]">
                      {selectedUser.registeredDate}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8DFD3]">
                  <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                    Location Address
                  </span>
                  <span className="font-black text-[#0F172A]">
                    {selectedUser.location.village}, {selectedUser.location.district},{' '}
                    {selectedUser.location.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4.2 F07 KYC & DPDP Consent Gate */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#0F172A]">
                <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                <span>F07 KYC Verification &amp; DPDP Consent Gate</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D6CBC0] space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                    Document Type &amp; Number
                  </span>
                  <p className="font-black text-[#0F172A]">
                    {selectedUser.kyc.documentType} •{' '}
                    <span className="font-mono">{selectedUser.kyc.documentNumber}</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#D6CBC0] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#0A3B2F] font-black text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Mandatory DPDP 2025 Consent Verified</span>
                  </div>
                  <p className="text-[10px] text-[#475569]">
                    Version: {selectedUser.kyc.consentVersion} • Recorded:{' '}
                    {selectedUser.kyc.consentTimestamp}
                  </p>
                </div>

                {selectedUser.kyc.clarificationQuestion && (
                  <div className="p-2.5 rounded-xl bg-[#FFF9E6] border border-[#F6D06F] space-y-1 text-xs">
                    <span className="font-bold text-[#8A5E00] block">
                      Active Clarification Question:
                    </span>
                    <p className="text-[11px] text-[#5D2702]">
                      {selectedUser.kyc.clarificationQuestion}
                    </p>
                  </div>
                )}

                {selectedUser.kyc.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-[#FFF0F0] border border-[#F5A6A6] space-y-1 text-xs">
                    <span className="font-bold text-[#8A1F1F] block">
                      Rejection Reason (Mandatory):
                    </span>
                    <p className="text-[11px] text-[#6C0606]">
                      {selectedUser.kyc.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="text-[11px] text-[#475569]">
                  <strong>Admin Note:</strong> {selectedUser.kyc.adminDecisionNote}
                </div>
              </div>
            </div>

            {/* Section 4.3 F08 Payout / Bank Profile */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#0F172A]">
                <CreditCard className="w-4 h-4 text-[#2D6A4F]" />
                <span>F08 Bank &amp; Payout Profile</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D6CBC0] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#0F172A]">
                    {selectedUser.payoutProfile.bankName}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      selectedUser.payoutProfile.status === 'VERIFIED'
                        ? 'badge-mint-tint'
                        : 'badge-warning-tint'
                    }`}
                  >
                    {selectedUser.payoutProfile.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold block">
                      Account Holder
                    </span>
                    <span className="font-bold text-[#0F172A]">
                      {selectedUser.payoutProfile.accountHolder}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold block">
                      Masked Account
                    </span>
                    <span className="font-mono font-bold text-[#0F172A]">
                      {selectedUser.payoutProfile.accountNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold block">
                      IFSC Code
                    </span>
                    <span className="font-mono font-bold text-[#0F172A]">
                      {selectedUser.payoutProfile.ifsc}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold block">
                      Branch
                    </span>
                    <span className="font-bold text-[#0F172A]">
                      {selectedUser.payoutProfile.branch}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5 Lands & Section 6 Projects (If Farmer) */}
            {selectedUser.roleCode === 'FARMER' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#0F172A]">
                  <Layers className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Associated Lands (F10) &amp; Projects (F14)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D6CBC0] space-y-2 text-xs">
                  {selectedUser.lands.map((land) => (
                    <div
                      key={land.landId}
                      className="p-2.5 rounded-xl bg-white border border-[#D6CBC0] space-y-1"
                    >
                      <div className="flex items-center justify-between font-black text-[#0F172A]">
                        <span>{land.name}</span>
                        <span className="text-[#2D6A4F]">
                          {land.gisCalculatedArea} {land.unit}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#475569]">
                        Survey / Khasra: {land.surveyNumber} • {land.ownershipType} • Crop:{' '}
                        {land.currentCrop}
                      </p>
                    </div>
                  ))}

                  {selectedUser.projects.map((proj) => (
                    <div
                      key={proj.projectId}
                      className="p-2.5 rounded-xl bg-white border border-[#D6CBC0] space-y-1"
                    >
                      <div className="flex items-center justify-between font-black text-[#0F172A]">
                        <span>{proj.name}</span>
                        <span className="badge-sky-tint px-2 py-0.2 rounded-full text-[10px]">
                          {proj.typeLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#475569]">
                        Stage: {proj.stage} • Target: {proj.targetImpact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 15.1 Immutable Audit Trail (Traceability) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-[#0F172A]">
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Immutable Audit Trail (PRD §15.1 &amp; §28)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenActionModal('note', selectedUser.id)}
                  className="text-[11px] text-[#2D6A4F] hover:underline cursor-pointer"
                >
                  + Add Note
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D6CBC0] space-y-2 text-xs">
                {selectedUser.auditTrail.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-[#E8DFD3] space-y-0.5 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#0A3B2F]">
                        [{log.action}] {log.performedBy}
                      </span>
                      <span className="text-[10px] text-[#64748B]">{log.timestamp}</span>
                    </div>
                    <p className="text-[#334155]">{log.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#D6CBC0]">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1E4D39] text-white text-xs font-black cursor-pointer shadow-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Universal Approval Gate Action Modals (Clarify / Reject / Note) */}
      {modalAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#E2DDD5] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D6CBC0]">
              <h4 className="text-base font-black text-[#0F172A]">
                {modalAction === 'clarify' && 'Request Clarification (KYC_CLARIFICATION)'}
                {modalAction === 'reject' && 'Reject Submission (KYC_REJECTED)'}
                {modalAction === 'note' && 'Add Internal Admin Audit Note'}
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
              {modalAction === 'clarify' &&
                'Enter the specific question or missing document required. The user will be notified and can resolve the request directly.'}
              {modalAction === 'reject' &&
                'PRD Section 2 Mandate: A clear rejection reason code and explanation is required so the user can edit and resubmit.'}
              {modalAction === 'note' &&
                'Enter internal governance or review notes to append to the immutable audit trail.'}
            </p>

            <div>
              <label className="text-[11px] font-bold text-[#0F172A] block mb-1">
                {modalAction === 'clarify'
                  ? 'Clarification Question'
                  : modalAction === 'reject'
                  ? 'Mandatory Rejection Reason'
                  : 'Internal Note'}
              </label>
              <textarea
                rows={3}
                value={modalInputText}
                onChange={(e) => setModalInputText(e.target.value)}
                placeholder={
                  modalAction === 'clarify'
                    ? 'e.g., Please upload clear back side of document...'
                    : modalAction === 'reject'
                    ? 'e.g., Document is expired or name does not match revenue record...'
                    : 'e.g., Cross-verified with state portal...'
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
                disabled={!modalInputText.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5 cursor-pointer shadow-xs ${
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

      {/* 11. Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#FECACA] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D6CBC0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] flex items-center justify-center font-black">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h4 className="text-base font-black text-[#0F172A]">
                  Delete User Account?
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="w-8 h-8 rounded-xl bg-[#F5EFEB] hover:bg-[#EAE0D3] flex items-center justify-center text-[#334155] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              Are you sure you want to permanently delete user{' '}
              <strong className="text-[#0F172A]">{userToDelete.name}</strong> ({userToDelete.role}) with ID{' '}
              <code className="bg-[#FAF7F2] px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-[#991B1B] border border-[#FCA5A5]">
                {userToDelete.id}
              </code>
              ? This action will remove their credentials, linked assets, and platform privileges.
            </p>

            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl text-[11px] text-[#991B1B] font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Permanent action: Associated roles and login pins will immediately be revoked.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D6CBC0]">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#475569] hover:bg-[#F3EDE4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-[#C53030] hover:bg-[#9B2C2C] flex items-center gap-1.5 cursor-pointer shadow-xs"
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
