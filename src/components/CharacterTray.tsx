import type { Character } from '../domain/types'
import { CharacterToken } from './CharacterToken'

interface CharacterTrayProps {
  readonly characters: readonly Character[]
  readonly selectedCharacterId?: Character['id']
  readonly onSelect: (character: Character) => void
  readonly label: string
}

export const CharacterTray = ({
  characters,
  selectedCharacterId,
  onSelect,
  label,
}: CharacterTrayProps) => (
  <section className="character-tray" aria-label={label}>
    <div className="character-tray__tokens">
      {characters.map((character) => (
        <CharacterToken
          key={character.id}
          character={character}
          selected={selectedCharacterId === character.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  </section>
)
