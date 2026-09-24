import { useState, useMemo, useEffect } from 'react'
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
  FileText,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Building2,
  Filter,
  Camera,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import landGisInitialData from '../data/landGisData.json'
import CustomDropdown from './CustomDropdown'

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
  satelliteImageUrl?: string
  locationPhotoUrl?: string
  photoCaption?: string
  photoTimestamp?: string
  photoAccuracy?: string
  photoElevation?: string
  photoDevice?: string
  geofenceStatus?: string
}

export interface ConflictRecord {
  id: string
  parcelA: {
    id: string
    farmerName: string
    khasra: string
    declaredArea: number
  }
  parcelB: {
    id: string
    farmerName: string
    khasra: string
    declaredArea: number
  }
  location: string
  overlapAcreage: number
  overlapPercentage: string
  detectedAt: string
  severity: string
  status: string
  reason: string
  assignedAgent: string
  recommendedAction: string
}

export interface DocumentRecord {
  id: string
  parcelId: string
  farmerName: string
  docType: string
  issuingAuthority: string
  documentNumber: string
  uploadDate: string
  fileSize: string
  status: string
  verifiedBy: string
  verifiedDate: string
  tehsil: string
  district: string
  state: string
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

  // Sync when initialSubTab changes from parent or sidebar navigation
  useEffect(() => {
    if (
      initialSubTab &&
      (initialSubTab === 'land-registry' ||
        initialSubTab === 'boundary-conflicts' ||
        initialSubTab === 'land-documents')
    ) {
      setActiveTab(initialSubTab as SubTabKey)
    }
  }, [initialSubTab])

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
  const [conflicts, setConflicts] = useState<ConflictRecord[]>(
    landGisInitialData.conflicts as ConflictRecord[]
  )
  const [documents, setDocuments] = useState<DocumentRecord[]>(
    landGisInitialData.documents as DocumentRecord[]
  )

  // -------------------------------------------------------------
  // TAB 1 (Land Registry) State & Filters
  // -------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState('')
  const [stateFilter, setStateFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedParcel, setSelectedParcel] = useState<ParcelRecord | null>(null)
  const [parcelToDelete, setParcelToDelete] = useState<ParcelRecord | null>(null)
  const [parcelVisualMode, setParcelVisualMode] = useState<'polygon' | 'location-photo'>('polygon')
  const [fullscreenPhoto, setFullscreenPhoto] = useState<{
    url: string
    title: string
    caption?: string
    timestamp?: string
    accuracy?: string
    elevation?: string
    device?: string
    geofence?: string
    parcelId: string
    agent: string
    coords: [number, number]
  } | null>(null)
  const [isAddParcelModalOpen, setIsAddParcelModalOpen] = useState(false)
  const [newParcelForm, setNewParcelForm] = useState({
    farmerName: '',
    farmerPhone: '',
    surveyNumber: '',
    state: 'Madhya Pradesh',
    district: '',
    tehsil: '',
    village: '',
    declaredArea: '',
    soilType: 'Medium Black Soil',
    cropPattern: 'Soybean - Wheat',
  })

  // -------------------------------------------------------------
  // TAB 2 (Boundary Conflicts) State & Filters
  // -------------------------------------------------------------
  const [conflictSearchTerm, setConflictSearchTerm] = useState('')
  const [conflictSeverityFilter, setConflictSeverityFilter] = useState('ALL')
  const [conflictStatusFilter, setConflictStatusFilter] = useState('ALL')
  const [selectedConflictForInspection, setSelectedConflictForInspection] =
    useState<ConflictRecord | null>(null)

