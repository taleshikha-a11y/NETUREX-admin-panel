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
  RotateCcw,
  Trash2,
  Eye,
  UserPlus,
  Check,
  XCircle,
  FileCheck,
  Building,
  Briefcase,
  Shield,
} from 'lucide-react'
import usersData from '../data/usersData.json'
import CustomDropdown, { type DropdownOption } from './CustomDropdown'

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

export interface DocumentItem {
  id: string
  title: string
  category: string
  fileName: string
  uploadDate: string
  size: string
  authority: string
  verified: boolean
}

export interface OrganizationRecord {
  id: string
  name: string
  type: string
  registrationNo: string
  headquarters: string
  status: string
  farmersCount: number
  managedAcreage: string
  projectsCount: number
  contactPerson: string
  onboardedDate: string
  email?: string
  phone?: string
  gstNumber?: string
  documents: DocumentItem[]
  auditTrail: {
    timestamp: string
    action: string
    performedBy: string
    note: string
  }[]
}

export interface FieldAgentRecord {
  id: string
  name: string
  phone: string
  assignedRegion: string
  organization: string
  activeVisits: number
  completedVisits: number
  syncStatus: string
  syncState: string
  appVersion: string
  lastActive: string
  status: string
  documents: DocumentItem[]
  auditTrail: {
    timestamp: string
    action: string
    performedBy: string
    note: string
  }[]
}

export interface ReviewerRecord {
  id: string
  name: string
  role: string
  organization: string
  accreditation: string
  assignedProjects: number
  pendingReviews: number
  status: string
  documents: DocumentItem[]
  auditTrail: {
    timestamp: string
    action: string
    performedBy: string
    note: string
  }[]
}

export interface InspectionDocModal {
  id: string
  title: string
  category: string
  fileName: string
  authority: string
  size: string
  entityName: string
  entityId: string
  entityRole: string
  verified: boolean
}

export interface DeleteTargetModal {
  type: 'user' | 'org' | 'agent' | 'reviewer'
  id: string
  name: string
  subtitle: string
}

function getUserDocuments(
  user: UserRecord,
  isDocVerified: (id: string, defaultVal: boolean) => boolean
): DocumentItem[] {
  const isApproved = user.universalStatus === 'APPROVED' || user.kyc.status === 'APPROVED'
  return [
    {
      id: `${user.id}_doc_front`,
      title: `${user.kyc.documentType} (Front Copy)`,
      category: 'Government National Identity Proof',
      fileName: user.kyc.frontUpload,
      uploadDate: user.registeredDate,
      size: '2.4 MB',
      authority: 'Govt. of India UIDAI / Revenue Authority',
      verified: isDocVerified(`${user.id}_doc_front`, isApproved),
    },
    {
      id: `${user.id}_doc_back`,
      title: `${user.kyc.documentType} (Back / Address Proof)`,
      category: 'Jurisdictional & Address Proof',
      fileName: user.kyc.backUpload,
      uploadDate: user.registeredDate,
      size: '1.9 MB',
      authority: 'Govt. of India UIDAI / State Revenue Desk',
      verified: isDocVerified(`${user.id}_doc_back`, isApproved),
    },
    {
      id: `${user.id}_doc_land`,
      title:
        user.roleCode === 'FARMER'
          ? 'Revenue Land Record & Khasra Passbook'
          : 'Official Role Appointment Charter',
      category:
        user.roleCode === 'FARMER' ? 'Land Freehold Verification' : 'Organizational Scope',
      fileName:
        user.roleCode === 'FARMER' ? 'khasra_b1_passbook_extract.pdf' : 'appointment_letter.pdf',
      uploadDate: user.registeredDate,
      size: '3.6 MB',
      authority:
        user.roleCode === 'FARMER'
          ? 'State Dept. of Land Records (AnyRoR / Bhulekh)'
          : 'NATUREX Institutional Trust Desk',
      verified: isDocVerified(`${user.id}_doc_land`, isApproved),
    },
    {
      id: `${user.id}_doc_dpdp`,
      title: 'DPDP Act 2025 Digital Data Consent Certificate',
      category: 'Data Privacy & Rights Mandate',
      fileName: 'naturex_dpdp_consent_audit.pdf',
      uploadDate: user.kyc.consentTimestamp?.slice(0, 10) || user.registeredDate,
      size: '850 KB',
      authority: `Digital Personal Data Protection Registry (${user.kyc.consentVersion})`,
      verified: isDocVerified(`${user.id}_doc_dpdp`, user.kyc.consentChecked),
    },
  ]
}


