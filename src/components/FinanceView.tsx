import { useState, useMemo, useEffect } from 'react'
import {
  Receipt,
  Banknote,
  Building2,
  Check,
  Trash2,
  Eye,
  AlertTriangle,
  Search,
  X,
  Download,
  Plus,
  FileText,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react'
import financeData from '../data/financeData.json'
import CustomDropdown from './CustomDropdown'

interface FinanceViewProps {
  initialSubTab?: string
  onNavigateSubTab?: (subTabKey: string) => void
}

type SubTabKey = 'benefit-ledger' | 'payouts'

export interface BenefitObligation {
  id: string
  farmerId: string
  farmerName: string
  farmerPhone: string
  parcelId: string
  khasra: string
  acreage: number
  projectId: string
  projectName: string
  benefitType: string
  entitlementAmount: number
  calculationBasis: string
  mrvMilestoneId: string
  bankDetails: {
    accountMasked: string
    ifsc: string
    bankName: string
    beneficiaryName: string
    payoutMethod: string
  }
  status: string
  accruedDate: string
  approvalDate: string
  approvedBy: string
  location: string
}

export interface PayoutBatch {
  id: string
  title: string
  totalBeneficiaries: number
  totalAmount: number
  sponsorFund: string
  executionDate: string
  channel: string
  escrowAccount: string
  status: string
  successfulCount: number
  failedCount: number
  utrRange: string
}

export interface SettlementTxn {
  id: string
  batchId: string
  farmerName: string
  farmerPhone: string
  amount: number
  bank: string
  ifsc: string
  accountMasked: string
  utr: string
  status: string
  settledAt: string
  ackNumber: string
}

export default function FinanceView({
  initialSubTab = 'benefit-ledger',
  onNavigateSubTab,
}: FinanceViewProps) {
  const [activeTab, setActiveTab] = useState<SubTabKey>(() => {
    if (initialSubTab === 'payouts') return 'payouts'
    return 'benefit-ledger'
  })

  // Sync tab when initialSubTab changes from parent or sidebar navigation
  useEffect(() => {
    if (initialSubTab === 'benefit-ledger' || initialSubTab === 'payouts') {
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
  const [benefits, setBenefits] = useState<BenefitObligation[]>(
    financeData.benefitObligations as BenefitObligation[]
  )
  const [batches, setBatches] = useState<PayoutBatch[]>(
    financeData.payoutBatches as PayoutBatch[]
  )
  const [transactions, setTransactions] = useState<SettlementTxn[]>(
    financeData.settlementTransactions as SettlementTxn[]
  )

  // -------------------------------------------------------------
  // TAB 1: Benefit Obligations State & Filters
  // -------------------------------------------------------------
  const [benefitSearch, setBenefitSearch] = useState('')
  const [benefitStatusFilter, setBenefitStatusFilter] = useState('ALL')
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitObligation | null>(null)
  const [benefitToDelete, setBenefitToDelete] = useState<BenefitObligation | null>(null)
  const [isAccrueModalOpen, setIsAccrueModalOpen] = useState(false)
  const [accrueForm, setAccrueForm] = useState({
    farmerName: '',
    parcelId: 'PARCEL-MP-0891',
    khasra: 'Khasra 142/2',
    acreage: '10.0',
    benefitType: 'Carbon Sequestration Insetting (Tranche 1)',
    ratePerAcre: '7000',
    location: 'Ashta, Sehore (MP)',
  })

  // -------------------------------------------------------------
  // TAB 2: Payouts & Settlements State & Filters
  // -------------------------------------------------------------
  const [payoutSearch, setPayoutSearch] = useState('')
  const [batchStatusFilter, setBatchStatusFilter] = useState('ALL')
  const [selectedTxn, setSelectedTxn] = useState<SettlementTxn | null>(null)
  const [isExecuteBatchModalOpen, setIsExecuteBatchModalOpen] = useState(false)
  const [newBatchForm, setNewBatchForm] = useState({
    title: 'Q3 2026 Direct Benefit Transfer Batch',
    sponsorFund: 'Tata Motors Green Horizon Fund',
    totalBeneficiaries: '45',
    totalAmount: '3150000',
    channel: 'PFMS / Direct Benefit Transfer (DBT)',
  })

  // -------------------------------------------------------------
  // Filtered Benefits
  // -------------------------------------------------------------
  const filteredBenefits = useMemo(() => {
    return benefits.filter((b) => {
      const q = benefitSearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        b.id.toLowerCase().includes(q) ||
        b.farmerName.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.projectName.toLowerCase().includes(q) ||
        b.benefitType.toLowerCase().includes(q)

      const matchesStatus =
        benefitStatusFilter === 'ALL' || b.status === benefitStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [benefits, benefitSearch, benefitStatusFilter])

  // -------------------------------------------------------------
  // Filtered Transactions
  // -------------------------------------------------------------
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const q = payoutSearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.farmerName.toLowerCase().includes(q) ||
        t.utr.toLowerCase().includes(q) ||
        t.bank.toLowerCase().includes(q) ||
        t.batchId.toLowerCase().includes(q)

      const matchesStatus =
        batchStatusFilter === 'ALL' || t.status === batchStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [transactions, payoutSearch, batchStatusFilter])

  // -------------------------------------------------------------
  // Actions: Benefits
  // -------------------------------------------------------------
  const handleApproveBenefit = (id: string) => {
    setBenefits((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: 'APPROVED',
              approvalDate: 'Today (Super Admin Gate)',
              approvedBy: 'Super Admin (admin@naturex.io)',
            }
          : b
      )
    )
    if (selectedBenefit?.id === id) {
      setSelectedBenefit((prev) =>
        prev
          ? {
              ...prev,
              status: 'APPROVED',
              approvalDate: 'Today (Super Admin Gate)',
              approvedBy: 'Super Admin (admin@naturex.io)',
            }
          : null
      )
    }
  }

  const handleDeleteBenefit = () => {
    if (!benefitToDelete) return
    const id = benefitToDelete.id
    setBenefits((prev) => prev.filter((b) => b.id !== id))
    if (selectedBenefit?.id === id) setSelectedBenefit(null)
    setBenefitToDelete(null)
  }

  const handleAccrueSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accrueForm.farmerName) return

    const acr = parseFloat(accrueForm.acreage) || 10.0
    const rate = parseFloat(accrueForm.ratePerAcre) || 7000
    const total = acr * rate

    const newBen: BenefitObligation = {
      id: `BEN-2026-${Math.floor(7700 + Math.random() * 200)}`,
      farmerId: `USR-FARM-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerName: accrueForm.farmerName,
      farmerPhone: '+91 98000 11223',
      parcelId: accrueForm.parcelId,
      khasra: accrueForm.khasra,
      acreage: acr,
      projectId: 'PRJ-CAR-2026-001',
      projectName: 'Indore-Dewas Agroforestry Carbon Sequestration',
      benefitType: accrueForm.benefitType,
      entitlementAmount: total,
      calculationBasis: `${acr} Acres × ₹${rate.toLocaleString()} / Acre`,
      mrvMilestoneId: 'MRV-CYC-2026-01',
      bankDetails: {
        accountMasked: '•••• 1122',
        ifsc: 'SBIN0001245',
        bankName: 'State Bank of India',
        beneficiaryName: accrueForm.farmerName,
        payoutMethod: 'DBT / Direct Bank Transfer',
      },
      status: 'APPROVED',
      accruedDate: 'Today',
      approvalDate: 'Today (Direct Accrual)',
      approvedBy: 'Super Admin (admin@naturex.io)',
      location: accrueForm.location,
    }

    setBenefits((prev) => [newBen, ...prev])
    setIsAccrueModalOpen(false)
  }

  // -------------------------------------------------------------
  // Actions: Payouts
  // -------------------------------------------------------------
  const handleExecuteBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const count = parseInt(newBatchForm.totalBeneficiaries) || 45
    const amt = parseInt(newBatchForm.totalAmount) || 3150000

    const newBatch: PayoutBatch = {
      id: `BATCH-2026-${Math.floor(10 + Math.random() * 90)}X`,
      title: newBatchForm.title,
      totalBeneficiaries: count,
      totalAmount: amt,
      sponsorFund: newBatchForm.sponsorFund,
      executionDate: 'Today',
      channel: newBatchForm.channel,
      escrowAccount: 'HDFC Bank Escrow AC #99210084',
      status: 'SETTLED',
      successfulCount: count,
      failedCount: 0,
      utrRange: `HDFCR520260922${Math.floor(1000 + Math.random() * 9000)}`,
    }

    const newTxn: SettlementTxn = {
      id: `TXN-2026-${Math.floor(9000 + Math.random() * 999)}`,
      batchId: newBatch.id,
      farmerName: 'Direct Pool Beneficiaries',
      farmerPhone: '+91 98930 11000',
      amount: amt,
      bank: 'HDFC Escrow Gateway',
      ifsc: 'HDFC0000240',
      accountMasked: '•••• 8901',
      utr: newBatch.utrRange,
      status: 'SUCCESS',
      settledAt: 'Today',
      ackNumber: `ACK-${Math.floor(100000 + Math.random() * 900000)}`,
    }

    setBatches((prev) => [newBatch, ...prev])
    setTransactions((prev) => [newTxn, ...prev])
    setIsExecuteBatchModalOpen(false)
  }

  // -------------------------------------------------------------
  // Minimalist Badge Helpers
  // -------------------------------------------------------------
  const renderBenefitStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase()
    if (s === 'DISBURSED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5E8256] flex-shrink-0" />
          <span>Disbursed</span>
        </span>
      )
    }
    if (s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] flex-shrink-0" />
          <span>Approved</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFFBEB] border border-[#FEF3C7] text-[#B45309]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
        <span>Pending Gate</span>
      </span>
    )
  }

  const renderTxnStatusBadge = (status: string) => {
    if (status === 'SETTLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6EFE4] text-[#3E5F36] border border-[#C1D6BD]">
          <span>✓ Settled</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]">
        <span>⏳ In Clearing</span>
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
            onClick={() => handleTabChange('benefit-ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'benefit-ledger'
                ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
                : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Obligations Ledger</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                activeTab === 'benefit-ledger'
                  ? 'bg-[#6E3812] text-white border-white/20'
                  : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
            >
              {benefits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('payouts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'payouts'
                ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
                : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
          >
            <Banknote className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Payouts &amp; Settlements</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                activeTab === 'payouts'
                  ? 'bg-[#6E3812] text-white border-white/20'
                  : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
            >
              {batches.length} Batches
            </span>
          </button>
        </div>

        {/* Top Action Button */}
        <div>
          {activeTab === 'benefit-ledger' ? (
            <button
              type="button"
              onClick={() => setIsAccrueModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Accrue Obligation</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsExecuteBatchModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Execute DBT Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. SUB-PAGE 1: BENEFIT OBLIGATIONS LEDGER (PRD A18)            */}
      {/* ============================================================= */}
      {activeTab === 'benefit-ledger' && (
        <div className="space-y-6">
          {/* Sea Green Tinted KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Total Obligations</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Receipt className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {financeData.summaryStats.totalObligations.value}
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Accrued</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>{financeData.summaryStats.totalObligations.farmerCount} Farmers</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  F08 Gate
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Disbursed via DBT</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {financeData.summaryStats.totalDisbursed.value}
                </span>
                <span className="text-[11px] font-bold text-[#3E5F36]">Settled Bank A/C</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>{financeData.summaryStats.totalDisbursed.payoutCount} Successful</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  99.2% SLA
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Pending Super Admin Gate</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#B45309] flex items-center justify-center font-bold shadow-2xs">
                  <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {financeData.summaryStats.pendingApproval.value}
                </span>
                <span className="text-[11px] font-bold text-[#B45309]">Queued Signoff</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>{financeData.summaryStats.pendingApproval.count} Entitlements</span>
                <span className="badge-warning-tint px-2 py-0.5 rounded-full text-[10px]">
                  48h SLA
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Escrow Bank Liquidity</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
                  <Building2 className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {financeData.summaryStats.escrowBalance.value}
                </span>
                <span className="text-[11px] font-bold text-[#0369A1]">HDFC Escrow</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Interest: ₹14.2 Lakhs</span>
                <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
                  Protected Trust
                </span>
              </div>
            </div>
          </div>

          {/* Obligations Master Table Card */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#8D4E22]" />
                  <span>Farmer Benefit Obligations Ledger (PRD A18 &amp; §18)</span>
                </h3>
                <p className="text-xs text-[#4A5B50] font-semibold">
                  Accrued farmer entitlements linked to verified MRV milestones, acreage calculations, and bank mandates
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search benefit ID, farmer, village..."
                    value={benefitSearch}
                    onChange={(e) => setBenefitSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs text-[#18221B] font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>

                <CustomDropdown
                  value={benefitStatusFilter}
                  onChange={(val) => setBenefitStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Obligation Statuses', dotColor: '#8D4E22' },
                    { value: 'APPROVED', label: 'Approved', dotColor: '#0284C7' },
                    { value: 'DISBURSED', label: 'Disbursed via DBT', dotColor: '#5E8256' },
                    { value: 'PENDING_APPROVAL', label: 'Pending Approval', dotColor: '#F59E0B' },
                  ]}
                  className="w-56"
                />
              </div>
            </div>

            {/* Obligations Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Obligation &amp; Landholder</th>
                    <th className="p-3.5">Parcel &amp; Location</th>
                    <th className="p-3.5">Benefit Type &amp; Calculation</th>
                    <th className="p-3.5">Entitlement Amount</th>
                    <th className="p-3.5">Beneficiary Bank A/C</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFD5]">
                  {filteredBenefits.map((ben) => (
                    <tr
                      key={ben.id}
                      className="hover:bg-[#F9F6F1] transition-colors cursor-pointer"
                      onClick={() => setSelectedBenefit(ben)}
                    >
                      {/* Obligation & Landholder */}
                      <td className="p-3.5">
                        <div className="font-black text-[#18221B] text-sm">
                          {ben.farmerName}
                        </div>
                        <div className="text-[11px] font-mono text-[#4A5B50] font-bold">
                          {ben.id} • {ben.farmerId}
                        </div>
                      </td>

                      {/* Parcel & Location */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-[#18221B]">{ben.khasra}</div>
                        <div className="text-[10px] text-[#4A5B50]">{ben.location}</div>
                      </td>

                      {/* Benefit Type & Calculation Basis */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{ben.benefitType}</div>
                        <div className="text-[10px] text-[#8D4E22] font-bold truncate max-w-xs">
                          {ben.calculationBasis}
                        </div>
                      </td>

                      {/* Entitlement Amount */}
                      <td className="p-3.5">
                        <div className="font-black text-sm text-[#18221B]">
                          ₹{ben.entitlementAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#738679]">
                          Accrued: {ben.accruedDate}
                        </div>
                      </td>

                      {/* Beneficiary Bank Account */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">
                          {ben.bankDetails.bankName}
                        </div>
                        <div className="text-[10px] text-[#4A5B50] font-mono">
                          {ben.bankDetails.accountMasked} ({ben.bankDetails.ifsc})
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">{renderBenefitStatusBadge(ben.status)}</td>

                      {/* Strictly Icon-Only Actions */}
                      <td className="p-3.5 text-right">
                        <div
                          className="inline-flex items-center gap-1.5 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedBenefit(ben)}
                            title="Inspect Benefit Dossier & Calculation Sheet Drawer"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {ben.status === 'PENDING_APPROVAL' && (
                            <button
                              type="button"
                              onClick={() => handleApproveBenefit(ben.id)}
                              title="Authorize Benefit Approval Gate"
                              className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setBenefitToDelete(ben)}
                            title="Put On Hold / Remove Obligation"
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
      {/* 3. SUB-PAGE 2: PAYOUTS & BANKING SETTLEMENTS (PRD A18)         */}
      {/* ============================================================= */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          {/* Sea Green Tinted KPI Summary Cards for Payouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Executed Batches</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Banknote className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">{batches.length}</span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Disbursement Runs</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>PFMS / NPCI Channel</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  DBT Engine
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Total Batch Volume</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">₹2.07 Cr</span>
                <span className="text-[11px] font-bold text-[#3E5F36]">Direct Transfers</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>292 Smallholders Paid</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  Zero Bounce
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">In Clearing Pipeline</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
                  <CreditCard className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">₹44.80 L</span>
                <span className="text-[11px] font-bold text-[#0369A1]">Clearing Cycle</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>BATCH-2026-09C</span>
                <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
                  Settlement Today
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Reconciliation Audit</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <FileText className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">100%</span>
                <span className="text-[11px] font-bold text-[#8D4E22]">UTR Matched</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Statutory Tax Tally</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  Audit Proof
                </span>
              </div>
            </div>
          </div>

          {/* Batches Cards & Line-item Transactions */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-[#8D4E22]" />
                  <span>PFMS Direct Benefit Transfer Batches &amp; UTR Trails</span>
                </h3>
                <p className="text-xs text-[#4A5B50] font-semibold">
                  View executed payment gateway batches, beneficiary UTR numbers, and bank settlement reconciliation records
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search UTR, farmer, bank..."
                    value={payoutSearch}
                    onChange={(e) => setPayoutSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs text-[#18221B] font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>

                <CustomDropdown
                  value={batchStatusFilter}
                  onChange={(val) => setBatchStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Settlement Status', dotColor: '#8D4E22' },
                    { value: 'SETTLED', label: 'Settled', dotColor: '#5E8256' },
                    { value: 'PROCESSING', label: 'In Clearing', dotColor: '#F59E0B' },
                  ]}
                  className="w-48"
                />
              </div>
            </div>

            {/* Batches Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-4 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-2 hover:border-[#8D4E22] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#8D4E22] bg-white border border-[#D8B293] px-2 py-0.5 rounded-lg shadow-2xs">
                      {batch.id}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        batch.status === 'SETTLED' ? 'badge-mint-tint' : 'badge-sky-tint'
                      }`}
                    >
                      {batch.status}
                    </span>
                  </div>
                  <h4 className="font-black text-xs text-[#18221B] line-clamp-1">{batch.title}</h4>
                  <div className="text-base font-black text-[#18221B]">
                    ₹{(batch.totalAmount / 100000).toFixed(2)} Lakhs
                  </div>
                  <div className="text-[10px] text-[#4A5B50] space-y-0.5 border-t border-[#E5DFD5] pt-1.5">
                    <div>Sponsor: {batch.sponsorFund}</div>
                    <div>
                      {batch.successfulCount} Beneficiaries • {batch.channel}
                    </div>
                    <div className="font-mono text-[#738679]">UTR: {batch.utrRange}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Line Items Transactions Table */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-black text-[#18221B] uppercase tracking-wider block">
                Settled Beneficiary Transaction Line Items
              </span>
              <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Txn ID &amp; Beneficiary</th>
                      <th className="p-3.5">Bank &amp; Account</th>
                      <th className="p-3.5">Amount (₹)</th>
                      <th className="p-3.5">Bank UTR &amp; Ack #</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADFD5]">
                    {filteredTransactions.map((txn) => (
                      <tr
                        key={txn.id}
                        className="hover:bg-[#F9F6F1] transition-colors cursor-pointer"
                        onClick={() => setSelectedTxn(txn)}
                      >
                        {/* Txn ID & Beneficiary */}
                        <td className="p-3.5">
                          <div className="font-black text-[#18221B] text-sm">
                            {txn.farmerName}
                          </div>
                          <div className="text-[10px] font-mono text-[#738679]">
                            {txn.id} • {txn.batchId}
                          </div>
                        </td>

                        {/* Bank & Account */}
                        <td className="p-3.5">
                          <div className="font-bold text-[#18221B]">{txn.bank}</div>
                          <div className="text-[10px] text-[#4A5B50] font-mono">
                            {txn.accountMasked} ({txn.ifsc})
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="p-3.5">
                          <div className="font-black text-sm text-[#3E5F36]">
                            ₹{txn.amount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-[#738679]">{txn.settledAt}</div>
                        </td>

                        {/* Bank UTR */}
                        <td className="p-3.5">
                          <div className="font-mono text-xs font-bold text-[#18221B]">
                            {txn.utr}
                          </div>
                          <div className="text-[10px] text-[#738679]">{txn.ackNumber}</div>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">{renderTxnStatusBadge(txn.status)}</td>

                        {/* Strictly Icon-Only Actions */}
                        <td className="p-3.5 text-right">
                          <div
                            className="inline-flex items-center gap-1.5 justify-end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedTxn(txn)}
                              title="View Bank Settlement Advice Slip"
                              className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                alert(`Downloading DBT bank advice receipt for ${txn.utr}...`)
                              }
                              title="Download Payment Receipt PDF"
                              className="w-7.5 h-7.5 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 stroke-[2.2]" />
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
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. SLIDE-OVER DRAWER: BENEFIT CALCULATION SHEET               */}
      {/* ============================================================= */}
      {selectedBenefit && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto custom-scrollbar flex flex-col border-l border-[#D8B293]">
            <div className="p-5 border-b border-[#EAE4DC] flex items-center justify-between bg-[#F5E5D5] sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Receipt className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#18221B]">{selectedBenefit.id}</h3>
                  <p className="text-xs text-[#738679] font-medium">
                    {selectedBenefit.farmerName} • {selectedBenefit.location}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBenefit(null)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 text-xs">
              {/* Status and Action Strip */}
              <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#738679]">Status:</span>
                  {renderBenefitStatusBadge(selectedBenefit.status)}
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedBenefit.status === 'PENDING_APPROVAL' && (
                    <button
                      type="button"
                      onClick={() => handleApproveBenefit(selectedBenefit.id)}
                      title="Approve Obligation"
                      className="w-9 h-9 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white cursor-pointer shadow-xs flex items-center justify-center transition-colors"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setBenefitToDelete(selectedBenefit)}
                    title="Put on Hold"
                    className="w-9 h-9 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Financial Calculation Sheet */}
              <div className="p-4 rounded-2xl bg-[#C49563]/25 border border-[#8D4E22] space-y-3">
                <h4 className="font-black text-[#18221B]">Obligation Calculation (PRD A18)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Entitlement Amount
                    </span>
                    <span className="font-black text-lg text-[#3E5F36]">
                      ₹{selectedBenefit.entitlementAmount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Calculation Basis
                    </span>
                    <span className="font-bold text-[#18221B]">
                      {selectedBenefit.calculationBasis}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Target Parcel &amp; Khasra
                    </span>
                    <span className="font-mono text-[#18221B]">
                      {selectedBenefit.parcelId} ({selectedBenefit.khasra})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Verified Acreage
                    </span>
                    <span className="font-bold text-[#18221B]">
                      {selectedBenefit.acreage} Acres
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank Mandate */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] space-y-2">
                <h4 className="font-black text-[#18221B]">Beneficiary Bank Profile (F08)</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Bank: <strong>{selectedBenefit.bankDetails.bankName}</strong></div>
                  <div>Account: <strong className="font-mono">{selectedBenefit.bankDetails.accountMasked}</strong></div>
                  <div>IFSC: <strong className="font-mono">{selectedBenefit.bankDetails.ifsc}</strong></div>
                  <div>Payout Mode: <strong>{selectedBenefit.bankDetails.payoutMethod}</strong></div>
                </div>
              </div>

              {/* Audit Signoff */}
              <div className="p-4 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-1">
                <div className="font-bold text-[#18221B]">Audit &amp; Milestone Validation</div>
                <div className="text-[11px] text-[#4A5B50]">
                  MRV Milestone: <strong>{selectedBenefit.mrvMilestoneId}</strong>
                </div>
                <div className="text-[11px] text-[#4A5B50]">
                  Approved By: <strong>{selectedBenefit.approvedBy}</strong> ({selectedBenefit.approvalDate})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 5. MODAL: BANK SETTLEMENT ADVICE SLIP                         */}
      {/* ============================================================= */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">Bank Payment Advice</h4>
                  <p className="text-xs text-[#738679]">PFMS / Direct Benefit Transfer (DBT)</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-3 font-mono">
              <div className="text-center pb-2 border-b border-[#D8B293]">
                <div className="text-[10px] text-[#738679] uppercase">National Payments Corporation of India</div>
                <div className="text-sm font-black text-[#18221B]">DBT SETTLEMENT CONFIRMATION</div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#738679]">Transaction Ref:</span>
                  <span className="font-bold text-[#18221B]">{selectedTxn.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738679]">Beneficiary:</span>
                  <span className="font-bold text-[#18221B]">{selectedTxn.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738679]">Amount Disbursed:</span>
                  <span className="font-black text-[#3E5F36]">₹{selectedTxn.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738679]">Bank UTR Number:</span>
                  <span className="font-bold text-[#18221B]">{selectedTxn.utr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738679]">PFMS Ack:</span>
                  <span className="text-[#4A5B50]">{selectedTxn.ackNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738679]">Settlement Timestamp:</span>
                  <span className="text-[#4A5B50]">{selectedTxn.settledAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => alert(`Downloading payment receipt for ${selectedTxn.utr}`)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#0369A1] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Advice Slip</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 6. MODAL: ACCRUE BENEFIT OBLIGATION                           */}
      {/* ============================================================= */}
      {isAccrueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">Accrue Farmer Benefit Obligation</h4>
                  <p className="text-xs text-[#738679]">PRD A18 Statutory Entitlement Ingestion</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAccrueModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAccrueSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                  Landholder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rameshwar Patel"
                  value={accrueForm.farmerName}
                  onChange={(e) => setAccrueForm({ ...accrueForm, farmerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Khasra / Survey #
                  </label>
                  <input
                    type="text"
                    value={accrueForm.khasra}
                    onChange={(e) => setAccrueForm({ ...accrueForm, khasra: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Verified Acreage
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={accrueForm.acreage}
                    onChange={(e) => setAccrueForm({ ...accrueForm, acreage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Benefit Type
                  </label>
                  <CustomDropdown
                    value={accrueForm.benefitType}
                    onChange={(val) => setAccrueForm({ ...accrueForm, benefitType: val })}
                    options={[
                      { value: 'Carbon Sequestration Insetting (Tranche 1)', label: 'Carbon Sequestration Insetting' },
                      { value: 'Water Recharge Infrastructure Incentive', label: 'Water Recharge Incentive' },
                      { value: 'Soil Carbon Baseline Ingestion Bonus', label: 'Soil Carbon Baseline Bonus' },
                      { value: 'Native Habitat Riparian Lease Stipend', label: 'Native Habitat Lease Stipend' },
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Rate per Acre (₹)
                  </label>
                  <input
                    type="number"
                    value={accrueForm.ratePerAcre}
                    onChange={(e) => setAccrueForm({ ...accrueForm, ratePerAcre: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE4DC]">
                <button
                  type="button"
                  onClick={() => setIsAccrueModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Accrue &amp; Record in Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 7. MODAL: EXECUTE PAYOUT BATCH                                */}
      {/* ============================================================= */}
      {isExecuteBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">Execute Direct Benefit Transfer (DBT)</h4>
                  <p className="text-xs text-[#738679]">Escrow Bank Clearing via PFMS Gateway</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExecuteBatchModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteBatchSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                  Batch Description / Title *
                </label>
                <input
                  type="text"
                  required
                  value={newBatchForm.title}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Corporate Sponsor Fund
                  </label>
                  <CustomDropdown
                    value={newBatchForm.sponsorFund}
                    onChange={(val) => setNewBatchForm({ ...newBatchForm, sponsorFund: val })}
                    options={[
                      { value: 'Tata Motors Green Horizon Fund', label: 'Tata Motors Green Horizon' },
                      { value: 'Infosys Eco-Stewardship Climate Facility', label: 'Infosys Eco-Stewardship' },
                      { value: 'Mahindra Hariyali Afforestation Trust', label: 'Mahindra Hariyali Trust' },
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={newBatchForm.totalAmount}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, totalAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] text-[11px] space-y-1">
                <div>Channel: <strong>PFMS / Direct Benefit Transfer (DBT)</strong></div>
                <div>Escrow Debit: <strong>HDFC Bank Escrow AC #99210084</strong></div>
                <div className="text-[#3E5F36] font-bold">✓ Dual Authorizer Super Admin Key Matched</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE4DC]">
                <button
                  type="button"
                  onClick={() => setIsExecuteBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Execute Disbursement Batch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 8. MODAL: DELETE BENEFIT CONFIRMATION                         */}
      {/* ============================================================= */}
      {benefitToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border-2 border-[#8D4E22] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C49563]/30 border border-[#8D4E22] text-[#2B1405] flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#18221B]">Put Obligation On Hold?</h4>
                <p className="text-xs text-[#738679]">Suspends disbursement from upcoming batch</p>
              </div>
            </div>

            <p className="text-[#4A5B50] leading-relaxed">
              Are you sure you want to put entitlement{' '}
              <strong className="text-[#18221B]">{benefitToDelete.id}</strong> (₹
              {benefitToDelete.entitlementAmount.toLocaleString()}) for farmer{' '}
              <strong className="text-[#18221B]">{benefitToDelete.farmerName}</strong> on hold?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBenefitToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#C49563]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBenefit}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Put On Hold</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
