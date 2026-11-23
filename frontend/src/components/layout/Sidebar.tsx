import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Home,
  Info,
  LogOut,
  Settings,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/about', label: 'About', icon: Info },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut } = useAuth()

  return (
    <aside className="flex h-full w-full flex-col bg-brand-600 text-white">
      <div className="flex items-center gap-3 px-5 pb-6 pt-7">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <ShoppingCart className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-tight tracking-tight">
            Expense Tracker
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/75 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-5 pb-6 pt-4">
        <button
          type="button"
          onClick={() => {
            signOut()
            onNavigate?.()
          }}
          className="mb-4 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
        <div className="border-t border-white/20 pt-4">
          <p className="flex items-center gap-2 text-xs font-medium text-white/80">
            Track smart. Spend better.
            <TrendingUp className="h-3.5 w-3.5 text-pink-200" />
          </p>
        </div>
      </div>
    </aside>
  )
}
