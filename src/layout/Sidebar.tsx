import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  FileBadge,
  Map,
  FolderKanban,
  FileCheck2,
  Compass,
  Award,
  Receipt,
  Settings,
  ChevronDown,
  ChevronRight,
  Leaf,
  Search,
  CircleDot,
  ShieldCheck,
} from 'lucide-react'
import navData from './navigation.json'

interface SidebarProps {
  activeKey: string
  onSelectKey: (key: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  FileBadge,
  Map,
  FolderKanban,
  FileCheck2,
  Compass,
  Award,
  Receipt,
  Settings,
}

export default function Sidebar({
  activeKey,
  onSelectKey,
  isCollapsed = false,
}: SidebarProps) {
  const [openParents, setOpenParents] = useState<Record<string, boolean>>({})
  const [searchFilter, setSearchFilter] = useState('')

  // Auto-expand the parent of the currently active key
  useEffect(() => {
    for (const mod of navData.modules) {
      if (mod.children) {
        const hasActiveChild = mod.children.some((c) => c.key === activeKey)
        if (hasActiveChild) {
          setOpenParents((prev) => ({ ...prev, [mod.key]: true }))
        }
      }
    }
  }, [activeKey])

  const toggleParent = (key: string) => {
    setOpenParents((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <aside
      className={`transition-all duration-300 ease-in-out h-full max-h-screen flex flex-col p-3.5 select-none ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Soft Harmony Outer Card Container - Clean, Light, Elegant */}
      <div className="rounded-3xl flex-1 min-h-0 flex flex-col overflow-hidden bg-white border border-[#E2DDD5] shadow-xs">
        {/* Brand Header */}
        <div className="p-4 pb-3.5 border-b border-[#EAE4DC] flex items-center justify-between bg-[#FAF8F5] flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Soft Light Logo Pill */}
            <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
              <Leaf className="w-5 h-5 text-[#166534] stroke-[2.2]" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F172A] tracking-tight text-lg">
                    {navData.brand.name}
                  </span>
                  <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7]">
                    {navData.brand.version}
                  </span>
                </div>
                <p className="text-[11px] text-[#475569] font-medium tracking-wide">
                  {navData.brand.subTitle}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Search Inset - Clean Light Border */}
        {!isCollapsed && (
          <div className="px-3.5 pt-3 pb-1 flex-shrink-0">
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-2xl px-3 py-2 flex items-center gap-2 transition-all focus-within:border-[#2D6A4F] focus-within:bg-white">
              <Search className="w-4 h-4 text-[#64748B] stroke-[2] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-[#0F172A] font-bold placeholder:text-[#64748B] w-full"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="text-[10px] text-[#64748B] hover:text-[#0F172A] cursor-pointer font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Scrollable Body - Smooth internal scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-1.5 sidebar-scrollbar">
          {navData.modules.map((mod) => {
            const IconComponent = iconMap[mod.icon] || LayoutDashboard
            const hasChildren = Boolean(mod.children && mod.children.length > 0)
            const isOpen = Boolean(openParents[mod.key])
            const isDirectActive = activeKey === mod.key
            const isChildActive = Boolean(
              mod.children?.some((child) => child.key === activeKey)
            )

            // Filter logic
            const matchesFilter =
              mod.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
              mod.description?.toLowerCase().includes(searchFilter.toLowerCase()) ||
              mod.children?.some((child) =>
                child.label.toLowerCase().includes(searchFilter.toLowerCase())
              )

            if (searchFilter && !matchesFilter) return null

            return (
              <div key={mod.key} className="space-y-1">
                {/* Parent Menu Item */}
                <button
                  type="button"
                  onClick={() => {
                    if (hasChildren) {
                      setOpenParents((prev) => ({ ...prev, [mod.key]: true }))
                    }
                    onSelectKey(mod.key)
                  }}
                  title={mod.label}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-all duration-200 cursor-pointer ${
                    isDirectActive
                      ? 'bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] font-bold shadow-2xs'
                      : isChildActive
                      ? 'bg-[#F0FDF4] text-[#166534] font-bold border border-[#DCFCE7]'
                      : 'text-[#0F172A] font-medium hover:bg-[#F3EDE3] border border-transparent hover:border-[#E2DDD5]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                        isDirectActive
                          ? 'bg-white text-[#0369A1] border border-[#BAE6FD]'
                          : isChildActive
                          ? 'bg-white text-[#166534] border border-[#DCFCE7]'
                          : 'bg-[#F4EFEA] text-[#475569] border border-[#E2DDD5] group-hover:bg-[#ECE6DE]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 stroke-[2.2]" />
                    </div>

                    {!isCollapsed && (
                      <span
                        className={`truncate tracking-tight ${
                          isDirectActive
                            ? 'text-[#07242E] font-black'
                            : isChildActive
                            ? 'text-[#0A3328] font-black'
                            : 'text-[#0F172A] font-bold'
                        }`}
                      >
                        {mod.label}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && hasChildren && (
                    <div
                      className="flex items-center text-[#334155] p-1 hover:text-[#0F172A] rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleParent(mod.key)
                      }}
                      title={isOpen ? 'Collapse submenu' : 'Expand submenu'}
                    >
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 text-[#0F172A] stroke-[2.5]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 transition-transform duration-200 text-[#334155] stroke-[2.5]" />
                      )}
                    </div>
                  )}
                </button>

                {/* Sub-modules list (Soft Harmony hierarchy with sharp contrast) */}
                {hasChildren && !isCollapsed && (isOpen || searchFilter) && (
                  <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-[#C8BCAD] ml-3.5 mt-0.5">
                    {mod.children?.map((child) => {
                      const isSubActive = activeKey === child.key

                      return (
                        <button
                          key={child.key}
                          type="button"
                          onClick={() => onSelectKey(child.key)}
                          title={child.label}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] transition-all duration-150 text-left cursor-pointer ${
                            isSubActive
                              ? 'bg-[#F0FDF4] border border-[#C2E0D4] text-[#15803D] font-bold'
                              : 'text-[#334155] font-medium hover:text-[#000000] hover:bg-[#EFE7DE]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <CircleDot
                              className={`w-2.5 h-2.5 flex-shrink-0 ${
                                isSubActive
                                  ? 'text-[#15803D] stroke-[2.2]'
                                  : 'text-[#64748B] stroke-[1.8]'
                              }`}
                            />
                            <span
                              className={`truncate ${
                                isSubActive
                                  ? 'text-[#15803D] font-bold'
                                  : 'text-[#334155] font-medium'
                              }`}
                            >
                              {child.label}
                            </span>
                          </div>

                          {child.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ml-1.5 ${
                                child.badge === 'Alert'
                                  ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FEE2E2]'
                                  : 'bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]'
                              }`}
                            >
                              {child.badge}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom Role Status - Clean Light Neutral */}
        {!isCollapsed && (
          <div className="p-3 border-t border-[#EAE4DC] bg-[#FAF8F5] flex-shrink-0">
            <div className="p-2.5 rounded-2xl flex items-center gap-2.5 border border-[#E2DDD5] bg-white shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <ShieldCheck className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#0F172A] truncate">
                  Super Admin
                </p>
                <p className="text-[10px] text-[#64748B] truncate font-medium">
                  Global Governance Access
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
