import {
  BookOpen,
  Camera,
  Coffee,
  Headphones,
  Leaf,
  MapPin,
  Music,
  Palette,
  ShoppingBag,
  Sprout,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import type { Audience, Position } from '../domain/types'

interface GridObjectIconsProps {
  readonly audience: Exclude<Audience, 'children'>
  readonly positions: readonly Position[]
}

const icons: Record<Exclude<Audience, 'children'>, readonly LucideIcon[]> = {
  teens: [Music, Trophy, Palette, Camera, Headphones, MapPin],
  adults: [BookOpen, Coffee, Sprout, Leaf, ShoppingBag, MapPin],
}

export const GridObjectIcons = ({ audience, positions }: GridObjectIconsProps) => {
  const columns = Math.max(...positions.map((position) => position.column)) + 1
  const IconSet = icons[audience]

  return (
    <div
      className="grid-object-icons"
      style={{ '--grid-columns': columns } as React.CSSProperties}
      aria-hidden="true"
    >
      {Array.from({ length: columns }, (_, column) => {
        const Icon = IconSet[column % IconSet.length]!
        return (
          <span key={column} className="grid-object-icons__item">
            <Icon size={17} strokeWidth={2.6} />
          </span>
        )
      })}
    </div>
  )
}
