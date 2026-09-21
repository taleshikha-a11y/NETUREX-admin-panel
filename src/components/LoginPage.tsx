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
    <div className="min-h-screen bg-[#F8F3EC] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Screen Boundary Radiant Flash - Soft Sea Green Pulsating Glow */}
      <div className="page-boundary-flash" />

      {/* Main Login Card - Clean Light Border */}
      <div className="w-full max-w-md bg-white border border-[#E2DDD5] rounded-3xl p-8 shadow-xs relative z-10 space-y-6">
        {/* Brand & Super Admin Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] shadow-2xs">
            <Leaf className="w-4 h-4 text-[#166534] stroke-[2.5]" />
            <span className="font-black text-sm text-[#0F172A] tracking-tight">
              NATUREX ADMIN
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-white text-[#166534] border border-[#DCFCE7]">
              Super Admin
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Super Admin Console Login
            </h1>
            <p className="text-xs text-[#475569] font-semibold">
              Global platform governance, user management, and compliance controls
            </p>
          </div>
        </div>

        {/* Auth Method Selector */}
        <div className="flex rounded-2xl bg-[#FAF8F5] p-1 border border-[#E2DDD5]">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('password')
              setError('')
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              authMethod === 'password'
                ? 'bg-white text-[#0F172A] shadow-xs border border-[#E2DDD5]'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Password / PIN
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('otp')
              setError('')
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              authMethod === 'otp'
                ? 'bg-white text-[#0F172A] shadow-xs border border-[#E2DDD5]'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Secure OTP
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-2xl bg-[#FFF0F0] border border-[#F5A6A6] text-xs text-[#8A1F1F] font-bold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[#0F172A] block">
              Super Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#475569] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="super.admin@naturex.eco"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#D6CBC0] text-xs text-[#0F172A] font-medium outline-none focus:border-[#2D6A4F] focus:bg-white transition-all"
              />
            </div>
          </div>

          {authMethod === 'password' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#0F172A]">
                  Security Password / PIN
                </label>
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-[11px] font-bold text-[#2D6A4F] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Demo Credentials</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#475569] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password or PIN"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#D6CBC0] text-xs text-[#0F172A] font-medium outline-none focus:border-[#2D6A4F] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#0F172A]">
                  One-Time Password (OTP)
                </label>
                <span className="text-[11px] text-[#2D6A4F] font-bold">
                  Code sent to verified email
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#475569] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP (e.g. 849201)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#D6CBC0] text-xs text-[#0F172A] font-mono font-bold tracking-widest outline-none focus:border-[#2D6A4F] focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-[#334155]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#2D6A4F] focus:ring-[#2D6A4F] accent-[#2D6A4F]"
              />
              <span>Remember secure session</span>
            </label>
            <span className="text-[11px] text-[#2D6A4F] font-bold">DPDP 2025 Protected</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-[#2D6A4F] hover:bg-[#1E4D39] text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all disabled:opacity-50"
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
        <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#D6CBC0] flex items-center gap-2 text-[11px] text-[#475569]">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] flex-shrink-0" />
          <span>Restricted to Authorized Super Administrators with full governance audit logging.</span>
        </div>
      </div>
    </div>
  )
}