// Minimal, elegant status pill with indicator dot - calm & uncongested
function renderStatusBadge(status: string) {
  const norm = (status || '').toUpperCase()
  if (norm === 'APPROVED' || norm === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#5E8256] flex-shrink-0" />
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

const roleFilterOptions: DropdownOption[] = [
  { value: 'ALL', label: 'All Roles', dotColor: '#8D4E22', badge: 'All' },
  { value: 'FARMER', label: 'Farmers & Landowners', dotColor: '#5E8256', badge: 'Producer' },
  { value: 'ORG_ADMIN', label: 'Organization Admins', dotColor: '#8D4E22', badge: 'Admin' },
  { value: 'FIELD_AGENT', label: 'Field Agents', dotColor: '#3E5F36', badge: 'Field' },
  { value: 'MRV_SPECIALIST', label: 'MRV Specialists', dotColor: '#0284C7', badge: 'Tech' },
  { value: 'ACVA_VERIFIER', label: 'ACVA Verifiers', dotColor: '#7C3AED', badge: 'Audit' },
]

const statusFilterOptions: DropdownOption[] = [
  { value: 'ALL', label: 'All Statuses', dotColor: '#8D4E22' },
  { value: 'APPROVED', label: 'APPROVED (Gate Passed)', dotColor: '#5E8256', badge: 'Active' },
  { value: 'SUBMITTED', label: 'SUBMITTED (Waiting Review)', dotColor: '#0284C7', badge: 'Review' },
  { value: 'CLARIFICATION', label: 'CLARIFICATION (Info Required)', dotColor: '#D97706', badge: 'Pending' },
  { value: 'REJECTED', label: 'REJECTED (Failed Review)', dotColor: '#DC2626', badge: 'Failed' },
  { value: 'SUSPENDED', label: 'SUSPENDED (Blocked)', dotColor: '#64748B', badge: 'Hold' },
]

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

  // Slide-over Drawer States for each entity
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [selectedOrg, setSelectedOrg] = useState<OrganizationRecord | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<FieldAgentRecord | null>(null)
  const [selectedReviewer, setSelectedReviewer] = useState<ReviewerRecord | null>(null)

  // Document Inspection Modal State
  const [inspectingDoc, setInspectingDoc] = useState<InspectionDocModal | null>(null)

  // Document Verification State: mapping docId -> verified boolean
  const [verifiedDocs, setVerifiedDocs] = useState<Record<string, boolean>>({})

  const isDocVerified = (docId: string, defaultVal: boolean) => {
    if (typeof verifiedDocs[docId] === 'boolean') {
      return verifiedDocs[docId]
    }
    return defaultVal
  }

  const toggleDocVerified = (docId: string, currentVal: boolean) => {
    setVerifiedDocs((prev) => ({
      ...prev,
      [docId]: !currentVal,
    }))
  }

  // Organizations Reactive State
  const [orgList, setOrgList] = useState<OrganizationRecord[]>(() =>
    usersData.organizations.map((org) => ({
      ...org,
      email: `${org.id.toLowerCase()}@partner.naturex.io`,
      phone: '+91 755 244 8912',
      gstNumber: `23AAACN${org.id.slice(-4)}1Z5`,
      documents: [
        {
          id: `${org.id}_doc_mca`,
          title: 'Certificate of Incorporation (MCA)',
          category: 'Legal Entity Registration',
          fileName: `${org.id.toLowerCase()}_incorporation.pdf`,
          uploadDate: org.onboardedDate,
          size: '2.8 MB',
          authority: 'Ministry of Corporate Affairs, Govt of India',
          verified: org.status === 'APPROVED',
        },
        {
          id: `${org.id}_doc_gst`,
          title: 'GSTIN & PAN Registration Certificate',
          category: 'Tax & Statutory Compliance',
          fileName: `${org.id.toLowerCase()}_gstin_pan.pdf`,
          uploadDate: org.onboardedDate,
          size: '1.4 MB',
          authority: 'Central Board of Indirect Taxes & Customs',
          verified: org.status === 'APPROVED',
        },
        {
          id: `${org.id}_doc_board`,
          title: 'Board Resolution & Signatory Mandate',
          category: 'Corporate Governance',
          fileName: `${org.id.toLowerCase()}_board_resolution.pdf`,
          uploadDate: org.onboardedDate,
          size: '890 KB',
          authority: 'Governing Board / Management Committee',
          verified: org.status === 'APPROVED',
        },
        {
          id: `${org.id}_doc_dpdp`,
          title: 'DPDP Act 2025 Institutional Data Agreement',
          category: 'Privacy & Governance Schedule',
          fileName: 'naturex_dpdp_fpo_schedule.pdf',
          uploadDate: org.onboardedDate,
          size: '1.1 MB',
          authority: 'NATUREX Institutional Trust Registry',
          verified: true,
        },
      ],
      auditTrail: [
        {
          timestamp: '2025-11-10 10:30',
          action: 'REGISTER',
          performedBy: `${org.contactPerson}`,
          note: 'Organization onboarded and legal charter submitted.',
        },
        ...(org.status === 'APPROVED'
          ? [
              {
                timestamp: '2025-11-12 16:45',
                action: 'APPROVE',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: 'MCA Incorporation and GST verified. Approved as official platform partner.',
              },
            ]
          : []),
      ],
    }))
  )

  // Field Agents Reactive State
  const [fieldAgentList, setFieldAgentList] = useState<FieldAgentRecord[]>(() =>
    usersData.fieldAgents.map((agent) => ({
      ...agent,
      status: 'APPROVED',
      documents: [
        {
          id: `${agent.id}_doc_badge`,
          title: 'Field Agent Identity Card & Ground Badge',
          category: 'Official Field Credential',
          fileName: `${agent.id.toLowerCase()}_official_badge.jpg`,
          uploadDate: '12 Jan 2026',
          size: '1.2 MB',
          authority: 'NATUREX Operations & Field Command',
          verified: true,
        },
        {
          id: `${agent.id}_doc_survey`,
          title: 'Ground Surveyor & GPS Certification',
          category: 'Technical Accreditation',
          fileName: `${agent.id.toLowerCase()}_surveyor_cert.pdf`,
          uploadDate: '12 Jan 2026',
          size: '3.1 MB',
          authority: 'National Institute of Agricultural Surveying',
          verified: true,
        },
        {
          id: `${agent.id}_doc_police`,
          title: 'Police Verification & Background Record',
          category: 'Security Clearance',
          fileName: `${agent.id.toLowerCase()}_police_clearance.pdf`,
          uploadDate: '10 Jan 2026',
          size: '950 KB',
          authority: 'District Police Department',
          verified: true,
        },
        {
          id: `${agent.id}_doc_dpdp`,
          title: 'DPDP 2025 Ground Enumerator Oath',
          category: 'Privacy & Data Protection',
          fileName: 'agent_dpdp_compliance.pdf',
          uploadDate: '12 Jan 2026',
          size: '640 KB',
          authority: 'DPDP Compliance Cell',
          verified: true,
        },
      ],
      auditTrail: [
        {
          timestamp: '2026-01-12 09:00',
          action: 'REGISTER',
          performedBy: 'Operations Command',
          note: `Field agent registered and assigned to ${agent.assignedRegion}.`,
        },
        {
          timestamp: '2026-01-12 14:20',
          action: 'APPROVE',
          performedBy: 'Super Admin (admin@naturex.io)',
          note: 'Ground surveyor certifications validated. Offline sync activated.',
        },
      ],
    }))
  )

  // Reviewers & Verifiers Reactive State
  const [reviewerList, setReviewerList] = useState<ReviewerRecord[]>(() =>
    usersData.reviewers.map((rev) => ({
      ...rev,
      status:
        rev.status === 'Active' || rev.status === 'Independent Auditor'
          ? 'APPROVED'
          : rev.status,
      documents: [
        {
          id: `${rev.id}_doc_bee`,
          title: 'BEE / CCTS Accredited Independent Agency License',
          category: 'Statutory Verification License',
          fileName: `${rev.id.toLowerCase()}_bee_ccts_license.pdf`,
          uploadDate: '01 Aug 2025',
          size: '4.2 MB',
          authority: 'Bureau of Energy Efficiency (BEE) / CCTS Council',
          verified: true,
        },
        {
          id: `${rev.id}_doc_iso`,
          title: 'ISO 14064-3 GHG Lead Assessor Certificate',
          category: 'Auditor Technical Competence',
          fileName: `${rev.id.toLowerCase()}_iso_cert.pdf`,
          uploadDate: '01 Aug 2025',
          size: '2.1 MB',
          authority: 'International GHG Accreditation Forum',
          verified: true,
        },
        {
          id: `${rev.id}_doc_ndc`,
          title: 'Non-Disclosure & Anti-Conflict Statement',
          category: 'Legal Independence & Ethics',
          fileName: `${rev.id.toLowerCase()}_conflict_statement.pdf`,
          uploadDate: '01 Aug 2025',
          size: '1.5 MB',
          authority: 'NATUREX Independent Review Protocol',
          verified: true,
        },
      ],
      auditTrail: [
        {
          timestamp: '2025-08-01 10:00',
          action: 'REGISTER',
          performedBy: 'NATUREX Verification Desk',
          note: 'Reviewer accreditation dossier received.',
        },
        {
          timestamp: '2025-08-03 11:30',
          action: 'APPROVE',
          performedBy: 'Super Admin (admin@naturex.io)',
          note: 'Statutory BEE credentials verified. Independent sign-off authority granted.',
        },
      ],
    }))
  )

  // Modals for Universal Approval Gate actions (PRD Page 2 & Page 10)
  const [modalAction, setModalAction] = useState<'clarify' | 'reject' | 'note' | null>(null)
  const [modalTargetUserId, setModalTargetUserId] = useState<string | null>(null)
  const [modalInputText, setModalInputText] = useState('')

  // Universal Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<DeleteTargetModal | null>(null)

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    const { type, id } = deleteTarget

    if (type === 'user') {
      setUserList((prev) => prev.filter((u) => u.id !== id))
      if (selectedUser?.id === id) setSelectedUser(null)
    } else if (type === 'org') {
      setOrgList((prev) => prev.filter((o) => o.id !== id))
      if (selectedOrg?.id === id) setSelectedOrg(null)
    } else if (type === 'agent') {
      setFieldAgentList((prev) => prev.filter((a) => a.id !== id))
      if (selectedAgent?.id === id) setSelectedAgent(null)
    } else if (type === 'reviewer') {
      setReviewerList((prev) => prev.filter((r) => r.id !== id))
      if (selectedReviewer?.id === id) setSelectedReviewer(null)
    }

    setDeleteTarget(null)
  }

  // Handle Universal Approval Gate Decisions for Users
  const handleApproveUser = (userId: string) => {
    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          // Mark documents verified
          const userDocs = getUserDocuments(u, isDocVerified)
          userDocs.forEach((doc) => {
            setVerifiedDocs((vPrev) => ({ ...vPrev, [doc.id]: true }))
          })

          const updated = {
            ...u,
            universalStatus: 'APPROVED',
            kyc: {
              ...u.kyc,
              status: 'APPROVED',
              adminDecisionNote: 'All uploaded KYC documents verified. Gate passed by Super Admin.',
              clarificationQuestion: null,
              rejectionReason: null,
            },
            auditTrail: [
              ...u.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                action: 'APPROVE',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: 'KYC_APPROVED. Payout profile and Land registration unlocked after document verification.',
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

  // Handle Organization Approval & Suspend
  const handleApproveOrg = (orgId: string) => {
    setOrgList((prev) =>
      prev.map((org) => {
        if (org.id === orgId) {
          const updated = {
            ...org,
            status: 'APPROVED',
            documents: org.documents.map((d) => {
              setVerifiedDocs((vPrev) => ({ ...vPrev, [d.id]: true }))
              return { ...d, verified: true }
            }),
            auditTrail: [
              ...org.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                action: 'APPROVE',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: 'MCA Incorporation and GST verified. Organization approved.',
              },
            ],
          }
          if (selectedOrg?.id === orgId) setSelectedOrg(updated)
          return updated
        }
        return org
      })
    )
  }

  const handleSuspendOrg = (orgId: string) => {
    setOrgList((prev) =>
      prev.map((org) => {
        if (org.id === orgId) {
          const isSuspended = org.status === 'SUSPENDED'
          const newStatus = isSuspended ? 'APPROVED' : 'SUSPENDED'
          const updated = {
            ...org,
            status: newStatus,
            auditTrail: [
              ...org.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                action: isSuspended ? 'APPROVE' : 'SUSPEND',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: isSuspended
                  ? 'Organization access restored by Super Admin.'
                  : 'Organization suspended under Section 13 Governance Gate.',
              },
            ],
          }
          if (selectedOrg?.id === orgId) setSelectedOrg(updated)
          return updated
        }
        return org
      })
    )
  }

  // Handle Field Agent Approval & Suspend
  const handleApproveAgent = (agentId: string) => {
    setFieldAgentList((prev) =>
      prev.map((agent) => {
        if (agent.id === agentId) {
          const updated = {
            ...agent,
            status: 'APPROVED',
            documents: agent.documents.map((d) => {
              setVerifiedDocs((vPrev) => ({ ...vPrev, [d.id]: true }))
              return { ...d, verified: true }
            }),
            auditTrail: [
              ...agent.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                action: 'APPROVE',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: 'Field Agent credentials & surveyor license verified.',
              },
            ],
          }
          if (selectedAgent?.id === agentId) setSelectedAgent(updated)
          return updated
        }
        return agent
      })
    )
  }

  const handleSuspendAgent = (agentId: string) => {
    setFieldAgentList((prev) =>
      prev.map((agent) => {
        if (agent.id === agentId) {
          const isSuspended = agent.status === 'SUSPENDED'
          const newStatus = isSuspended ? 'APPROVED' : 'SUSPENDED'
          const updated = {
            ...agent,
            status: newStatus,
            auditTrail: [
              ...agent.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                action: isSuspended ? 'APPROVE' : 'SUSPEND',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: isSuspended
                  ? 'Field Agent app sync restored.'
                  : 'Field Agent access temporarily suspended.',
              },
            ],
          }
          if (selectedAgent?.id === agentId) setSelectedAgent(updated)
          return updated
        }
        return agent
      })
    )
  }

  // Handle Reviewer Approval & Suspend
  const handleApproveReviewer = (revId: string) => {
    setReviewerList((prev) =>
      prev.map((rev) => {
        if (rev.id === revId) {
          const updated = {
            ...rev,
            status: 'APPROVED',
            documents: rev.documents.map((d) => {
              setVerifiedDocs((vPrev) => ({ ...vPrev, [d.id]: true }))
              return { ...d, verified: true }
            }),
            auditTrail: [
              ...rev.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                action: 'APPROVE',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: 'BEE / CCTS accreditation verified. Independent auditor sign-off active.',
              },
            ],
          }
          if (selectedReviewer?.id === revId) setSelectedReviewer(updated)
          return updated
        }
        return rev
      })
    )
  }

  const handleSuspendReviewer = (revId: string) => {
    setReviewerList((prev) =>
      prev.map((rev) => {
        if (rev.id === revId) {
          const isSuspended = rev.status === 'SUSPENDED'
          const newStatus = isSuspended ? 'APPROVED' : 'SUSPENDED'
          const updated = {
            ...rev,
            status: newStatus,
            auditTrail: [
              ...rev.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                action: isSuspended ? 'APPROVE' : 'SUSPEND',
                performedBy: 'Super Admin (admin@naturex.io)',
                note: isSuspended
                  ? 'Reviewer credentials restored.'
                  : 'Reviewer signing authority suspended.',
              },
            ],
          }
          if (selectedReviewer?.id === revId) setSelectedReviewer(updated)
          return updated
        }
        return rev
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
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${activeTab === 'all-users' ? 'ring-2 ring-[#8D4E22] border-[#8D4E22]' : ''
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B50]">Total Platform Users</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#18221B]">
              {usersData.summaryStats.totalUsers.count}
            </span>
            <span className="text-[11px] font-bold text-[#8D4E22]">
              {usersData.summaryStats.totalUsers.growthThisMonth} active
            </span>
          </div>
          <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
            <span>{usersData.summaryStats.totalUsers.activeCount} Active</span>
            <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
              Master A02 Directory
            </span>
          </div>
        </div>

        {/* Farmers & Landowners KPI */}
        <div
          onClick={() => handleTabChange('farmers')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${activeTab === 'farmers' ? 'ring-2 ring-[#8D4E22] border-[#8D4E22]' : ''
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B50]">Farmers &amp; Landowners</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
              <UserCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#18221B]">
              {usersData.summaryStats.totalFarmers.count}
            </span>
            <span className="text-[11px] font-bold text-[#8D4E22]">
              {usersData.summaryStats.totalFarmers.verificationRate} KYC Verified
            </span>
          </div>
          <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
            <span>{usersData.summaryStats.totalFarmers.totalAcreage}</span>
            <span className="badge-warning-tint px-2 py-0.5 rounded-full text-[10px]">
              {usersData.summaryStats.totalFarmers.pendingKyc} Pending KYC
            </span>
          </div>
        </div>

        {/* Organizations KPI */}
        <div
          onClick={() => handleTabChange('organizations')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${activeTab === 'organizations' ? 'ring-2 ring-[#8D4E22] border-[#8D4E22]' : ''
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B50]">Organizations (FPO/NGO)</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
              <Building2 className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#18221B]">
              {usersData.summaryStats.totalOrganizations.count}
            </span>
            <span className="text-[11px] font-bold text-[#8D4E22]">
              {usersData.summaryStats.totalOrganizations.fpoCount} FPOs
            </span>
          </div>
          <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
            <span>{usersData.summaryStats.totalOrganizations.ngoCount} NGOs</span>
            <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
              A04 Verified
            </span>
          </div>
        </div>

        {/* Field Agents & Verifiers KPI */}
        <div
          onClick={() => handleTabChange('field-agents')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${activeTab === 'field-agents' ? 'ring-2 ring-[#8D4E22] border-[#8D4E22]' : ''
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B50]">Field Agents &amp; Ops</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
              <Smartphone className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#18221B]">
              {usersData.summaryStats.totalFieldAgents.count}
            </span>
            <span className="text-[11px] font-bold text-[#8D4E22]">
              {usersData.summaryStats.totalFieldAgents.activeToday} in field
            </span>
          </div>
          <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
            <span>{usersData.summaryStats.totalFieldAgents.visitsCompletedMonth} visits</span>
            <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
              Sync Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Submodule Tab Bar Navigation (PRD Page 10 Section 15 Modules) */}
      <div className="bg-white border border-[#D19E77] rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => handleTabChange('all-users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'all-users'
            ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
            : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Users &amp; Directory</span>
          <span
            className={`text-[10px] px-2 py-0.2 rounded-full border ${activeTab === 'all-users'
              ? 'bg-[#6E3812] text-white border-white/20 font-black'
              : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
          >
            {userList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('farmers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'farmers'
            ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
            : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Farmers &amp; Landowners</span>
          <span
            className={`text-[10px] px-2 py-0.2 rounded-full border ${activeTab === 'farmers'
              ? 'bg-[#6E3812] text-white border-white/20 font-black'
              : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
          >
            {farmersOnlyList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('organizations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'organizations'
            ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
            : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Organizations</span>
          <span
            className={`text-[10px] px-2 py-0.2 rounded-full border ${activeTab === 'organizations'
              ? 'bg-[#6E3812] text-white border-white/20 font-black'
              : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
          >
            {usersData.organizations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('field-agents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'field-agents'
            ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
            : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Field Agents</span>
          <span
            className={`text-[10px] px-2 py-0.2 rounded-full border ${activeTab === 'field-agents'
              ? 'bg-[#6E3812] text-white border-white/20 font-black'
              : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
          >
            {usersData.fieldAgents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('reviewers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'reviewers'
            ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
            : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Reviewers &amp; ACVAs</span>
          <span
            className={`text-[10px] px-2 py-0.2 rounded-full border ${activeTab === 'reviewers'
              ? 'bg-[#6E3812] text-white border-white/20 font-black'
              : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
          >
            {usersData.reviewers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('roles-rbac')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'roles-rbac'
            ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
            : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Roles &amp; Permissions</span>
        </button>
      </div>

      {/* 3. TAB 1: ALL USERS & DIRECTORY (PRD Module A02) */}
      {activeTab === 'all-users' && (
        <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#18221B] tracking-tight">
                Master User Directory (PRD §15 Module A02)
              </h3>
              <p className="text-xs text-[#4A5B50] font-semibold">
                Centralized registry with Universal Approval Gate, DPDP 2025 consent verification, and scoped management
              </p>
            </div>

            {/* Controls: Search, Role Filter, Status Filter */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="bg-[#F5E5D5] border border-[#D8B293] rounded-xl px-3 py-1.5 flex items-center gap-2 w-56">
                <Search className="w-3.5 h-3.5 text-[#738679]" />
                <input
                  type="text"
                  placeholder="Search user, mobile, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-[#18221B] font-bold w-full placeholder:text-[#738679]"
                />
              </div>

              {/* Role Filter */}
              <CustomDropdown
                value={roleFilter}
                onChange={setRoleFilter}
                options={roleFilterOptions}
                className="w-48"
              />

              {/* Universal Gate Status Filter (PRD Page 2) */}
              <CustomDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusFilterOptions}
                className="w-60"
              />

              {onCreateUserClick && (
                <button
                  type="button"
                  onClick={onCreateUserClick}
                  className="px-3.5 py-1.5 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md transition-all border border-[#6E3812] active:scale-98"
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span> Create Role &amp; User</span>
                </button>
              )}
            </div>
          </div>

          {/* Master Users Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
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
                        <div className="font-black text-[#18221B] text-sm flex items-center gap-2">
                          <span>{user.name}</span>
                        </div>
                        <div className="text-[11px] font-mono text-[#4A5B50] font-bold">
                          {user.id} • {user.phone}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-3.5">
                        <span className="font-black text-[#18221B] block">
                          {user.role}
                        </span>
                        <span className="text-[10px] font-bold text-[#738679]">
                          Age: {user.age} • Reg: {user.registeredDate}
                        </span>
                      </td>

                      {/* Organization */}
                      <td className="p-3.5">
                        <div
                          className="font-bold text-[#18221B] max-w-xs truncate"
                          title={user.organization.name}
                        >
                          {user.organization.name}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6EFE4] text-[#3E5F36] font-bold border border-[#C1D6BD]">
                          {user.organization.type} • {user.organization.roleInOrg}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-[#18221B] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#8D4E22]" />
                          <span>
                            {user.location.district}, {user.location.state}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#4A5B50] font-medium">
                          {user.location.village}
                        </div>
                      </td>

                      {/* Universal Gate Status (PRD Page 2) */}
                      <td className="p-3.5">
                        {renderStatusBadge(user.universalStatus)}
                      </td>

                      {/* DPDP Consent */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#4A5B50] bg-[#F5E5D5] border border-[#D19E77] px-2.5 py-1 rounded-full">
                          <span className={`w-1.5 h-1.5 rounded-full ${user.kyc.consentChecked ? 'bg-[#5E8256]' : 'bg-[#F59E0B]'}`} />
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
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {/* 2. Approve Button */}
                          {user.universalStatus !== 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handleApproveUser(user.id)}
                              title="Approve User (KYC_APPROVED)"
                              className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          {/* 3. Reject / Clarify Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal('reject', user.id)}
                            title="Reject / Clarification"
                            className="w-7.5 h-7.5 rounded-xl bg-[#C49563] hover:bg-[#8D4E22] hover:text-white border border-[#8D4E22] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {/* 5. Suspend / Restore Button */}
                          <button
                            type="button"
                            onClick={() => handleSuspendUser(user.id)}
                            title={user.universalStatus === 'SUSPENDED' ? 'Restore User Access' : 'Suspend User Account'}
                            className={`w-7.5 h-7.5 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${user.universalStatus === 'SUSPENDED'
                              ? 'bg-[#E6EFE4] hover:bg-[#C1D6BD] border-[#BED2BB] text-[#3E5F36]'
                              : 'bg-[#B6814C] hover:bg-[#8D4E22] hover:text-white border border-[#8D4E22] text-[#2B1405]'
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
                            onClick={() =>
                              setDeleteTarget({
                                type: 'user',
                                id: user.id,
                                name: user.name,
                                subtitle: `${user.role} • ${user.location.district}, ${user.location.state}`,
                              })
                            }
                            title="Permanently Delete User Account"
                            className="w-7.5 h-7.5 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
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
        <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#18221B] tracking-tight">
                Farmers &amp; Landowners Directory (PRD §4 Complete Flow)
              </h3>
              <p className="text-xs text-[#4A5B50] font-semibold">
                F06 Profile → F07 KYC Gate → F08 Bank/Payout → F10 Land → F14 Projects
              </p>
            </div>

            <div className="text-xs font-bold text-[#4A5B50] bg-[#F5E5D5] border border-[#D19E77] px-3 py-1.5 rounded-xl">
              Showing {farmersOnlyList.length} Registered Landholders
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
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
                        <div className="font-black text-[#18221B] text-sm">
                          {farmer.name}
                        </div>
                        <div className="text-[11px] font-mono text-[#4A5B50] font-bold">
                          {farmer.id} • {farmer.phone}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-extrabold text-[#18221B]">
                          {farmer.location.village}, {farmer.location.district}
                        </div>
                        <div className="text-[10px] text-[#4A5B50] font-mono font-bold">
                          {farmer.lands[0]?.surveyNumber || 'Pending Land Survey'}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-black text-[#18221B] text-sm">
                          {farmer.lands[0]?.gisCalculatedArea || 0}
                        </span>{' '}
                        <span className="text-[11px] font-bold text-[#8D4E22]">Acres</span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B] mb-1">
                          {farmer.payoutProfile.bankName}
                        </div>
                        {renderStatusBadge(farmer.payoutProfile.status)}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B] mb-1">
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
                        <div
                          className="inline-flex items-center gap-1.5 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* 1. View Profile Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedUser(farmer)}
                            title="Review Full Profile, KYC & Verification Documents"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {/* 2. Approve Button */}
                          {farmer.universalStatus !== 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handleApproveUser(farmer.id)}
                              title="Approve Farmer (KYC_APPROVED)"
                              className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          {/* 3. Reject / Clarify Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal('reject', farmer.id)}
                            title="Reject / Clarification"
                            className="w-7.5 h-7.5 rounded-xl bg-[#C49563] hover:bg-[#8D4E22] hover:text-white border border-[#8D4E22] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {/* 5. Suspend / Restore Button */}
                          <button
                            type="button"
                            onClick={() => handleSuspendUser(farmer.id)}
                            title={
                              farmer.universalStatus === 'SUSPENDED'
                                ? 'Restore Farmer Access'
                                : 'Suspend Farmer Account'
                            }
                            className={`w-7.5 h-7.5 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${
                              farmer.universalStatus === 'SUSPENDED'
                                ? 'bg-[#E6EFE4] hover:bg-[#C1D6BD] border-[#BED2BB] text-[#3E5F36]'
                                : 'bg-[#B6814C] hover:bg-[#8D4E22] hover:text-white border border-[#8D4E22] text-[#2B1405]'
                            }`}
                          >
                            {farmer.universalStatus === 'SUSPENDED' ? (
                              <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                            ) : (
                              <Ban className="w-3.5 h-3.5 stroke-[2.2]" />
                            )}
                          </button>

                          {/* 6. Delete Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: 'user',
                                id: farmer.id,
                                name: farmer.name,
                                subtitle: `Farmer • ${farmer.location.village}, ${farmer.location.district}`,
                              })
                            }
                            title="Permanently Delete Farmer"
                            className="w-7.5 h-7.5 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
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

      {/* 5. TAB 3: ORGANIZATIONS (PRD §13 Module A04) */}
      {activeTab === 'organizations' && (
        <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black text-[#18221B] tracking-tight">
              Organizations Directory (PRD §13 Module A04)
            </h3>
            <p className="text-xs text-[#4A5B50] font-semibold">
              O01 Login → O02 Setup → O03 Legal Verification Gate → O04 Dashboard &amp; Farmers Portfolio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgList.map((org) => {
              return (
                <div
                  key={org.id}
                  onClick={() => setSelectedOrg(org)}
                  className="p-5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-3 hover:border-[#8D4E22] transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-[#18221B] group-hover:text-[#8D4E22] transition-colors">
                          {org.name}
                        </h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full badge-sky-tint">
                          {org.type}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[#4A5B50]">
                        {org.registrationNo} • {org.headquarters}
                      </p>
                    </div>

                    {renderStatusBadge(org.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8DFD3] text-center">
                    <div className="p-2 rounded-xl bg-white border border-[#D8B293]">
                      <span className="text-xs font-black text-[#18221B] block">
                        {org.farmersCount}
                      </span>
                      <span className="text-[10px] text-[#4A5B50] font-bold">Onboarded</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#D8B293]">
                      <span className="text-xs font-black text-[#18221B] block">
                        {org.managedAcreage}
                      </span>
                      <span className="text-[10px] text-[#4A5B50] font-bold">Total Acreage</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#D8B293]">
                      <span className="text-xs font-black text-[#18221B] block">
                        {org.projectsCount}
                      </span>
                      <span className="text-[10px] text-[#4A5B50] font-bold">Projects</span>
                    </div>
                  </div>

                  {/* Action Toolbar for Organization */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E8DFD3]">
                    <span className="text-[11px] text-[#4A5B50] font-bold">
                      Lead: <strong>{org.contactPerson}</strong>
                    </span>

                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* View Org Dossier & Documents */}
                      <button
                        type="button"
                        onClick={() => setSelectedOrg(org)}
                        title="View Org Dossier & Legal Verification Documents"
                        className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>

                      {/* Approve Button */}
                      {org.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleApproveOrg(org.id)}
                          title="Approve Legal Entity (ORG_APPROVED)"
                          className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}

                      {/* Suspend / Restore Button */}
                      <button
                        type="button"
                        onClick={() => handleSuspendOrg(org.id)}
                        title={
                          org.status === 'SUSPENDED'
                            ? 'Restore Organization'
                            : 'Suspend Organization'
                        }
                        className={`w-7.5 h-7.5 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${
                          org.status === 'SUSPENDED'
                            ? 'bg-[#E6EFE4] hover:bg-[#C1D6BD] border-[#BED2BB] text-[#3E5F36]'
                            : 'bg-white hover:bg-[#EDE8E1] border-[#D8B293] text-[#738679]'
                        }`}
                      >
                        {org.status === 'SUSPENDED' ? (
                          <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                        ) : (
                          <Ban className="w-3.5 h-3.5 stroke-[2.2]" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: 'org',
                            id: org.id,
                            name: org.name,
                            subtitle: `${org.type} • Reg: ${org.registrationNo}`,
                          })
                        }
                        title="Permanently Delete Organization"
                        className="w-7.5 h-7.5 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 6. TAB 4: FIELD AGENTS (PRD §14 Module A15) */}
      {activeTab === 'field-agents' && (
        <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#18221B] tracking-tight">
                Field Agents &amp; Ground Surveyors (PRD §14 Offline-First Engine)
              </h3>
              <p className="text-xs text-[#4A5B50] font-semibold">
                FA01 Login → FA02 Today Dashboard → FA06 Start Visit → FA10 Evidence Capture → FA16 Sync
              </p>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-full badge-mint-tint">
              68 Total Registered Agents
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldAgentList.map((agent) => {
              const isDanger = agent.syncState === 'danger'
              const isWarning = agent.syncState === 'warning'

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-5 rounded-2xl border space-y-3 transition-all cursor-pointer group hover:border-[#8D4E22] ${
                    isDanger
                      ? 'bg-[#C49563]/30 border-[#8D4E22]'
                      : isWarning
                        ? 'bg-[#FFFDF7] border-[#FEF08A]'
                        : 'bg-[#C49563]/20 border-[#8D4E22]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-[#18221B] group-hover:text-[#8D4E22] transition-colors">
                          {agent.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#4A5B50]">
                          {agent.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4A5B50] font-bold">
                        {agent.assignedRegion} • {agent.organization}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
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
                      {renderStatusBadge(agent.status)}
                    </div>
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
                    <span className="text-[11px] text-[#3E5F36] font-bold">
                      {agent.lastActive}
                    </span>
                  </div>

                  {/* Action Toolbar for Field Agent */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E8DFD3]">
                    <span className="text-[10px] text-[#738679] font-mono font-bold">
                      App: {agent.appVersion}
                    </span>

                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* View Profile */}
                      <button
                        type="button"
                        onClick={() => setSelectedAgent(agent)}
                        title="View Field Agent Profile & Certifications"
                        className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>

                      {/* Approve Button */}
                      {agent.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleApproveAgent(agent.id)}
                          title="Approve Field Agent (AGENT_ACTIVE)"
                          className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}

                      {/* Suspend / Restore Button */}
                      <button
                        type="button"
                        onClick={() => handleSuspendAgent(agent.id)}
                        title={
                          agent.status === 'SUSPENDED'
                            ? 'Restore Agent Access'
                            : 'Suspend Field Agent'
                        }
                        className={`w-7.5 h-7.5 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${
                          agent.status === 'SUSPENDED'
                            ? 'bg-[#E6EFE4] hover:bg-[#C1D6BD] border-[#BED2BB] text-[#3E5F36]'
                            : 'bg-white hover:bg-[#EDE8E1] border-[#D8B293] text-[#738679]'
                        }`}
                      >
                        {agent.status === 'SUSPENDED' ? (
                          <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                        ) : (
                          <Ban className="w-3.5 h-3.5 stroke-[2.2]" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: 'agent',
                            id: agent.id,
                            name: agent.name,
                            subtitle: `Field Agent • ${agent.assignedRegion}`,
                          })
                        }
                        title="Permanently Delete Field Agent"
                        className="w-7.5 h-7.5 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 7. TAB 5: REVIEWERS & VERIFIERS (PRD §11 & §16 Module A16) */}
      {activeTab === 'reviewers' && (
        <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black text-[#18221B] tracking-tight">
              Technical Reviewers &amp; Accredited Carbon Verifiers (ACVAs)
            </h3>
            <p className="text-xs text-[#4A5B50] font-semibold">
              MRV Specialists + BEE / CCTS Accredited Independent Verification Agencies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewerList.map((rev) => (
              <div
                key={rev.id}
                onClick={() => setSelectedReviewer(rev)}
                className="p-5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-2.5 cursor-pointer group hover:border-[#8D4E22] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-black text-[#18221B] group-hover:text-[#8D4E22] transition-colors">
                      {rev.name}
                    </h4>
                    <p className="text-xs text-[#8D4E22] font-bold">{rev.role}</p>
                    <p className="text-[11px] text-[#4A5B50] font-medium">{rev.organization}</p>
                  </div>
                  {renderStatusBadge(rev.status)}
                </div>

                <div className="text-[11px] p-2 rounded-xl bg-white border border-[#D8B293] text-[#4A5B50] font-semibold">
                  {rev.accreditation}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-[#4A5B50]">
                    Assigned: <strong>{rev.assignedProjects} Projects</strong>
                  </span>
                  <span className="badge-warning-tint px-2 py-0.5 rounded-full text-[10px] font-black">
                    {rev.pendingReviews} Audits Active
                  </span>
                </div>

                {/* Action Toolbar for Reviewer */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E8DFD3]">
                  <span className="text-[10px] font-mono text-[#738679] font-bold">
                    {rev.id}
                  </span>

                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* View Profile */}
                    <button
                      type="button"
                      onClick={() => setSelectedReviewer(rev)}
                      title="View Reviewer Dossier & Statutory Accreditations"
                      className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>

                    {/* Approve Button */}
                    {rev.status !== 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleApproveReviewer(rev.id)}
                        title="Approve Reviewer / Verifier"
                        className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    )}

                    {/* Suspend / Restore Button */}
                    <button
                      type="button"
                      onClick={() => handleSuspendReviewer(rev.id)}
                      title={
                        rev.status === 'SUSPENDED'
                          ? 'Restore Sign-off Rights'
                          : 'Suspend Sign-off Rights'
                      }
                      className={`w-7.5 h-7.5 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${
                        rev.status === 'SUSPENDED'
                          ? 'bg-[#E6EFE4] hover:bg-[#C1D6BD] border-[#BED2BB] text-[#3E5F36]'
                          : 'bg-white hover:bg-[#EDE8E1] border-[#D8B293] text-[#738679]'
                      }`}
                    >
                      {rev.status === 'SUSPENDED' ? (
                        <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                      ) : (
                        <Ban className="w-3.5 h-3.5 stroke-[2.2]" />
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: 'reviewer',
                          id: rev.id,
                          name: rev.name,
                          subtitle: `${rev.role} • ${rev.organization}`,
                        })
                      }
                      title="Permanently Delete Reviewer"
                      className="w-7.5 h-7.5 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB 6: ROLES & RBAC POLICY MATRIX (PRD §11 & §13 Module A03) */}
      {activeTab === 'roles-rbac' && (
        <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black text-[#18221B] tracking-tight">
              Roles &amp; Permissions RBAC Policy Matrix (PRD §11 &amp; §13 Module A03)
            </h3>
            <p className="text-xs text-[#4A5B50] font-semibold">
              Platform security scopes enforced across Super Admin, Organization Admin, MRV Specialist, and ACVA Verifier
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Platform Module</th>
                  <th className="p-3.5">Super Admin</th>
                  <th className="p-3.5">Org Admin (FPO/NGO)</th>
                  <th className="p-3.5">MRV Specialist</th>
                  <th className="p-3.5">ACVA Verifier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFD5]">
                {usersData.rbacMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F9F6F1] transition-colors">
                    <td className="p-3.5 font-black text-[#18221B]">{row.module}</td>
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
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-5 border-l border-[#D19E77]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE4DC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <UserCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">{selectedUser.name}</h4>
                  <p className="text-xs font-mono text-[#4A5B50] font-bold">
                    {selectedUser.id} • {selectedUser.role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#EFE9E0] border border-[#D19E77] flex items-center justify-center text-[#4A5B50] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Pill & Approval Gate Actions */}
            <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#738679]">Universal Approval Gate:</span>
                {renderStatusBadge(selectedUser.universalStatus)}
              </div>

              {/* Action Buttons in Drawer (Strictly Icon Only) */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {selectedUser.universalStatus !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleApproveUser(selectedUser.id)}
                    title="Approve User (KYC_APPROVED)"
                    className="w-9 h-9 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white cursor-pointer shadow-xs transition-colors flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenActionModal('reject', selectedUser.id)}
                  title="Reject / Clarification"
                  className="w-9 h-9 rounded-xl bg-[#C49563] hover:bg-[#8D4E22] hover:text-white border border-[#8D4E22] text-[#2B1405] cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                >
                  <XCircle className="w-4 h-4 stroke-[2.2]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSuspendUser(selectedUser.id)}
                  title={selectedUser.universalStatus === 'SUSPENDED' ? 'Restore User Access' : 'Suspend User Account'}
                  className={`w-9 h-9 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${selectedUser.universalStatus === 'SUSPENDED'
                    ? 'bg-[#E6EFE4] hover:bg-[#C1D6BD] border-[#BED2BB] text-[#3E5F36]'
                    : 'bg-[#B6814C] hover:bg-[#8D4E22] hover:text-white border border-[#8D4E22] text-[#2B1405]'
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
                  onClick={() =>
                    setDeleteTarget({
                      type: 'user',
                      id: selectedUser.id,
                      name: selectedUser.name,
                      subtitle: `${selectedUser.role} • ${selectedUser.location.district}, ${selectedUser.location.state}`,
                    })
                  }
                  title="Permanently Delete User Account"
                  className="w-9 h-9 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Section 4.1 F06 Profile */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#18221B]">
                <FileText className="w-4 h-4 text-[#8D4E22]" />
                <span>F06 Profile Information</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D8B293] space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Full Name
                    </span>
                    <span className="font-black text-[#18221B]">{selectedUser.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Mobile / Phone
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedUser.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      DOB / Age
                    </span>
                    <span className="font-bold text-[#18221B]">
                      {selectedUser.dob} ({selectedUser.age} yrs)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Registered Date
                    </span>
                    <span className="font-bold text-[#18221B]">
                      {selectedUser.registeredDate}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8DFD3]">
                  <span className="text-[10px] text-[#738679] font-bold uppercase block">
                    Location Address
                  </span>
                  <span className="font-black text-[#18221B]">
                    {selectedUser.location.village}, {selectedUser.location.district},{' '}
                    {selectedUser.location.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4.2 F07 KYC, Documents Verification & DPDP Consent Gate */}
            {(() => {
              const userDocs = getUserDocuments(selectedUser, isDocVerified)
              const verifiedCount = userDocs.filter((d) => d.verified).length
              const allVerified = verifiedCount === userDocs.length

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-[#18221B]">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#8D4E22]" />
                      <span>F07 KYC Verification &amp; DPDP Consent Gate</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                        allVerified ? 'badge-mint-tint' : 'badge-warning-tint'
                      }`}
                    >
                      {verifiedCount}/{userDocs.length} Docs Verified
                    </span>
                  </div>

                  {/* Uploaded Verification Documents List */}
                  <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D8B293] space-y-2.5 text-xs">
                    <span className="text-[10px] text-[#738679] font-bold uppercase block tracking-wider">
                      Uploaded Verification Documents ({userDocs.length})
                    </span>

                    <div className="space-y-2">
                      {userDocs.map((doc) => {
                        return (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl bg-white border border-[#D8B293] hover:border-[#8D4E22] transition-all space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-[#8D4E22] flex-shrink-0" />
                                  <span className="font-bold text-[#18221B]">{doc.title}</span>
                                </div>
                                <p className="text-[10px] text-[#738679] font-mono">
                                  {doc.fileName} • {doc.size}
                                </p>
                                <p className="text-[10px] text-[#4A5B50] font-medium">
                                  Authority: {doc.authority}
                                </p>
                              </div>

                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                                  doc.verified ? 'badge-mint-tint' : 'badge-warning-tint'
                                }`}
                              >
                                {doc.verified ? 'Verified' : 'Pending Check'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[#F2EADB]">
                              <button
                                type="button"
                                onClick={() =>
                                  setInspectingDoc({
                                    id: doc.id,
                                    title: doc.title,
                                    category: doc.category,
                                    fileName: doc.fileName,
                                    authority: doc.authority,
                                    size: doc.size,
                                    entityName: selectedUser.name,
                                    entityId: selectedUser.id,
                                    entityRole: selectedUser.role,
                                    verified: doc.verified,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-[#F5E5D5] hover:bg-[#EFE9E0] text-[#8D4E22] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors border border-[#D8B293]"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect Document</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleDocVerified(doc.id, doc.verified)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                  doc.verified
                                    ? 'bg-[#E6EFE4] text-[#3E5F36] hover:bg-[#C1D6BD] border border-[#BED2BB]'
                                    : 'bg-[#8D4E22] text-white hover:bg-[#6E3812] shadow-xs'
                                }`}
                              >
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>{doc.verified ? 'Marked Verified' : 'Verify Document'}</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-[#D8B293] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#3E5F36] font-black text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8D4E22]" />
                        <span>Mandatory DPDP 2025 Consent Verified</span>
                      </div>
                      <p className="text-[10px] text-[#4A5B50]">
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

                    <div className="text-[11px] text-[#4A5B50]">
                      <strong>Admin Note:</strong> {selectedUser.kyc.adminDecisionNote}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Section 4.3 F08 Payout / Bank Profile */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#18221B]">
                <CreditCard className="w-4 h-4 text-[#8D4E22]" />
                <span>F08 Bank &amp; Payout Profile</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D8B293] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#18221B]">
                    {selectedUser.payoutProfile.bankName}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${selectedUser.payoutProfile.status === 'VERIFIED'
                      ? 'badge-mint-tint'
                      : 'badge-warning-tint'
                      }`}
                  >
                    {selectedUser.payoutProfile.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold block">
                      Account Holder
                    </span>
                    <span className="font-bold text-[#18221B]">
                      {selectedUser.payoutProfile.accountHolder}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold block">
                      Masked Account
                    </span>
                    <span className="font-mono font-bold text-[#18221B]">
                      {selectedUser.payoutProfile.accountNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold block">
                      IFSC Code
                    </span>
                    <span className="font-mono font-bold text-[#18221B]">
                      {selectedUser.payoutProfile.ifsc}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold block">
                      Branch
                    </span>
                    <span className="font-bold text-[#18221B]">
                      {selectedUser.payoutProfile.branch}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5 Lands & Section 6 Projects (If Farmer) */}
            {selectedUser.roleCode === 'FARMER' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#18221B]">
                  <Layers className="w-4 h-4 text-[#8D4E22]" />
                  <span>Associated Lands (F10) &amp; Projects (F14)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D8B293] space-y-2 text-xs">
                  {selectedUser.lands.map((land) => (
                    <div
                      key={land.landId}
                      className="p-2.5 rounded-xl bg-white border border-[#D8B293] space-y-1"
                    >
                      <div className="flex items-center justify-between font-black text-[#18221B]">
                        <span>{land.name}</span>
                        <span className="text-[#8D4E22]">
                          {land.gisCalculatedArea} {land.unit}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#4A5B50]">
                        Survey / Khasra: {land.surveyNumber} • {land.ownershipType} • Crop:{' '}
                        {land.currentCrop}
                      </p>
                    </div>
                  ))}

                  {selectedUser.projects.map((proj) => (
                    <div
                      key={proj.projectId}
                      className="p-2.5 rounded-xl bg-white border border-[#D8B293] space-y-1"
                    >
                      <div className="flex items-center justify-between font-black text-[#18221B]">
                        <span>{proj.name}</span>
                        <span className="badge-sky-tint px-2 py-0.2 rounded-full text-[10px]">
                          {proj.typeLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#4A5B50]">
                        Stage: {proj.stage} • Target: {proj.targetImpact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 15.1 Immutable Audit Trail (Traceability) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-[#18221B]">
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-[#8D4E22]" />
                  <span>Immutable Audit Trail (PRD §15.1 &amp; §28)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenActionModal('note', selectedUser.id)}
                  className="text-[11px] text-[#8D4E22] hover:underline cursor-pointer"
                >
                  + Add Note
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D8B293] space-y-2 text-xs">
                {selectedUser.auditTrail.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-[#E8DFD3] space-y-0.5 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#3E5F36]">
                        [{log.action}] {log.performedBy}
                      </span>
                      <span className="text-[10px] text-[#738679]">{log.timestamp}</span>
                    </div>
                    <p className="text-[#4A5B50]">{log.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#D8B293]">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-black cursor-pointer shadow-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9.2 Slide-over Organization Dossier & Legal Verification Drawer */}
      {selectedOrg && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-5 border-l border-[#D19E77]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE4DC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F5E5D5] border border-[#D8B293] text-[#8D4E22] flex items-center justify-center font-bold shadow-2xs">
                  <Building2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">{selectedOrg.name}</h4>
                  <p className="text-xs font-mono text-[#4A5B50] font-bold">
                    {selectedOrg.id} • {selectedOrg.type}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrg(null)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#EFE9E0] border border-[#D19E77] flex items-center justify-center text-[#4A5B50] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Pill & Approval Actions */}
            <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#738679]">Organization Legal Gate:</span>
                {renderStatusBadge(selectedOrg.status)}
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {selectedOrg.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleApproveOrg(selectedOrg.id)}
                    title="Approve Legal Entity (ORG_APPROVED)"
                    className="w-9 h-9 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white cursor-pointer shadow-xs transition-colors flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSuspendOrg(selectedOrg.id)}
                  title={
                    selectedOrg.status === 'SUSPENDED'
                      ? 'Restore Organization Access'
                      : 'Suspend Organization'
                  }
                  className={`w-9 h-9 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${
                    selectedOrg.status === 'SUSPENDED'
                      ? 'bg-[#E6EFE4] hover:bg-[#C1D6BD] border-[#BED2BB] text-[#3E5F36]'
                      : 'bg-white hover:bg-[#F5E5D5] border-[#D8B293] text-[#4A5B50]'
                  }`}
                >
                  {selectedOrg.status === 'SUSPENDED' ? (
                    <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                  ) : (
                    <Ban className="w-4 h-4 stroke-[2.2]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({
                      type: 'org',
                      id: selectedOrg.id,
                      name: selectedOrg.name,
                      subtitle: `${selectedOrg.type} • Reg: ${selectedOrg.registrationNo}`,
                    })
                  }
                  title="Permanently Delete Organization"
                  className="w-9 h-9 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Core Entity Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#18221B]">
                <Building className="w-4 h-4 text-[#8D4E22]" />
                <span>Entity Charter &amp; Legal Registry</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D8B293] space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Registration Number
                    </span>
                    <span className="font-mono font-bold text-[#18221B]">
                      {selectedOrg.registrationNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Headquarters
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedOrg.headquarters}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Key Lead / Representative
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedOrg.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Onboarded Date
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedOrg.onboardedDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Official Email
                    </span>
                    <span className="font-mono text-[11px] text-[#8D4E22] font-bold">
                      {selectedOrg.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      GSTIN Identification
                    </span>
                    <span className="font-mono text-[11px] text-[#18221B] font-bold">
                      {selectedOrg.gstNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-white border border-[#D8B293] text-center">
                <span className="text-base font-black text-[#18221B] block">
                  {selectedOrg.farmersCount}
                </span>
                <span className="text-[10px] text-[#4A5B50] font-bold">Farmers</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#D8B293] text-center">
                <span className="text-base font-black text-[#18221B] block">
                  {selectedOrg.managedAcreage}
                </span>
                <span className="text-[10px] text-[#4A5B50] font-bold">Acreage</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#D8B293] text-center">
                <span className="text-base font-black text-[#18221B] block">
                  {selectedOrg.projectsCount}
                </span>
                <span className="text-[10px] text-[#4A5B50] font-bold">Projects</span>
              </div>
            </div>

            {/* Uploaded Legal Documents */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-[#18221B]">
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#8D4E22]" />
                  <span>Legal &amp; Institutional Documents</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase badge-mint-tint">
                  {selectedOrg.documents.filter((d) => isDocVerified(d.id, d.verified)).length}/
                  {selectedOrg.documents.length} Verified
                </span>
              </div>

              <div className="space-y-2">
                {selectedOrg.documents.map((doc) => {
                  const verified = isDocVerified(doc.id, doc.verified)
                  return (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-white border border-[#D8B293] hover:border-[#8D4E22] transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs text-[#18221B] block">{doc.title}</span>
                          <span className="text-[10px] text-[#738679] font-mono">
                            {doc.fileName} • {doc.size}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            verified ? 'badge-mint-tint' : 'badge-warning-tint'
                          }`}
                        >
                          {verified ? 'Verified' : 'Pending Check'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F2EADB]">
                        <button
                          type="button"
                          onClick={() =>
                            setInspectingDoc({
                              id: doc.id,
                              title: doc.title,
                              category: doc.category,
                              fileName: doc.fileName,
                              authority: doc.authority,
                              size: doc.size,
                              entityName: selectedOrg.name,
                              entityId: selectedOrg.id,
                              entityRole: selectedOrg.type,
                              verified,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-[#F5E5D5] hover:bg-[#EFE9E0] text-[#8D4E22] text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-[#D8B293]"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect Document</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleDocVerified(doc.id, verified)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            verified
                              ? 'bg-[#E6EFE4] text-[#3E5F36] border border-[#BED2BB]'
                              : 'bg-[#8D4E22] text-white hover:bg-[#6E3812]'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>{verified ? 'Marked Verified' : 'Verify Document'}</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#18221B]">
                <RotateCcw className="w-4 h-4 text-[#8D4E22]" />
                <span>Immutable Audit Trail</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D8B293] space-y-2 text-xs">
                {selectedOrg.auditTrail.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-[#E8DFD3] space-y-0.5 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#3E5F36]">
                        [{log.action}] {log.performedBy}
                      </span>
                      <span className="text-[10px] text-[#738679]">{log.timestamp}</span>
                    </div>
                    <p className="text-[#4A5B50]">{log.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#D8B293]">
              <button
                type="button"
                onClick={() => setSelectedOrg(null)}
                className="w-full py-2.5 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-black cursor-pointer shadow-xs transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9.3 Slide-over Field Agent Profile Drawer */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-5 border-l border-[#D19E77]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE4DC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Smartphone className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">{selectedAgent.name}</h4>
                  <p className="text-xs font-mono text-[#4A5B50] font-bold">
                    {selectedAgent.id} • Field Agent
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAgent(null)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#EFE9E0] border border-[#D19E77] flex items-center justify-center text-[#4A5B50] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Pill & Approval Actions */}
            <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#738679]">Agent Activation Gate:</span>
                {renderStatusBadge(selectedAgent.status)}
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {selectedAgent.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleApproveAgent(selectedAgent.id)}
                    title="Approve Field Agent (AGENT_ACTIVE)"
                    className="w-9 h-9 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white cursor-pointer shadow-xs transition-colors flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSuspendAgent(selectedAgent.id)}
                  title={
                    selectedAgent.status === 'SUSPENDED'
                      ? 'Restore Agent Access'
                      : 'Suspend Field Agent'
                  }
                  className={`w-9 h-9 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${
                    selectedAgent.status === 'SUSPENDED'
                      ? 'bg-[#E6EFE4] hover:bg-[#C1D6BD] border-[#BED2BB] text-[#3E5F36]'
                      : 'bg-white hover:bg-[#F5E5D5] border-[#D8B293] text-[#4A5B50]'
                  }`}
                >
                  {selectedAgent.status === 'SUSPENDED' ? (
                    <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                  ) : (
                    <Ban className="w-4 h-4 stroke-[2.2]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({
                      type: 'agent',
                      id: selectedAgent.id,
                      name: selectedAgent.name,
                      subtitle: `Field Agent • ${selectedAgent.assignedRegion}`,
                    })
                  }
                  title="Permanently Delete Field Agent"
                  className="w-9 h-9 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Core Agent Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#18221B]">
                <Briefcase className="w-4 h-4 text-[#8D4E22]" />
                <span>Field Operator Scope &amp; Device Details</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D8B293] space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Assigned Region
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedAgent.assignedRegion}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Organization
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedAgent.organization}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Contact Phone
                    </span>
                    <span className="font-mono font-bold text-[#18221B]">{selectedAgent.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Mobile App Engine
                    </span>
                    <span className="font-mono font-bold text-[#8D4E22]">{selectedAgent.appVersion}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Sync Status
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedAgent.syncStatus}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Last Active Ping
                    </span>
                    <span className="font-bold text-[#3E5F36]">{selectedAgent.lastActive}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-white border border-[#D8B293] text-center">
                <span className="text-base font-black text-[#18221B] block">
                  {selectedAgent.activeVisits}
                </span>
                <span className="text-[10px] text-[#4A5B50] font-bold">Active Visits</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#D8B293] text-center">
                <span className="text-base font-black text-[#18221B] block">
                  {selectedAgent.completedVisits}
                </span>
                <span className="text-[10px] text-[#4A5B50] font-bold">Completed Visits</span>
              </div>
            </div>

            {/* Uploaded Field Documents */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-[#18221B]">
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#8D4E22]" />
                  <span>Field Certifications &amp; KYC</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase badge-mint-tint">
                  {selectedAgent.documents.filter((d) => isDocVerified(d.id, d.verified)).length}/
                  {selectedAgent.documents.length} Verified
                </span>
              </div>

              <div className="space-y-2">
                {selectedAgent.documents.map((doc) => {
                  const verified = isDocVerified(doc.id, doc.verified)
                  return (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-white border border-[#D8B293] hover:border-[#8D4E22] transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs text-[#18221B] block">{doc.title}</span>
                          <span className="text-[10px] text-[#738679] font-mono">
                            {doc.fileName} • {doc.size}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            verified ? 'badge-mint-tint' : 'badge-warning-tint'
                          }`}
                        >
                          {verified ? 'Verified' : 'Pending Check'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F2EADB]">
                        <button
                          type="button"
                          onClick={() =>
                            setInspectingDoc({
                              id: doc.id,
                              title: doc.title,
                              category: doc.category,
                              fileName: doc.fileName,
                              authority: doc.authority,
                              size: doc.size,
                              entityName: selectedAgent.name,
                              entityId: selectedAgent.id,
                              entityRole: 'Field Agent',
                              verified,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-[#F5E5D5] hover:bg-[#EFE9E0] text-[#8D4E22] text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-[#D8B293]"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect Document</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleDocVerified(doc.id, verified)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            verified
                              ? 'bg-[#E6EFE4] text-[#3E5F36] border border-[#BED2BB]'
                              : 'bg-[#8D4E22] text-white hover:bg-[#6E3812]'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>{verified ? 'Marked Verified' : 'Verify Document'}</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#18221B]">
                <RotateCcw className="w-4 h-4 text-[#8D4E22]" />
                <span>Immutable Audit Trail</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D8B293] space-y-2 text-xs">
                {selectedAgent.auditTrail.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-[#E8DFD3] space-y-0.5 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#3E5F36]">
                        [{log.action}] {log.performedBy}
                      </span>
                      <span className="text-[10px] text-[#738679]">{log.timestamp}</span>
                    </div>
                    <p className="text-[#4A5B50]">{log.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#D8B293]">
              <button
                type="button"
                onClick={() => setSelectedAgent(null)}
                className="w-full py-2.5 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-black cursor-pointer shadow-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9.4 Slide-over Reviewer / ACVA Dossier Drawer */}
      {selectedReviewer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-5 border-l border-[#D19E77]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE4DC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F5E5D5] border border-[#D8B293] text-[#8D4E22] flex items-center justify-center font-bold shadow-2xs">
                  <Award className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">{selectedReviewer.name}</h4>
                  <p className="text-xs font-mono text-[#4A5B50] font-bold">
                    {selectedReviewer.id} • {selectedReviewer.role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReviewer(null)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#EFE9E0] border border-[#D19E77] flex items-center justify-center text-[#4A5B50] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Pill & Approval Actions */}
            <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#738679]">Auditor Verification Gate:</span>
                {renderStatusBadge(selectedReviewer.status)}
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {selectedReviewer.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleApproveReviewer(selectedReviewer.id)}
                    title="Approve Reviewer / Verifier"
                    className="w-9 h-9 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white cursor-pointer shadow-xs transition-colors flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSuspendReviewer(selectedReviewer.id)}
                  title={
                    selectedReviewer.status === 'SUSPENDED'
                      ? 'Restore Signing Rights'
                      : 'Suspend Signing Rights'
                  }
                  className={`w-9 h-9 rounded-xl cursor-pointer shadow-2xs border flex items-center justify-center transition-colors ${
                    selectedReviewer.status === 'SUSPENDED'
                      ? 'bg-[#E6EFE4] hover:bg-[#C1D6BD] border-[#BED2BB] text-[#3E5F36]'
                      : 'bg-white hover:bg-[#F5E5D5] border-[#D8B293] text-[#4A5B50]'
                  }`}
                >
                  {selectedReviewer.status === 'SUSPENDED' ? (
                    <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                  ) : (
                    <Ban className="w-4 h-4 stroke-[2.2]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({
                      type: 'reviewer',
                      id: selectedReviewer.id,
                      name: selectedReviewer.name,
                      subtitle: `${selectedReviewer.role} • ${selectedReviewer.organization}`,
                    })
                  }
                  title="Permanently Delete Reviewer"
                  className="w-9 h-9 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Scope & Accreditation */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#18221B]">
                <Shield className="w-4 h-4 text-[#8D4E22]" />
                <span>Auditor Credentials &amp; Accreditation Scope</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D8B293] space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Organization
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedReviewer.organization}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Accreditation
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedReviewer.accreditation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Assigned Projects
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedReviewer.assignedProjects} Projects</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Active Audits Pending
                    </span>
                    <span className="font-bold text-[#B45309]">{selectedReviewer.pendingReviews} Audits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Reviewer Documents */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-[#18221B]">
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#8D4E22]" />
                  <span>Statutory Accreditation Licenses</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase badge-mint-tint">
                  {selectedReviewer.documents.filter((d) => isDocVerified(d.id, d.verified)).length}/
                  {selectedReviewer.documents.length} Verified
                </span>
              </div>

              <div className="space-y-2">
                {selectedReviewer.documents.map((doc) => {
                  const verified = isDocVerified(doc.id, doc.verified)
                  return (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-white border border-[#D8B293] hover:border-[#8D4E22] transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs text-[#18221B] block">{doc.title}</span>
                          <span className="text-[10px] text-[#738679] font-mono">
                            {doc.fileName} • {doc.size}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            verified ? 'badge-mint-tint' : 'badge-warning-tint'
                          }`}
                        >
                          {verified ? 'Verified' : 'Pending Check'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F2EADB]">
                        <button
                          type="button"
                          onClick={() =>
                            setInspectingDoc({
                              id: doc.id,
                              title: doc.title,
                              category: doc.category,
                              fileName: doc.fileName,
                              authority: doc.authority,
                              size: doc.size,
                              entityName: selectedReviewer.name,
                              entityId: selectedReviewer.id,
                              entityRole: selectedReviewer.role,
                              verified,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-[#F5E5D5] hover:bg-[#EFE9E0] text-[#8D4E22] text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-[#D8B293]"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect Document</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleDocVerified(doc.id, verified)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            verified
                              ? 'bg-[#E6EFE4] text-[#3E5F36] border border-[#BED2BB]'
                              : 'bg-[#8D4E22] text-white hover:bg-[#6E3812]'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>{verified ? 'Marked Verified' : 'Verify Document'}</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#18221B]">
                <RotateCcw className="w-4 h-4 text-[#8D4E22]" />
                <span>Immutable Audit Trail</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8F5F0] border border-[#D8B293] space-y-2 text-xs">
                {selectedReviewer.auditTrail.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-[#E8DFD3] space-y-0.5 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#3E5F36]">
                        [{log.action}] {log.performedBy}
                      </span>
                      <span className="text-[10px] text-[#738679]">{log.timestamp}</span>
                    </div>
                    <p className="text-[#4A5B50]">{log.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#D8B293]">
              <button
                type="button"
                onClick={() => setSelectedReviewer(null)}
                className="w-full py-2.5 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-black cursor-pointer shadow-xs transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Universal Approval Gate Action Modals (Clarify / Reject / Note) */}
      {modalAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#D19E77] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8B293]">
              <h4 className="text-base font-black text-[#18221B]">
                {modalAction === 'clarify' && 'Request Clarification (KYC_CLARIFICATION)'}
                {modalAction === 'reject' && 'Reject Submission (KYC_REJECTED)'}
                {modalAction === 'note' && 'Add Internal Admin Audit Note'}
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
              {modalAction === 'clarify' &&
                'Enter the specific question or missing document required. The user will be notified and can resolve the request directly.'}
              {modalAction === 'reject' &&
                'Enter a clear, formal rejection reason code so the user understands what must be corrected before resubmitting.'}
              {modalAction === 'note' &&
                'Enter internal compliance / governance notes for the record audit trail. Only administrators can view these notes.'}
            </p>

            <div>
              <label className="text-[11px] font-bold text-[#18221B] block mb-1">
                {modalAction === 'clarify' && 'Clarification Request Message'}
                {modalAction === 'reject' && 'Mandatory Rejection Reason'}
                {modalAction === 'note' && 'Internal Admin Audit Note'}
              </label>
              <textarea
                rows={3}
                value={modalInputText}
                onChange={(e) => setModalInputText(e.target.value)}
                placeholder={
                  modalAction === 'clarify'
                    ? 'e.g. Please re-upload clearer land deed showing survey coordinates...'
                    : modalAction === 'reject'
                    ? 'e.g. Identity document expired or mismatch with official database records...'
                    : 'e.g. Verified cross-border tax identification with ACVA node...'
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
                disabled={!modalInputText.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  modalAction === 'reject'
                    ? 'bg-[#8D4E22] hover:bg-[#6E3812]'
                    : 'bg-[#8D4E22] hover:bg-[#6E3812]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm &amp; Record Action</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Document Inspection Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 border-2 border-[#B88258] shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#C89B75]">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#2B1405] bg-[#C49563] px-2 py-0.5 rounded-md border border-[#8D4E22]">
                  {inspectingDoc.category}
                </span>
                <h3 className="text-base font-black text-[#18221B]">{inspectingDoc.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="w-8 h-8 rounded-xl bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] flex items-center justify-center text-[#2B1405] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Metadata Strip */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-[#C49563]/25 p-3 rounded-2xl border border-[#8D4E22]">
              <div>
                <span className="text-[10px] text-[#738679] font-bold block">Document Owner</span>
                <span className="font-black text-[#18221B]">{inspectingDoc.entityName}</span>
                <span className="text-[10px] text-[#4A5B50] font-mono block">
                  ({inspectingDoc.entityId} • {inspectingDoc.entityRole})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#738679] font-bold block">Attached File</span>
                <span className="font-mono text-[#8D4E22] font-bold truncate block">
                  {inspectingDoc.fileName}
                </span>
                <span className="text-[10px] text-[#738679]">
                  {inspectingDoc.size} • High-Resolution Scan
                </span>
              </div>
              <div className="col-span-2 pt-1.5 border-t border-[#E8DFD3]">
                <span className="text-[10px] text-[#738679] font-bold block">
                  Issuing Authority
                </span>
                <span className="font-bold text-[#18221B]">{inspectingDoc.authority}</span>
              </div>
            </div>

            {/* High-Fidelity Simulated Document Viewer with Watermarks */}
            <div className="relative p-5 rounded-2xl bg-[#FFFDF9] border-2 border-dashed border-[#D8B293] space-y-3 overflow-hidden shadow-inner">
              {/* DPDP Watermark Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-25deg] select-none text-2xl font-black text-black">
                NATUREX AUDIT ARCHIVE • CONFIDENTIAL • DPDP ACT 2025
              </div>

              <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#8D4E22] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    NX
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-[#18221B] uppercase tracking-wide">
                      Digital Verification Registry
                    </h5>
                    <p className="text-[9px] text-[#738679] font-mono">
                      CERT-HASH: SHA256:7f9a2e...c419 • ENCRYPTED
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                    isDocVerified(inspectingDoc.id, inspectingDoc.verified)
                      ? 'bg-[#E6EFE4] text-[#3E5F36] border-[#BED2BB]'
                      : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                  }`}
                >
                  {isDocVerified(inspectingDoc.id, inspectingDoc.verified)
                    ? 'Verified & Compliant'
                    : 'Pending Verification'}
                </span>
              </div>

              <div className="space-y-2 text-xs py-2">
                <div className="p-3 rounded-xl bg-white border border-[#E8DFD3] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#738679]">
                      Document Record
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#8D4E22]">
                      STATUS: VALID
                    </span>
                  </div>
                  <p className="font-extrabold text-[#18221B]">{inspectingDoc.title}</p>
                  <p className="text-[11px] text-[#4A5B50] leading-relaxed">
                    This official certificate is digitally bound to actor{' '}
                    <strong>{inspectingDoc.entityName}</strong> under Section 2 of the Universal
                    Approval Gate and compliant with DPDP 2025 cross-reference rules.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#738679] pt-1">
                <span>Verified by Super Admin Node</span>
                <span className="font-mono">Security Checksum: OK</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#D8B293]">
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleDocVerified(
                    inspectingDoc.id,
                    isDocVerified(inspectingDoc.id, inspectingDoc.verified)
                  )
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                  isDocVerified(inspectingDoc.id, inspectingDoc.verified)
                    ? 'bg-[#E6EFE4] text-[#3E5F36] hover:bg-[#C1D6BD] border border-[#BED2BB]'
                    : 'bg-[#8D4E22] text-white hover:bg-[#6E3812]'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>
                  {isDocVerified(inspectingDoc.id, inspectingDoc.verified)
                    ? '✓ Document Verified (Click to Revoke)'
                    : 'Verify & Mark Document Checked'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Universal Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#B88258] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#C89B75]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#C49563] border border-[#8D4E22] text-[#2B1405] flex items-center justify-center font-black">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h4 className="text-base font-black text-[#18221B]">
                  Permanently Delete Record?
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-8 h-8 rounded-xl bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] flex items-center justify-center text-[#2B1405] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#4A5B50] font-medium leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#18221B]">{deleteTarget.name}</strong> ({deleteTarget.subtitle})
              with ID{' '}
              <code className="bg-[#C49563] px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-[#2B1405] border border-[#8D4E22]">
                {deleteTarget.id}
              </code>
              ? This action will immediately remove their credentials, linked assets, and platform privileges.
            </p>

            <div className="p-3 bg-[#C49563] border border-[#8D4E22] rounded-2xl text-[11px] text-[#2B1405] font-black flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Irreversible action: All associated roles and access will immediately be revoked.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C89B75]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#C49563] hover:text-[#2B1405] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
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
