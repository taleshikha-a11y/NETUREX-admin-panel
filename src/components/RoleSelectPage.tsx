import React from 'react'
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  Award,
  ArrowRight,
  Leaf,
  CheckCircle2,
} from 'lucide-react'
import rolesData from '../data/roles.json'
import type { RoleConfig } from './LoginPage'

interface RoleSelectPageProps {
  onSelectRole: (role: RoleConfig) => void
}

const roleIconMap: Record<string, React.ElementType> = {
  ShieldCheck,
  Building2,
  FileCheck2,
  Award,
}

export default function RoleSelectPage({ onSelectRole }: RoleSelectPageProps) {
  return (
    <div className="min-h-screen bg-[#F8F3EC] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background ambient accents (strictly background layer) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D0EFE8]/40 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#CFE7F1]/40 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-[#F7E6E6]/30 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main Selection Container */}
      <div className="w-full max-w-3xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#D0EFE8] border-2 border-[#7EC8B5] text-[#0F3F32] shadow-xs mb-1">
            <Leaf className="w-7 h-7 text-[#0F3F32] stroke-[2.5]" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              NATUREX
            </h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#D0EFE8] text-[#0F3F32] border border-[#7EC8B5]">
              ADMIN CONSOLE
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
            Select Your Administrative Role
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] font-medium max-w-lg mx-auto">
            Choose your designated portal to continue to role-specific authentication under the NATUREX specification
          </p>
        </div>

        {/* 4 Role Selection Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rolesData.roles.map((role) => {
            const Icon = roleIconMap[role.icon] || ShieldCheck

            return (
              <div
                key={role.id}
                onClick={() => onSelectRole(role)}
                className="group bg-white hover:bg-[#FDFBF8] border-2 border-[#D6CBC0] hover:border-[#2D6A4F] rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div className="space-y-3.5">
                  {/* Card Top: Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#D0EFE8] group-hover:bg-[#2D6A4F] text-[#0F3F32] group-hover:text-white border-2 border-[#7EC8B5] group-hover:border-[#2D6A4F] flex items-center justify-center font-bold transition-all shadow-xs">
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#E8F5F1] text-[#0A3328] border border-[#A0D4C5]">
                      {role.badge}
                    </span>
                  </div>

                  {/* Role Title & Description */}
                  <div>
                    <h3 className="text-base font-black text-[#0F172A] group-hover:text-[#2D6A4F] transition-colors">
                      {role.name}
                    </h3>
                    <p className="text-xs text-[#475569] font-medium mt-1 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </div>

                {/* Scope & Action Button */}
                <div className="mt-5 pt-3.5 border-t border-[#E2D8CC] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#334155] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] flex-shrink-0" />
                    <span className="truncate max-w-[170px] sm:max-w-[200px]">{role.scope}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-black text-[#2D6A4F] group-hover:translate-x-1 transition-transform">
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Security & Compliance Footer */}
        <div className="text-center pt-2 space-y-1.5">
          <div className="flex items-center justify-center gap-3 text-xs text-[#475569] font-bold">
            <span>India DPDP Rules 2025</span>
            <span>•</span>
            <span>BEE / ACVA Portal</span>
            <span>•</span>
            <span>Role-Based Access (RBAC)</span>
          </div>
          <p className="text-[11px] text-[#64748B] font-medium">
            Every session validates resource permissions and organization scope boundaries
          </p>
        </div>
      </div>
    </div>
  )
}
