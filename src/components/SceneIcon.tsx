import { lazy, Suspense } from 'react'

const SceneIconSvg = lazy(() =>
  import('../assets/generated/fluentIconData').then(({ fluentIconData }) => ({
    default: ({ emoji, className }: SceneIconProps) => {
      const icon = fluentIconData[emoji]

      return icon ? (
        <svg
          className={className}
          data-scene-icon={emoji}
          viewBox={`0 0 ${icon.width ?? 32} ${icon.height ?? 32}`}
          aria-hidden="true"
          focusable="false"
          // This body is generated at build time from the reviewed local Fluent asset subset.
          dangerouslySetInnerHTML={{ __html: icon.body }}
        />
      ) : (
        <span className={className} data-scene-icon={emoji} aria-hidden="true">
          {emoji}
        </span>
      )
    },
  })),
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