  // -------------------------------------------------------------
  // TAB 3 (Land Documents) State & Filters
  // -------------------------------------------------------------
  const [docSearchTerm, setDocSearchTerm] = useState('')
  const [docStateFilter, setDocStateFilter] = useState('ALL')
  const [docTypeFilter, setDocTypeFilter] = useState('ALL')
  const [docStatusFilter, setDocStatusFilter] = useState('ALL')
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null)
  const [docToDelete, setDocToDelete] = useState<DocumentRecord | null>(null)
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false)
  const [newDocForm, setNewDocForm] = useState({
    farmerName: '',
    parcelId: '',
    docType: 'B-1 / Khasra-Khatauni Record',
    state: 'Madhya Pradesh',
    district: '',
    tehsil: '',
    issuingAuthority: '',
    documentNumber: '',
  })

  // -------------------------------------------------------------
  // Filtered Parcels
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // Filtered Conflicts
  // -------------------------------------------------------------
  const filteredConflicts = useMemo(() => {
    return conflicts.filter((c) => {
      const q = conflictSearchTerm.toLowerCase().trim()
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.parcelA.farmerName.toLowerCase().includes(q) ||
        c.parcelB.farmerName.toLowerCase().includes(q) ||
        c.parcelA.khasra.toLowerCase().includes(q) ||
        c.parcelB.khasra.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)

      const matchesSeverity =
        conflictSeverityFilter === 'ALL' || c.severity === conflictSeverityFilter
      const matchesStatus =
        conflictStatusFilter === 'ALL' || c.status === conflictStatusFilter

      return matchesSearch && matchesSeverity && matchesStatus
    })
  }, [conflicts, conflictSearchTerm, conflictSeverityFilter, conflictStatusFilter])

  // -------------------------------------------------------------
  // Filtered Documents
  // -------------------------------------------------------------
  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      const q = docSearchTerm.toLowerCase().trim()
      const matchesSearch =
        !q ||
        d.id.toLowerCase().includes(q) ||
        d.farmerName.toLowerCase().includes(q) ||
        d.parcelId.toLowerCase().includes(q) ||
        d.documentNumber.toLowerCase().includes(q) ||
        d.issuingAuthority.toLowerCase().includes(q) ||
        d.district.toLowerCase().includes(q)

      const matchesState = docStateFilter === 'ALL' || d.state === docStateFilter
      const matchesType =
        docTypeFilter === 'ALL' || d.docType.toLowerCase().includes(docTypeFilter.toLowerCase())
      const matchesStatus = docStatusFilter === 'ALL' || d.status === docStatusFilter

      return matchesSearch && matchesState && matchesType && matchesStatus
    })
  }, [documents, docSearchTerm, docStateFilter, docTypeFilter, docStatusFilter])

  // -------------------------------------------------------------
  // Parcel Actions
  // -------------------------------------------------------------
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

  const handleAddParcelSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newParcelForm.farmerName || !newParcelForm.surveyNumber) return

    const newId = `PARCEL-${newParcelForm.state.slice(0, 2).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`
    const declared = parseFloat(newParcelForm.declaredArea) || 10.0
    const gis = +(declared * 0.985).toFixed(2)

    const createdParcel: ParcelRecord = {
      id: newId,
      farmerId: `USR-FARM-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerName: newParcelForm.farmerName,
      farmerPhone: newParcelForm.farmerPhone || '+91 98000 00000',
      surveyNumber: newParcelForm.surveyNumber,
      location: {
        state: newParcelForm.state,
        district: newParcelForm.district || 'Sehore',
        tehsil: newParcelForm.tehsil || 'Ashta',
        village: newParcelForm.village || 'Gram Panchayat Area',
        patwariHalka: 'PH-01',
      },
      declaredArea: declared,
      gisArea: gis,
      status: 'VERIFIED',
      soilType: newParcelForm.soilType,
      cropPattern: newParcelForm.cropPattern,
      polygonCoordinates: [
        [22.9821, 76.5412],
        [22.9845, 76.5438],
        [22.9818, 76.5471],
        [22.9792, 76.5442],
      ],
      ndviScore: 0.71,
      canopyDensity: 'Medium-High',
      surveyDate: 'Today (F10 PostGIS)',
      fieldAgent: 'Super Admin (Direct Import)',
      documentStatus: 'VERIFIED',
      conflictDetails: null,
    }

    setParcels((prev) => [createdParcel, ...prev])
    setIsAddParcelModalOpen(false)
    setNewParcelForm({
      farmerName: '',
      farmerPhone: '',
      surveyNumber: '',
      state: 'Madhya Pradesh',
      district: '',
      tehsil: '',
      village: '',
      declaredArea: '',
      soilType: 'Medium Black Soil',
      cropPattern: 'Soybean - Wheat',
    })
  }

  // -------------------------------------------------------------
  // Conflict Actions
  // -------------------------------------------------------------
  const handleResolveConflict = (conflictId: string) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, status: 'RESOLVED' } : c))
    )
    if (selectedConflictForInspection?.id === conflictId) {
      setSelectedConflictForInspection((prev) =>
        prev ? { ...prev, status: 'RESOLVED' } : null
      )
    }
  }

  const handleDispatchSurvey = (conflictId: string) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, status: 'IN_RE_SURVEY' } : c))
    )
    if (selectedConflictForInspection?.id === conflictId) {
      setSelectedConflictForInspection((prev) =>
        prev ? { ...prev, status: 'IN_RE_SURVEY' } : null
      )
    }
  }

  // -------------------------------------------------------------
  // Document Actions
  // -------------------------------------------------------------
  const handleVerifyDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: 'VERIFIED',
              verifiedBy: 'Super Admin (admin@naturex.io)',
              verifiedDate: 'Today',
            }
          : d
      )
    )
    if (previewDoc?.id === docId) {
      setPreviewDoc((prev) =>
        prev
          ? {
              ...prev,
              status: 'VERIFIED',
              verifiedBy: 'Super Admin (admin@naturex.io)',
              verifiedDate: 'Today',
            }
          : null
      )
    }
  }

  const handleDeleteDocument = () => {
    if (!docToDelete) return
    const id = docToDelete.id
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    if (previewDoc?.id === id) setPreviewDoc(null)
    setDocToDelete(null)
  }

  const handleUploadDocSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDocForm.farmerName || !newDocForm.documentNumber) return

    const newDoc: DocumentRecord = {
      id: `DOC-LAND-${Math.floor(9000 + Math.random() * 999)}`,
      parcelId: newDocForm.parcelId || `PARCEL-${newDocForm.state.slice(0, 2).toUpperCase()}-001`,
      farmerName: newDocForm.farmerName,
      docType: newDocForm.docType,
      issuingAuthority:
        newDocForm.issuingAuthority || `Tehsildar Office, ${newDocForm.tehsil || 'District HQ'}`,
      documentNumber: newDocForm.documentNumber,
      uploadDate: 'Today',
      fileSize: '2.1 MB PDF',
      status: 'VERIFIED',
      verifiedBy: 'Super Admin (Direct Provision)',
      verifiedDate: 'Today',
      tehsil: newDocForm.tehsil || 'Central Tehsil',
      district: newDocForm.district || 'District Area',
      state: newDocForm.state,
    }

    setDocuments((prev) => [newDoc, ...prev])
    setIsUploadDocModalOpen(false)
    setNewDocForm({
      farmerName: '',
      parcelId: '',
      docType: 'B-1 / Khasra-Khatauni Record',
      state: 'Madhya Pradesh',
      district: '',
      tehsil: '',
      issuingAuthority: '',
      documentNumber: '',
    })
  }

  // -------------------------------------------------------------
  // Minimalist Status Badge Helper
  // -------------------------------------------------------------
  const renderStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase()
    if (s === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5E8256] flex-shrink-0" />
          <span>GIS Verified</span>
        </span>
      )
    }
    if (s === 'CONFLICT' || s === 'DOCUMENT_FLAGGED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#C49563] border border-[#8D4E22] text-[#2B1405]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6E3812] flex-shrink-0" />
          <span>{s === 'DOCUMENT_FLAGGED' ? 'Flagged' : 'Boundary Dispute'}</span>
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

  return (
    <div className="space-y-6">
      {/* 1. Submodule Navigation Bar (matching Exact Sea Green Harmony Theme) */}
      <div className="bg-white border border-[#D19E77] rounded-2xl p-1.5 shadow-xs flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleTabChange('land-registry')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'land-registry'
                ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
                : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Land Registry</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                activeTab === 'land-registry'
                  ? 'bg-[#6E3812] text-white border-white/20'
                  : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
            >
              {parcels.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('boundary-conflicts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'boundary-conflicts'
                ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
                : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Boundary Conflicts</span>
            <span className="text-[10px] bg-[#C49563] text-[#2B1405] px-2 py-0.5 rounded-full border border-[#8D4E22] font-black">
              {conflicts.filter((c) => c.status !== 'RESOLVED').length} Active
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('land-documents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'land-documents'
                ? 'bg-[#8D4E22] border border-[#6E3812] text-white shadow-2xs'
                : 'text-[#4A5B50] hover:bg-[#F3EDE4]'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Land Documents</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                activeTab === 'land-documents'
                  ? 'bg-[#6E3812] text-white border-white/20'
                  : 'bg-white/80 text-[#4A5B50] border-black/10'
              }`}
            >
              {documents.length}
            </span>
          </button>
        </div>

        {/* Action button corresponding to active page */}
        <div>
          {activeTab === 'land-registry' && (
            <button
              type="button"
              onClick={() => setIsAddParcelModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Register Parcel</span>
            </button>
          )}

          {activeTab === 'boundary-conflicts' && (
            <button
              type="button"
              onClick={() => {
                alert('Triggered PostGIS ST_Overlaps detection on 342 active parcel polygons. Zero new overlapping polygons detected.')
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#8D4E22] bg-[#F5E5D5] hover:bg-[#F2DFC9] border border-[#D8B293] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Run PostGIS Intersection Scan</span>
            </button>
          )}

          {activeTab === 'land-documents' && (
            <button
              type="button"
              onClick={() => setIsUploadDocModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Upload Revenue Record</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. SUB-PAGE 1: LAND REGISTRY (PRD §5 & A06)                    */}
      {/* ============================================================= */}
      {activeTab === 'land-registry' && (
        <div className="space-y-6">
          {/* Dedicated Sea Green Tinted KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Total Mapped Acreage</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Map className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {landGisInitialData.summaryStats.totalAcreage.value}
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Acres PostGIS</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>{landGisInitialData.summaryStats.totalAcreage.gisVerified} Verified</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  F10.1 Engine
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Registered Parcels</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Layers className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">{parcels.length}</span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Active Parcels</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>
                  {parcels.filter((p) => p.status === 'VERIFIED').length} GIS Approved
                </span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  Cadastral Linked
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Centroid Accuracy</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
                  <Compass className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">99.2%</span>
                <span className="text-[11px] font-bold text-[#0369A1]">&lt;0.5m Error</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>WGS84 EPSG:4326</span>
                <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
                  RTK Precision
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Optical Monitoring</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Satellite className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  NDVI {landGisInitialData.summaryStats.satelliteCoverage.ndviMean}
                </span>
                <span className="text-[11px] font-bold text-[#3E5F36]">Sentinel-2</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>96.4% Coverage Sync</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  10m Resolution
                </span>
              </div>
            </div>
          </div>

          {/* Spatial Land Registry Table Card */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight flex items-center gap-2">
                  <Map className="w-5 h-5 text-[#8D4E22]" />
                  <span>Land Registry &amp; PostGIS Spatial Engine (PRD §5 &amp; §10)</span>
                </h3>
                <p className="text-xs text-[#4A5B50] font-semibold">
                  Centralized registry of farmer parcel boundaries, GPS survey coordinates, calculated acreage, and vegetative health
                </p>
              </div>

              {/* Quick Search & Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search farmer, Khasra, village..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs text-[#18221B] font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>

                <CustomDropdown
                  value={stateFilter}
                  onChange={(val) => setStateFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All States', dotColor: '#8D4E22' },
                    { value: 'Madhya Pradesh', label: 'Madhya Pradesh', dotColor: '#5E8256' },
                    { value: 'Uttar Pradesh', label: 'Uttar Pradesh', dotColor: '#0284C7' },
                    { value: 'Maharashtra', label: 'Maharashtra', dotColor: '#D97706' },
                    { value: 'Rajasthan', label: 'Rajasthan', dotColor: '#8B5CF6' },
                    { value: 'Andhra Pradesh', label: 'Andhra Pradesh', dotColor: '#10B981' },
                  ]}
                  className="w-48"
                />

                <CustomDropdown
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Statuses', dotColor: '#8D4E22' },
                    { value: 'VERIFIED', label: 'GIS Verified', dotColor: '#5E8256' },
                    { value: 'CONFLICT', label: 'Disputed', dotColor: '#EF4444' },
                    { value: 'PENDING_SURVEY', label: 'Pending Survey', dotColor: '#F59E0B' },
                  ]}
                  className="w-44"
                />
              </div>
            </div>

            {/* Registry Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
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
                        <div className="font-black text-[#18221B] text-sm">
                          {parcel.farmerName}
                        </div>
                        <div className="text-[11px] font-mono text-[#4A5B50] font-bold">
                          {parcel.id} • {parcel.farmerId}
                        </div>
                      </td>

                      {/* Khasra & Location */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-[#18221B]">
                          {parcel.surveyNumber}
                        </div>
                        <div className="text-[10px] text-[#4A5B50] font-medium">
                          {parcel.location.village}, {parcel.location.district} ({parcel.location.state})
                        </div>
                      </td>

                      {/* GIS vs Declared Acreage */}
                      <td className="p-3.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-sm text-[#18221B]">
                            {parcel.gisArea}
                          </span>
                          <span className="text-[10px] font-bold text-[#8D4E22]">Acres GIS</span>
                        </div>
                        <div className="text-[10px] text-[#738679]">
                          Declared: {parcel.declaredArea} Acres
                        </div>
                      </td>

                      {/* Soil & Crops */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B] max-w-xs truncate">
                          {parcel.cropPattern}
                        </div>
                        <div className="text-[10px] text-[#4A5B50]">
                          {parcel.soilType}
                        </div>
                      </td>

                      {/* Satellite NDVI */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#5E8256]" />
                          <span className="font-black text-[#18221B]">
                            NDVI {parcel.ndviScore}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#738679]">
                          {parcel.canopyDensity}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">{renderStatusBadge(parcel.status)}</td>

                      {/* Strictly Icon-Only Actions with descriptive tooltips */}
                      <td className="p-3.5 text-right">
                        <div
                          className="inline-flex items-center gap-1.5 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedParcel(parcel)}
                            title="Inspect Boundary Polygon & Satellite Canvas"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {parcel.status !== 'VERIFIED' && (
                            <button
                              type="button"
                              onClick={() => handleVerifyParcel(parcel.id)}
                              title="Verify Boundary (F10 Complete)"
                              className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setParcelToDelete(parcel)}
                            title="Delete Parcel Entry"
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
      {/* 3. SUB-PAGE 2: BOUNDARY CONFLICTS (PRD §10 & A07)              */}
      {/* ============================================================= */}
      {activeTab === 'boundary-conflicts' && (
        <div className="space-y-6">
          {/* Dedicated Sea Green Tinted KPI Summary Cards for Conflicts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Active Spatial Disputes</span>
                <div className="w-8 h-8 rounded-xl bg-[#C49563] border border-[#8D4E22] text-[#2B1405] flex items-center justify-center font-bold shadow-2xs">
                  <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#8D4E22]">
                  {conflicts.filter((c) => c.status !== 'RESOLVED').length}
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Disputes Active</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>{conflicts.filter((c) => c.status === 'RESOLVED').length} Resolved</span>
                <span className="badge-alert-tint px-2 py-0.5 rounded-full text-[10px]">
                  PRD §10 Gate
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Disputed Acreage</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Map className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">6.8</span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Acres Overlapping</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>&lt;0.8% Total Land</span>
                <span className="badge-warning-tint px-2 py-0.5 rounded-full text-[10px]">
                  Tolerance Safe
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Auto-Snap Resolution</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">84.2%</span>
                <span className="text-[11px] font-bold text-[#3E5F36]">Resolved in 48h</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>PostGIS ST_Snap</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  Cadastral Snap
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Field Drone SLA</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
                  <Compass className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">48 hrs</span>
                <span className="text-[11px] font-bold text-[#0369A1]">Re-survey Turnaround</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>5 Surveyors On Call</span>
                <span className="badge-sky-tint px-2 py-0.5 rounded-full text-[10px]">
                  RTK Mobile
                </span>
              </div>
            </div>
          </div>

          {/* PRD §10 Cadastral Protocols Explanatory Strip */}
          <div className="bg-[#F5E5D5] border border-[#D19E77] rounded-3xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-[#F2DFC9] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center text-xs font-bold">
                §
              </div>
              <h4 className="text-xs font-black text-[#18221B] uppercase tracking-wider">
                PRD §10 Statutory Dispute Resolution Protocols
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-[#D19E77] space-y-1">
                <span className="text-[10px] font-black uppercase text-[#8D4E22] block">
                  Protocol 1: RTK Drone Re-Survey
                </span>
                <p className="text-[11px] text-[#4A5B50] leading-relaxed">
                  Sub-meter optical orthomosaic capture to eliminate mobile GNSS multipath error along tree lines and bunds.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#D19E77] space-y-1">
                <span className="text-[10px] font-black uppercase text-[#0369A1] block">
                  Protocol 2: PostGIS Snap-to-Road
                </span>
                <p className="text-[11px] text-[#4A5B50] leading-relaxed">
                  Algorithmic realignment via <code>ST_Snap</code> to municipal access lanes or surveyed taluka stone pillars.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#D19E77] space-y-1">
                <span className="text-[10px] font-black uppercase text-[#8D4E22] block">
                  Protocol 3: Joint Patwari Demarcation
                </span>
                <p className="text-[11px] text-[#4A5B50] leading-relaxed">
                  Physical tri-party verification with both landholders and village revenue official (Panchnama report).
                </p>
              </div>
            </div>
          </div>

          {/* Boundary Conflicts Queue */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#8D4E22]" />
                  <span>Spatial Overlap &amp; Dispute Queue (PRD §10 &amp; Module A07)</span>
                </h3>
                <p className="text-xs text-[#4A5B50] font-semibold">
                  Automated geometric intersection alerts where PostGIS detected concurrent land claims exceeding tolerance thresholds
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search conflict, farmer, Khasra..."
                    value={conflictSearchTerm}
                    onChange={(e) => setConflictSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs text-[#18221B] font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>

                <CustomDropdown
                  value={conflictSeverityFilter}
                  onChange={(val) => setConflictSeverityFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Severities', dotColor: '#8D4E22' },
                    { value: 'HIGH', label: 'High Severity', dotColor: '#EF4444' },
                    { value: 'MEDIUM', label: 'Medium Severity', dotColor: '#F59E0B' },
                    { value: 'LOW', label: 'Low Severity', dotColor: '#10B981' },
                  ]}
                  className="w-44"
                />

                <CustomDropdown
                  value={conflictStatusFilter}
                  onChange={(val) => setConflictStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Statuses', dotColor: '#8D4E22' },
                    { value: 'ACTION_REQUIRED', label: 'Action Required', dotColor: '#EF4444' },
                    { value: 'UNDER_REVIEW', label: 'Under Review', dotColor: '#F59E0B' },
                    { value: 'IN_RE_SURVEY', label: 'In Re-Survey', dotColor: '#0284C7' },
                    { value: 'RESOLVED', label: 'Resolved', dotColor: '#5E8256' },
                  ]}
                  className="w-48"
                />
              </div>
            </div>

            {/* Conflict Cards Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredConflicts.map((conf) => {
                const isResolved = conf.status === 'RESOLVED'

                return (
                  <div
                    key={conf.id}
                    className={`p-5 rounded-2xl border space-y-3 transition-all ${
                      isResolved
                        ? 'bg-[#E6EFE4] border-[#C1D6BD]'
                        : 'bg-[#C49563]/25 border-[#8D4E22]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#2B1405] bg-white border border-[#8D4E22] px-2.5 py-0.5 rounded-lg shadow-2xs">
                          {conf.id}
                        </span>
                        <h4 className="text-sm font-black text-[#18221B]">{conf.location}</h4>
                        <span className="text-[10px] text-[#738679] font-medium">
                          Detected: {conf.detectedAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge-alert-tint px-2.5 py-0.5 rounded-full text-[10px] font-black">
                          {conf.overlapAcreage} Acres Overlap ({conf.overlapPercentage})
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            conf.severity === 'HIGH'
                              ? 'bg-[#C49563] text-[#2B1405] border border-[#8D4E22]'
                              : conf.severity === 'MEDIUM'
                              ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                              : 'bg-[#F1F5F9] text-[#4A5B50] border border-[#E2E8F0]'
                          }`}
                        >
                          {conf.severity} Severity
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

                    {/* Claimant Comparison Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-[#E5DFD5]">
                      {/* Claimant A */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#738679] font-bold uppercase">
                            Claimant A (Survey #1)
                          </span>
                          <span className="text-[10px] font-mono text-[#18221B] font-bold">
                            {conf.parcelA.id}
                          </span>
                        </div>
                        <div className="font-black text-xs text-[#18221B]">
                          {conf.parcelA.farmerName}
                        </div>
                        <div className="text-[11px] text-[#4A5B50] flex items-center justify-between">
                          <span>{conf.parcelA.khasra}</span>
                          <span className="font-bold text-[#8D4E22]">
                            {conf.parcelA.declaredArea} Acres
                          </span>
                        </div>
                      </div>

                      {/* Claimant B */}
                      <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#E5DFD5] pt-2 md:pt-0 md:pl-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#738679] font-bold uppercase">
                            Claimant B (Survey #2)
                          </span>
                          <span className="text-[10px] font-mono text-[#18221B] font-bold">
                            {conf.parcelB.id}
                          </span>
                        </div>
                        <div className="font-black text-xs text-[#18221B]">
                          {conf.parcelB.farmerName}
                        </div>
                        <div className="text-[11px] text-[#4A5B50] flex items-center justify-between">
                          <span>{conf.parcelB.khasra}</span>
                          <span className="font-bold text-[#8D4E22]">
                            {conf.parcelB.declaredArea} Acres
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dispute Details & Recommended Protocol */}
                    <div className="text-xs text-[#4A5B50] leading-relaxed bg-[#F5E5D5] p-3 rounded-xl border border-[#E8DFD3]">
                      <strong className="text-[#18221B]">Dispute Cause: </strong>
                      {conf.reason}
                      <div className="mt-1 text-[11px] text-[#3E5F36] font-medium">
                        <strong>Recommended Protocol: </strong> {conf.recommendedAction}
                      </div>
                    </div>

                    {/* Bottom Action Strip - Strictly Icon-Only Actions with Tooltips */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] text-[#738679]">
                        Field Surveyor: <strong>{conf.assignedAgent}</strong>
                      </span>

                      <div className="inline-flex items-center gap-1.5">
                        {/* 1. View Spatial Overlap Canvas */}
                        <button
                          type="button"
                          onClick={() => setSelectedConflictForInspection(conf)}
                          title="Inspect Spatial Overlap Polygon (ST_Intersection)"
                          className="w-8 h-8 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                        >
                          <Eye className="w-4 h-4 stroke-[2.2]" />
                        </button>

                        {/* 2. Dispatch RTK Drone Survey */}
                        {conf.status !== 'IN_RE_SURVEY' && !isResolved && (
                          <button
                            type="button"
                            onClick={() => handleDispatchSurvey(conf.id)}
                            title="Dispatch RTK Drone Field Re-survey"
                            className="w-8 h-8 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Compass className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        )}

                        {/* 3. Resolve Dispute */}
                        {!isResolved && (
                          <button
                            type="button"
                            onClick={() => handleResolveConflict(conf.id)}
                            title="Resolve Dispute & Re-align Cadastral Boundary"
                            className="w-8 h-8 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white cursor-pointer shadow-xs flex items-center justify-center transition-colors"
                          >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        )}
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
      {/* 4. SUB-PAGE 3: LAND DOCUMENTS (PRD §5 F10.2)                  */}
      {/* ============================================================= */}
      {activeTab === 'land-documents' && (
        <div className="space-y-6">
          {/* Dedicated Sea Green Tinted KPI Summary Cards for Documents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Total Land Records</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <FileCheck2 className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">{documents.length}</span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Cadastral Files</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>State Bhulekh Portals</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  Encrypted Vault
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">7/12 &amp; B-1 Extracts</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <FileText className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {
                    documents.filter(
                      (d) =>
                        d.docType.includes('7/12') ||
                        d.docType.includes('B-1') ||
                        d.docType.includes('Khatauni')
                    ).length
                  }
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Ownership Deeds</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Record of Rights (ROR)</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  F10.2 Gate
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Revenue Authenticity</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">98.6%</span>
                <span className="text-[11px] font-bold text-[#3E5F36]">Seal Matched</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Tehsildar Digital Sign</span>
                <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px]">
                  Legal Grade
                </span>
              </div>
            </div>

            <div className="harmony-kpi-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5B50]">Flagged / Review</span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C1D6BD] text-[#8D4E22] flex items-center justify-center font-bold shadow-2xs">
                  <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#18221B]">
                  {documents.filter((d) => d.status !== 'VERIFIED').length}
                </span>
                <span className="text-[11px] font-bold text-[#8D4E22]">Pending Actions</span>
              </div>
              <div className="text-[11px] text-[#4A5B50] font-medium flex items-center justify-between pt-1 border-t border-[#C1D6BD]/30">
                <span>Mutation / Incomplete</span>
                <span className="badge-warning-tint px-2 py-0.5 rounded-full text-[10px]">
                  Audit Check
                </span>
              </div>
            </div>
          </div>

          {/* Revenue Documents Table Card */}
          <div className="bg-white border border-[#D19E77] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#18221B] tracking-tight flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#8D4E22]" />
                  <span>Revenue Land Records &amp; Ownership Deeds (PRD §5 F10.2)</span>
                </h3>
                <p className="text-xs text-[#4A5B50] font-semibold">
                  Official 7/12 Satbara, B-1 Khasra-Khatauni records, Jamabandi certificates, and Patwari demarcation sketches
                </p>
              </div>

              {/* Quick Search & Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search doc ID, farmer, ref #..."
                    value={docSearchTerm}
                    onChange={(e) => setDocSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs text-[#18221B] font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>

                <CustomDropdown
                  value={docStateFilter}
                  onChange={(val) => setDocStateFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All States', dotColor: '#8D4E22' },
                    { value: 'Madhya Pradesh', label: 'MP Bhulekh', dotColor: '#5E8256' },
                    { value: 'Uttar Pradesh', label: 'UP Bhulekh', dotColor: '#0284C7' },
                    { value: 'Maharashtra', label: 'MahaBhulekh', dotColor: '#D97706' },
                    { value: 'Punjab', label: 'Punjab Jamabandi', dotColor: '#8B5CF6' },
                    { value: 'Rajasthan', label: 'Rajasthan Apna Khata', dotColor: '#EC4899' },
                    { value: 'Telangana', label: 'Telangana Dharani', dotColor: '#06B6D4' },
                    { value: 'Karnataka', label: 'Karnataka Bhoomi', dotColor: '#10B981' },
                    { value: 'Gujarat', label: 'Gujarat AnyROR', dotColor: '#F59E0B' },
                    { value: 'Tamil Nadu', label: 'Tamil Nadu e-Services', dotColor: '#6366F1' },
                    { value: 'Andhra Pradesh', label: 'AP Meebhoomi', dotColor: '#14B8A6' },
                  ]}
                  className="w-48"
                />

                <CustomDropdown
                  value={docStatusFilter}
                  onChange={(val) => setDocStatusFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Statuses', dotColor: '#8D4E22' },
                    { value: 'VERIFIED', label: 'Verified', dotColor: '#5E8256' },
                    { value: 'DOCUMENT_FLAGGED', label: 'Flagged', dotColor: '#EF4444' },
                    { value: 'UNDER_REVIEW', label: 'Under Review', dotColor: '#F59E0B' },
                  ]}
                  className="w-44"
                />
              </div>
            </div>

            {/* Document Type Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#E5DFD5]">
              <span className="text-[11px] font-bold text-[#738679] flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Record Type:
              </span>
              {[
                { key: 'ALL', label: 'All Records' },
                { key: '7/12', label: '7/12 Satbara' },
                { key: 'B-1', label: 'B-1 Khatauni' },
                { key: 'Jamabandi', label: 'Jamabandi' },
                { key: 'Naksha', label: 'Naksha Map Trace' },
                { key: 'Dharani', label: 'Dharani Passbook' },
                { key: 'Mutation', label: 'Mutation Order' },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setDocTypeFilter(pill.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    docTypeFilter === pill.key
                      ? 'bg-[#8D4E22] text-white shadow-2xs'
                      : 'bg-[#F5E5D5] text-[#4A5B50] hover:bg-[#F3EDE4] border border-[#D19E77]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Documents Archive Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5E5D5] text-[#4A5B50] font-bold border-b border-[#E5DFD5] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Document &amp; Landholder</th>
                    <th className="p-3.5">Document Type &amp; Authority</th>
                    <th className="p-3.5">Reference &amp; Location</th>
                    <th className="p-3.5">File Specs</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFD5]">
                  {filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-[#F9F6F1] transition-colors cursor-pointer"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      {/* Document & Landholder */}
                      <td className="p-3.5">
                        <div className="font-black text-[#18221B] text-sm">
                          {doc.farmerName}
                        </div>
                        <div className="text-[11px] font-mono text-[#4A5B50] font-bold flex items-center gap-1.5">
                          <span className="text-[#8D4E22]">{doc.id}</span>
                          <span>•</span>
                          <span>{doc.parcelId}</span>
                        </div>
                      </td>

                      {/* Document Type & Issuing Authority */}
                      <td className="p-3.5">
                        <div className="font-black text-[#18221B]">{doc.docType}</div>
                        <div className="text-[11px] text-[#4A5B50] flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#738679]" />
                          <span>{doc.issuingAuthority}</span>
                        </div>
                      </td>

                      {/* Reference & Location */}
                      <td className="p-3.5">
                        <div className="font-mono text-xs font-bold text-[#18221B]">
                          {doc.documentNumber}
                        </div>
                        <div className="text-[10px] text-[#4A5B50]">
                          {doc.tehsil}, {doc.district} ({doc.state})
                        </div>
                      </td>

                      {/* File Specs */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#18221B]">{doc.fileSize}</div>
                        <div className="text-[10px] text-[#738679]">
                          Uploaded: {doc.uploadDate}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">{renderStatusBadge(doc.status)}</td>

                      {/* Strictly Icon-Only Actions with descriptive tooltips */}
                      <td className="p-3.5 text-right">
                        <div
                          className="inline-flex items-center gap-1.5 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            title="Preview Official Revenue Record & Watermark Seal"
                            className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-[#F5E5D5] border border-[#D8B293] hover:border-[#8D4E22] text-[#4A5B50] hover:text-[#18221B] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          {doc.status !== 'VERIFIED' && (
                            <button
                              type="button"
                              onClick={() => handleVerifyDocument(doc.id)}
                              title="Approve Revenue Authenticity"
                              className="w-7.5 h-7.5 rounded-xl bg-[#E6EFE4] hover:bg-[#C1D6BD] border border-[#BED2BB] text-[#3E5F36] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                `Downloading official cadastral document ${doc.documentNumber} (${doc.fileSize})...`
                              )
                            }
                            title="Download Official PDF Extract"
                            className="w-7.5 h-7.5 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDocToDelete(doc)}
                            title="Reject / Remove Record"
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
      {/* 5. SLIDE-OVER DRAWER: PARCEL BOUNDARY INSPECTOR                */}
      {/* ============================================================= */}
      {selectedParcel && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto custom-scrollbar flex flex-col border-l border-[#D8B293]">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#EAE4DC] flex items-center justify-between bg-[#F5E5D5] sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold shadow-2xs">
                  <Map className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#18221B]">{selectedParcel.id}</h3>
                  <p className="text-xs text-[#738679] font-medium">
                    {selectedParcel.surveyNumber} • {selectedParcel.location.village}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedParcel(null)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* Quick Actions (Strictly Icon-Only with tooltips) */}
              <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#738679]">Status:</span>
                  {renderStatusBadge(selectedParcel.status)}
                </div>

                <div className="flex items-center gap-2">
                  {selectedParcel.status !== 'VERIFIED' && (
                    <button
                      type="button"
                      onClick={() => handleVerifyParcel(selectedParcel.id)}
                      title="Verify Boundary (Approve)"
                      className="w-9 h-9 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white cursor-pointer shadow-xs flex items-center justify-center transition-colors"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setParcelToDelete(selectedParcel)}
                    title="Delete Parcel Entry"
                    className="w-9 h-9 rounded-xl bg-[#AF7540] hover:bg-[#6E3812] hover:text-white border border-[#6E3812] text-[#2B1405] cursor-pointer shadow-2xs flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Spatial PostGIS Coordinates & Location Photo Visualizer Card */}
              <div className="p-4 rounded-2xl bg-[#C49563]/25 border border-[#8D4E22] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#18221B] flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#8D4E22]" />
                    <span>Spatial &amp; Ground Evidence (PRD §10, §17)</span>
                  </div>
                  {/* Mode Selector Tabs */}
                  <div className="flex items-center bg-[#F5E5D5] p-0.5 rounded-xl border border-[#D8B293] shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setParcelVisualMode('polygon')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        parcelVisualMode === 'polygon'
                          ? 'bg-[#8D4E22] text-white shadow-2xs'
                          : 'text-[#2B1405] hover:text-[#8D4E22]'
                      }`}
                    >
                      <Satellite className="w-3 h-3" />
                      <span>Satellite GIS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setParcelVisualMode('location-photo')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        parcelVisualMode === 'location-photo'
                          ? 'bg-[#8D4E22] text-white shadow-2xs'
                          : 'text-[#2B1405] hover:text-[#8D4E22]'
                      }`}
                    >
                      <Camera className="w-3 h-3" />
                      <span>Location Photo</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </button>
                  </div>
                </div>

                {/* Content View based on Active Tab */}
                {parcelVisualMode === 'polygon' ? (
                  <>
                    {/* Satellite Aerial Map with Polygon Overlay */}
                    <div className="h-48 rounded-2xl relative overflow-hidden border-2 border-[#8D4E22] shadow-inner group">
                      <img
                        src={selectedParcel.satelliteImageUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'}
                        alt={`Satellite imagery for ${selectedParcel.id}`}
                        className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-700"
                      />
                      {/* Grid & Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

                      {/* SVG Boundary Polygon Simulation */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polygon
                          points="20,25 78,18 85,75 24,82"
                          fill="rgba(141, 78, 34, 0.28)"
                          stroke="#F2DFC9"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                        <circle cx="20" cy="25" r="3" fill="#8D4E22" stroke="#FFFFFF" strokeWidth="1.5" />
                        <circle cx="78" cy="18" r="3" fill="#8D4E22" stroke="#FFFFFF" strokeWidth="1.5" />
                        <circle cx="85" cy="75" r="3" fill="#8D4E22" stroke="#FFFFFF" strokeWidth="1.5" />
                        <circle cx="24" cy="82" r="3" fill="#8D4E22" stroke="#FFFFFF" strokeWidth="1.5" />
                      </svg>

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center gap-1">
                          <Satellite className="w-3 h-3 text-[#C49563]" />
                          <span>Sentinel-2 L2A</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6EFE4] text-[#3E5F36] border border-[#C1D6BD] shadow-2xs">
                          NDVI {selectedParcel.ndviScore}
                        </span>
                      </div>

                      {/* Centered Area Pill */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="p-2.5 text-center bg-white/90 backdrop-blur-md rounded-2xl border border-[#8D4E22]/40 shadow-lg pointer-events-auto">
                          <MapPin className="w-4 h-4 text-[#8D4E22] mx-auto animate-bounce mb-0.5" />
                          <span className="text-[11px] font-black text-[#18221B] block">
                            PostGIS Polygon Mapped
                          </span>
                          <span className="text-[10px] text-[#3E5F36] font-bold block">
                            ST_Area: {(selectedParcel.gisArea * 4046.86).toFixed(0)} m² ({selectedParcel.gisArea} Computed Acres)
                          </span>
                        </div>
                      </div>

                      {/* Bottom Coordinate Bar */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                        <span>Center: {selectedParcel.polygonCoordinates[0][0]}° N, {selectedParcel.polygonCoordinates[0][1]}° E</span>
                        <span className="text-emerald-400 font-bold">Closed Ring ✓</span>
                      </div>
                    </div>

                    {/* Coordinate Vertices */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#D8B293] text-[11px] font-mono text-[#4A5B50] space-y-1">
                      <div className="text-[10px] font-bold uppercase text-[#738679] flex items-center justify-between border-b border-[#F2DFC9] pb-1 mb-1">
                        <span>PostGIS Vertex Boundary Nodes</span>
                        <span>WGS84 Coordinates</span>
                      </div>
                      {selectedParcel.polygonCoordinates.map((coord, idx) => (
                        <div key={idx} className="flex justify-between items-center hover:bg-[#FDFBF8] px-1 py-0.5 rounded">
                          <span className="flex items-center gap-1.5 font-bold text-[#8D4E22]">
                            <span className="w-4 h-4 rounded-full bg-[#F2DFC9] text-[9px] flex items-center justify-center text-[#8D4E22]">
                              {idx + 1}
                            </span>
                            Vertex #{idx + 1}:
                          </span>
                          <span className="font-bold text-[#18221B]">
                            {coord[0]}° N, {coord[1]}° E
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* On-Ground Geotagged Field Photo View */}
                    <div className="relative rounded-2xl overflow-hidden border-2 border-[#8D4E22] shadow-sm group">
                      <div className="relative h-60 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={selectedParcel.locationPhotoUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80'}
                          alt={`Field photo for ${selectedParcel.id}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

                        {/* Top Watermark Header */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{selectedParcel.geofenceStatus || 'INSIDE_PARCEL'}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setFullscreenPhoto({
                                url: selectedParcel.locationPhotoUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
                                title: `${selectedParcel.id} - ${selectedParcel.surveyNumber}`,
                                caption: selectedParcel.photoCaption,
                                timestamp: selectedParcel.photoTimestamp,
                                accuracy: selectedParcel.photoAccuracy,
                                elevation: selectedParcel.photoElevation,
                                device: selectedParcel.photoDevice,
                                geofence: selectedParcel.geofenceStatus,
                                parcelId: selectedParcel.id,
                                agent: selectedParcel.fieldAgent,
                                coords: selectedParcel.polygonCoordinates[0],
                              })
                            }
                            className="px-2.5 py-1 rounded-xl bg-black/60 hover:bg-[#8D4E22] text-white text-[11px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                            title="Expand full high-resolution geotagged image"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Full HD View</span>
                          </button>
                        </div>

                        {/* Bottom Geotagged HUD Bar (Official Field App Watermark) */}
                        <div className="absolute bottom-0 inset-x-0 p-3 bg-black/75 backdrop-blur-md border-t border-white/10 text-white space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <div className="flex items-center gap-1.5 text-amber-300">
                              <MapPin className="w-3.5 h-3.5 text-amber-400" />
                              <span>{selectedParcel.polygonCoordinates[0][0]}° N, {selectedParcel.polygonCoordinates[0][1]}° E</span>
                            </div>
                            <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              {selectedParcel.photoAccuracy || '±1.2 m (RTK-GNSS)'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-200 line-clamp-2 leading-tight">
                            {selectedParcel.photoCaption || `On-ground physical verification of ${selectedParcel.surveyNumber}, ${selectedParcel.location.village}`}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-white/10 font-mono">
                            <span>⏱ {selectedParcel.photoTimestamp || selectedParcel.surveyDate}</span>
                            <span>👤 {selectedParcel.fieldAgent}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Camera & EXIF Audit Callout */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#D8B293] text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-[#738679]">
                        <span className="font-bold">Capture Device:</span>
                        <span className="font-mono text-[#18221B]">{selectedParcel.photoDevice || 'Redmi Note 13 Pro (NatureX FieldApp v2.4.1)'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#738679]">
                        <span className="font-bold">Survey Elevation:</span>
                        <span className="font-mono text-[#18221B]">{selectedParcel.photoElevation || '188 m MSL'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#738679]">
                        <span className="font-bold">Cryptographic Tamper Hash:</span>
                        <span className="font-mono text-emerald-700 text-[10px] font-bold">SHA-256 Verified ✓</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Landholder & Survey Details */}
              <div className="p-4 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-3 text-xs">
                <h4 className="font-black text-[#18221B]">Parcel Metadata (PRD §5)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Landowner
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedParcel.farmerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Contact
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedParcel.farmerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Tehsil &amp; Halka
                    </span>
                    <span className="font-bold text-[#18221B]">
                      {selectedParcel.location.tehsil}, {selectedParcel.location.patwariHalka}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Assigned Field Agent
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedParcel.fieldAgent}</span>
                  </div>
                </div>
              </div>

              {/* Crop & Ecological Matrix */}
              <div className="p-4 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] space-y-2 text-xs">
                <h4 className="font-black text-[#18221B]">Ecological &amp; Soil Matrix</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Soil Type
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedParcel.soilType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Crop Rotation
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedParcel.cropPattern}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Sentinel-2 NDVI
                    </span>
                    <span className="font-black text-[#3E5F36]">{selectedParcel.ndviScore}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#738679] font-bold uppercase block">
                      Canopy Density
                    </span>
                    <span className="font-bold text-[#18221B]">{selectedParcel.canopyDensity}</span>
                  </div>
                </div>
              </div>

              {/* Linked Land Revenue Record / Khatauni Document (PRD §15.2) */}
              {(() => {
                const linkedDoc = documents.find((d) => d.parcelId === selectedParcel.id)
                if (!linkedDoc) return null
                return (
                  <div className="p-4 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-[#3E5F36]">
                        <FileCheck2 className="w-4 h-4 text-[#3E5F36]" />
                        <span>Uploaded Land Record (PRD §15.2)</span>
                      </div>
                      <span className="badge-mint-tint px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {linkedDoc.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#C1D6BD] shadow-2xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-[#18221B]">{linkedDoc.docType}</div>
                        <div className="text-[10px] text-[#738679] font-mono">
                          {linkedDoc.documentNumber} • {linkedDoc.fileSize}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(linkedDoc)}
                        className="px-3 py-1.5 rounded-xl bg-[#3E5F36] hover:bg-[#2F4729] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 6. MODAL: INSPECT SPATIAL OVERLAP (PRD §10 ST_Intersection)    */}
      {/* ============================================================= */}
      {selectedConflictForInspection && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#C49563] border border-[#8D4E22] text-[#2B1405] flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">
                    Spatial Overlap Analyzer: {selectedConflictForInspection.id}
                  </h4>
                  <p className="text-xs text-[#738679]">
                    PostGIS <code>ST_Intersection(geom_a, geom_b)</code> Geometric Inspection
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedConflictForInspection(null)}
                className="w-8 h-8 rounded-xl bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] text-[#2B1405] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Spatial Overlap Simulation Visualizer */}
            <div className="h-52 rounded-2xl bg-[#C49563]/20 border border-[#8D4E22] relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8D4E22_1px,transparent_1px)] [background-size:12px_12px]" />

              {/* Polygon A Overlay */}
              <div className="absolute w-44 h-36 border-2 border-[#0369A1] bg-[#0369A1]/10 rounded-2xl -translate-x-12 flex items-start p-2">
                <span className="text-[10px] font-black text-[#0369A1] bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">
                  {selectedConflictForInspection.parcelA.id}
                </span>
              </div>

              {/* Polygon B Overlay */}
              <div className="absolute w-44 h-36 border-2 border-[#3E5F36] bg-[#3E5F36]/10 rounded-2xl translate-x-12 flex items-end justify-end p-2">
                <span className="text-[10px] font-black text-[#3E5F36] bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">
                  {selectedConflictForInspection.parcelB.id}
                </span>
              </div>

              {/* Intersecting Overlap Strip */}
              <div className="relative z-10 w-24 h-28 border-2 border-dashed border-[#8D4E22] bg-[#C49563] rounded-xl flex flex-col items-center justify-center p-2 text-center animate-pulse">
                <AlertTriangle className="w-4 h-4 text-[#8D4E22] mb-1" />
                <span className="text-[11px] font-black text-[#2B1405]">
                  {selectedConflictForInspection.overlapAcreage} Acres
                </span>
                <span className="text-[9px] font-black text-[#2B1405]">
                  {selectedConflictForInspection.overlapPercentage} Overlap
                </span>
              </div>
            </div>

            {/* Conflict Metadata Matrix */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5]">
                <span className="text-[10px] text-[#738679] font-bold uppercase block">
                  Claimant A
                </span>
                <div className="font-bold text-[#18221B]">
                  {selectedConflictForInspection.parcelA.farmerName}
                </div>
                <div className="text-[11px] text-[#4A5B50]">
                  {selectedConflictForInspection.parcelA.khasra} (
                  {selectedConflictForInspection.parcelA.declaredArea} Acres)
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5]">
                <span className="text-[10px] text-[#738679] font-bold uppercase block">
                  Claimant B
                </span>
                <div className="font-bold text-[#18221B]">
                  {selectedConflictForInspection.parcelB.farmerName}
                </div>
                <div className="text-[11px] text-[#4A5B50]">
                  {selectedConflictForInspection.parcelB.khasra} (
                  {selectedConflictForInspection.parcelB.declaredArea} Acres)
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] text-xs space-y-1">
              <div className="font-black text-[#18221B]">Dispute Cause &amp; Technical Analysis:</div>
              <p className="text-[11px] text-[#4A5B50] leading-relaxed">
                {selectedConflictForInspection.reason}
              </p>
              <div className="text-[11px] text-[#3E5F36] font-bold pt-1">
                Protocol: {selectedConflictForInspection.recommendedAction}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EAE4DC]">
              <span className="text-xs text-[#738679]">
                Assigned Surveyor: <strong>{selectedConflictForInspection.assignedAgent}</strong>
              </span>

              <div className="flex items-center gap-2">
                {selectedConflictForInspection.status !== 'RESOLVED' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleDispatchSurvey(selectedConflictForInspection.id)
                        alert('Dispatched RTK drone field team for high-precision boundary re-survey.')
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#0369A1] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Dispatch Re-survey</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleResolveConflict(selectedConflictForInspection.id)
                        setSelectedConflictForInspection(null)
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Snap &amp; Resolve Conflict</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 7. MODAL: REVENUE DOCUMENT PREVIEW & WATERMARK SHEET          */}
      {/* ============================================================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">{previewDoc.docType}</h4>
                  <p className="text-xs text-[#738679]">
                    {previewDoc.id} • {previewDoc.documentNumber}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Authentic Government Cadastral Document Mockup */}
            <div className="p-5 rounded-2xl bg-[#F5E5D5] border border-[#E5DFD5] relative overflow-hidden space-y-3 font-serif">
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none -rotate-12">
                <span className="text-5xl font-black uppercase text-[#18221B]">
                  GOVERNMENT REVENUE RECORD
                </span>
              </div>

              {/* Official Seal Header */}
              <div className="text-center pb-3 border-b border-[#D8B293] space-y-0.5">
                <span className="text-[10px] font-sans font-bold text-[#738679] tracking-widest uppercase block">
                  DEPARTMENT OF LAND REVENUE &amp; SURVEY
                </span>
                <h5 className="text-sm font-sans font-black text-[#18221B]">
                  {previewDoc.state.toUpperCase()} BHULEKH CADASTRAL EXTRACT
                </h5>
                <p className="text-[11px] font-sans text-[#4A5B50]">
                  Tehsil: {previewDoc.tehsil} | District: {previewDoc.district}
                </p>
              </div>

              {/* Document Details Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                <div>
                  <span className="text-[10px] text-[#738679] font-bold uppercase block">
                    Registered Landholder
                  </span>
                  <span className="font-bold text-[#18221B]">{previewDoc.farmerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#738679] font-bold uppercase block">
                    Parcel Link ID
                  </span>
                  <span className="font-mono font-bold text-[#8D4E22]">{previewDoc.parcelId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#738679] font-bold uppercase block">
                    Issuing Authority
                  </span>
                  <span className="font-bold text-[#18221B]">{previewDoc.issuingAuthority}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#738679] font-bold uppercase block">
                    Bhulekh Reference ID
                  </span>
                  <span className="font-mono font-bold text-[#18221B]">
                    {previewDoc.documentNumber}
                  </span>
                </div>
              </div>

              {/* Verification Seal Box */}
              <div className="mt-3 p-3 rounded-xl bg-white border border-[#E6EFE4] font-sans flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#738679] uppercase font-bold block">
                    Verification Audit
                  </span>
                  <span className="text-xs font-bold text-[#3E5F36]">
                    {previewDoc.status === 'VERIFIED'
                      ? `✓ Verified by ${previewDoc.verifiedBy}`
                      : '⚠ Document Under Review'}
                  </span>
                </div>
                <div className="text-right text-[10px] text-[#738679]">
                  <div>Date: {previewDoc.verifiedDate}</div>
                  <div className="font-mono">SHA256: 4e9f...8a12</div>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  alert(`Downloading original PDF extract for ${previewDoc.documentNumber}`)
                }
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#0369A1] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF ({previewDoc.fileSize})</span>
              </button>

              <div className="flex items-center gap-2">
                {previewDoc.status !== 'VERIFIED' && (
                  <button
                    type="button"
                    onClick={() => handleVerifyDocument(previewDoc.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Approve Revenue Authenticity</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
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
      {/* 8. MODAL: REGISTER NEW PARCEL FORM                            */}
      {/* ============================================================= */}
      {isAddParcelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">Register New Land Parcel</h4>
                  <p className="text-xs text-[#738679]">PostGIS Cadastral Onboarding (PRD §5)</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddParcelModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddParcelSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Landholder Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={newParcelForm.farmerName}
                    onChange={(e) =>
                      setNewParcelForm({ ...newParcelForm, farmerName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98261 00000"
                    value={newParcelForm.farmerPhone}
                    onChange={(e) =>
                      setNewParcelForm({ ...newParcelForm, farmerPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Khasra / Survey Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Khasra 142/2"
                    value={newParcelForm.surveyNumber}
                    onChange={(e) =>
                      setNewParcelForm({ ...newParcelForm, surveyNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Declared Acreage (Acres) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 12.5"
                    value={newParcelForm.declaredArea}
                    onChange={(e) =>
                      setNewParcelForm({ ...newParcelForm, declaredArea: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none focus:bg-white focus:border-[#8D4E22]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">State</label>
                  <CustomDropdown
                    value={newParcelForm.state}
                    onChange={(val) => setNewParcelForm({ ...newParcelForm, state: val })}
                    options={[
                      { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
                      { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
                      { value: 'Maharashtra', label: 'Maharashtra' },
                      { value: 'Rajasthan', label: 'Rajasthan' },
                      { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">District</label>
                  <input
                    type="text"
                    placeholder="e.g. Sehore"
                    value={newParcelForm.district}
                    onChange={(e) =>
                      setNewParcelForm({ ...newParcelForm, district: e.target.value })
                    }
                    className="w-full px-2.5 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">Tehsil</label>
                  <input
                    type="text"
                    placeholder="e.g. Ashta"
                    value={newParcelForm.tehsil}
                    onChange={(e) =>
                      setNewParcelForm({ ...newParcelForm, tehsil: e.target.value })
                    }
                    className="w-full px-2.5 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Soil Class
                  </label>
                  <input
                    type="text"
                    value={newParcelForm.soilType}
                    onChange={(e) =>
                      setNewParcelForm({ ...newParcelForm, soilType: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Crop Rotation
                  </label>
                  <input
                    type="text"
                    value={newParcelForm.cropPattern}
                    onChange={(e) =>
                      setNewParcelForm({ ...newParcelForm, cropPattern: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE4DC]">
                <button
                  type="button"
                  onClick={() => setIsAddParcelModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Register Parcel &amp; Ingest GIS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 9. MODAL: UPLOAD NEW REVENUE DOCUMENT                         */}
      {/* ============================================================= */}
      {isUploadDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#D8B293] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#18221B]">
                    Upload Cadastral Revenue Record
                  </h4>
                  <p className="text-xs text-[#738679]">State Bhulekh Encrypted Repository</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUploadDocModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#F5E5D5] hover:bg-[#F3EDE4] border border-[#D8B293] text-[#738679] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Landholder Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Patel"
                    value={newDocForm.farmerName}
                    onChange={(e) =>
                      setNewDocForm({ ...newDocForm, farmerName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Associated Parcel ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PARCEL-MP-0914"
                    value={newDocForm.parcelId}
                    onChange={(e) =>
                      setNewDocForm({ ...newDocForm, parcelId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                  Document Type *
                </label>
                <select
                  value={newDocForm.docType}
                  onChange={(e) => setNewDocForm({ ...newDocForm, docType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="B-1 / Khasra-Khatauni Record">
                    B-1 / Khasra-Khatauni Record (MP / UP)
                  </option>
                  <option value="Maharashtra 7/12 Extract (Satbara)">
                    Maharashtra 7/12 Extract (Satbara)
                  </option>
                  <option value="Punjab Jamabandi Record of Rights">
                    Punjab Jamabandi Record of Rights
                  </option>
                  <option value="Rajasthan Jamabandi Nakal">
                    Rajasthan Jamabandi Nakal
                  </option>
                  <option value="Telangana Dharani E-Passbook (ROR-1B)">
                    Telangana Dharani E-Passbook (ROR-1B)
                  </option>
                  <option value="Karnataka Bhoomi RTC (Record of Rights)">
                    Karnataka Bhoomi RTC (Record of Rights)
                  </option>
                  <option value="Khasra Map (Naksha Trace)">Khasra Map (Naksha Trace)</option>
                  <option value="Cadastral Mutation Sanction Order">
                    Cadastral Mutation Sanction Order
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Official Document Ref # *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MP-REV-2026-99120"
                    value={newDocForm.documentNumber}
                    onChange={(e) =>
                      setNewDocForm({ ...newDocForm, documentNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5B50] mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tehsildar Office"
                    value={newDocForm.issuingAuthority}
                    onChange={(e) =>
                      setNewDocForm({ ...newDocForm, issuingAuthority: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D8B293] bg-[#F5E5D5] text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F5E5D5] border-2 border-dashed border-[#C1D6BD] text-center space-y-1">
                <Upload className="w-5 h-5 text-[#8D4E22] mx-auto" />
                <span className="text-xs font-bold text-[#18221B] block">
                  Simulated File Attachment
                </span>
                <span className="text-[10px] text-[#738679] block">
                  official_bhulekh_extract_signed.pdf (2.4 MB)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE4DC]">
                <button
                  type="button"
                  onClick={() => setIsUploadDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#F3EDE4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Upload &amp; Store In Cadastral Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 10. MODAL: DELETE PARCEL CONFIRMATION                         */}
      {/* ============================================================= */}
      {parcelToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border-2 border-[#B88258] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C49563] border border-[#8D4E22] text-[#2B1405] flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#18221B]">Delete Parcel Entry?</h4>
                <p className="text-xs text-[#738679]">This action will purge spatial polygon records</p>
              </div>
            </div>

            <p className="text-xs text-[#4A5B50] leading-relaxed">
              Are you sure you want to permanently delete parcel{' '}
              <strong className="text-[#18221B]">{parcelToDelete.id}</strong> (
              {parcelToDelete.surveyNumber}) for landowner{' '}
              <strong className="text-[#18221B]">{parcelToDelete.farmerName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setParcelToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#C49563] hover:text-[#2B1405] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteParcel}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 11. MODAL: DELETE DOCUMENT CONFIRMATION                       */}
      {/* ============================================================= */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border-2 border-[#B88258] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C49563] border border-[#8D4E22] text-[#2B1405] flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#18221B]">Remove Revenue Record?</h4>
                <p className="text-xs text-[#738679]">Purges legal document from repository</p>
              </div>
            </div>

            <p className="text-xs text-[#4A5B50] leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="text-[#18221B]">{docToDelete.docType}</strong> (Ref:{' '}
              <strong className="text-[#18221B]">{docToDelete.documentNumber}</strong>) for landholder{' '}
              <strong className="text-[#18221B]">{docToDelete.farmerName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A5B50] hover:bg-[#C49563] hover:text-[#2B1405] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDocument}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8D4E22] hover:bg-[#6E3812] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 9. MODAL: FULLSCREEN GEOTAGGED LOCATION PHOTO VIEWER          */}
      {/* ============================================================= */}
      {fullscreenPhoto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#18221B] rounded-3xl border border-[#8D4E22] overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-[#233127] border-b border-[#3E5F36]/40 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#8D4E22] text-white flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight">{fullscreenPhoto.title}</h4>
                  <p className="text-[11px] text-[#C49563] font-mono">
                    Geotagged Field Evidence • {fullscreenPhoto.parcelId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenPhoto(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Container */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[340px]">
              <img
                src={fullscreenPhoto.url}
                alt={fullscreenPhoto.title}
                className="max-h-[60vh] w-auto max-w-full object-contain"
              />

              {/* Watermark Stamp Overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md border border-white/15 p-3 rounded-2xl text-white space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-300 font-mono flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {fullscreenPhoto.coords[0]}° N, {fullscreenPhoto.coords[1]}° E
                  </span>
                  <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    Accuracy: {fullscreenPhoto.accuracy || '±1.2 m'}
                  </span>
                </div>
                <p className="text-xs text-slate-200">{fullscreenPhoto.caption}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-white/10 flex-wrap gap-2">
                  <span>⏱ {fullscreenPhoto.timestamp}</span>
                  <span>👤 {fullscreenPhoto.agent}</span>
                  <span>📱 {fullscreenPhoto.device}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-[#233127] border-t border-[#3E5F36]/40 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-mono font-bold text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>SHA-256 Tamper Proof • India DPDP 2025 Compliant</span>
              </span>
              <button
                type="button"
                onClick={() => setFullscreenPhoto(null)}
                className="px-4 py-1.5 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white font-bold cursor-pointer transition-colors shadow-2xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
