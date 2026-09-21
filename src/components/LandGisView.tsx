import { useState, useMemo } from 'react'
import {
  Map,
  Layers,
  AlertTriangle,
  FileCheck2,
  Search,
  Eye,
  Check,
  Trash2,
  MapPin,
  Compass,
  X,
  Satellite,
} from 'lucide-react'
import landGisInitialData from '../data/landGisData.json'

interface LandGisViewProps {
  initialSubTab?: string
  onNavigateSubTab?: (subTabKey: string) => void
}

type SubTabKey = 'land-registry' | 'boundary-conflicts' | 'land-documents'

export interface ParcelRecord {
  id: string
  farmerId: string
  farmerName: string
  farmerPhone: string
  surveyNumber: string
  location: {
    state: string
    district: string
    tehsil: string
    village: string
    patwariHalka: string
  }
  declaredArea: number
  gisArea: number
  status: string
  soilType: string
  cropPattern: string
  polygonCoordinates: [number, number][]
  ndviScore: number
  canopyDensity: string
  surveyDate: string
  fieldAgent: string
  documentStatus: string
  conflictDetails?: {
    conflictId: string
    overlappingParcelId: string
    overlappingFarmer: string
    overlapAcreage: number
    overlapPercentage: string
    reason: string
    severity: string
    status: string
  } | null
}

