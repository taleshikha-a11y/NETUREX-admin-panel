import navData from '../layout/navigation.json'
import usersData from '../data/usersData.json'
import landGisData from '../data/landGisData.json'
import projectsData from '../data/projectsData.json'
import kycData from '../data/kycData.json'
import fieldOpsData from '../data/fieldOpsData.json'
import financeData from '../data/financeData.json'

export type SearchCategory =
  | 'ALL'
  | 'MODULES'
  | 'USERS'
  | 'LAND'
  | 'PROJECTS'
  | 'KYC'
  | 'FIELD_OPS'
  | 'FINANCE'

export interface SearchResultItem {
  id: string
  title: string
  subtitle: string
  category: SearchCategory
  categoryLabel: string
  targetKey: string
  badgeText?: string
  badgeVariant?: 'green' | 'amber' | 'blue' | 'red' | 'wood' | 'gray'
  meta?: string
  searchTokens: string
}

// Build static search index from JSON datasets
function buildSearchIndex(): SearchResultItem[] {
  const items: SearchResultItem[] = []

  // 1. Navigation Modules & Sub-modules
  for (const mod of navData.modules) {
    items.push({
      id: `nav-${mod.key}`,
      title: mod.label,
      subtitle: mod.description || 'System Navigation Module',
      category: 'MODULES',
      categoryLabel: 'Module',
      targetKey: mod.key,
      badgeText: 'Page',
      badgeVariant: 'wood',
      meta: 'Navigation',
      searchTokens: `${mod.label} ${mod.description || ''} ${mod.key} page module navigation`.toLowerCase(),
    })

    if (mod.children) {
      for (const child of mod.children) {
        items.push({
          id: `nav-${child.key}`,
          title: child.label,
          subtitle: `${mod.label} • ${child.description || ''}`,
          category: 'MODULES',
          categoryLabel: 'Module',
          targetKey: child.key,
          badgeText: (child as any).badge || 'Sub-page',
          badgeVariant: 'wood',
          meta: mod.label,
          searchTokens: `${child.label} ${child.description || ''} ${child.key} ${mod.label} sub-page`.toLowerCase(),
        })
      }
    }
  }

  // 2. Users & Farmers
  if (usersData && Array.isArray((usersData as any).users)) {
    for (const u of (usersData as any).users) {
      const loc = u.location ? `${u.location.village || ''}, ${u.location.district || ''}, ${u.location.state || ''}` : ''
      items.push({
        id: u.id,
        title: u.name,
        subtitle: `${u.id} • ${u.role || 'User'} • ${loc}`,
        category: 'USERS',
        categoryLabel: 'User / Farmer',
        targetKey: 'all-users',
        badgeText: u.universalStatus || 'ACTIVE',
        badgeVariant: u.universalStatus === 'APPROVED' ? 'green' : u.universalStatus === 'SUBMITTED' ? 'blue' : 'amber',
        meta: u.phone || '',
        searchTokens: `${u.name} ${u.id} ${u.phone || ''} ${u.role || ''} ${loc} ${u.organization?.name || ''} farmer user`.toLowerCase(),
      })
    }
  }

  // 3. Land Parcels
  if (landGisData && Array.isArray((landGisData as any).parcels)) {
    for (const p of (landGisData as any).parcels) {
      const loc = p.location ? `${p.location.village || ''}, ${p.location.tehsil || ''}, ${p.location.district || ''} (${p.location.state || ''})` : ''
      items.push({
        id: p.id,
        title: `${p.id} • ${p.surveyNumber}`,
        subtitle: `Landowner: ${p.farmerName} • ${loc}`,
        category: 'LAND',
        categoryLabel: 'Land / GIS',
        targetKey: p.status === 'CONFLICT' ? 'boundary-conflicts' : 'land-registry',
        badgeText: p.status || 'VERIFIED',
        badgeVariant: p.status === 'VERIFIED' ? 'green' : p.status === 'CONFLICT' ? 'red' : 'amber',
        meta: `${p.gisArea} Computed Acres`,
        searchTokens: `${p.id} ${p.surveyNumber} ${p.farmerName} ${p.farmerPhone || ''} ${loc} ${p.cropPattern || ''} ${p.soilType || ''} land parcel khasra gis`.toLowerCase(),
      })
    }
  }

  // 4. Land Documents
  if (landGisData && Array.isArray((landGisData as any).documents)) {
    for (const d of (landGisData as any).documents) {
      items.push({
        id: d.id,
        title: `${d.docType} (${d.documentNumber})`,
        subtitle: `Parcel: ${d.parcelId} • Landholder: ${d.farmerName} • ${d.issuingAuthority}`,
        category: 'LAND',
        categoryLabel: 'Land Document',
        targetKey: 'land-documents',
        badgeText: d.status || 'VERIFIED',
        badgeVariant: d.status === 'VERIFIED' ? 'green' : 'amber',
        meta: d.fileSize,
        searchTokens: `${d.id} ${d.docType} ${d.documentNumber} ${d.parcelId} ${d.farmerName} ${d.issuingAuthority} khatauni khasra document proof`.toLowerCase(),
      })
    }
  }

  // 5. Projects (Carbon, Water, Biodiversity)
  if (projectsData) {
    const pData = projectsData as any
    const allProj = [
      ...(pData.carbonProjects || []).map((cp: any) => ({ ...cp, type: 'Carbon' })),
      ...(pData.waterProjects || []).map((wp: any) => ({ ...wp, type: 'Water' })),
      ...(pData.biodiversityProjects || []).map((bp: any) => ({ ...bp, type: 'Biodiversity' })),
    ]

    for (const proj of allProj) {
      const targetSub = proj.type === 'Carbon' ? 'carbon' : proj.type === 'Water' ? 'water' : 'biodiversity'
      items.push({
        id: proj.id,
        title: proj.title,
        subtitle: `${proj.id} • ${proj.methodology || ''} • Lead: ${proj.leadFarmer || proj.developerOrg || ''}`,
        category: 'PROJECTS',
        categoryLabel: `${proj.type} Project`,
        targetKey: targetSub,
        badgeText: proj.type.toUpperCase(),
        badgeVariant: proj.type === 'Carbon' ? 'wood' : proj.type === 'Water' ? 'blue' : 'green',
        meta: proj.landParcel || proj.developerOrg || '',
        searchTokens: `${proj.id} ${proj.title} ${proj.methodology || ''} ${proj.developerOrg || ''} ${proj.leadFarmer || ''} ${proj.landParcel || ''} ${proj.type} project`.toLowerCase(),
      })
    }
  }

  // 6. KYC Records
  if (kycData && Array.isArray((kycData as any).records)) {
    for (const k of (kycData as any).records) {
      items.push({
        id: k.id,
        title: `KYC: ${k.userName}`,
        subtitle: `${k.id} • ${k.documentType} (${k.documentNumber}) • ${k.location || ''}`,
        category: 'KYC',
        categoryLabel: 'KYC & Compliance',
        targetKey: k.status === 'APPROVED' ? 'kyc-approved' : k.status === 'ACTION_REQUIRED' ? 'kyc-action' : 'kyc-queue',
        badgeText: k.status || 'SUBMITTED',
        badgeVariant: k.status === 'APPROVED' ? 'green' : k.status === 'REJECTED' || k.status === 'ACTION_REQUIRED' ? 'red' : 'blue',
        meta: k.userPhone || '',
        searchTokens: `${k.id} ${k.userName} ${k.userPhone || ''} ${k.documentType} ${k.documentNumber} ${k.location || ''} ${k.organization || ''} kyc verification aadhaar pan identity`.toLowerCase(),
      })
    }
  }

  // 7. Field Operations
  if (fieldOpsData && Array.isArray((fieldOpsData as any).visits)) {
    for (const v of (fieldOpsData as any).visits) {
      items.push({
        id: v.id,
        title: `${v.id}: ${v.purpose}`,
        subtitle: `Agent: ${v.assignedAgent} • Landowner: ${v.farmerName} (${v.parcelId})`,
        category: 'FIELD_OPS',
        categoryLabel: 'Field Operations',
        targetKey: 'field-visits',
        badgeText: v.status || 'COMPLETED',
        badgeVariant: v.status === 'COMPLETED' ? 'green' : 'amber',
        meta: v.scheduledDate || '',
        searchTokens: `${v.id} ${v.purpose} ${v.assignedAgent} ${v.farmerName} ${v.parcelId} ${v.location || ''} field visit survey`.toLowerCase(),
      })
    }
  }

  // 8. Finance Benefits
  if (financeData && Array.isArray((financeData as any).benefitObligations)) {
    for (const b of (financeData as any).benefitObligations) {
      items.push({
        id: b.id,
        title: `${b.farmerName} • ₹${b.entitlementAmount?.toLocaleString('en-IN') || ''}`,
        subtitle: `${b.id} • ${b.benefitType} • ${b.projectName}`,
        category: 'FINANCE',
        categoryLabel: 'Finance Ledger',
        targetKey: 'benefit-ledger',
        badgeText: 'ENTITLEMENT',
        badgeVariant: 'green',
        meta: `Parcel ${b.parcelId}`,
        searchTokens: `${b.id} ${b.farmerName} ${b.parcelId} ${b.khasra || ''} ${b.projectName} ${b.benefitType} finance payout entitlement ledger`.toLowerCase(),
      })
    }
  }

  return items
}

