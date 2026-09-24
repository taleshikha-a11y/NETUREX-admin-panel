import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

interface LayoutProps {
  children?: React.ReactNode
  activeKey: string
  onSelectKey: (key: string) => void
  activeRole?: {
    id: string
    name: string
    badge: string
  }
  onProfileClick?: () => void
}

export default function Layout({
  children,
  activeKey,
  onSelectKey,
  activeRole,
  onProfileClick,
}: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="h-screen w-screen bg-[#F8F9F5] flex overflow-hidden relative select-none">
      {/* Single Folder Component: Sidebar (Clean, Full Viewport Height, Always Sticky) */}
      <div className="relative z-10 h-screen flex-shrink-0 sticky top-0">
        <Sidebar
          activeKey={activeKey}
          onSelectKey={onSelectKey}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Main Content Area - Full height with independent smooth scrolling */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative z-10">
        {/* Single Folder Component: Navbar (Fixed at top) */}
        <div className="flex-shrink-0">
          <Navbar
            activeKey={activeKey}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            activeRole={activeRole}
            onProfileClick={onProfileClick}
            onNavigate={onSelectKey}
          />
        </div>

        {/* Dynamic Page Content Outlet - Independent Scroll, Never affects Sidebar */}
        <main className="flex-1 overflow-y-auto p-3.5 custom-scrollbar">
          <div className="harmony-card rounded-3xl p-6 min-h-full bg-white border border-[#CBD3C8] shadow-xs">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
