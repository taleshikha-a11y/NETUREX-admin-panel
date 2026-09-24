import { useState, useMemo, useEffect } from 'react'
import {
  Bell,
  LifeBuoy,
  BarChart3,
  ShieldCheck,
  FileQuestion,
  Settings,
  Search,
  X,
  Eye,
  Check,
  Trash2,
  Download,
  Send,
  Sliders,
  RefreshCw,
  Plus,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  Database,
  MapPin,
  Sparkles,
} from 'lucide-react'
import systemData from '../data/systemSettingsData.json'
import CustomDropdown from './CustomDropdown'

interface SystemSettingsViewProps {
  initialSubTab?: string
  onNavigateSubTab?: (subTabKey: string) => void
}

export interface QuestionItem {
  id: string
  label: string
  type: string
  options?: string[]
  required: boolean
  min?: number
  max?: number
}

export interface SectionItem {
  id: string
  title: string
  questions: QuestionItem[]
}

export interface SchemaItem {
  id: string
  projectType: string
  code: string
  version: string
  status: string
  updatedAt: string
  sections: SectionItem[]
}

type SubTabKey =
  | 'notifications'
  | 'support'
  | 'reports'
  | 'audit-logs'
  | 'questionnaires'
  | 'settings'

export default function SystemSettingsView({
  initialSubTab = 'notifications',
  onNavigateSubTab,
}: SystemSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SubTabKey>(() => {
    const validTabs: SubTabKey[] = [
      'notifications',
      'support',
      'reports',
      'audit-logs',
      'questionnaires',
      'settings',
    ]
    if (initialSubTab && validTabs.includes(initialSubTab as SubTabKey)) {
      return initialSubTab as SubTabKey
    }
    return 'notifications'
  })

  // Sync tab when initialSubTab changes from parent or sidebar navigation
  useEffect(() => {
    const validTabs: SubTabKey[] = [
      'notifications',
      'support',
      'reports',
      'audit-logs',
      'questionnaires',
      'settings',
    ]
    if (initialSubTab && validTabs.includes(initialSubTab as SubTabKey)) {
      setActiveTab(initialSubTab as SubTabKey)
    }
  }, [initialSubTab])

  const handleTabChange = (tab: SubTabKey) => {
    setActiveTab(tab)
    if (onNavigateSubTab) {
      onNavigateSubTab(tab)
    }
  }

  // -------------------------------------------------------------
  // TAB 1: Notifications State
  // -------------------------------------------------------------
  const [notifSearch, setNotifSearch] = useState('')
  const [notifChannelFilter, setNotifChannelFilter] = useState('ALL')
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [isTestDispatchModalOpen, setIsTestDispatchModalOpen] = useState(false)
  const [testDispatchForm, setTestDispatchForm] = useState({
    recipientName: 'Ramesh Patel',
    recipientPhone: '+91 98930 12345',
    channel: 'WhatsApp + SMS',
    customNotes: 'Manual test dispatch triggered by Super Admin',
  })
  const [dispatchSuccessToast, setDispatchSuccessToast] = useState(false)

  // -------------------------------------------------------------
  // TAB 2: Support State
  // -------------------------------------------------------------
  const [supportSearch, setSupportSearch] = useState('')
  const [supportCategoryFilter, setSupportCategoryFilter] = useState('ALL')
  const [supportStatusFilter, setSupportStatusFilter] = useState('ALL')
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)
  const [ticketToDelete, setTicketToDelete] = useState<any | null>(null)
  const [ticketList, setTicketList] = useState(systemData.support.tickets)
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false)
  const [newTicketForm, setNewTicketForm] = useState({
    farmerName: '',
    userPhone: '',
    category: 'LAND_DISPUTE',
    priority: 'HIGH',
    subject: '',
    description: '',
  })

  // -------------------------------------------------------------
  // TAB 3: Reports State
  // -------------------------------------------------------------
  const [reportSearch, setReportSearch] = useState('')
  const [reportCategoryFilter, setReportCategoryFilter] = useState('ALL')
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false)
  const [generateReportForm, setGenerateReportForm] = useState({
    title: 'Custom Carbon Sequestration Audit Dossier',
    category: 'IMPACT_CARBON',
    period: 'Current Quarter (Q3 2026)',
    format: 'PDF / Encrypted Dossier',
  })
  const [reportList, setReportList] = useState(systemData.reports.catalog)
  const [reportGenerating, setReportGenerating] = useState(false)

  // -------------------------------------------------------------
  // TAB 4: Audit Logs State
  // -------------------------------------------------------------
  const [auditSearch, setAuditSearch] = useState('')
  const [auditCategoryFilter, setAuditCategoryFilter] = useState('ALL')
  const [selectedAuditProof, setSelectedAuditProof] = useState<any | null>(null)

  // -------------------------------------------------------------
  // TAB 5: Questionnaires State
  // -------------------------------------------------------------
  const [selectedSchemaIndex, setSelectedSchemaIndex] = useState(0)
  const [schemaList, setSchemaList] = useState<any[]>(
    systemData.questionnaires.schemas as any[]
  )
  const [previewQuestionnaireModal, setPreviewQuestionnaireModal] = useState<any | null>(null)
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false)
  const [newQuestionForm, setNewQuestionForm] = useState({
    label: '',
    type: 'SELECT',
    required: true,
    optionsStr: 'Option A, Option B, Option C',
  })

  // -------------------------------------------------------------
  // TAB 6: Settings State
  // -------------------------------------------------------------
  const [settingsForm, setSettingsForm] = useState(systemData.settings.infrastructure)
  const [settingsSavedToast, setSettingsSavedToast] = useState(false)

  // -------------------------------------------------------------
  // Filtered Computations
  // -------------------------------------------------------------
  const filteredTemplates = useMemo(() => {
    return systemData.notifications.templates.filter((tmpl) => {
      const matchesSearch =
        tmpl.name.toLowerCase().includes(notifSearch.toLowerCase()) ||
        tmpl.triggerEvent.toLowerCase().includes(notifSearch.toLowerCase()) ||
        tmpl.recipientRole.toLowerCase().includes(notifSearch.toLowerCase())
      const matchesChannel =
        notifChannelFilter === 'ALL' || tmpl.channel.includes(notifChannelFilter)
      return matchesSearch && matchesChannel
    })
  }, [notifSearch, notifChannelFilter])

  const filteredTickets = useMemo(() => {
    return ticketList.filter((t) => {
      const q = supportSearch.toLowerCase()
      const matchesSearch =
        t.ticketNumber.toLowerCase().includes(q) ||
        t.farmerName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.userPhone.includes(q)
      const matchesCat =
        supportCategoryFilter === 'ALL' || t.category === supportCategoryFilter
      const matchesStatus =
        supportStatusFilter === 'ALL' || t.status === supportStatusFilter
      return matchesSearch && matchesCat && matchesStatus
    })
  }, [ticketList, supportSearch, supportCategoryFilter, supportStatusFilter])

  const filteredReports = useMemo(() => {
    return reportList.filter((r) => {
      const q = reportSearch.toLowerCase()
      const matchesSearch =
        r.title.toLowerCase().includes(q) ||
        r.verifiedBy.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q)
      const matchesCat =
        reportCategoryFilter === 'ALL' || r.category === reportCategoryFilter
      return matchesSearch && matchesCat
    })
  }, [reportList, reportSearch, reportCategoryFilter])

  const filteredAuditLogs = useMemo(() => {
    return systemData.auditLogs.entries.filter((entry) => {
      const q = auditSearch.toLowerCase()
      const matchesSearch =
        entry.actor.toLowerCase().includes(q) ||
        entry.entityId.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.ip.includes(q) ||
        entry.details.toLowerCase().includes(q)
      const matchesCat =
        auditCategoryFilter === 'ALL' || entry.category === auditCategoryFilter
      return matchesSearch && matchesCat
    })
  }, [auditSearch, auditCategoryFilter])

  // Handlers
  const handleResolveTicket = (id: string) => {
    setTicketList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'RESOLVED', slaHoursRemaining: 0 } : t
      )
    )
    if (selectedTicket?.id === id) {
      setSelectedTicket((prev: any) => (prev ? { ...prev, status: 'RESOLVED' } : null))
    }
  }

  const handleDeleteTicket = () => {
    if (!ticketToDelete) return
    setTicketList((prev) => prev.filter((t) => t.id !== ticketToDelete.id))
    if (selectedTicket?.id === ticketToDelete.id) setSelectedTicket(null)
    setTicketToDelete(null)
  }

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicketForm.farmerName || !newTicketForm.subject) return
    const newT = {
      id: `TCK-${Math.floor(8822 + Math.random() * 200)}`,
      ticketNumber: `SUP-2026-${Math.floor(8822 + Math.random() * 200)}`,
      farmerName: newTicketForm.farmerName,
      userPhone: newTicketForm.userPhone || '+91 98000 00000',
      category: newTicketForm.category,
      subject: newTicketForm.subject,
      description: newTicketForm.description || 'Logged via Super Admin desk.',
      priority: newTicketForm.priority,
      status: 'OPEN',
      createdAt: 'Just now',
      slaHoursRemaining: 24,
      assignedTo: 'Super Admin Helpdesk',
      parcelId: 'PARCEL-MP-0891',
    }
    setTicketList((prev) => [newT, ...prev])
    setIsNewTicketModalOpen(false)
  }

  const handleGenerateReportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setReportGenerating(true)
    setTimeout(() => {
      const newRep = {
        id: `REP-2026-${Math.floor(10 + Math.random() * 90)}`,
        title: generateReportForm.title,
        category: generateReportForm.category,
        period: generateReportForm.period,
        format: generateReportForm.format,
        generatedAt: 'Just now',
        fileSize: '5.2 MB',
        status: 'READY',
        verifiedBy: 'Super Admin (Real-time)',
        downloadUrl: '#',
      }
      setReportList((prev) => [newRep, ...prev])
      setReportGenerating(false)
      setIsGenerateReportModalOpen(false)
    }, 600)
  }

  const handleTestDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setDispatchSuccessToast(true)
    setIsTestDispatchModalOpen(false)
    setTimeout(() => setDispatchSuccessToast(false), 4000)
  }

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestionForm.label) return
    const currentSchema = schemaList[selectedSchemaIndex]
    const updatedSecs = [...currentSchema.sections]
    const opts = newQuestionForm.optionsStr
      ? newQuestionForm.optionsStr.split(',').map((s) => s.trim())
      : undefined

    const newQ = {
      id: `Q-${Math.floor(50 + Math.random() * 50)}`,
      label: newQuestionForm.label,
      type: newQuestionForm.type,
      options: opts,
      required: newQuestionForm.required,
    }

    if (updatedSecs.length > 0) {
      updatedSecs[0] = {
        ...updatedSecs[0],
        questions: [...updatedSecs[0].questions, newQ],
      }
    }

    const updatedSchema = {
      ...currentSchema,
      sections: updatedSecs,
    }

    setSchemaList((prev) =>
      prev.map((s, idx) => (idx === selectedSchemaIndex ? updatedSchema : s))
    )
    setIsAddQuestionModalOpen(false)
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSavedToast(true)
    setTimeout(() => setSettingsSavedToast(false), 3500)
  }

  return (
    <div className="relative rounded-2xl border-2 border-[#D19E77] shadow-[0_0_15px_rgba(58,168,142,0.18)] p-4 sm:p-6 bg-white space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-black shadow-2xs">
              <Settings className="w-5 h-5 text-[#3E5F36]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#18221B] tracking-tight">
                System &amp; Governance
              </h1>
              <p className="text-xs text-[#4A5B50] font-medium mt-0.5">
                Dynamic forms engine, notifications, helpdesk SLA, reports, and immutable audit logs (PRD A19–A24)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
            <Sparkles className="w-3.5 h-3.5" />
            DPDP 2025 Compliant
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1]">
            <Lock className="w-3.5 h-3.5" />
            Super Admin Authority
          </span>
        </div>
      </div>

      {/* Success Toasts */}
      {dispatchSuccessToast && (
        <div className="flex items-center gap-3 p-4 bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] rounded-xl text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Notification dispatch signal transmitted successfully via Airtel DLT SMS &amp; Meta Cloud API gateway!</span>
        </div>
      )}

      {settingsSavedToast && (
        <div className="flex items-center gap-3 p-4 bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] rounded-xl text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>System configuration changes saved and encrypted to persistent vault successfully!</span>
        </div>
      )}

      {/* 6 Sub-Tabs Navigation Strip */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => handleTabChange('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-[#8D4E22] text-white border border-[#6E3812] shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F8FAFC]'
          }`}
        >
          <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-white' : 'text-[#8D4E22]'}`} />
          <span>Notifications Center</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-black border ${
              activeTab === 'notifications'
                ? 'bg-[#6E3812] text-white border-white/20'
                : 'bg-white border border-[#D19E77] text-[#8D4E22]'
            }`}
          >
            6
          </span>
        </button>

        <button
          onClick={() => handleTabChange('support')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'support'
              ? 'bg-[#8D4E22] text-white border border-[#6E3812] shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F8FAFC]'
          }`}
        >
          <LifeBuoy className={`w-4 h-4 ${activeTab === 'support' ? 'text-white' : 'text-[#8D4E22]'}`} />
          <span>Support &amp; Disputes</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#C49563] border border-[#8D4E22] text-[#2B1405] font-black">
            {ticketList.filter((t) => t.status === 'OPEN').length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-[#8D4E22] text-white border border-[#6E3812] shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F8FAFC]'
          }`}
        >
          <BarChart3 className={`w-4 h-4 ${activeTab === 'reports' ? 'text-white' : 'text-[#8D4E22]'}`} />
          <span>Reports &amp; Analytics</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-black border ${
              activeTab === 'reports'
                ? 'bg-[#6E3812] text-white border-white/20'
                : 'bg-white border border-[#D19E77] text-[#8D4E22]'
            }`}
          >
            {reportList.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('audit-logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'audit-logs'
              ? 'bg-[#8D4E22] text-white border border-[#6E3812] shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F8FAFC]'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${activeTab === 'audit-logs' ? 'text-white' : 'text-[#8D4E22]'}`} />
          <span>Audit Logs</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-black border ${
              activeTab === 'audit-logs'
                ? 'bg-[#6E3812] text-white border-white/20'
                : 'bg-[#F2DFC9] border border-[#D19E77] text-[#6E3812]'
            }`}
          >
            SHA-256
          </span>
        </button>

        <button
          onClick={() => handleTabChange('questionnaires')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'questionnaires'
              ? 'bg-[#8D4E22] text-white border border-[#6E3812] shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F8FAFC]'
          }`}
        >
          <FileQuestion className={`w-4 h-4 ${activeTab === 'questionnaires' ? 'text-white' : 'text-[#8D4E22]'}`} />
          <span>Questionnaire Engine</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-black border ${
              activeTab === 'questionnaires'
                ? 'bg-[#6E3812] text-white border-white/20'
                : 'bg-white border border-[#D19E77] text-[#8D4E22]'
            }`}
          >
            3 Schemas
          </span>
        </button>

        <button
          onClick={() => handleTabChange('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#8D4E22] text-white border border-[#6E3812] shadow-2xs'
              : 'text-[#4A5B50] hover:bg-[#F8FAFC]'
          }`}
        >
          <Sliders className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-[#8D4E22]'}`} />
          <span>System Settings</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: NOTIFICATIONS CENTER (PRD §17 & A19)                  */}
      {/* ============================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fade-in">
          {/* Notifications KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Total Dispatched</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#18221B]">
                {systemData.notifications.kpis.totalDispatched}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Automated multi-channel event triggers
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">WhatsApp Delivery</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#3E5F36]">
                {systemData.notifications.kpis.whatsappDeliveryRate}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Meta Cloud API verified enterprise channel
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">SMS DLT Rate</span>
                <div className="w-7 h-7 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4 text-[#0369A1]" />
                </div>
              </div>
              <div className="text-xl font-black text-[#0369A1]">
                {systemData.notifications.kpis.smsDeliveryRate}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                TRAI DLT compliant transactional route
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Push Click Ratio</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#18221B]">
                {systemData.notifications.kpis.pushClickRate}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                In-app task response engagement
              </p>
            </div>
          </div>

          {/* Controls Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[#99ABA0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search template, trigger event, role..."
                  value={notifSearch}
                  onChange={(e) => setNotifSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#4A5B50] font-bold">
                <span>Channel:</span>
                <CustomDropdown
                  value={notifChannelFilter}
                  onChange={(val) => setNotifChannelFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Channels', dotColor: '#8D4E22' },
                    { value: 'WhatsApp', label: 'WhatsApp', dotColor: '#5E8256' },
                    { value: 'SMS', label: 'SMS', dotColor: '#0284C7' },
                    { value: 'Push', label: 'Push', dotColor: '#D97706' },
                  ]}
                  className="w-40"
                />
              </div>
            </div>

            <button
              onClick={() => setIsTestDispatchModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto border border-[#6E3812]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Test Dispatch</span>
            </button>
          </div>

          {/* Templates Grid / Table */}
          <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#4A5B50] font-bold">
                  <th className="py-3 px-4">Template &amp; Event</th>
                  <th className="py-3 px-4">Recipient Scope</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Message Sample</th>
                  <th className="py-3 px-4">CTA Action</th>
                  <th className="py-3 px-4 text-center">Delivery</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {filteredTemplates.map((tmpl) => (
                  <tr key={tmpl.id} className="hover:bg-[#F1F5F9]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#18221B]">{tmpl.name}</div>
                      <div className="text-[10px] font-mono text-[#5E8256] font-semibold mt-0.5">
                        {tmpl.triggerEvent}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#4A5B50]">
                      {tmpl.recipientRole}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
                        {tmpl.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-[11px] text-[#4A5B50] truncate" title={tmpl.body}>
                        {tmpl.body}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#4A5B50]">
                        {tmpl.cta}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-[#3E5F36]">{tmpl.deliveryRate}</span>
                      <div className="text-[10px] text-[#738679]">
                        {tmpl.dispatchedCount.toLocaleString()} sent
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedTemplate(tmpl)}
                          title="Preview Template & Variables"
                          className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#4A5B50] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTemplate(tmpl)
                            setIsTestDispatchModalOpen(true)
                          }}
                          title="Simulate Dispatch"
                          className="w-8 h-8 rounded-lg bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Live Dispatches Feed */}
          <div className="harmony-kpi-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5E8256]" />
                <h3 className="text-xs font-bold text-[#18221B] uppercase tracking-wider">
                  Live Dispatch Stream &amp; Gateway Acks
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#4A5B50]">
                Real-time Webhook Receiver
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {systemData.notifications.recentDispatches.map((dsp) => (
                <div
                  key={dsp.id}
                  className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-between shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#18221B]">{dsp.recipient}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#4A5B50]">
                        {dsp.channel}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-[#738679]">
                      Ack: {dsp.ackId} • {dsp.sentAt}
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
                    <CheckCircle2 className="w-3 h-3" />
                    {dsp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: SUPPORT & DISPUTES (PRD A20)                          */}
      {/* ============================================================= */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-fade-in">
          {/* Support KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Active Grievances</span>
                <div className="w-7 h-7 rounded-xl bg-[#C49563]/30 border border-[#8D4E22] text-[#2B1405] flex items-center justify-center font-bold">
                  <LifeBuoy className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#8D4E22]">
                {ticketList.filter((t) => t.status === 'OPEN').length} Open
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Requiring Super Admin resolution
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">SLA Breaches</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#3E5F36]">0 Breaches</div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                100% resolution within 24hr window
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Avg Resolution Time</span>
                <div className="w-7 h-7 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4 text-[#0369A1]" />
                </div>
              </div>
              <div className="text-xl font-black text-[#0369A1]">
                {systemData.support.kpis.avgResolutionTime}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Speedy grievance turnaround
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Farmer Satisfaction</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#18221B]">
                {systemData.support.kpis.satisfactionIndex}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Field verification feedback rating
              </p>
            </div>
          </div>

          {/* Controls Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[#99ABA0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ticket #, farmer, phone, subject..."
                  value={supportSearch}
                  onChange={(e) => setSupportSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#4A5B50] font-bold">
                <span>Category:</span>
                <CustomDropdown
                  value={supportCategoryFilter}
                  onChange={(val) => setSupportCategoryFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Categories', dotColor: '#8D4E22' },
                    { value: 'LAND_DISPUTE', label: 'Land Dispute', dotColor: '#EF4444' },
                    { value: 'PAYOUT_QUERY', label: 'Payout Query', dotColor: '#0284C7' },
                    { value: 'KYC_ASSISTANCE', label: 'KYC Assistance', dotColor: '#F59E0B' },
                    { value: 'PROJECT_MRV', label: 'Project MRV', dotColor: '#5E8256' },
                  ]}
                  className="w-44"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#4A5B50] font-bold">
                <span>Status:</span>
                <CustomDropdown
                  value={supportStatusFilter}
                  onChange={(val) => setSupportStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Statuses', dotColor: '#8D4E22' },
                    { value: 'OPEN', label: 'Open', dotColor: '#EF4444' },
                    { value: 'IN_REVIEW', label: 'In Review', dotColor: '#F59E0B' },
                    { value: 'RESOLVED', label: 'Resolved', dotColor: '#5E8256' },
                  ]}
                  className="w-40"
                />
              </div>
            </div>

            <button
              onClick={() => setIsNewTicketModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto border border-[#6E3812]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Grievance Ticket</span>
            </button>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#4A5B50] font-bold">
                  <th className="py-3 px-4">Ticket # &amp; Priority</th>
                  <th className="py-3 px-4">Farmer / Beneficiary</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Subject &amp; Description</th>
                  <th className="py-3 px-4">SLA Clock</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F1F5F9]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#18221B]">{t.ticketNumber}</div>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 ${
                          t.priority === 'URGENT'
                            ? 'bg-[#C49563] border border-[#8D4E22] text-[#2B1405]'
                            : t.priority === 'HIGH'
                            ? 'bg-[#FFFBEB] border border-[#FCD34D] text-[#92400E]'
                            : 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#4A5B50]'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#18221B]">{t.farmerName}</div>
                      <div className="text-[11px] font-mono text-[#738679]">{t.userPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#4A5B50]">{t.category}</span>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-semibold text-[#18221B]">{t.subject}</div>
                      <p className="text-[11px] text-[#4A5B50] truncate" title={t.description}>
                        {t.description}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {t.status === 'RESOLVED' ? (
                        <span className="text-[11px] font-semibold text-[#3E5F36]">
                          SLA Met
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#D97706]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t.slaHoursRemaining}h remaining</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === 'RESOLVED'
                            ? 'bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]'
                            : t.status === 'IN_REVIEW'
                            ? 'bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1]'
                            : 'bg-[#C49563] border border-[#8D4E22] text-[#2B1405]'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedTicket(t)}
                          title="View Grievance Details"
                          className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#4A5B50] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {t.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleResolveTicket(t.id)}
                            title="Mark Resolved"
                            className="w-8 h-8 rounded-lg bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setTicketToDelete(t)}
                          title="Archive / Dismiss Ticket"
                          className="w-8 h-8 rounded-lg bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: REPORTS & ANALYTICS (PRD A21)                         */}
      {/* ============================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fade-in">
          {/* Reports KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Reports Dossiers</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#18221B]">
                {systemData.reports.kpis.reportsGenerated} Files
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Pre-compiled compliance exports
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Verified Carbon Impact</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#3E5F36]">
                {systemData.reports.kpis.verifiedImpactSummaries}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                BEE &amp; Verra registry aligned
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Scheduled Exports</span>
                <div className="w-7 h-7 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4 text-[#0369A1]" />
                </div>
              </div>
              <div className="text-xl font-black text-[#0369A1]">
                {systemData.reports.kpis.scheduledAutoExports} Active Crons
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Weekly &amp; monthly automated dumps
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Evidence Vault Storage</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#18221B]">
                {systemData.reports.kpis.storageUsed}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Encrypted S3 GovCloud bucket
              </p>
            </div>
          </div>

          {/* Controls Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[#99ABA0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search report title, period, auditor..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#4A5B50] font-bold">
                <span>Category:</span>
                <CustomDropdown
                  value={reportCategoryFilter}
                  onChange={(val) => setReportCategoryFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Categories', dotColor: '#8D4E22' },
                    { value: 'IMPACT_CARBON', label: 'Carbon Impact', dotColor: '#5E8256' },
                    { value: 'FINANCE_PAYOUTS', label: 'Finance Payouts', dotColor: '#0284C7' },
                    { value: 'OPERATIONAL_FIELD', label: 'Field Operations', dotColor: '#D97706' },
                    { value: 'GIS_COMPLIANCE', label: 'GIS & Land', dotColor: '#8B5CF6' },
                    { value: 'IMPACT_WATER', label: 'Water Impact', dotColor: '#06B6D4' },
                  ]}
                  className="w-48"
                />
              </div>
            </div>

            <button
              onClick={() => setIsGenerateReportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto border border-[#6E3812]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compile New Report</span>
            </button>
          </div>

          {/* Reports Catalog Table */}
          <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#4A5B50] font-bold">
                  <th className="py-3 px-4">Report Dossier Title</th>
                  <th className="py-3 px-4">Reporting Window</th>
                  <th className="py-3 px-4">Export Format</th>
                  <th className="py-3 px-4">Generated At</th>
                  <th className="py-3 px-4">Certified By</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F1F5F9]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#18221B]">{r.title}</div>
                      <span className="text-[10px] font-mono text-[#5E8256] font-semibold">
                        {r.category} • {r.fileSize}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#4A5B50]">{r.period}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#4A5B50]">
                        <FileText className="w-3 h-3 text-[#5E8256]" />
                        {r.format}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#4A5B50]">{r.generatedAt}</td>
                    <td className="py-3 px-4 font-medium text-[#4A5B50]">{r.verifiedBy}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
                        <CheckCircle2 className="w-3 h-3" />
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedReport(r)}
                          title="View Report Metadata"
                          className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#4A5B50] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href="#download"
                          onClick={(e) => {
                            e.preventDefault()
                            alert(`Initiating download for ${r.title}`)
                          }}
                          title="Download Dossier Package"
                          className="w-8 h-8 rounded-lg bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: AUDIT LOGS (PRD A22 & §19)                            */}
      {/* ============================================================= */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-6 animate-fade-in">
          {/* Audit KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Total Action Trails</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#18221B]">
                {systemData.auditLogs.kpis.totalAuditEvents}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Immutable ledger write-ahead log
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Cryptographic Proofs</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#3E5F36]">
                {systemData.auditLogs.kpis.verifiedCryptoTrails} Verified
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                SHA-256 state chain unbroken
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Super Admin Changes</span>
                <div className="w-7 h-7 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4 text-[#0369A1]" />
                </div>
              </div>
              <div className="text-xl font-black text-[#0369A1]">
                {systemData.auditLogs.kpis.adminStateChanges}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Gated approval decisions recorded
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Tamper-Proof Ratio</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#18221B]">
                {systemData.auditLogs.kpis.tamperProofRatio}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Zero hash collisions or modifications
              </p>
            </div>
          </div>

          {/* Controls Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[#99ABA0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search actor, entity ID, action, IP..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#4A5B50] font-bold">
                <span>Category:</span>
                <CustomDropdown
                  value={auditCategoryFilter}
                  onChange={(val) => setAuditCategoryFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Categories', dotColor: '#8D4E22' },
                    { value: 'FINANCE', label: 'Finance', dotColor: '#0284C7' },
                    { value: 'KYC', label: 'KYC', dotColor: '#F59E0B' },
                    { value: 'VERIFICATION', label: 'Verification', dotColor: '#5E8256' },
                    { value: 'RBAC', label: 'RBAC Provisioning', dotColor: '#8B5CF6' },
                    { value: 'FIELD_OPS', label: 'Field Operations', dotColor: '#D97706' },
                    { value: 'LAND_GIS', label: 'Land & GIS', dotColor: '#10B981' },
                  ]}
                  className="w-48"
                />
              </div>
            </div>

            <span className="text-[11px] font-mono text-[#738679]">
              Viewing {filteredAuditLogs.length} verified events
            </span>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#4A5B50] font-bold">
                  <th className="py-3 px-4">Timestamp &amp; IP</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Domain Category</th>
                  <th className="py-3 px-4">Action &amp; Target Entity</th>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Cryptographic Hash</th>
                  <th className="py-3 px-4 text-center">Audit Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {filteredAuditLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#F1F5F9]/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-[#18221B]">{entry.timestamp}</div>
                      <div className="text-[10px] font-mono text-[#738679]">IP: {entry.ip}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#18221B]">{entry.actor}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#F8FAFC] border border-[#CBD5E1] text-[#4A5B50]">
                        {entry.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#3E5F36]">{entry.action}</div>
                      <div className="font-mono text-[10px] text-[#5E8256]">{entry.entityId}</div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-[11px] text-[#4A5B50]">{entry.details}</p>
                    </td>
                    <td className="py-3 px-4 max-w-[140px]">
                      <span
                        className="font-mono text-[10px] text-[#738679] block truncate"
                        title={entry.hash}
                      >
                        {entry.hash.substring(0, 16)}...
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedAuditProof(entry)}
                        title="View Immutable Audit Certificate"
                        className="w-8 h-8 rounded-lg bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#C1D6BD] text-[#3E5F36] inline-flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 5: QUESTIONNAIRE ENGINE (PRD A23 & §25)                  */}
      {/* ============================================================= */}
      {activeTab === 'questionnaires' && (
        <div className="space-y-6 animate-fade-in">
          {/* Questionnaires KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Active Schemas</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <FileQuestion className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#18221B]">
                {systemData.questionnaires.kpis.activeQuestionnaires} Types
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Carbon, Water &amp; Biodiversity models
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Total Field Questions</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#3E5F36]">
                {systemData.questionnaires.kpis.totalFieldQuestions} Questions
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Dynamically dispatched to mobile app
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Conditional Branches</span>
                <div className="w-7 h-7 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-[#0369A1]" />
                </div>
              </div>
              <div className="text-xl font-black text-[#0369A1]">
                {systemData.questionnaires.kpis.conditionalRules} Active Rules
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Adaptive questionnaire progression
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Engine Standard</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-sm font-black text-[#18221B] mt-1">
                {systemData.questionnaires.kpis.activeSchemaVersion}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Hot-reload schema compiler active
              </p>
            </div>
          </div>

          {/* Schema Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
            {schemaList.map((schema, idx) => (
              <button
                key={schema.id}
                onClick={() => setSelectedSchemaIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedSchemaIndex === idx
                    ? 'bg-[#8D4E22] text-white shadow-xs border border-[#6E3812]'
                    : 'bg-[#F8FAFC] text-[#4A5B50] hover:bg-[#E2E8F0]'
                }`}
              >
                <span>{schema.projectType}</span>
                <span className="text-[10px] opacity-80 font-mono">({schema.version})</span>
              </button>
            ))}
          </div>

          {/* Active Schema Structure Overview */}
          {(() => {
            const currentSchema = schemaList[selectedSchemaIndex]
            return (
              <div className="harmony-kpi-card p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#18221B]">
                        {currentSchema.projectType} Schema
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
                        {currentSchema.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A5B50] mt-0.5">
                      Schema ID: <span className="font-mono text-[#5E8256]">{currentSchema.id}</span> • Version: {currentSchema.version} • Updated: {currentSchema.updatedAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewQuestionnaireModal(currentSchema)}
                      className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#4A5B50] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>App Preview</span>
                    </button>
                    <button
                      onClick={() => setIsAddQuestionModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-[#6E3812]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>

                {/* Sections & Questions */}
                <div className="space-y-4">
                  {currentSchema.sections.map((sec: any, secIdx: number) => (
                    <div
                      key={sec.id}
                      className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#18221B] uppercase tracking-wider">
                          Section {secIdx + 1}: {sec.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#738679]">
                          {sec.questions.length} Fields
                        </span>
                      </div>

                      <div className="divide-y divide-[#F1F5F9]">
                        {sec.questions.map((q: any) => (
                          <div
                            key={q.id}
                            className="py-2.5 flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#1E293B]">{q.label}</span>
                                {q.required && (
                                  <span className="text-[10px] font-bold text-[#8D4E22]">
                                    *Required
                                  </span>
                                )}
                              </div>
                              {q.options && (
                                <div className="text-[11px] text-[#738679]">
                                  Options: {q.options.join(', ')}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F8FAFC] border border-[#E2E8F0] text-[#4A5B50]">
                                {q.type}
                              </span>
                              <button
                                onClick={() =>
                                  alert(`Configuring conditional rules for ${q.id}`)
                                }
                                title="Configure Rules"
                                className="w-7 h-7 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#4A5B50] flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 6: SYSTEM SETTINGS & INFRASTRUCTURE (PRD A24)             */}
      {/* ============================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-fade-in">
          {/* Settings KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Platform Health</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-sm font-black text-[#3E5F36]">
                {systemData.settings.kpis.platformStatus}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                High-availability redundant clusters
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Active API Credentials</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#18221B]">
                {systemData.settings.kpis.activeApiKeys} Keys
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Mapbox, Bhuvan, PFMS &amp; Meta APIs
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">DPDP 2025 Enforced</span>
                <div className="w-7 h-7 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#0369A1]" />
                </div>
              </div>
              <div className="text-sm font-black text-[#0369A1]">
                {systemData.settings.kpis.dpdpCompliance}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Digital Personal Data Protection audit active
              </p>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">S3 Storage Vault</span>
                <div className="w-7 h-7 rounded-xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="text-sm font-black text-[#18221B]">
                {systemData.settings.kpis.s3VaultHealth}
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Immutable 7-year retention locked
              </p>
            </div>
          </div>

          {/* 4 Infrastructure Configuration Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* GIS & Maps Configuration */}
            <div className="harmony-kpi-card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <MapPin className="w-4 h-4 text-[#5E8256]" />
                <h3 className="text-xs font-bold text-[#18221B] uppercase tracking-wider">
                  Spatial GIS &amp; Mapbox Configuration
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#4A5B50] mb-1">GIS Engine Provider</label>
                  <input
                    type="text"
                    value={settingsForm.gisProvider.name}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#4A5B50] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A5B50] mb-1">
                    Mapbox GL Access Token (Masked)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.gisProvider.apiKeyMasked}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] font-mono text-[#738679]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">Projection Datum</label>
                    <input
                      type="text"
                      value={settingsForm.gisProvider.defaultProjection}
                      readOnly
                      className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">Tolerance</label>
                    <input
                      type="text"
                      value={settingsForm.gisProvider.polygonValidationTolerance}
                      readOnly
                      className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* S3 Storage & Evidence Vault */}
            <div className="harmony-kpi-card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <Database className="w-4 h-4 text-[#5E8256]" />
                <h3 className="text-xs font-bold text-[#18221B] uppercase tracking-wider">
                  S3 Evidence Vault &amp; Retention
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#4A5B50] mb-1">S3 Bucket Name</label>
                  <input
                    type="text"
                    value={settingsForm.storageVault.bucketName}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] font-mono text-[#4A5B50]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A5B50] mb-1">Encryption Mode</label>
                  <input
                    type="text"
                    value={settingsForm.storageVault.encryption}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] font-semibold text-[#3E5F36]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A5B50] mb-1">
                    Compliance Retention Guarantee
                  </label>
                  <input
                    type="text"
                    value={settingsForm.storageVault.immutableRetention}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#4A5B50]"
                  />
                </div>
              </div>
            </div>

            {/* Gateway Connectors */}
            <div className="harmony-kpi-card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <Send className="w-4 h-4 text-[#5E8256]" />
                <h3 className="text-xs font-bold text-[#18221B] uppercase tracking-wider">
                  External Communication &amp; Payment Nodes
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#4A5B50] mb-1">TRAI DLT SMS Node</label>
                  <input
                    type="text"
                    value={settingsForm.gateways.smsGateway}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#4A5B50]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A5B50] mb-1">Meta WhatsApp API Node</label>
                  <input
                    type="text"
                    value={settingsForm.gateways.whatsappApi}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#3E5F36] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A5B50] mb-1">PFMS Direct Benefit Node</label>
                  <input
                    type="text"
                    value={settingsForm.gateways.payoutGateway}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#4A5B50]"
                  />
                </div>
              </div>
            </div>

            {/* Security Compliance Toggles */}
            <div className="harmony-kpi-card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <Lock className="w-4 h-4 text-[#5E8256]" />
                <h3 className="text-xs font-bold text-[#18221B] uppercase tracking-wider">
                  Governance &amp; Security Toggles
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E2E8F0] bg-white">
                  <div>
                    <div className="font-bold text-[#18221B]">DPDP 2025 Consent Enforced</div>
                    <div className="text-[11px] text-[#738679]">
                      Require farmer digital thumbprint/OTP before project enrollment
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.securityCompliance.dpdpConsentEnforced}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        securityCompliance: {
                          ...prev.securityCompliance,
                          dpdpConsentEnforced: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 accent-[#3E5F36] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E2E8F0] bg-white">
                  <div>
                    <div className="font-bold text-[#18221B]">Super Admin 2FA / MFA Required</div>
                    <div className="text-[11px] text-[#738679]">
                      Time-based OTP token for all financial batch approvals
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.securityCompliance.superAdminMfaRequired}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        securityCompliance: {
                          ...prev.securityCompliance,
                          superAdminMfaRequired: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 accent-[#3E5F36] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E2E8F0] bg-white">
                  <div>
                    <div className="font-bold text-[#18221B]">Platform Maintenance Mode</div>
                    <div className="text-[11px] text-[#738679]">
                      Temporarily pause mobile field sync and public portal
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.securityCompliance.maintenanceMode}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        securityCompliance: {
                          ...prev.securityCompliance,
                          maintenanceMode: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 accent-[#DC2626] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer border border-[#6E3812]"
            >
              <Check className="w-4 h-4" />
              <span>Save System &amp; Governance Configurations</span>
            </button>
          </div>
        </form>
      )}

      {/* ============================================================= */}
      {/* MODALS & DRAWERS                                              */}
      {/* ============================================================= */}

      {/* 1. Template Preview Modal */}
      {selectedTemplate && !isTestDispatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D19E77] shadow-xl max-w-lg w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#18221B]">{selectedTemplate.name}</h3>
                <p className="text-[11px] font-mono text-[#5E8256]">
                  Trigger: {selectedTemplate.triggerEvent}
                </p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#738679] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#738679] uppercase">
                  Template Body (Variables Highlighted)
                </div>
                <p className="text-xs text-[#18221B] mt-1 leading-relaxed font-medium">
                  {selectedTemplate.body}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#738679]">Channel:</span>{' '}
                  <span className="font-bold text-[#3E5F36]">{selectedTemplate.channel}</span>
                </div>
                <div>
                  <span className="text-[#738679]">Recipient:</span>{' '}
                  <span className="font-bold text-[#18221B]">{selectedTemplate.recipientRole}</span>
                </div>
                <div>
                  <span className="text-[#738679]">CTA Button:</span>{' '}
                  <span className="font-bold text-[#4A5B50]">{selectedTemplate.cta}</span>
                </div>
                <div>
                  <span className="text-[#738679]">Historical Dispatches:</span>{' '}
                  <span className="font-bold text-[#18221B]">
                    {selectedTemplate.dispatchedCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#4A5B50] text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Test Dispatch Modal */}
      {isTestDispatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D19E77] shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#5E8256]" />
                <h3 className="text-sm font-bold text-[#18221B]">Simulate Notification Dispatch</h3>
              </div>
              <button
                onClick={() => setIsTestDispatchModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#738679] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTestDispatchSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4A5B50] mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={testDispatchForm.recipientName}
                  onChange={(e) =>
                    setTestDispatchForm((prev) => ({ ...prev, recipientName: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A5B50] mb-1">
                  Recipient Phone (WhatsApp / SMS)
                </label>
                <input
                  type="text"
                  required
                  value={testDispatchForm.recipientPhone}
                  onChange={(e) =>
                    setTestDispatchForm((prev) => ({ ...prev, recipientPhone: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A5B50] mb-1">Gateway Route</label>
                <CustomDropdown
                  value={testDispatchForm.channel}
                  onChange={(val) => setTestDispatchForm((prev) => ({ ...prev, channel: val }))}
                  options={[
                    { value: 'WhatsApp + SMS', label: 'WhatsApp + SMS (Dual Redundant)' },
                    { value: 'WhatsApp', label: 'Meta Cloud API (WhatsApp Only)' },
                    { value: 'SMS', label: 'Airtel DLT SMS Only' },
                    { value: 'Push', label: 'FCM In-App Push Only' },
                  ]}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsTestDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#4A5B50] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white font-bold flex items-center gap-1.5 border border-[#6E3812]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Ticket Detail Drawer / Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D19E77] shadow-xl max-w-lg w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#18221B]">{selectedTicket.ticketNumber}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C49563] border border-[#8D4E22] text-[#2B1405]">
                    {selectedTicket.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-[#4A5B50] mt-0.5">
                  Category: {selectedTicket.category} • Created: {selectedTicket.createdAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#738679] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="text-[10px] font-bold text-[#738679] uppercase">Subject</div>
                <div className="font-bold text-[#18221B] text-sm">{selectedTicket.subject}</div>
                <p className="text-xs text-[#4A5B50] leading-relaxed pt-1">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-[#E2E8F0] bg-white text-xs">
                <div>
                  <span className="text-[#738679]">Complainant:</span>{' '}
                  <span className="font-bold text-[#18221B]">{selectedTicket.farmerName}</span>
                </div>
                <div>
                  <span className="text-[#738679]">Phone:</span>{' '}
                  <span className="font-mono text-[#18221B]">{selectedTicket.userPhone}</span>
                </div>
                <div>
                  <span className="text-[#738679]">Assigned Desk:</span>{' '}
                  <span className="font-medium text-[#4A5B50]">{selectedTicket.assignedTo}</span>
                </div>
                <div>
                  <span className="text-[#738679]">Status:</span>{' '}
                  <span className="font-bold text-[#3E5F36]">{selectedTicket.status}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#4A5B50] text-xs font-bold"
              >
                Close
              </button>
              {selectedTicket.status !== 'RESOLVED' && (
                <button
                  onClick={() => {
                    handleResolveTicket(selectedTicket.id)
                    setSelectedTicket(null)
                  }}
                  className="px-4 py-2 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-bold flex items-center gap-1.5 border border-[#6E3812]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Grievance Resolved</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Log Grievance Modal */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D19E77] shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#18221B]">Create Grievance Ticket</h3>
              <button
                onClick={() => setIsNewTicketModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#738679] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4A5B50] mb-1">Farmer / Complainant</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra Patel"
                  value={newTicketForm.farmerName}
                  onChange={(e) =>
                    setNewTicketForm((prev) => ({ ...prev, farmerName: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A5B50] mb-1">Category</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) =>
                      setNewTicketForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                  >
                    <option value="LAND_DISPUTE">Land Dispute</option>
                    <option value="PAYOUT_QUERY">Payout Query</option>
                    <option value="KYC_ASSISTANCE">KYC Assistance</option>
                    <option value="PROJECT_MRV">Project MRV</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#4A5B50] mb-1">Priority</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) =>
                      setNewTicketForm((prev) => ({ ...prev, priority: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A5B50] mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Short grievance summary"
                  value={newTicketForm.subject}
                  onChange={(e) =>
                    setNewTicketForm((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A5B50] mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={newTicketForm.description}
                  onChange={(e) =>
                    setNewTicketForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Provide dispute specifics or survey numbers..."
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#4A5B50] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white font-bold border border-[#6E3812]"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Ticket Confirmation */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-[#8D4E22] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C49563]/30 border border-[#8D4E22] flex items-center justify-center text-[#2B1405]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#18221B]">Archive Grievance Ticket?</h3>
                <p className="text-xs text-[#738679]">Ticket {ticketToDelete.ticketNumber}</p>
              </div>
            </div>

            <p className="text-xs text-[#4A5B50] leading-relaxed">
              Are you sure you want to dismiss this ticket filed by {ticketToDelete.farmerName}? This action will be recorded in the immutable audit log.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#C49563]/20 text-[#4A5B50] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTicket}
                className="px-4 py-2 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Archive Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Cryptographic Audit Proof Modal */}
      {selectedAuditProof && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D19E77] shadow-xl max-w-lg w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#3E5F36]" />
                <h3 className="text-sm font-bold text-[#18221B]">
                  Cryptographic Audit Proof (SHA-256)
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuditProof(null)}
                className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#738679] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#E6EFE4] border border-[#C1D6BD] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#3E5F36] uppercase">
                    Tamper-Proof SHA-256 Hash
                  </span>
                  <span className="text-[10px] font-bold text-[#3E5F36]">VERIFIED VALID</span>
                </div>
                <div className="font-mono text-[11px] text-[#18221B] break-all p-2 rounded bg-white border border-[#C1D6BD]">
                  {selectedAuditProof.hash}
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl border border-[#E2E8F0] bg-white">
                <div className="flex justify-between">
                  <span className="text-[#738679]">Event ID:</span>
                  <span className="font-mono font-bold text-[#18221B]">
                    {selectedAuditProof.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738679]">Action:</span>
                  <span className="font-bold text-[#3E5F36]">{selectedAuditProof.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738679]">Target Entity:</span>
                  <span className="font-mono text-[#5E8256]">{selectedAuditProof.entityId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738679]">Actor:</span>
                  <span className="font-bold text-[#18221B]">{selectedAuditProof.actor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738679]">Origin IP:</span>
                  <span className="font-mono text-[#4A5B50]">{selectedAuditProof.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738679]">Timestamp:</span>
                  <span className="font-mono text-[#4A5B50]">{selectedAuditProof.timestamp}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#738679] uppercase">Event Payload</div>
                <p className="text-xs text-[#18221B] mt-1">{selectedAuditProof.details}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedAuditProof(null)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#4A5B50] text-xs font-bold"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Generate Custom Report Modal */}
      {isGenerateReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D19E77] shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#18221B]">Compile New Compliance Report</h3>
              <button
                onClick={() => setIsGenerateReportModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#738679] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4A5B50] mb-1">Dossier Title</label>
                <input
                  type="text"
                  required
                  value={generateReportForm.title}
                  onChange={(e) =>
                    setGenerateReportForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A5B50] mb-1">Report Category</label>
                <select
                  value={generateReportForm.category}
                  onChange={(e) =>
                    setGenerateReportForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                >
                  <option value="IMPACT_CARBON">Carbon Impact &amp; Sequestration</option>
                  <option value="FINANCE_PAYOUTS">Finance &amp; Escrow Reconciliation</option>
                  <option value="OPERATIONAL_FIELD">Field Agent Visit Compliance</option>
                  <option value="GIS_COMPLIANCE">GIS &amp; Land Boundary Disputes</option>
                  <option value="IMPACT_WATER">Water Stewardship &amp; Aquifers</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A5B50] mb-1">Period</label>
                  <input
                    type="text"
                    value={generateReportForm.period}
                    onChange={(e) =>
                      setGenerateReportForm((prev) => ({ ...prev, period: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#4A5B50] mb-1">Format</label>
                  <select
                    value={generateReportForm.format}
                    onChange={(e) =>
                      setGenerateReportForm((prev) => ({ ...prev, format: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                  >
                    <option value="PDF / Encrypted Dossier">PDF / Encrypted Dossier</option>
                    <option value="CSV / Bank Format">CSV / Bank Reconciliation</option>
                    <option value="XLSX / Executive Sheet">XLSX / Executive Sheet</option>
                    <option value="GeoJSON Package">GeoJSON Package</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsGenerateReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#4A5B50] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportGenerating}
                  className="px-4 py-2 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white font-bold flex items-center gap-1.5 border border-[#6E3812]"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${reportGenerating ? 'animate-spin' : ''}`}
                  />
                  <span>{reportGenerating ? 'Compiling...' : 'Generate Dossier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. App Preview Modal for Questionnaire */}
      {previewQuestionnaireModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D19E77] shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#18221B]">
                  Mobile Field App Form Simulation
                </h3>
                <p className="text-[11px] text-[#4A5B50]">
                  {previewQuestionnaireModal.projectType}
                </p>
              </div>
              <button
                onClick={() => setPreviewQuestionnaireModal(null)}
                className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#738679] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1 text-xs">
              {previewQuestionnaireModal.sections.map((sec: any) => (
                <div key={sec.id} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-2.5">
                  <div className="font-bold text-[#18221B] uppercase tracking-wider text-[11px]">
                    {sec.title}
                  </div>
                  {sec.questions.map((q: any) => (
                    <div key={q.id} className="space-y-1">
                      <label className="block font-semibold text-[#4A5B50]">
                        {q.label} {q.required && <span className="text-[#8D4E22]">*</span>}
                      </label>
                      {q.type === 'SELECT' ? (
                        <select className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs">
                          {q.options?.map((opt: string) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : q.type === 'NUMBER' ? (
                        <input
                          type="number"
                          placeholder="Enter numeric value..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder="Tap to capture GPS or input..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setPreviewQuestionnaireModal(null)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#4A5B50] text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Add Question Modal */}
      {isAddQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D19E77] shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#18221B]">Add New Schema Field</h3>
              <button
                onClick={() => setIsAddQuestionModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#738679] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddQuestionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4A5B50] mb-1">Question Prompt</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tree Survival Rate (%)"
                  value={newQuestionForm.label}
                  onChange={(e) =>
                    setNewQuestionForm((prev) => ({ ...prev, label: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A5B50] mb-1">Input Field Type</label>
                <select
                  value={newQuestionForm.type}
                  onChange={(e) =>
                    setNewQuestionForm((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                >
                  <option value="SELECT">Single Select Dropdown</option>
                  <option value="MULTI_SELECT">Multi-Select Checkboxes</option>
                  <option value="NUMBER">Numeric Input</option>
                  <option value="GEOTAG">GPS Coordinates</option>
                  <option value="TEXT">Free Text Field</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#4A5B50] mb-1">
                  Options (Comma separated, for SELECT)
                </label>
                <input
                  type="text"
                  value={newQuestionForm.optionsStr}
                  onChange={(e) =>
                    setNewQuestionForm((prev) => ({ ...prev, optionsStr: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#5E8256]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqQ"
                  checked={newQuestionForm.required}
                  onChange={(e) =>
                    setNewQuestionForm((prev) => ({ ...prev, required: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#3E5F36]"
                />
                <label htmlFor="reqQ" className="font-bold text-[#4A5B50]">
                  Mandatory field for project screening
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#4A5B50] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white font-bold border border-[#6E3812]"
                >
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Selected Report Metadata Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D19E77] shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#18221B]">{selectedReport.title}</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#738679] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#738679]">Category:</span>
                <span className="font-bold text-[#3E5F36]">{selectedReport.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#738679]">Period:</span>
                <span className="font-semibold text-[#18221B]">{selectedReport.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#738679]">Format:</span>
                <span className="font-mono text-[#18221B]">{selectedReport.format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#738679]">File Size:</span>
                <span className="font-bold text-[#4A5B50]">{selectedReport.fileSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#738679]">Verification Seal:</span>
                <span className="font-bold text-[#3E5F36]">{selectedReport.verifiedBy}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#4A5B50] text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
