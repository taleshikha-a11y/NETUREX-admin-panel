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
  CircleDot,
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
      {/* Soft Nature Outer Card Container - Warm Terracotta Theme */}
      <div className="rounded-3xl flex-1 min-h-0 flex flex-col overflow-hidden bg-white border border-[#8D4E22] shadow-xs">
        {/* Brand Header */}
        <div className="p-4 pb-4 border-b border-[#8D4E22] flex items-center justify-between bg-[#C49563] flex-shrink-0">
          <div className="flex items-center gap-3.5 overflow-hidden">
            {/* NatureX 3D Carved Badge Emblem - Enlarged Crisp View */}
            <div className="w-14 h-14 rounded-2xl bg-[#542B0E] border-2 border-[#8D4E22] flex items-center justify-center font-bold flex-shrink-0 shadow-md overflow-hidden p-1 transition-all">
              <img
                src="/naturex-badge.png"
                alt="NatureX Emblem"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#18221B] tracking-tight text-xl">
                    {navData.brand.name}
                  </span>
                  <span className="text-[10px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#B6814C] text-[#2B1405] border border-[#8D4E22]">
                    {navData.brand.version}
                  </span>
                </div>
                <p className="text-xs text-[#2B1405] font-bold tracking-wide mt-0.5">
                  {navData.brand.subTitle}
                </p>
              </div>
            )}
          </div>
        </div>

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

            return (
              <div key={mod.key} className="space-y-1">
                {/* Parent Menu Item - Terracotta Teak Wood Active Theme */}
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
                      ? 'bg-[#8D4E22] text-white font-extrabold shadow-md border-2 border-[#6E3812]'
                      : isChildActive
                      ? 'bg-[#B6814C] text-[#2B1405] font-black border-2 border-[#8D4E22] shadow-xs'
                      : 'text-[#18221B] font-semibold hover:bg-[#C49563] hover:text-[#2B1405] border border-transparent hover:border-[#8D4E22]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                        isDirectActive
                          ? 'bg-[#6E3812] text-white border border-[#A86A3B]'
                          : isChildActive
                          ? 'bg-[#8D4E22] text-white border border-[#6E3812]'
                          : 'bg-[#C49563] text-[#2B1405] border border-[#8D4E22] group-hover:bg-[#B6814C] group-hover:text-[#2B1405]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 stroke-[2.2]" />
                    </div>

                    {!isCollapsed && (
                      <span
                        className={`truncate tracking-tight ${
                          isDirectActive
                            ? 'text-white font-black'
                            : isChildActive
                            ? 'text-[#6E3812] font-black'
                            : 'text-[#18221B] font-bold group-hover:text-[#8D4E22]'
                        }`}
                      >
                        {mod.label}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && hasChildren && (
                    <div
                      className={`flex items-center p-1 rounded-lg transition-colors ${
                        isDirectActive
                          ? 'text-white hover:text-white/80'
                          : isChildActive
                          ? 'text-[#8D4E22] hover:text-[#6E3812]'
                          : 'text-[#738679] hover:text-[#18221B]'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleParent(mod.key)
                      }}
                      title={isOpen ? 'Collapse submenu' : 'Expand submenu'}
                    >
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 stroke-[2.5]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 transition-transform duration-200 stroke-[2.5]" />
                      )}
                    </div>
                  )}
                </button>

                {/* Sub-modules list with Solid Terracotta Teak Wood Active State */}
                {hasChildren && !isCollapsed && isOpen && (
                  <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-[#B88258] ml-3.5 mt-0.5">
                    {mod.children?.map((child) => {
                      const isSubActive = activeKey === child.key

                      return (
                        <button
                          key={child.key}
                          type="button"
                          onClick={() => onSelectKey(child.key)}
                          title={child.label}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[11px] transition-all duration-150 text-left cursor-pointer ${
                            isSubActive
                              ? 'bg-[#8D4E22] text-white font-black shadow-sm border border-[#6E3812]'
                              : 'text-[#4A5B50] font-semibold hover:text-[#2B1405] hover:bg-[#C49563]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <CircleDot
                              className={`w-2.5 h-2.5 flex-shrink-0 ${
                                isSubActive
                                  ? 'text-white stroke-[3]'
                                  : 'text-[#A86A3B] stroke-[1.8]'
                              }`}
                            />
                            <span
                              className={`truncate ${
                                isSubActive
                                  ? 'text-white font-black'
                                  : 'text-[#4A5B50] font-semibold'
                              }`}
                            >
                              {child.label}
                            </span>
                          </div>

                          {child.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ml-1.5 ${
                                isSubActive
                                  ? 'bg-white/25 text-white border border-white/40'
                                  : child.badge === 'Alert'
                                  ? 'bg-[#B6814C] text-[#2B1405] border border-[#8D4E22]'
                                  : 'bg-[#C49563] text-[#2B1405] border border-[#8D4E22]'
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
      </div>
    </aside>
  )
}
