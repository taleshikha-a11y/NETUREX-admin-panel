import { useState, useEffect } from 'react'
import {
  User,
  ShieldCheck,
  Lock,
  MapPin,
  KeyRound,
  Mail,
  Phone,
  Building,
  Check,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Smartphone,
  BadgeCheck,
  Globe,
  X,
  LogOut,
} from 'lucide-react'

export interface SuperAdminProfile {
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
  employeeId: string
  role: string
  roleBadge: string
  roleScope: string
  department: string
  clearanceLevel: string
  streetAddress: string
  city: string
  district: string
  state: string
  pincode: string
  country: string
  joinedDate: string
  timezone: string
  twoFactorEnabled: boolean
  lastPasswordChanged: string
  digitalSignatureId: string
}

export const defaultSuperAdminProfile: SuperAdminProfile = {
  firstName: 'Devendra',
  lastName: 'Patel',
  displayName: 'Super Admin',
  email: 'admin@naturex.io',
  phone: '+91 98930 11000',
  employeeId: 'NTX-ADMIN-001',
  role: 'Super Admin',
  roleBadge: 'All Permissions',
  roleScope: 'Global System Control & Escrow Governance',
  department: 'Executive Governance & Platform Security',
  clearanceLevel: 'Level 5 (Unrestricted Global Root)',
  streetAddress: 'NATUREX Climate Tech Campus, Floor 4, Suite 402, Ring Road',
  city: 'Indore',
  district: 'Indore Division',
  state: 'Madhya Pradesh',
  pincode: '452010',
  country: 'India',
  joinedDate: 'January 2025',
  timezone: 'Asia/Kolkata (IST, UTC+5:30)',
  twoFactorEnabled: true,
  lastPasswordChanged: '15 days ago',
  digitalSignatureId: 'SIG-BEE-CCTS-ROOT-9901',
}

interface AdminProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
  profile: SuperAdminProfile
  onUpdateProfile: (updated: SuperAdminProfile) => void
  onLogout?: () => void
}

type ProfileTab = 'personal' | 'role' | 'password' | 'address'

