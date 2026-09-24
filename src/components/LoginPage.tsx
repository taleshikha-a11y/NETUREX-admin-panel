import React, { useState } from 'react'
import {
  ShieldCheck,
  ArrowRight,
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'

export interface RoleConfig {
  id: string
  name: string
  badge: string
  scope: string
  icon: string
  description: string
}

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('super.admin@naturex.eco')
  const [password, setPassword] = useState('SuperAdmin@2026')
  const [otp, setOtp] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (authMethod === 'password') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your Super Admin email and security credentials.')
        return
      }
    } else {
      if (!otp || otp.length < 4) {
        setError('Please enter the 6-digit verification code.')
        return
      }
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 450)
  }

  const handleQuickDemoFill = () => {
    setEmail('super.admin@naturex.eco')
    setPassword('SuperAdmin@2026')
    setAuthMethod('password')
    setError('')
  }

  return (
    <div className="min-h-screen bg-[#F8F9F5] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Main Login Card - Terracotta Teak Wood Border */}
      <div className="w-full max-w-md bg-white border border-[#D19E77] rounded-3xl p-8 shadow-lg relative z-10 space-y-6">
        {/* Brand & Super Admin Badge */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#C49563] border-2 border-[#8D4E22] p-2 shadow-md flex items-center justify-center transition-all">
              <img
                src="/naturex-badge.png"
                alt="NatureX Emblem"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] shadow-2xs">
            <Leaf className="w-4 h-4 text-[#3E5F36] stroke-[2.5]" />
            <span className="font-black text-sm text-[#18221B] tracking-tight">
              NATUREX ADMIN
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-black text-[#18221B] tracking-tight">
              Platform Authentication
            </h1>
            <p className="text-xs text-[#738679] font-medium mt-1">
              Protected Administrative Access Portal • NatureX Digital Core
            </p>
          </div>
        </div>

        {/* Auth Method Selector */}
        <div className="p-1 rounded-2xl bg-[#F8F9F5] border border-[#DEE6DC] flex items-center gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthMethod('password')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              authMethod === 'password'
                ? 'bg-white text-[#8D4E22] shadow-xs border border-[#B88258]'
                : 'text-[#4A5B50] hover:text-[#18221B]'
            }`}
          >
            Master Password
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('otp')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              authMethod === 'otp'
                ? 'bg-white text-[#8D4E22] shadow-xs border border-[#B88258]'
                : 'text-[#4A5B50] hover:text-[#18221B]'
            }`}
          >
            Secure OTP
          </button>
        </div>

        {/* Error Message - Rich Dark Wooden Tint (No Pink) */}
        {error && (
          <div className="p-3 rounded-2xl bg-[#C49563] border border-[#8D4E22] text-xs text-[#2B1405] font-black">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[#18221B] block">
              Super Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#738679] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="super.admin@naturex.eco"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F5E5D5]/50 border border-[#D8B293] text-xs text-[#18221B] font-medium outline-none focus:border-[#8D4E22] focus:bg-white focus:ring-1 focus:ring-[#8D4E22] transition-all"
              />
            </div>
          </div>

          {authMethod === 'password' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#18221B]">
                  Security Password / PIN
                </label>
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-[11px] font-bold text-[#8D4E22] hover:text-[#6E3812] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Demo Credentials</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#738679] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password or PIN"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#F5E5D5]/50 border border-[#D8B293] text-xs text-[#18221B] font-medium outline-none focus:border-[#8D4E22] focus:bg-white focus:ring-1 focus:ring-[#8D4E22] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#738679] hover:text-[#18221B] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#18221B]">
                  One-Time Password (OTP)
                </label>
                <span className="text-[11px] text-[#5E8256] font-bold">
                  Code sent to verified email
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#738679] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP (e.g. 849201)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F5E5D5]/50 border border-[#D8B293] text-xs text-[#18221B] font-mono font-bold tracking-widest outline-none focus:border-[#8D4E22] focus:bg-white focus:ring-1 focus:ring-[#8D4E22] transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-[#4A5B50]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#8D4E22] focus:ring-[#8D4E22] accent-[#8D4E22]"
              />
              <span>Remember secure session</span>
            </label>
            <span className="text-[11px] text-[#5E8256] font-bold">DPDP 2025 Protected</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-[#8D4E22] hover:bg-[#6E3812] text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating Super Admin...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Enter Super Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Security Notice */}
        <div className="p-3 rounded-2xl bg-[#E6EFE4] border border-[#C1D6BD] flex items-center gap-2 text-[11px] text-[#3E5F36]">
          <CheckCircle2 className="w-4 h-4 text-[#5E8256] flex-shrink-0" />
          <span>Restricted to Authorized Super Administrators with full governance audit logging.</span>
        </div>
      </div>
    </div>
  )
}
