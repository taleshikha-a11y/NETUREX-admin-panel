import React from 'react'
import {
  MapPin,
  Users,
  FolderKanban,
  Receipt,
  AlertTriangle,
  FileBadge,
  FileCheck2,
  Compass,
  Award,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  Layers,
  Leaf,
  Droplets,
  Trees,
} from 'lucide-react'
import dashboardData from '../data/dashboard.json'

interface DashboardViewProps {
  onNavigate: (moduleKey: string) => void
}

const kpiIconMap: Record<string, React.ElementType> = {
  MapPin,
  Users,
  FolderKanban,
  Receipt,
}

const alertIconMap: Record<string, React.ElementType> = {
  'alert-kyc': FileBadge,
  'alert-conflicts': AlertTriangle,
  'alert-evidence': FileCheck2,
  'alert-visits': Compass,
  'alert-verification': Award,
  'alert-sync': RefreshCw,
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* 1. Top Impact Summary KPIs (PRD Section 14) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardData.summaryKpis.map((kpi) => {
          const Icon = kpiIconMap[kpi.icon] || MapPin

          return (
            <div
              key={kpi.id}
              className="harmony-kpi-card p-5 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#334155] tracking-wide">
                  {kpi.label}
                </span>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#7EC8B5] text-[#0F3F32] flex items-center justify-center font-bold shadow-2xs">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                    {kpi.value}
                  </span>
                  <span className="text-xs font-extrabold text-[#2D6A4F]">
                    {kpi.unit}
                  </span>
                </div>
                <p className="text-xs text-[#475569] font-bold mt-1">
                  {kpi.secondaryValue}
                </p>
              </div>

              <div className="pt-2 border-t border-[#82CEBA]/30 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-bold text-[#164E3A]">
                  <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{kpi.trend}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full badge-mint-tint text-[10px]">
                  {kpi.category}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 2. Priority Alert & Action Queues (PRD Section 14) */}
      <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#B91C1C] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0F172A]">
                Pending Administrative Queues
              </h3>
              <p className="text-xs text-[#475569] font-semibold">
                Operational review queues requiring Super Admin or specialist intervention
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full badge-alert-tint">
            {dashboardData.priorityAlertQueues.reduce((acc, q) => acc + q.count, 0)} Items Pending
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {dashboardData.priorityAlertQueues.map((alert) => {
            const Icon = alertIconMap[alert.id] || AlertTriangle
            const isDanger = alert.severity === 'danger'

            return (
              <div
                key={alert.id}
                onClick={() => onNavigate(alert.targetKey)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 ${
                  isDanger
                    ? 'bg-[#FFFBFB] border-[#FECACA] hover:border-[#F87171] hover:shadow-xs'
                    : 'bg-[#FBFDFB] border-[#DCFCE7] hover:border-[#86EFAC] hover:shadow-xs'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isDanger
                          ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FEE2E2]'
                          : 'bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7]'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isDanger ? 'badge-alert-tint' : 'badge-mint-tint'
                        }`}
                      >
                        {alert.badge}
                      </span>
                      <span className="text-sm font-black text-[#0F172A] px-2 py-0.5 rounded-lg bg-white border border-[#D6CBC0] shadow-2xs">
                        {alert.count}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold text-[#0F172A]">
                      {alert.title}
                    </h4>
                    <p className="text-[11px] text-[#475569] font-medium mt-1 leading-relaxed line-clamp-2">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E8E0D5] flex items-center justify-between text-[11px] font-bold text-[#2D6A4F]">
                  <span>Open Queue</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Project Lifecycle & State Machine (PRD Section 15) */}
      <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] flex items-center justify-center">
              <Layers className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0F172A]">
                Project Lifecycle &amp; State Machine (PRD §15)
              </h3>
              <p className="text-xs text-[#475569] font-semibold">
                Distribution of projects across the official lifecycle state machine
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('project-queue')}
            className="text-xs font-bold text-[#2D6A4F] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* State Machine Step Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {dashboardData.lifecycleStages.map((stage, idx) => {
            return (
              <div
                key={stage.stage}
                className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-center space-y-1 hover:bg-[#F2ECE4] transition-colors"
              >
                <div className="text-[10px] font-black text-[#64748B] uppercase">
                  Stage {idx + 1}
                </div>
                <div className="text-lg font-black text-[#0F172A]">
                  {stage.count}
                </div>
                <div className="text-[11px] font-bold text-[#334155] truncate" title={stage.stage}>
                  {stage.stage}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Project Type Breakdown & Compliance Boundary (PRD Section 16 & 27) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Project Breakdown Cards */}
        <div className="lg:col-span-2 bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#0F172A]">
              Impact Methodology Breakdown (PRD §16)
            </h3>
            <span className="text-xs font-bold text-[#475569]">
              184 Total Registered
            </span>
          </div>

          <div className="space-y-3.5">
            {dashboardData.projectTypesBreakdown.map((item) => {
              const Icon =
                item.tone === 'mint'
                  ? Leaf
                  : item.tone === 'sky'
                  ? Droplets
                  : Trees

              return (
                <div
                  key={item.type}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                          item.tone === 'mint'
                            ? 'bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7]'
                            : item.tone === 'sky'
                            ? 'bg-[#F0F9FF] text-[#0369A1] border border-[#E0F2FE]'
                            : 'bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span className="text-sm font-extrabold text-[#0F172A]">
                        {item.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#0F172A]">
                        {item.count} projects ({item.percentage}%)
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          item.tone === 'mint'
                            ? 'badge-mint-tint'
                            : item.tone === 'sky'
                            ? 'badge-sky-tint'
                            : 'badge-mint-tint'
                        }`}
                      >
                        {item.acreage}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-[#E2D8CC] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.tone === 'mint'
                          ? 'bg-[#2D6A4F]'
                          : item.tone === 'sky'
                          ? 'bg-[#0E7490]'
                          : 'bg-[#15803D]'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#475569] font-bold">
                    <span>Target Metric: {item.impactMetric}</span>
                    <span className="text-[#2D6A4F] font-black">
                      PostGIS Verified Polygons
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Compliance Discipline & Quick Links */}
        <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#2D6A4F] stroke-[2.2]" />
              <h3 className="text-sm font-black text-[#0F172A]">
                Compliance Boundary (PRD §27)
              </h3>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#166534]">
                <CheckCircle2 className="w-4 h-4 text-[#166534] flex-shrink-0" />
                <span>Claim Discipline Enforced</span>
              </div>
              <p className="text-[11px] text-[#334155] font-medium leading-relaxed">
                {dashboardData.complianceBanner.description}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F5F0] border border-[#D6CBC0] space-y-1.5 text-xs">
              <span className="font-bold text-[#0F172A] block">
                Official Regulatory Oversight:
              </span>
              <ul className="text-[11px] text-[#475569] font-medium space-y-1">
                <li>• <strong>BEE</strong> — Carbon Market Administrator</li>
                <li>• <strong>GCI</strong> — National Registry Operator</li>
                <li>• <strong>ACVAs</strong> — Accredited Verification Agencies</li>
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-[#D6CBC0]">
            <button
              type="button"
              onClick={() => onNavigate('acva-verification')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1E4D39] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <span>View ACVA Partner Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