export default function AdminProfileView({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onLogout,
}: AdminProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal')
  const [formData, setFormData] = useState<SuperAdminProfile>({ ...profile })

  // Sync state whenever profile prop changes
  useEffect(() => {
    setFormData({ ...profile })
  }, [profile])

  // Escape key handler to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccessToast, setPasswordSuccessToast] = useState(false)

  // Profile Save feedback
  const [saveSuccessToast, setSaveSuccessToast] = useState(false)

  if (!isOpen) return null

  // Handle text change
  const handleChange = (field: keyof SuperAdminProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle profile form save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateProfile(formData)
    setSaveSuccessToast(true)
    setTimeout(() => {
      setSaveSuccessToast(false)
    }, 2800)
  }

  // Handle password submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (!currentPassword) {
      setPasswordError('Please enter your current administrative password.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.')
      return
    }

    // Success
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    handleChange('lastPasswordChanged', 'Just now')
    onUpdateProfile({
      ...formData,
      lastPasswordChanged: 'Just now',
    })
    setPasswordSuccessToast(true)
    setTimeout(() => setPasswordSuccessToast(false), 3000)
  }

  // Handle reset to default
  const handleReset = () => {
    if (window.confirm('Reset profile to default administrative credentials?')) {
      setFormData({ ...defaultSuperAdminProfile })
      onUpdateProfile({ ...defaultSuperAdminProfile })
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in select-none">
      {/* Clickable Backdrop overlay */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Side Slide-Over Drawer Container */}
      <div
        className="w-full max-w-xl md:max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l-2 border-[#D19E77] animate-slide-drawer relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#8D4E22] bg-gradient-to-r from-[#C49563]/40 via-white to-[#E6EFE4] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8D4E22] to-[#542B0E] text-white flex items-center justify-center font-black text-sm shadow-md border border-[#8D4E22]">
              {formData.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#18221B] tracking-tight">
                  Super Admin Profile
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
                  <BadgeCheck className="w-3 h-3" />
                  Side Form
                </span>
              </div>
              <p className="text-[11px] text-[#4A5B50] font-medium">
                Edit administrative name, role, password &amp; official address
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to log out of the Super Admin console?')) {
                    onLogout()
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FEE2E2] hover:bg-[#FCA5A5] border border-[#FECACA] text-[#991B1B] text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Log out of Super Admin Console"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Logout</span>
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-xl bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] text-[#2B1405] text-[11px] font-black flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset to default admin values"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#C49563] hover:bg-[#B6814C] border border-[#8D4E22] text-[#2B1405] flex items-center justify-center transition-colors cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Feedback Toast */}
        {saveSuccessToast && (
          <div className="mx-5 mt-4 flex items-center gap-2.5 p-3 bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] rounded-xl text-xs font-semibold shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Profile changes saved! Navbar and session updated live.</span>
          </div>
        )}

        {passwordSuccessToast && (
          <div className="mx-5 mt-4 flex items-center gap-2.5 p-3 bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36] rounded-xl text-xs font-semibold shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Password updated successfully!</span>
          </div>
        )}

        {/* Sub-Tabs Selector Strip */}
        <div className="flex items-center gap-1.5 px-5 pt-3 pb-2 border-b border-[#C89B75] bg-[#C49563]/25 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-[#C49563] text-[#2B1405] border border-[#8D4E22] shadow-2xs font-black'
                : 'text-[#4A5B50] hover:bg-[#C49563]/40'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Name &amp; Personal</span>
          </button>

          <button
            onClick={() => setActiveTab('role')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'role'
                ? 'bg-[#C49563] text-[#2B1405] border border-[#8D4E22] shadow-2xs font-black'
                : 'text-[#4A5B50] hover:bg-[#C49563]/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Role &amp; Scope</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'password'
                ? 'bg-[#C49563] text-[#2B1405] border border-[#8D4E22] shadow-2xs font-black'
                : 'text-[#4A5B50] hover:bg-[#C49563]/40'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Password</span>
          </button>

          <button
            onClick={() => setActiveTab('address')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'address'
                ? 'bg-[#C49563] text-[#2B1405] border border-[#8D4E22] shadow-2xs font-black'
                : 'text-[#4A5B50] hover:bg-[#C49563]/40'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#8D4E22]" />
            <span>Address</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* TAB 1: PERSONAL & NAME */}
          {activeTab === 'personal' && (
            <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-4">
              <div className="harmony-kpi-card p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-[#D8B293] pb-2">
                  <User className="w-4 h-4 text-[#8D4E22]" />
                  <h3 className="text-xs font-bold text-[#18221B] uppercase tracking-wider">
                    Full Name &amp; Contact Credentials
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      First Name <span className="text-[#C44B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      Last Name <span className="text-[#C44B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      Navbar Display Name <span className="text-[#C44B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={(e) => handleChange('displayName', e.target.value)}
                      placeholder="e.g. Super Admin"
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22] font-bold text-[#8D4E22]"
                    />
                    <span className="text-[10px] text-[#738679] mt-0.5 block">
                      This name directly reflects on the top Navbar profile pill.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      Official Email <span className="text-[#C44B4B]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      Contact Phone <span className="text-[#C44B4B]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">Employee Ref ID</label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => handleChange('employeeId', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-[#F5E5D5] font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">Timezone</label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#D8B293] bg-[#F5E5D5] text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: ROLE & SCOPE */}
          {activeTab === 'role' && (
            <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-4">
              <div className="harmony-kpi-card p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-[#D8B293] pb-2">
                  <ShieldCheck className="w-4 h-4 text-[#8D4E22]" />
                  <h3 className="text-xs font-bold text-[#18221B] uppercase tracking-wider">
                    Role &amp; Clearance Scope
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      Role Title <span className="text-[#C44B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22] font-bold text-[#18221B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      Navbar Badge <span className="text-[#C44B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.roleBadge}
                      onChange={(e) => handleChange('roleBadge', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22] font-semibold text-[#8D4E22]"
                    />
                    <span className="text-[10px] text-[#738679] mt-0.5 block">
                      Sub-title under role in Navbar
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">Department</label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-[#738679] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">Clearance Level</label>
                    <input
                      type="text"
                      value={formData.clearanceLevel}
                      onChange={(e) => handleChange('clearanceLevel', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22] font-mono text-[11px]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      Platform Scope Summary
                    </label>
                    <textarea
                      rows={2}
                      value={formData.roleScope}
                      onChange={(e) => handleChange('roleScope', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                    />
                  </div>
                </div>

                {/* Delegated Authorities Quick View */}
                <div className="pt-2 border-t border-[#D8B293]">
                  <div className="text-[10px] font-bold text-[#18221B] uppercase tracking-wider mb-2">
                    Active Root Authorities
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {[
                      'Universal KYC Approval',
                      'Land Overlap Resolution',
                      'Carbon & Water Screening',
                      'PFMS DBT Payout Escrow',
                      'Dynamic Form Engine',
                      'Immutable Audit Inspection',
                    ].map((auth) => (
                      <div
                        key={auth}
                        className="flex items-center gap-1.5 p-1.5 rounded-lg border border-[#C1D6BD] bg-[#E6EFE4] text-[#3E5F36] font-semibold"
                      >
                        <Check className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{auth}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: PASSWORD & SECURITY */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-[#C49563] border border-[#8D4E22] text-[#2B1405] rounded-xl text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#6E3812]" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form id="password-form" onSubmit={handlePasswordSubmit} className="harmony-kpi-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#D8B293] pb-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#8D4E22]" />
                    <h3 className="text-xs font-bold text-[#18221B] uppercase tracking-wider">
                      Change Admin Password
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#738679]">
                    Age: {formData.lastPasswordChanged}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      Current Password <span className="text-[#C44B4B]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password..."
                        className="w-full pr-9 pl-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#738679] hover:text-[#18221B]"
                      >
                        {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      New Password <span className="text-[#C44B4B]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters..."
                        className="w-full pr-9 pl-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#738679] hover:text-[#18221B]"
                      >
                        {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      Confirm New Password <span className="text-[#C44B4B]">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password..."
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Update Password Now</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* MFA 2FA Toggle */}
              <div className="harmony-kpi-card p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-[#D8B293] pb-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#8D4E22]" />
                    <h3 className="text-xs font-bold text-[#18221B] uppercase tracking-wider">
                      Two-Factor Authentication (MFA)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6EFE4] border border-[#C1D6BD] text-[#3E5F36]">
                    {formData.twoFactorEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-[#D8B293] bg-white">
                  <div>
                    <div className="font-bold text-xs text-[#18221B]">TOTP Authenticator Token</div>
                    <div className="text-[10px] text-[#738679]">Google Authenticator / YubiKey MFA</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.twoFactorEnabled}
                    onChange={(e) => {
                      handleChange('twoFactorEnabled', e.target.checked)
                      onUpdateProfile({
                        ...formData,
                        twoFactorEnabled: e.target.checked,
                      })
                    }}
                    className="w-4 h-4 accent-[#8D4E22] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL ADDRESS */}
          {activeTab === 'address' && (
            <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-4">
              <div className="harmony-kpi-card p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-[#D8B293] pb-2">
                  <MapPin className="w-4 h-4 text-[#8D4E22]" />
                  <h3 className="text-xs font-bold text-[#18221B] uppercase tracking-wider">
                    Administrative Headquarters &amp; Physical Address
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      Campus / Street Address <span className="text-[#C44B4B]">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.streetAddress}
                      onChange={(e) => handleChange('streetAddress', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      City <span className="text-[#C44B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">District / Division</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      State <span className="text-[#C44B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      Postal Pincode <span className="text-[#C44B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => handleChange('pincode', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">
                      Country <span className="text-[#C44B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-white focus:outline-none focus:border-[#8D4E22]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A5B50] mb-1">Digital Certificate Ref</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.digitalSignatureId}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8B293] bg-[#F5E5D5] font-mono text-[11px] text-[#738679]"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Drawer Sticky Footer */}
        <div className="p-4 border-t border-[#D19E77] bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to log out of the Super Admin console?')) {
                    onLogout()
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#991B1B] border border-[#FECACA] text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs hover:shadow-xs active:scale-98"
                title="Log out of Super Admin Console"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Logout Session</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F5E5D5] hover:bg-[#D8B293] text-[#526658] text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {activeTab !== 'password' ? (
            <button
              type="submit"
              form="profile-form"
              className="px-6 py-2 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
