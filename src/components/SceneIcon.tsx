import { lazy, Suspense } from 'react'

const SceneIconSvg = lazy(() =>
  import('./SceneIconSvg').then((module) => ({ default: module.SceneIconSvg })),
)

interface SceneIconProps {
  readonly emoji: string
  readonly className?: string
}

export const SceneIcon = ({ emoji, className }: SceneIconProps) => {
  const classes = ['scene-icon', className].filter(Boolean).join(' ')

  return (
    <Suspense
      fallback={
        <span className={classes} aria-hidden="true">
          {emoji}
        </span>
      }
    >
      <SceneIconSvg emoji={emoji} className={classes} />
    </Suspense>
  )
}
