import { useState, useEffect } from 'react'
import Layout from './layout/Layout'
import LoginPage, { type RoleConfig } from './components/LoginPage'
import DashboardView from './components/DashboardView'
import UserManagementView, { type UserRecord } from './components/UserManagementView'
import CreateUserPage from './components/CreateUserPage'
import KycComplianceView from './components/KycComplianceView'
import LandGisView from './components/LandGisView'
import navData from './layout/navigation.json'
import rolesData from './data/roles.json'
import usersData from './data/usersData.json'
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  FolderTree,
  ChevronRight,
  Building2,
  FileCheck2,
  Award,
  LogOut,
} from 'lucide-react'

export default function App() {
  const [activeKey, setActiveKey] = useState<string>(() => {
    return sessionStorage.getItem('naturex_active_key') || 'dashboard'
  })

  // Direct Super Admin Auth Flow: No multi-role chooser at login
  const [authStep, setAuthStep] = useState<'login' | 'dashboard'>(() => {
    return (sessionStorage.getItem('naturex_auth_step') as 'login' | 'dashboard') || 'dashboard'
  })

  // Master Users State: Shared across Create User, User Management, and Directory
  const [masterUserList, setMasterUserList] = useState<UserRecord[]>(() => {
    const saved = sessionStorage.getItem('naturex_master_users')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        // fallback
      }
    }
    return usersData.users as UserRecord[]
  })

  // Default Super Admin Role Configuration
  const superAdminRole: RoleConfig =
    (rolesData.roles.find((r) => r.code === 'SUPER_ADMIN') as any) || {
      id: 'role-super-admin',
      name: 'Super Admin',
      badge: 'All Permissions',
      scope: 'Global System Control',
      icon: 'ShieldCheck',
      description: 'Universal platform administration and governance',
    }

  useEffect(() => {
    sessionStorage.setItem('naturex_auth_step', authStep)
  }, [authStep])

  useEffect(() => {
    sessionStorage.setItem('naturex_active_key', activeKey)
  }, [activeKey])

  useEffect(() => {
    sessionStorage.setItem('naturex_master_users', JSON.stringify(masterUserList))
  }, [masterUserList])

  // Resolve active title and parent breadcrumb dynamically from navigation.json
  let parentLabel = ''
  let activeTitle = 'Dashboard'
  let activeDescription = 'Executive platform KPIs, real-time alerts, and operational trends'
  let activeBadge: string | undefined = undefined

  if (activeKey === 'create-user') {
    parentLabel = 'User Management'
    activeTitle = 'Create Role & User'
    activeDescription = 'Add new platform actor, assign RBAC role, generate login PIN, and dispatch invitation email'
    activeBadge = 'Provisioning'
  } else {
    for (const mod of navData.modules) {
      if (mod.key === activeKey) {
        activeTitle = mod.label
        activeDescription = mod.description || ''
        parentLabel = ''
        break
      }
      if (mod.children) {
        const child = mod.children.find((c) => c.key === activeKey)
        if (child) {
          parentLabel = mod.label
          activeTitle = child.label
          activeDescription = child.description || mod.description || ''
          activeBadge = child.badge
          break
        }
      }
    }
  }

  // Step 1: Dedicated Super Admin Login Form (Single role portal)
  if (authStep === 'login') {
    return <LoginPage onLogin={() => setAuthStep('dashboard')} />
  }

  // Step 2: Main Super Admin Console
  return (
    <Layout
      activeKey={activeKey}
      onSelectKey={setActiveKey}
      activeRole={superAdminRole}
      onSwitchRole={() => setAuthStep('login')}
    >
      <div className="space-y-6">
        {/* Module Header Card with Clean Light Accents & Action Toolbar */}
        <div className="harmony-card-subtle p-6 border border-[#E2DDD5] shadow-xs bg-white rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {parentLabel && (
                  <>
                    <span className="text-xs font-bold px-3 py-1 rounded-full badge-mint-tint shadow-2xs">
                      {parentLabel}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#334155] stroke-[2.5]" />
                  </>
                )}
                <span className="text-xs font-bold px-3 py-1 rounded-full badge-sky-tint shadow-2xs">
                  {activeTitle}
                </span>

                {activeBadge && (
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full badge-alert-tint shadow-2xs">
                    {activeBadge}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
                {activeTitle}
              </h2>
              <p className="text-sm text-[#334155] font-semibold max-w-2xl">
                {activeDescription}
              </p>
            </div>

            {/* Quick Action Buttons: Super Admin Badge, Logout */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Clean Light Super Admin Badge */}
              <div className="px-3.5 py-2 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] text-xs font-bold flex items-center gap-2 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#166534] stroke-[2.2]" />
                <span>Super Admin</span>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => setAuthStep('login')}
                className="px-3 py-2 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EDE3] border border-[#D6CBC0] text-[#64748B] hover:text-[#991B1B] text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                title="Log out of Super Admin Console"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2]" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Outlet Views */}
        {activeKey === 'create-user' ? (
          <CreateUserPage
            onUserCreated={(newUser) => {
              setMasterUserList((prev) => {
                const exists = prev.some((u) => u.id === newUser.id)
                if (exists) {
                  return prev.map((u) => (u.id === newUser.id ? newUser : u))
                }
                return [newUser, ...prev]
              })
            }}
            onCancel={() => setActiveKey('all-users')}
          />
        ) : activeKey === 'dashboard' ? (
          <DashboardView onNavigate={(target) => setActiveKey(target)} />
        ) : activeKey === 'users' ||
          activeKey === 'all-users' ||
          activeKey === 'farmers' ||
          activeKey === 'organizations' ||
          activeKey === 'field-agents' ||
          activeKey === 'reviewers' ||
          activeKey === 'roles-rbac' ? (
          <UserManagementView
            initialSubTab={activeKey === 'users' ? 'all-users' : (activeKey as any)}
            onNavigateSubTab={(tabKey) => setActiveKey(tabKey)}
            usersList={masterUserList}
            onUpdateUsers={setMasterUserList}
            onCreateUserClick={() => setActiveKey('create-user')}
          />
        ) : activeKey === 'kyc' ||
          activeKey === 'kyc-queue' ||
          activeKey === 'kyc-action' ||
          activeKey === 'kyc-approved' ? (
          <KycComplianceView
            initialSubTab={activeKey === 'kyc' ? 'kyc-queue' : (activeKey as any)}
            onNavigateSubTab={(tabKey) => setActiveKey(tabKey)}
            onUpdateUsers={setMasterUserList}
          />
        ) : activeKey === 'land-gis' ||
          activeKey === 'land-registry' ||
          activeKey === 'boundary-conflicts' ||
          activeKey === 'land-documents' ? (
          <LandGisView
            initialSubTab={activeKey === 'land-gis' ? 'land-registry' : (activeKey as any)}
            onNavigateSubTab={(tabKey) => setActiveKey(tabKey)}
          />
        ) : (
          /* Context Canvas for other modules */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="harmony-kpi-card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#334155]">Active Scope</span>
                  <div className="w-7 h-7 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl font-black text-[#0F172A]">Super Admin</div>
                <p className="text-[11px] text-[#475569] font-medium leading-relaxed">
                  Full unrestricted platform governance &amp; security authority
                </p>
              </div>

              <div className="harmony-kpi-card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#334155]">Operational Domain</span>
                  <div className="w-7 h-7 rounded-xl bg-[#F0F9FF] border border-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4 text-[#0369A1]" />
                  </div>
                </div>
                <div className="text-xl font-black text-[#0F172A]">All Modules</div>
                <p className="text-[11px] text-[#475569] font-medium leading-relaxed">
                  Universal gate decisions, KYC approvals &amp; user provisioning
                </p>
              </div>

              <div className="harmony-kpi-card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#334155]">Identity Verification</span>
                  <div className="w-7 h-7 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl font-black text-[#0F172A]">Enforced</div>
                <p className="text-[11px] text-[#475569] font-medium leading-relaxed">
                  India DPDP 2025 compliant authentication session
                </p>
              </div>

              <div className="harmony-kpi-card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#334155]">Framework Standard</span>
                  <div className="w-7 h-7 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#B91C1C] flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl font-black text-[#0F172A]">BEE / CCTS</div>
                <p className="text-[11px] text-[#475569] font-medium leading-relaxed">
                  ACVA verification architecture ready
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="harmony-kpi-card p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold shadow-2xs">
                  <FolderTree className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Module Workspace</h3>
                <p className="text-xs text-[#334155] leading-relaxed font-medium">
                  Currently viewing <strong className="text-[#166534]">{activeTitle}</strong> under Super Admin access.
                </p>
              </div>

              <div className="harmony-kpi-card p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0F9FF] border border-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-[#0369A1]" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Executive Minimalism</h3>
                <p className="text-xs text-[#334155] leading-relaxed font-medium">
                  Ultra-light pastel surfaces and refined borders for quiet, executive focus.
                </p>
              </div>

              <div className="harmony-kpi-card p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold shadow-2xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">PRD Aligned</h3>
                <p className="text-xs text-[#334155] leading-relaxed font-medium">
                  All data nodes load dynamically from JSON configuration files without hardcoded strings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
