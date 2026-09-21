import React, { useState } from 'react'
import {
  UserPlus,
  Mail,
  Smartphone,
  MapPin,
  KeyRound,
  ShieldCheck,
  Building2,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  X,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react'
import rolesData from '../data/roles.json'
import type { UserRecord } from './UserManagementView'

interface CreateUserPageProps {
  onUserCreated: (newUser: UserRecord) => void
  onCancel: () => void
}

export default function CreateUserPage({ onUserCreated, onCancel }: CreateUserPageProps) {
  // Form State - with sensible defaults so it is immediately usable
  const [name, setName] = useState('Kavita Verma')
  const [selectedRoleCode, setSelectedRoleCode] = useState(rolesData.roles[1]?.code || rolesData.roles[0].code)
  const [email, setEmail] = useState('kavita.verma@narmadafpo.org')
  const [mobile, setMobile] = useState('+91 98261 44520')
  const [city, setCity] = useState('Sehore')
  const [pin, setPin] = useState('849201')
  const [showPin, setShowPin] = useState(false)
  const [orgName, setOrgName] = useState('Narmada Valley Farmer Producer Co.')
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)
  const [validationError, setValidationError] = useState('')
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  // Simulation & Modal State
  const [createdUser, setCreatedUser] = useState<UserRecord | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [userSimulatedLogin, setUserSimulatedLogin] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate random 6-digit PIN
  const handleGenerateRandomPin = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString()
    setPin(randomPin)
  }

  // Selected Role Info from roles.json
  const currentRoleObj =
    rolesData.roles.find((r) => r.code === selectedRoleCode) || rolesData.roles[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!name.trim() || !email.trim() || !mobile.trim() || !city.trim() || !pin.trim()) {
      setValidationError('Please fill in all mandatory fields: Name, Email, Mobile, City, and PIN.')
      return
    }

    setIsSubmitting(true)

    // Generate unique ID based on role
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const newId = `USR-${currentRoleObj.code.slice(0, 4)}-${randomSuffix}`

    const newUser: UserRecord = {
      id: newId,
      name: name.trim(),
      phone: mobile.trim().startsWith('+91') ? mobile.trim() : `+91 ${mobile.trim()}`,
      role: currentRoleObj.name,
      roleCode: currentRoleObj.code,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      location: {
        village: `${city} Sector`,
        city: city.trim(),
        district: city.trim(),
        state: 'Madhya Pradesh',
        country: 'India',
      },
      dob: '01 Jan 1990',
      age: 36,
      registeredDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      universalStatus: 'SUBMITTED',
      organization: {
        id: 'ORG-FPO-0101',
        name: orgName.trim() || 'Narmada Valley Farmer Producer Co.',
        type: currentRoleObj.code === 'ORG_ADMIN' ? 'FPO' : 'Beneficiary',
        roleInOrg: currentRoleObj.name,
      },
      kyc: {
        status: 'SUBMITTED',
        documentType: 'Aadhaar / Work Identity (Pending Verification)',
        documentNumber: `•••• •••• ${pin.slice(0, 4)}`,
        frontUpload: 'invitation_id_doc.jpg',
        backUpload: 'invitation_id_back.jpg',
        consentChecked: true,
        consentVersion: 'DPDP-Act-2025-v1.2',
        consentTimestamp: new Date().toISOString(),
        adminDecisionNote: `Invited by Super Admin with initial security PIN ${pin}.`,
        clarificationQuestion: null,
        rejectionReason: null,
      },
      payoutProfile: {
        status: 'PENDING_REVIEW',
        accountHolder: name.trim(),
        accountNumber: `•••• •••• •••• ${randomSuffix}`,
        ifsc: 'SBIN0001920',
        bankName: 'State Bank of India',
        branch: `${city} Branch`,
      },
      lands: [],
      projects: [],
      auditTrail: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          action: 'USER_CREATED',
          performedBy: 'Super Admin (admin@naturex.io)',
          note: `User created with Role [${currentRoleObj.name}]. Welcome email & activation link dispatched with PIN.`,
        },
      ],
    }

    setTimeout(() => {
      setIsSubmitting(false)
      setCreatedUser(newUser)
      setShowEmailModal(true)
      setSuccessBanner(`Role & User "${newUser.name}" successfully created with ID ${newUser.id}!`)
      onUserCreated(newUser)
    }, 350)
  }

  const handleCopyCredentials = () => {
    if (!createdUser) return
    const textToCopy = `NATUREX Login Invitation:\nName: ${name}\nRole: ${currentRoleObj.name}\nEmail: ${email}\nMobile: ${mobile}\nPIN: ${pin}\nActivation Link: https://app.naturex.eco/login?user=${encodeURIComponent(email)}&pin=${pin}`
    navigator.clipboard.writeText(textToCopy)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Simulate User First Login via Email Link
  const handleSimulateUserLogin = () => {
    if (!createdUser) return
    setUserSimulatedLogin(true)

    const updatedUser: UserRecord = {
      ...createdUser,
      universalStatus: 'APPROVED',
      kyc: {
        ...createdUser.kyc,
        status: 'APPROVED',
        adminDecisionNote: 'User completed first-time login verification via email link & PIN.',
      },
      auditTrail: [
        ...createdUser.auditTrail,
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          action: 'USER_LOGIN',
          performedBy: `${name} (Self via Email Link)`,
          note: 'First-time authentication successful using security PIN. Account status transitioned to APPROVED.',
        },
      ],
    }

    setCreatedUser(updatedUser)
    onUserCreated(updatedUser)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="harmony-card-subtle p-6 border border-[#E2DDD5] shadow-xs bg-white rounded-3xl space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold shadow-2xs">
              <UserPlus className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
                Create New Role &amp; User Account
              </h2>
              <p className="text-xs text-[#475569] font-semibold">
                Generate authenticated credentials, assign platform RBAC role, and dispatch email invitation with login PIN
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-[#F5EFEB] hover:bg-[#EAE0D3] border border-[#D6CBC0] text-xs font-bold text-[#334155] cursor-pointer"
          >
            Cancel &amp; Back to Directory
          </button>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-[#E2DDD5] rounded-3xl p-8 shadow-xs max-w-3xl mx-auto space-y-6">
        {successBanner && (
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-[#166534] font-semibold">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] flex-shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#1E4D39] flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <span>View in Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Name & Role Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] block">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikramaditya Rao"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6CBC0] text-xs text-[#0F172A] font-bold outline-none focus:border-[#2D6A4F] focus:bg-white transition-all"
              />
            </div>

            {/* Role Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] block">
                Assign Platform Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedRoleCode}
                  onChange={(e) => setSelectedRoleCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6CBC0] text-xs text-[#0F172A] font-bold outline-none focus:border-[#2D6A4F] focus:bg-white cursor-pointer transition-all"
                >
                  {rolesData.roles.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name} ({r.badge})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Role Scope Info Callout */}
          <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#166534] flex-shrink-0" />
              <div>
                <span className="font-bold text-[#166534]">{currentRoleObj.name}:</span>{' '}
                <span className="text-[#334155] font-medium">{currentRoleObj.description}</span>
              </div>
            </div>
            <span className="badge-mint-tint px-2 py-0.5 rounded-full text-[10px] font-bold">
              {currentRoleObj.scope}
            </span>
          </div>

          {/* Row 2: Email & Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] block">
                Email Address (For Invitation Link) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. vikram.rao@narmadafpo.org"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6CBC0] text-xs text-[#0F172A] font-medium outline-none focus:border-[#2D6A4F] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] block">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98260 12345"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6CBC0] text-xs text-[#0F172A] font-medium outline-none focus:border-[#2D6A4F] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Location (City) & Organization Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] block">
                Location (City / District) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Sehore, Indore, Bhopal"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6CBC0] text-xs text-[#0F172A] font-medium outline-none focus:border-[#2D6A4F] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] block">
                Organization / FPO Context
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Narmada Valley Farmer Producer Co."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6CBC0] text-xs text-[#0F172A] font-medium outline-none focus:border-[#2D6A4F] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Security Access PIN / Password (PIN Input Type) */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block">
                  Security Access PIN / Password (App Login) <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-[#475569] font-medium">
                  Ye PIN user ke welcome email me jayega jisse vo mobile app ya web portal me login karega
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateRandomPin}
                className="text-xs font-bold text-[#2D6A4F] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Generate PIN</span>
              </button>
            </div>

            <div className="relative max-w-sm">
              <KeyRound className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPin ? 'text' : 'password'}
                required
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="6-digit PIN"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#D6CBC0] text-xs text-[#0F172A] font-mono font-bold tracking-widest outline-none focus:border-[#2D6A4F] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Invitation Email Dispatch Toggle */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD5] flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#0F172A]">
              <input
                type="checkbox"
                checked={sendWelcomeEmail}
                onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                className="w-4 h-4 rounded text-[#2D6A4F] focus:ring-[#2D6A4F] accent-[#2D6A4F]"
              />
              <span>Send welcome invitation email with access PIN &amp; activation link</span>
            </label>
            <span className="badge-sky-tint px-2.5 py-0.5 rounded-full text-[10px] font-black">
              SMTP Simulation Ready
            </span>
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-semibold text-[#B91C1C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#E2DDD5]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setName('Anil Kumar Joshi')
                  setEmail('anil.joshi@ecoverify.in')
                  setMobile('+91 94250 88912')
                  setCity('Bhopal')
                  setPin('561928')
                  setValidationError('')
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2D6A4F] hover:bg-[#F0FDF4] border border-[#DCFCE7] cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Sample Data</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:bg-[#F3EDE4] border border-[#D6CBC0] cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#3AA88E] to-[#2D8E77] hover:from-[#339A82] hover:to-[#257964] text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md transition-all border border-[#257964] active:scale-98"
            >
              {isSubmitting ? (
                <span>Generating Role Credentials...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 stroke-[2.2]" />
                  <span>Create Role &amp; Send Invite</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 11. Interactive Welcome Email Simulation Modal */}
      {showEmailModal && createdUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#E2DDD5] shadow-xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D6CBC0]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#0F172A]">
                    Welcome Email &amp; Invitation Sent!
                  </h4>
                  <p className="text-xs font-mono text-[#475569] font-bold">
                    To: {email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEmailModal(false)
                  onCancel()
                }}
                className="w-8 h-8 rounded-xl bg-[#F5EFEB] hover:bg-[#EAE0D3] flex items-center justify-center text-[#334155] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Preview Card */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD5] space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD3]">
                <span className="font-bold text-[#475569]">Subject:</span>
                <span className="font-black text-[#0F172A]">
                  Welcome to NATUREX - Your Account Credentials &amp; Login Access
                </span>
              </div>

              <div className="space-y-2 text-[#334155] leading-relaxed">
                <p>
                  Hello <strong>{name}</strong>,
                </p>
                <p>
                  Welcome to the <strong>NATUREX Climate &amp; Nature Impact Platform</strong>! Your account has been created by the Super Administrator with the assigned role of{' '}
                  <strong className="text-[#0A3B2F]">{currentRoleObj.name}</strong>.
                </p>
                <p>You can now sign in using your mobile number or email with the following security PIN:</p>
              </div>

              {/* PIN Highlight Box */}
              <div className="p-3.5 rounded-xl bg-white border border-[#DCFCE7] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                    Your Initial Login PIN
                  </span>
                  <span className="text-xl font-mono font-black text-[#0F172A] tracking-widest">
                    {pin}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE0D3] border border-[#D6CBC0] text-[11px] font-bold text-[#0F172A] flex items-center gap-1 cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Details</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secure Activation Link */}
              <div className="p-3 rounded-xl bg-white border border-[#D6CBC0] space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                  One-Click Activation Link
                </span>
                <p className="text-[11px] font-mono text-[#2D6A4F] truncate underline">
                  https://app.naturex.eco/login?user={encodeURIComponent(email)}&amp;pin={pin}
                </p>
              </div>

              {/* Status Note */}
              <div className="flex items-center gap-2 text-[11px] text-[#475569]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>
                  Current User Status:{' '}
                  <strong className="text-[#0F172A]">{createdUser.universalStatus}</strong>
                </span>
              </div>
            </div>

            {/* Simulation Action Bar */}
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-black text-[#166534] block">
                    {userSimulatedLogin
                      ? '✓ User First Login Simulated Successfully!'
                      : 'Test User First Login via Link:'}
                  </span>
                  <p className="text-[10px] text-[#334155]">
                    {userSimulatedLogin
                      ? 'User has authenticated with PIN. Status is now APPROVED.'
                      : 'Click below to simulate the user opening this email link & logging in with their PIN.'}
                  </p>
                </div>

                {!userSimulatedLogin ? (
                  <button
                    type="button"
                    onClick={handleSimulateUserLogin}
                    className="px-3 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1E4D39] text-white text-xs font-black cursor-pointer shadow-xs flex items-center gap-1.5 flex-shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Simulate Login</span>
                  </button>
                ) : (
                  <span className="badge-mint-tint px-3 py-1 rounded-full text-xs font-black">
                    APPROVED
                  </span>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-[#D6CBC0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowEmailModal(false)
                  onCancel()
                }}
                className="w-full py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1E4D39] text-white text-xs font-black cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Go to User Management &amp; View User</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
