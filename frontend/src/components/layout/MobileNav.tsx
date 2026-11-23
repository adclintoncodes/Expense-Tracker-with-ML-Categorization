import { NavLink } from 'react-router-dom'
import { BarChart3, Home, Info, Settings } from 'lucide-react'
import clsx from 'clsx'

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/about', label: 'About', icon: Info },
]

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur md:hidden">
      <ul className="flex items-stretch justify-around">
        {links.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-semibold',
                  isActive ? 'text-brand-600' : 'text-slate-400',
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