export default function LandGisView({
  initialSubTab = 'land-registry',
  onNavigateSubTab,
}: LandGisViewProps) {
  // Navigation Subtabs
  const [activeTab, setActiveTab] = useState<SubTabKey>(() => {
    if (initialSubTab === 'boundary-conflicts' || initialSubTab === 'land-documents') {
      return initialSubTab
    }
    return 'land-registry'
  })

  const handleTabChange = (tab: SubTabKey) => {
    setActiveTab(tab)
    if (onNavigateSubTab) {
      onNavigateSubTab(tab)
    }
  }

  // Local state initialized from JSON
  const [parcels, setParcels] = useState<ParcelRecord[]>(
    landGisInitialData.parcels as ParcelRecord[]
  )
  const [conflicts, setConflicts] = useState(landGisInitialData.conflicts)
  const [documents] = useState(landGisInitialData.documents)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [stateFilter, setStateFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Selected Parcel for Drawer
  const [selectedParcel, setSelectedParcel] = useState<ParcelRecord | null>(null)
  const [parcelToDelete, setParcelToDelete] = useState<ParcelRecord | null>(null)

  // Filtered Parcels
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      const q = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !q ||
        p.farmerName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q) ||
        p.location.village.toLowerCase().includes(q) ||
        p.location.district.toLowerCase().includes(q)

      const matchesState = stateFilter === 'ALL' || p.location.state === stateFilter
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter

      return matchesSearch && matchesState && matchesStatus
    })
  }, [parcels, searchTerm, stateFilter, statusFilter])

  // Actions
  const handleVerifyParcel = (parcelId: string) => {
    setParcels((prev) =>
      prev.map((p) => (p.id === parcelId ? { ...p, status: 'VERIFIED' } : p))
    )
    if (selectedParcel?.id === parcelId) {
      setSelectedParcel((prev) => (prev ? { ...prev, status: 'VERIFIED' } : null))
    }
  }

  const handleDeleteParcel = () => {
    if (!parcelToDelete) return
    const id = parcelToDelete.id
    setParcels((prev) => prev.filter((p) => p.id !== id))
    if (selectedParcel?.id === id) setSelectedParcel(null)
    setParcelToDelete(null)
  }

  const handleResolveConflict = (conflictId: string) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, status: 'RESOLVED' } : c))
    )
  }

  // Minimalist status badge
  const renderStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase()
    if (s === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] flex-shrink-0" />
          <span>GIS Verified</span>
        </span>
      )
    }
    if (s === 'CONFLICT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF2F2] border border-[#FEE2E2] text-[#B91C1C]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] flex-shrink-0" />
          <span>Boundary Dispute</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFFBEB] border border-[#FEF3C7] text-[#B45309]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
        <span>Pending Survey</span>
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Sea Green Tinted KPI Summary Cards (Matching Exactly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Mapped Acreage */}
        <div
          onClick={() => handleTabChange('land-registry')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'land-registry' ? 'ring-2 ring-[#3AA88E] border-[#3AA88E]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155]">Total Mapped Acreage</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#0F3F32] flex items-center justify-center font-bold shadow-2xs">
              <Map className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">
              {landGisInitialData.summaryStats.totalAcreage.value}
            </span>
            <span className="text-[11px] font-bold text-[#2D6A4F]">
              {landGisInitialData.summaryStats.totalAcreage.unit}
            </span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium flex items-center justify-between pt-1 border-t border-[#82CEBA]/30">
            <span>{landGisInitialData.summaryStats.totalAcreage.gisVerified} Verified</span>
            <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
              PostGIS Ready
            </span>
          </div>
        </div>

        {/* KPI 2: Mapped Parcels */}
        <div
          onClick={() => handleTabChange('land-registry')}
          className="harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155]">Registered Parcels</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#0F3F32] flex items-center justify-center font-bold shadow-2xs">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">
              {landGisInitialData.summaryStats.totalParcels.count}
            </span>
            <span className="text-[11px] font-bold text-[#2D6A4F]">
              {landGisInitialData.summaryStats.totalParcels.verifiedCount} GIS Mapped
            </span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium flex items-center justify-between pt-1 border-t border-[#82CEBA]/30">
            <span>{landGisInitialData.summaryStats.totalParcels.pendingSurvey} Pending Survey</span>
            <span className="badge-warning-tint px-2 py-0.5 rounded-full text-[10px]">
              F10 Polygons
            </span>
          </div>
        </div>

        {/* KPI 3: Boundary Conflicts Alert */}
        <div
          onClick={() => handleTabChange('boundary-conflicts')}
          className={`harmony-kpi-card p-4 space-y-2 cursor-pointer transition-all ${
            activeTab === 'boundary-conflicts' ? 'ring-2 ring-[#3AA88E] border-[#3AA88E]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155]">Boundary Conflicts</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#B91C1C] flex items-center justify-center font-bold shadow-2xs">
              <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">
              {conflicts.filter((c) => c.status !== 'RESOLVED').length}
            </span>
            <span className="text-[11px] font-bold text-[#B91C1C]">Overlaps Active</span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium flex items-center justify-between pt-1 border-t border-[#82CEBA]/30">
            <span>{landGisInitialData.summaryStats.boundaryConflicts.overlapArea} Disputed</span>
            <span className="badge-alert-tint px-2 py-0.5 rounded-full text-[10px]">
              PRD §10 Alert
            </span>
          </div>
        </div>

        {/* KPI 4: Satellite Sentinel-2 Monitoring */}
        <div className="harmony-kpi-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155]">Satellite Monitoring</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
              <Satellite className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">
              {landGisInitialData.summaryStats.satelliteCoverage.percentage}
            </span>
            <span className="text-[11px] font-bold text-[#0369A1]">Sentinel-2 Sync</span>
          </div>
          <div className="text-[11px] text-[#475569] font-medium flex items-center justify-between pt-1 border-t border-[#82CEBA]/30">
            <span>Mean NDVI: {landGisInitialData.summaryStats.satelliteCoverage.ndviMean}</span>
            <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
              Daily Optical
            </span>
          </div>
        </div>
      </div>

      {/* 2. Submodule Tab Bar Navigation (matching navigation.json) */}
      <div className="bg-white border border-[#E2DDD5] rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => handleTabChange('land-registry')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'land-registry'
              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] shadow-2xs'
              : 'text-[#475569] hover:bg-[#F3EDE4]'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Land Registry</span>
          <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-full border border-black/10 font-bold">
            {parcels.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('boundary-conflicts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'boundary-conflicts'
              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] shadow-2xs'
              : 'text-[#475569] hover:bg-[#F3EDE4]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#B91C1C]" />
          <span>Boundary Conflicts</span>
          <span className="text-[10px] bg-[#FEF2F2] text-[#B91C1C] px-2 py-0.5 rounded-full border border-[#FECACA] font-bold">
            {conflicts.filter((c) => c.status !== 'RESOLVED').length} Active
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('land-documents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'land-documents'
              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] shadow-2xs'
              : 'text-[#475569] hover:bg-[#F3EDE4]'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Land Documents (7/12 &amp; B-1)</span>
          <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-full border border-black/10 font-bold">
            {documents.length}
          </span>
        </button>
      </div>

      {/* 3. TAB 1: LAND REGISTRY */}
      {activeTab === 'land-registry' && (
        <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                <Map className="w-5 h-5 text-[#2D6A4F]" />
                <span>Land Registry &amp; PostGIS Spatial Engine (PRD §5 &amp; §10)</span>
              </h3>
              <p className="text-xs text-[#475569] font-semibold">
                Centralized registry of farmer parcel boundaries, GPS survey coordinates, calculated acreage, and NDVI baselines
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search farmer, Khasra, village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D6CBC0] bg-[#FAF8F5] text-xs text-[#0F172A] font-medium outline-none focus:bg-white focus:border-[#2D6A4F]"
                />
              </div>

              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#D6CBC0] bg-[#FAF8F5] text-xs font-bold text-[#0F172A] outline-none cursor-pointer"
              >
                <option value="ALL">All States</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#D6CBC0] bg-[#FAF8F5] text-xs font-bold text-[#0F172A] outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="VERIFIED">GIS Verified</option>
                <option value="CONFLICT">Disputed</option>
                <option value="PENDING_SURVEY">Pending Survey</option>
              </select>
            </div>
          </div>

          {/* Parcels Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#334155] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Parcel &amp; Landholder</th>
                  <th className="p-3.5">Khasra &amp; Location</th>
                  <th className="p-3.5">GIS Acreage</th>
                  <th className="p-3.5">Soil &amp; Crops</th>
                  <th className="p-3.5">Satellite NDVI</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFD5]">
                {filteredParcels.map((parcel) => (
                  <tr
                    key={parcel.id}
                    className="hover:bg-[#F9F6F1] transition-colors cursor-pointer"
                    onClick={() => setSelectedParcel(parcel)}
                  >
                    {/* Parcel & Landholder */}
                    <td className="p-3.5">
                      <div className="font-black text-[#0F172A] text-sm">
                        {parcel.farmerName}
                      </div>
                      <div className="text-[11px] font-mono text-[#475569] font-bold">
                        {parcel.id} • {parcel.farmerId}
                      </div>
                    </td>

                    {/* Khasra & Location */}
                    <td className="p-3.5">
                      <div className="font-extrabold text-[#0F172A]">
                        {parcel.surveyNumber}
                      </div>
                      <div className="text-[10px] text-[#475569] font-medium">
                        {parcel.location.village}, {parcel.location.district} ({parcel.location.state})
                      </div>
                    </td>

                    {/* GIS vs Declared Acreage */}
                    <td className="p-3.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-sm text-[#0F172A]">
                          {parcel.gisArea}
                        </span>
                        <span className="text-[10px] font-bold text-[#2D6A4F]">Acres GIS</span>
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        Declared: {parcel.declaredArea} Acres
                      </div>
                    </td>

                    {/* Soil & Crops */}
                    <td className="p-3.5">
                      <div className="font-bold text-[#0F172A] max-w-xs truncate">
                        {parcel.cropPattern}
                      </div>
                      <div className="text-[10px] text-[#475569]">
                        {parcel.soilType}
                      </div>
                    </td>

                    {/* Satellite NDVI */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                        <span className="font-black text-[#0F172A]">
                          NDVI {parcel.ndviScore}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#64748B]">
                        {parcel.canopyDensity}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {renderStatusBadge(parcel.status)}
                    </td>

                    {/* Strictly Icon-Only Actions */}
                    <td className="p-3.5 text-right">
                      <div
                        className="inline-flex items-center gap-1.5 justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* 1. Inspect Boundary Drawer Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedParcel(parcel)}
                          title="Inspect Boundary Polygon & Satellite Canvas"
                          className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#D6CBC0] hover:border-[#2D6A4F] text-[#475569] hover:text-[#0F172A] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>

                        {/* 2. Verify Parcel Button */}
                        {parcel.status !== 'VERIFIED' && (
                          <button
                            type="button"
                            onClick={() => handleVerifyParcel(parcel.id)}
                            title="Verify Boundary (F10 Complete)"
                            className="w-7.5 h-7.5 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}

                        {/* 3. Delete Parcel Button */}
                        <button
                          type="button"
                          onClick={() => setParcelToDelete(parcel)}
                          title="Delete Parcel Entry"
                          className="w-7.5 h-7.5 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
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
      )}

      {/* 4. TAB 2: BOUNDARY CONFLICTS QUEUE */}
      {activeTab === 'boundary-conflicts' && (
        <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#B91C1C]" />
                <span>Spatial Overlap &amp; Dispute Queue (PRD §10 &amp; Module A06)</span>
              </h3>
              <p className="text-xs text-[#475569] font-semibold">
                Automatic geometric intersection alerts where PostGIS detected concurrent land claims exceeding tolerance thresholds
              </p>
            </div>
            <span className="badge-alert-tint px-3 py-1 rounded-full text-xs font-black">
              {conflicts.filter((c) => c.status !== 'RESOLVED').length} Critical Disputes
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {conflicts.map((conf) => {
              const isResolved = conf.status === 'RESOLVED'

              return (
                <div
                  key={conf.id}
                  className={`p-5 rounded-2xl border space-y-3 transition-all ${
                    isResolved
                      ? 'bg-[#F0FDF4] border-[#DCFCE7]'
                      : 'bg-[#FFFBFB] border-[#FECACA]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#B91C1C] bg-white border border-[#FECACA] px-2.5 py-0.5 rounded-lg">
                        {conf.id}
                      </span>
                      <h4 className="text-sm font-black text-[#0F172A]">
                        {conf.location}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="badge-alert-tint px-2.5 py-0.5 rounded-full text-[10px] font-black">
                        {conf.overlapAcreage} Acres Overlap ({conf.overlapPercentage})
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          isResolved ? 'badge-mint-tint' : 'badge-warning-tint'
                        }`}
                      >
                        {conf.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-[#E5DFD5]">
                    {/* Parcel A */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                        Claimant A
                      </span>
                      <div className="font-bold text-xs text-[#0F172A]">
                        {conf.parcelA.farmerName} ({conf.parcelA.khasra})
                      </div>
                      <span className="text-[11px] text-[#475569]">
                        Declared: {conf.parcelA.declaredArea} Acres
                      </span>
                    </div>

                    {/* Parcel B */}
                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#E5DFD5] pt-2 md:pt-0 md:pl-3">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                        Claimant B
                      </span>
                      <div className="font-bold text-xs text-[#0F172A]">
                        {conf.parcelB.farmerName} ({conf.parcelB.khasra})
                      </div>
                      <span className="text-[11px] text-[#475569]">
                        Declared: {conf.parcelB.declaredArea} Acres
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#334155] leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#E8DFD3]">
                    <strong className="text-[#0F172A]">Dispute Cause: </strong>
                    {conf.reason}
                    <div className="mt-1 text-[11px] text-[#15803D] font-medium">
                      <strong>Recommended Protocol: </strong> {conf.recommendedAction}
                    </div>
                  </div>

                  {/* Actions for Conflict */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-[#64748B]">
                      Assigned Field Surveyor: <strong>{conf.assignedAgent}</strong>
                    </span>

                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => handleResolveConflict(conf.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1E4D39] cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Dispatch Re-survey &amp; Resolve</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 5. TAB 3: LAND DOCUMENTS */}
      {activeTab === 'land-documents' && (
        <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#2D6A4F]" />
              <span>Revenue Land Records &amp; Ownership Deeds (PRD §5 F10.2)</span>
            </h3>
            <p className="text-xs text-[#475569] font-semibold">
              Official 7/12 Satbara, B-1 Khasra-Khatauni records, and Patwari demarcation sketches
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-3 hover:border-[#2D6A4F] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#64748B]">
                      {doc.id} • {doc.parcelId}
                    </span>
                    <h4 className="text-sm font-black text-[#0F172A]">
                      {doc.docType}
                    </h4>
                    <p className="text-xs font-bold text-[#2D6A4F]">
                      Landholder: {doc.farmerName}
                    </p>
                  </div>
                  <span className="badge-mint-tint px-2.5 py-0.5 rounded-full text-[10px] font-black">
                    {doc.status}
                  </span>
                </div>

                <div className="text-[11px] p-2.5 rounded-xl bg-white border border-[#D6CBC0] text-[#334155] space-y-1">
                  <div>
                    <strong className="text-[#0F172A]">Issuing Authority: </strong>
                    {doc.issuingAuthority}
                  </div>
                  <div className="font-mono text-[#64748B]">
                    Doc Reference: {doc.documentNumber}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E8DFD3]">
                  <span className="text-[#64748B]">
                    Uploaded: {doc.uploadDate} ({doc.fileSize})
                  </span>
                  <span className="text-[#15803D] font-bold">
                    ✓ Revenue Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SLIDE-OVER DRAWER: PARCEL BOUNDARY INSPECTOR */}
      {selectedParcel && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto custom-scrollbar flex flex-col border-l border-[#D6CBC0]">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#EAE4DC] flex items-center justify-between bg-[#FAF8F5] sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white border border-[#7EC8B5] text-[#0F3F32] flex items-center justify-center font-bold shadow-2xs">
                  <Map className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F172A]">
                    {selectedParcel.id}
                  </h3>
                  <p className="text-xs text-[#64748B] font-medium">
                    {selectedParcel.surveyNumber} • {selectedParcel.location.village}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedParcel(null)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#F3EDE4] border border-[#D6CBC0] text-[#64748B] flex items-center justify-center cursor-pointer transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* Quick Actions (Strictly Icon-Only with tooltips) */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#64748B]">Status:</span>
                  {renderStatusBadge(selectedParcel.status)}
                </div>

                <div className="flex items-center gap-2">
                  {selectedParcel.status !== 'VERIFIED' && (
                    <button
                      type="button"
                      onClick={() => handleVerifyParcel(selectedParcel.id)}
                      title="Verify Boundary (Approve)"
                      className="w-9 h-9 rounded-xl bg-[#2D6A4F] hover:bg-[#1E4D39] text-white cursor-pointer shadow-xs flex items-center justify-center transition-colors"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setParcelToDelete(selectedParcel)}
                    title="Delete Parcel Entry"
                    className="w-9 h-9 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Spatial PostGIS Coordinates Visualizer Card */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#2D6A4F]" />
                    <span>PostGIS Boundary Polygon</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#2D6A4F]">
                    {selectedParcel.gisArea} Computed Acres
                  </span>
                </div>

                {/* Simulated Polygon Boundary Box */}
                <div className="h-40 rounded-xl bg-[#EAF4F2] border border-[#7EC8B5] relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#2D6A4F_1px,transparent_1px)] [background-size:12px_12px]" />
                  <div className="border-2 border-dashed border-[#2D6A4F] bg-[#2D6A4F]/10 rounded-xl p-6 text-center space-y-1">
                    <MapPin className="w-5 h-5 text-[#2D6A4F] mx-auto animate-bounce" />
                    <span className="text-xs font-black text-[#0F172A] block">
                      Polygon Boundary Mapped
                    </span>
                    <span className="text-[10px] text-[#475569] font-mono block">
                      Vertices: {selectedParcel.polygonCoordinates.length} Boundary Points
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white border border-[#D6CBC0] text-[11px] font-mono text-[#475569] space-y-0.5">
                  {selectedParcel.polygonCoordinates.map((coord, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>Vertex #{idx + 1}:</span>
                      <span className="font-bold text-[#0F172A]">{coord[0]}° N, {coord[1]}° E</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Landholder & Survey Details */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-3 text-xs">
                <h4 className="font-black text-[#0F172A]">Parcel Metadata (PRD §5)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      Landowner
                    </span>
                    <span className="font-bold text-[#0F172A]">{selectedParcel.farmerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      Contact
                    </span>
                    <span className="font-bold text-[#0F172A]">{selectedParcel.farmerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      Tehsil &amp; Halka
                    </span>
                    <span className="font-bold text-[#0F172A]">
                      {selectedParcel.location.tehsil}, {selectedParcel.location.patwariHalka}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      Assigned Agent
                    </span>
                    <span className="font-bold text-[#0F172A]">{selectedParcel.fieldAgent}</span>
                  </div>
                </div>
              </div>

              {/* Crop & Ecological Matrix */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2 text-xs">
                <h4 className="font-black text-[#0F172A]">Ecological &amp; Soil Matrix</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      Soil Type
                    </span>
                    <span className="font-bold text-[#0F172A]">{selectedParcel.soilType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      Crop Rotation
                    </span>
                    <span className="font-bold text-[#0F172A]">{selectedParcel.cropPattern}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      Sentinel-2 NDVI
                    </span>
                    <span className="font-black text-[#15803D]">{selectedParcel.ndviScore}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      Canopy Density
                    </span>
                    <span className="font-bold text-[#0F172A]">{selectedParcel.canopyDensity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION MODAL */}
      {parcelToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#D6CBC0] shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#0F172A]">Delete Parcel Entry?</h4>
                <p className="text-xs text-[#64748B]">This action will purge spatial polygon records</p>
              </div>
            </div>

            <p className="text-xs text-[#334155] leading-relaxed">
              Are you sure you want to permanently delete parcel{' '}
              <strong className="text-[#0F172A]">{parcelToDelete.id}</strong> ({parcelToDelete.surveyNumber})
              for landowner <strong className="text-[#0F172A]">{parcelToDelete.farmerName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setParcelToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#475569] hover:bg-[#F3EDE4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteParcel}
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