const GLOBAL_SEARCH_INDEX = buildSearchIndex()

export const POPULAR_QUICK_JUMPS: SearchResultItem[] = [
  {
    id: 'pop-1',
    title: 'Master User Directory',
    subtitle: 'Users • Comprehensive registry of platform actors & KYC states',
    category: 'MODULES',
    categoryLabel: 'Quick Jump',
    targetKey: 'all-users',
    badgeText: 'Directory',
    badgeVariant: 'wood',
    searchTokens: '',
  },
  {
    id: 'pop-2',
    title: 'Land Registry & GIS Polygons',
    subtitle: 'Land / GIS • Plot boundaries, PostGIS coordinates & computed acreage',
    category: 'MODULES',
    categoryLabel: 'Quick Jump',
    targetKey: 'land-registry',
    badgeText: 'PostGIS',
    badgeVariant: 'green',
    searchTokens: '',
  },
  {
    id: 'pop-3',
    title: 'KYC & Compliance Queue',
    subtitle: 'KYC • Identity screening, DPDP 2025 consent, and approval gates',
    category: 'MODULES',
    categoryLabel: 'Quick Jump',
    targetKey: 'kyc-queue',
    badgeText: 'Gate A05',
    badgeVariant: 'blue',
    searchTokens: '',
  },
  {
    id: 'pop-4',
    title: 'Carbon Projects Portfolio',
    subtitle: 'Projects • Agroforestry & soil carbon removals (Verra VM0042)',
    category: 'MODULES',
    categoryLabel: 'Quick Jump',
    targetKey: 'carbon',
    badgeText: 'VM0042',
    badgeVariant: 'wood',
    searchTokens: '',
  },
  {
    id: 'pop-5',
    title: 'Water Impact & Recharge Projects',
    subtitle: 'Projects • Volumetric aquifer recharge and checkdam flow meters',
    category: 'MODULES',
    categoryLabel: 'Quick Jump',
    targetKey: 'water',
    badgeText: 'VWBA v1.2',
    badgeVariant: 'blue',
    searchTokens: '',
  },
  {
    id: 'pop-6',
    title: 'Site Visit Dispatch & Operations',
    subtitle: 'Field Ops • On-ground surveyor routes, GPS sync & inspection records',
    category: 'MODULES',
    categoryLabel: 'Quick Jump',
    targetKey: 'field-visits',
    badgeText: 'Field Ops',
    badgeVariant: 'amber',
    searchTokens: '',
  },
]

