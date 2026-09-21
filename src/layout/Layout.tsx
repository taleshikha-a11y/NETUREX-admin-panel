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
  onSwitchRole?: () => void
}

export default function Layout({
  children,
  activeKey,
  onSelectKey,
  activeRole,
  onSwitchRole,
}: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="h-screen w-screen bg-[#F8F3EC] flex overflow-hidden relative select-none">
      {/* Soft Sea Green ambient tint along viewport edges */}
      <div className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#2DD4BF]/12 via-[#3AA88E]/6 to-transparent pointer-events-none z-20" />
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#3AA88E]/12 via-[#2DD4BF]/6 to-transparent pointer-events-none z-20" />
      <div className="fixed top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#2DD4BF]/10 to-transparent pointer-events-none z-20" />
      <div className="fixed top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#3AA88E]/10 to-transparent pointer-events-none z-20" />

      {/* Screen Boundary Radiant Flash - Pulsating Sea Green Glow */}
      <div className="page-boundary-flash" />

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
            onSwitchRole={onSwitchRole}
          />
        </div>

        {/* Dynamic Page Content Outlet - Independent Scroll, Never affects Sidebar */}
        <main className="flex-1 overflow-y-auto p-3.5 custom-scrollbar">
          <div className="harmony-card rounded-3xl p-6 min-h-full bg-white border border-[#E2DDD5] shadow-xs">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
