import {
  Bell,
  Search,
  PanelLeft,
  ShieldCheck,
  Radio,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react'
import navData from './navigation.json'

interface NavbarProps {
  activeKey: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  activeRole?: {
    id: string
    name: string
    badge: string
  }
  onSwitchRole?: () => void
}

export default function Navbar({
  activeKey,
  isCollapsed,
  onToggleCollapse,
  activeRole = { id: 'super-admin', name: 'Super Admin', badge: 'Global Scope' },
  onSwitchRole,
}: NavbarProps) {
  // Find current active item and its parent
  let parentLabel = ''
  let activeTitle = 'Dashboard'
  let activeDescription = 'Executive platform KPIs, real-time alerts, and operational trends'

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

  return (
    <header className="p-3.5 pb-0 select-none">
      <div className="harmony-card px-5 py-3.5 flex items-center justify-between gap-4 bg-white border border-[#E2DDD5] shadow-xs">
        {/* Left: Collapse Toggle & Clean Breadcrumb */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-10 h-10 rounded-2xl bg-[#F5EFEB] hover:bg-[#EAE0D3] border border-[#D6CBC0] flex items-center justify-center text-[#0F172A] transition-colors cursor-pointer"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#334155]">
              {parentLabel && (
                <>
                  <span className="text-[#334155] hover:text-[#0F172A] transition-colors">
                    {parentLabel}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                </>
              )}
              <span className="text-[#0F172A] font-extrabold text-sm truncate">
                {activeTitle}
              </span>
            </div>
            <p className="text-[11px] text-[#475569] font-medium truncate max-w-sm hidden sm:block">
              {activeDescription}
            </p>
          </div>
        </div>

        {/* Center: Search Inset Pill - High Contrast */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="w-full harmony-input rounded-full px-4 py-2 flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#475569] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent border-none outline-none text-xs text-[#0F172A] font-medium placeholder:text-[#64748B] w-full"
            />
            <span className="text-[10px] bg-[#EAE0D3] text-[#0F172A] px-2 py-0.5 rounded-full font-mono font-bold border border-[#D6CBC0]">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right: Actions, Status & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Soft Mint Light Live Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-xs font-bold text-[#166534]">
            <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse" />
            <Radio className="w-3.5 h-3.5 text-[#166534]" />
            <span className="text-[11px]">Live System</span>
          </div>

          {/* Preferences Button */}
          <button
            type="button"
            className="w-10 h-10 rounded-2xl bg-[#F5EFEB] hover:bg-[#EAE0D3] border border-[#D6CBC0] flex items-center justify-center text-[#334155] hover:text-[#0F172A] transition-colors cursor-pointer"
            title="System Preferences"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            className="relative w-10 h-10 rounded-2xl bg-[#F5EFEB] hover:bg-[#EAE0D3] border border-[#D6CBC0] flex items-center justify-center text-[#334155] hover:text-[#0F172A] transition-colors cursor-pointer"
            title="Workflow Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#D93838] ring-2 ring-white" />
          </button>

          {/* User Profile Pill & Role Switcher */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#DDD4C7]">
            <div className="flex items-center gap-2.5 p-1 rounded-2xl">
              <div className="w-9 h-9 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] flex items-center justify-center font-extrabold text-xs shadow-2xs">
                {activeRole.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden xl:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#0F172A]">
                    {activeRole.name}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                </div>
                <span className="text-[10px] text-[#475569] font-medium block">
                  {activeRole.badge}
                </span>
              </div>
            </div>

            {onSwitchRole && (
              <button
                type="button"
                onClick={onSwitchRole}
                className="px-3 py-1.5 rounded-xl bg-[#F3EDE4] hover:bg-[#EAE0D3] border border-[#D6CBC0] text-[11px] font-bold text-[#1E293B] hover:text-[#0F172A] transition-colors cursor-pointer shadow-2xs"
                title="Switch Admin Role / Logout"
              >
                Switch Role
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
