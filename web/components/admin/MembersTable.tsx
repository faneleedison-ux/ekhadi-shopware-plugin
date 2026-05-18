'use client'

import { useState, useMemo } from 'react'
import { FileText } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export interface SerializedMember {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  createdAt: string
  customerProfile: {
    sassaId: string | null
    monthlyGrantAmount: string | number
    creditScore: number | null
    isActive: boolean
    area: { name: string } | null
  } | null
  groupMemberships: {
    group: { name: string }
  }[]
}

type SortKey = 'name' | 'area' | 'grant' | 'score' | 'joined'
type SortDir = 'asc' | 'desc'

const scoreBadge = (score: number | null | undefined) => {
  if (score == null) return (
    <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#A89971] border-[#A89971]/30 bg-[#A89971]/10">No score</span>
  )
  if (score >= 75) return (
    <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#3F7B4F] border-[#3F7B4F]/30 bg-[#3F7B4F]/10">{score} Excellent</span>
  )
  if (score >= 50) return (
    <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#A07030] border-[#A07030]/30 bg-[#A07030]/10">{score} Good</span>
  )
  return (
    <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#E11D2A] border-[#E11D2A]/30 bg-[#E11D2A]/10">{score} Low</span>
  )
}

const SORT_LABELS: Record<SortKey, string> = {
  name: 'Name',
  area: 'Area',
  grant: 'Grant',
  score: 'Score',
  joined: 'Joined',
}

export default function MembersTable({ members }: { members: SerializedMember[] }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('joined')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = q
      ? members.filter((m) =>
          (m.name ?? '').toLowerCase().includes(q) ||
          (m.email ?? '').toLowerCase().includes(q) ||
          (m.customerProfile?.area?.name ?? '').toLowerCase().includes(q)
        )
      : members

    return [...base].sort((a, b) => {
      let av: string | number = 0
      let bv: string | number = 0
      switch (sortKey) {
        case 'name':
          av = (a.name ?? '').toLowerCase()
          bv = (b.name ?? '').toLowerCase()
          break
        case 'area':
          av = (a.customerProfile?.area?.name ?? '').toLowerCase()
          bv = (b.customerProfile?.area?.name ?? '').toLowerCase()
          break
        case 'grant':
          av = Number(a.customerProfile?.monthlyGrantAmount ?? 0)
          bv = Number(b.customerProfile?.monthlyGrantAmount ?? 0)
          break
        case 'score':
          av = a.customerProfile?.creditScore ?? -1
          bv = b.customerProfile?.creditScore ?? -1
          break
        case 'joined':
          av = a.createdAt
          bv = b.createdAt
          break
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [members, search, sortKey, sortDir])

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return null
    return (
      <span className="ml-1 text-[#E11D2A]">{sortDir === 'asc' ? '↑' : '↓'}</span>
    )
  }

  const thClass = (key: SortKey) =>
    `px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971] cursor-pointer select-none hover:text-[#E11D2A] transition-colors whitespace-nowrap`

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search members by name, email, area…"
        className="w-full px-4 py-2.5 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl font-[var(--mono)] text-[11px] text-[#14130E] outline-none focus:border-[#E11D2A] transition-colors placeholder:text-[#A89971]"
      />

      {/* Table */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#C9BCA0]">
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Community</p>
          <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">All Members</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#14130E]">
                <th
                  className={thClass('name')}
                  onClick={() => handleSort('name')}
                >
                  {SORT_LABELS.name}{sortIndicator('name')}
                </th>
                <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">
                  SASSA ID
                </th>
                <th
                  className={thClass('area')}
                  onClick={() => handleSort('area')}
                >
                  {SORT_LABELS.area}{sortIndicator('area')}
                </th>
                <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">
                  Group
                </th>
                <th
                  className={thClass('grant')}
                  onClick={() => handleSort('grant')}
                >
                  {SORT_LABELS.grant}{sortIndicator('grant')}
                </th>
                <th
                  className={thClass('score')}
                  onClick={() => handleSort('score')}
                >
                  {SORT_LABELS.score}{sortIndicator('score')}
                </th>
                <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">
                  Status
                </th>
                <th
                  className={thClass('joined')}
                  onClick={() => handleSort('joined')}
                >
                  {SORT_LABELS.joined}{sortIndicator('joined')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="flex flex-col items-center py-12 text-center bg-[#EBE0C7]">
                      <FileText className="h-10 w-10 text-[#A89971] mb-3" />
                      <p className="font-[var(--serif)] italic text-lg text-[#14130E]">No members match your search.</p>
                      <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] mt-1">
                        Try a different name, email, or area
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((member, i) => (
                  <tr
                    key={member.id}
                    className={`border-b border-[#C9BCA0] last:border-0 hover:bg-[#E11D2A]/3 transition-colors ${
                      i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E]">{member.name}</p>
                      <p className="font-[var(--mono)] text-[10px] text-[#6B6552]">{member.email}</p>
                      {member.phone && (
                        <p className="font-[var(--mono)] text-[10px] text-[#6B6552]">{member.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-[var(--mono)] text-[11px] text-[#14130E]">
                      {member.customerProfile?.sassaId || '—'}
                    </td>
                    <td className="px-4 py-3 font-[var(--sans-dawn)] text-sm text-[#14130E]">
                      {member.customerProfile?.area?.name || '—'}
                    </td>
                    <td className="px-4 py-3 font-[var(--sans-dawn)] text-sm text-[#14130E]">
                      {member.groupMemberships.length > 0
                        ? member.groupMemberships.map((gm) => gm.group.name).join(', ')
                        : <span className="text-[#A89971]">No group</span>}
                    </td>
                    <td className="px-4 py-3 font-[var(--serif)] italic text-base text-[#E11D2A]">
                      {member.customerProfile
                        ? formatCurrency(Number(member.customerProfile.monthlyGrantAmount))
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {scoreBadge(member.customerProfile?.creditScore)}
                    </td>
                    <td className="px-4 py-3">
                      {member.customerProfile?.isActive ? (
                        <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#3F7B4F] border-[#3F7B4F]/30 bg-[#3F7B4F]/10">
                          Active
                        </span>
                      ) : (
                        <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#A89971] border-[#A89971]/30 bg-[#A89971]/10">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-[var(--mono)] text-[10px] text-[#6B6552]">
                      {formatDate(member.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