export function performGlobalSearch(
  query: string,
  category: SearchCategory = 'ALL'
): SearchResultItem[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) {
    if (category === 'ALL') {
      return POPULAR_QUICK_JUMPS
    }
    return GLOBAL_SEARCH_INDEX.filter((item) => item.category === category).slice(0, 10)
  }

  const queryTerms = trimmed.split(/\s+/).filter(Boolean)

  const matched = GLOBAL_SEARCH_INDEX.filter((item) => {
    // If a category filter is active and not ALL, reject mismatched category
    if (category !== 'ALL' && item.category !== category) {
      return false
    }

    // Must match all query words in either tokens, title, subtitle or id
    return queryTerms.every(
      (term) =>
        item.title.toLowerCase().includes(term) ||
        item.subtitle.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term) ||
        item.searchTokens.includes(term)
    )
  })

  // Rank matches: exact ID matches and title prefix matches rank higher
  matched.sort((a, b) => {
    const aIdMatch = a.id.toLowerCase().includes(trimmed) ? -10 : 0
    const bIdMatch = b.id.toLowerCase().includes(trimmed) ? -10 : 0
    const aTitlePrefix = a.title.toLowerCase().startsWith(trimmed) ? -5 : 0
    const bTitlePrefix = b.title.toLowerCase().startsWith(trimmed) ? -5 : 0
    return aIdMatch + aTitlePrefix - (bIdMatch + bTitlePrefix)
  })

  return matched.slice(0, 25)
}
