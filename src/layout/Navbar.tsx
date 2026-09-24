import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Bell,
  Search,
  PanelLeft,
  ShieldCheck,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  X,
  Users,
  MapPin,
  FolderKanban,
  FileBadge,
  Compass,
  Receipt,
  Layers,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react'
import navData from './navigation.json'
import {
  performGlobalSearch,
  type SearchCategory,
  type SearchResultItem,
} from '../services/globalSearch'

interface NavbarProps {
  activeKey: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  activeRole?: {
    id: string
    name: string
    badge: string
  }
  onProfileClick?: () => void
  onNavigate?: (key: string) => void
}

const CATEGORY_TABS: { key: SearchCategory; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'USERS', label: 'Users & Farmers' },
  { key: 'LAND', label: 'Land / GIS' },
  { key: 'PROJECTS', label: 'Projects' },
  { key: 'KYC', label: 'KYC' },
  { key: 'MODULES', label: 'Modules' },
]

export default function Navbar({
  activeKey,
  isCollapsed,
  onToggleCollapse,
  activeRole = { id: 'super-admin', name: 'Super Admin', badge: 'Global Scope' },
  onProfileClick,
  onNavigate,
}: NavbarProps) {
  // Find current active item and its parent
  let parentLabel = ''
  let activeTitle = 'Dashboard'
  let activeDescription = 'Executive platform KPIs, real-time alerts, and operational trends'

  if (activeKey === 'profile') {
    parentLabel = 'Executive Account'
    activeTitle = 'Super Admin Profile'
    activeDescription = 'Manage administrative credentials, role scope, password, and official address'
  } else {
    for (const mod of navData.modules) {
      if (mod.key === activeKey) {
        activeTitle = mod.label
        activeDescription = mod.description || ''
        parentLabel = ''
        break
      }
      if (mod.children) {
        const foundChild = mod.children.find((c) => c.key === activeKey)
        if (foundChild) {
          parentLabel = mod.label
          activeTitle = foundChild.label
          activeDescription = foundChild.description || mod.description || ''
          break
        }
      }
    }
  }

  // -----------------------------------------------------------------
  // Global Search State
  // -----------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('ALL')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsListRef = useRef<HTMLDivElement>(null)

  // Query results from global search service
  const results = useMemo(() => {
    return performGlobalSearch(searchQuery, activeCategory)
  }, [searchQuery, activeCategory])

  // Reset selected highlight index when query or category changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery, activeCategory])

  // Auto scroll highlighted item into view
  useEffect(() => {
    if (resultsListRef.current && results.length > 0) {
      const activeEl = resultsListRef.current.querySelector(
        `[data-search-idx="${selectedIndex}"]`
      ) as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, results])

  // Global Keyboard Shortcut: ⌘K or Ctrl+K to focus search, Esc to close
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation within search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen) {
      setIsSearchOpen(true)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelectResult(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false)
      searchInputRef.current?.blur()
    }
  }

  const handleSelectResult = (item: SearchResultItem) => {
    setIsSearchOpen(false)
    setSearchQuery('')
    if (onNavigate) {
      onNavigate(item.targetKey)
    }
  }

  const getBadgeClass = (variant?: string) => {
    switch (variant) {
      case 'green':
        return 'bg-[#E6EFE4] text-[#3E5F36] border-[#C1D6BD]'
      case 'blue':
        return 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]'
      case 'red':
        return 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]'
      case 'amber':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
      case 'wood':
      default:
        return 'bg-[#F5E5D5] text-[#8D4E22] border-[#D8B293]'
    }
  }

  const getCategoryIcon = (cat: SearchCategory) => {
    switch (cat) {
      case 'USERS':
        return <Users className="w-3.5 h-3.5 text-[#3E5F36]" />
      case 'LAND':
        return <MapPin className="w-3.5 h-3.5 text-[#8D4E22]" />
      case 'PROJECTS':
        return <FolderKanban className="w-3.5 h-3.5 text-[#0369A1]" />
      case 'KYC':
        return <FileBadge className="w-3.5 h-3.5 text-[#7C3AED]" />
      case 'FIELD_OPS':
        return <Compass className="w-3.5 h-3.5 text-[#B45309]" />
      case 'FINANCE':
        return <Receipt className="w-3.5 h-3.5 text-[#059669]" />
      case 'MODULES':
      default:
        return <Layers className="w-3.5 h-3.5 text-[#8D4E22]" />
    }
  }

  return (
    <header className="p-3.5 pb-0 select-none">
      <div className="harmony-card px-5 py-3.5 flex items-center justify-between gap-4 bg-white border border-[#CBD3C8] shadow-xs">
        {/* Left: Collapse Toggle & Clean Breadcrumb */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-10 h-10 rounded-2xl bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] flex items-center justify-center text-[#2B1405] transition-colors cursor-pointer"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A5B50]">
              {parentLabel && (
                <>
                  <span className="text-[#4A5B50] hover:text-[#18221B] transition-colors">
                    {parentLabel}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#738679]" />
                </>
              )}
              <span className="text-[#18221B] font-black text-sm truncate">
                {activeTitle}
              </span>
            </div>
            <p className="text-[11px] text-[#738679] font-medium truncate max-w-sm hidden sm:block">
              {activeDescription}
            </p>
          </div>
        </div>

        {/* Center: Live Global Search Bar with Real-time Data Popover */}
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-lg mx-2 sm:mx-4"
        >
          {/* Search Input Pill */}
          <div
            className={`w-full rounded-2xl px-3.5 py-2 flex items-center gap-2.5 transition-all border ${
              isSearchOpen
                ? 'bg-white border-[#8D4E22] ring-2 ring-[#8D4E22]/20 shadow-md'
                : 'bg-[#F5E5D5] hover:bg-white border-[#D8B293] hover:border-[#8D4E22]'
            }`}
          >
            <Search className="w-4 h-4 text-[#8D4E22] flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (!isSearchOpen) setIsSearchOpen(true)
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search farmers, parcels (e.g. UP-0412), projects, KYC..."
              className="bg-transparent border-none outline-none text-xs text-[#18221B] font-bold placeholder:text-[#738679] w-full"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  searchInputRef.current?.focus()
                }}
                className="w-4 h-4 rounded-full bg-[#8D4E22]/15 hover:bg-[#8D4E22] hover:text-white flex items-center justify-center text-[#2B1405] text-[10px] cursor-pointer transition-colors"
                title="Clear Search"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="hidden sm:inline-block text-[10px] bg-[#C49563] text-[#2B1405] px-2 py-0.5 rounded-full font-mono font-bold border border-[#8D4E22]">
                ⌘K
              </span>
            )}
          </div>

          {/* Floating Live Search Results Popover */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border-2 border-[#D8B293] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[460px]">
              {/* Category Filter Tabs Bar */}
              <div className="p-2.5 bg-[#FAF6F0] border-b border-[#EAE4DC] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = activeCategory === tab.key
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveCategory(tab.key)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? 'bg-[#8D4E22] text-white shadow-2xs border border-[#6E3812]'
                          : 'bg-white hover:bg-[#F2DFC9] text-[#4A5B50] border border-[#E5DFD5]'
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Header Label: Results Count or Suggestions */}
              <div className="px-4 py-2 bg-white border-b border-[#F2DFC9] flex items-center justify-between text-[11px] font-bold text-[#738679]">
                <span>
                  {searchQuery.trim()
                    ? `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${searchQuery}"`
                    : 'Recommended & Popular Quick Jumps'}
                </span>
                <span className="text-[10px] text-[#8D4E22] font-semibold">
                  Press ↵ to view
                </span>
              </div>

              {/* Scrollable Results List */}
              <div
                ref={resultsListRef}
                className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-1 divide-y divide-[#F9F6F0]"
              >
                {results.length > 0 ? (
                  results.map((item, idx) => {
                    const isHighlighted = idx === selectedIndex
                    return (
                      <div
                        key={item.id}
                        data-search-idx={idx}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => handleSelectResult(item)}
                        className={`p-2.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isHighlighted
                            ? 'bg-[#F5E5D5] border border-[#8D4E22] shadow-2xs'
                            : 'hover:bg-[#FAF6F0] border border-transparent'
                        }`}
                      >
                        {/* Left: Icon & Main Details */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-2xs ${
                              isHighlighted
                                ? 'bg-white border-[#8D4E22]'
                                : 'bg-[#F5E5D5] border-[#D8B293]'
                            }`}
                          >
                            {getCategoryIcon(item.category)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-[#18221B] truncate">
                                {item.title}
                              </span>
                              {item.badgeText && (
                                <span
                                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-2xs ${getBadgeClass(
                                    item.badgeVariant
                                  )}`}
                                >
                                  {item.badgeText}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#4A5B50] font-medium truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Right: Meta & Jump Button */}
                        <div className="flex items-center gap-2 flex-shrink-0 text-right">
                          {item.meta && (
                            <span className="text-[10px] text-[#738679] font-mono font-bold hidden md:inline-block bg-white/70 px-2 py-0.5 rounded-lg border border-[#E5DFD5]">
                              {item.meta}
                            </span>
                          )}

                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform ${
                              isHighlighted
                                ? 'bg-[#8D4E22] text-white translate-x-0.5 shadow-2xs'
                                : 'bg-[#E5DFD5]/60 text-[#738679]'
                            }`}
                            title="Open module"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  /* Empty State when no results match */
                  <div className="py-8 px-4 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5E5D5] border border-[#D8B293] text-[#8D4E22] flex items-center justify-center mx-auto">
                      <Search className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="text-xs font-black text-[#18221B]">
                      No matching records found
                    </div>
                    <p className="text-[11px] text-[#738679] max-w-xs mx-auto">
                      Try searching with farmer name (e.g.{' '}
                      <span className="text-[#8D4E22] font-bold">Savitri</span>,{' '}
                      <span className="text-[#8D4E22] font-bold">Rameshwar</span>), parcel ID (e.g.{' '}
                      <span className="text-[#8D4E22] font-bold">PARCEL-UP-0412</span>), project title, or Khasra number.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer: Keyboard shortcut guide */}
              <div className="px-4 py-2 bg-[#FAF6F0] border-t border-[#EAE4DC] flex items-center justify-between text-[10px] text-[#738679] font-medium">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-[#D8B293] rounded font-mono font-bold text-[#18221B]">
                      ↑
                    </kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-[#D8B293] rounded font-mono font-bold text-[#18221B]">
                      ↓
                    </kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-[#D8B293] rounded font-mono font-bold text-[#18221B] flex items-center gap-0.5">
                      <CornerDownLeft className="w-2.5 h-2.5" /> Enter
                    </kbd>
                    <span>Select</span>
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#D8B293] rounded font-mono font-bold text-[#18221B]">
                    Esc
                  </kbd>
                  <span>Close</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions, Status & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Lush Forest Moss Green Live Status Pill - Richer Dark Tint */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6EFE4] border border-[#C1D6BD] text-xs font-bold text-[#3E5F36]">
            <span className="w-2 h-2 rounded-full bg-[#5E8256]" />
            <Radio className="w-3.5 h-3.5 text-[#3E5F36]" />
            <span className="text-[11px]">Live System</span>
          </div>

          {/* Preferences Button */}
          <button
            type="button"
            className="w-10 h-10 rounded-2xl bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] flex items-center justify-center text-[#2B1405] hover:text-[#18221B] transition-colors cursor-pointer"
            title="System Preferences"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            className="relative w-10 h-10 rounded-2xl bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] flex items-center justify-center text-[#2B1405] hover:text-[#18221B] transition-colors cursor-pointer"
            title="Workflow Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#8D4E22] ring-2 ring-white" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#8D4E22]">
            <button
              type="button"
              onClick={onProfileClick}
              className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-[#C49563] border border-transparent hover:border-[#8D4E22] transition-all cursor-pointer group text-left shadow-2xs hover:shadow-xs"
              title="Click to view & edit Super Admin Profile (Name, Role, Password, Address)"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#C49563] group-hover:bg-[#B6814C] border border-[#8D4E22] text-[#2B1405] flex items-center justify-center font-black text-xs shadow-2xs transition-colors">
                {activeRole.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden xl:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#18221B] group-hover:text-[#8D4E22] transition-colors">
                    {activeRole.name}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8D4E22]" />
                </div>
                <span className="text-[10px] text-[#738679] font-medium block">
                  {activeRole.badge}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
