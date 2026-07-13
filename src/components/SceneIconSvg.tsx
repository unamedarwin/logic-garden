import { Icon } from '@iconify/react/offline'
import { fluentIconData } from '../assets/generated/fluentIconData'

interface SceneIconSvgProps {
  readonly emoji: string
  readonly className: string
}

export const SceneIconSvg = ({ emoji, className }: SceneIconSvgProps) => {
  const icon = fluentIconData[emoji]

  return icon ? (
    <Icon
      icon={icon}
      className={className}
      data-scene-icon={emoji}
      aria-hidden="true"
      focusable="false"
    />
  ) : (
    <span className={className} data-scene-icon={emoji} aria-hidden="true">
      {emoji}
    </span>
  )
}
