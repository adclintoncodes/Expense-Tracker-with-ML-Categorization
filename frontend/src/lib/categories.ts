import type { Category, CategoryName } from '../types'
import {
  ShoppingBag,
  UtensilsCrossed,
  ShoppingCart,
  Car,
  MoreHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const CATEGORY_META: Record<
  CategoryName,
  { color: string; soft: string; icon: LucideIcon; key: string }
> = {
  'Food & Dining': {
    color: '#800020',
    soft: '#FCE7EB',
    icon: UtensilsCrossed,
    key: 'food',
  },
  Shopping: {
    color: '#EC4899',
    soft: '#FCE7F3',
    icon: ShoppingBag,
    key: 'shopping',
  },
  Groceries: {
    color: '#F97316',
    soft: '#FFF7ED',
    icon: ShoppingCart,
    key: 'groceries',
  },
  Transportation: {
    color: '#8B5CF6',
    soft: '#F5F3FF',
    icon: Car,
    key: 'transport',
  },
  Other: {
    color: '#3B82F6',
    soft: '#EFF6FF',
    icon: MoreHorizontal,
    key: 'other',
  },
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Food & Dining', color: '#800020', budget_limit: 200, icon: 'utensils' },
  { id: 2, name: 'Shopping', color: '#EC4899', budget_limit: 150, icon: 'bag' },
  { id: 3, name: 'Groceries', color: '#F97316', budget_limit: 250, icon: 'cart' },
  { id: 4, name: 'Transportation', color: '#8B5CF6', budget_limit: 100, icon: 'car' },
  { id: 5, name: 'Other', color: '#3B82F6', budget_limit: 80, icon: 'other' },
]

export function getCategoryMeta(name: string) {
  return (
    CATEGORY_META[name as CategoryName] ?? {
      color: '#3B82F6',
      soft: '#EFF6FF',
      icon: MoreHorizontal,
      key: 'other',
    }
  )
}

export function resolveCategoryName(categories: Category[], id: number): string {
  return categories.find((c) => c.id === id)?.name ?? 'Other'
}
