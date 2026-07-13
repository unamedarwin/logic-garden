export type GameFeedback =
  | { readonly type: 'assignment-incomplete' }
  | { readonly type: 'assignment-incorrect' }
  | { readonly type: 'assignment-correct' }
  | {
      readonly type: 'placement-conflicts-cleared'
      readonly characterName: string
      readonly clearedCount: number
    }
  | { readonly type: 'hint-person-required' }
  | { readonly type: 'hint-limit-reached' }
  | { readonly type: 'hint-puzzle-preparing' }
  | { readonly type: 'hint-ready-to-check' }
  | { readonly type: 'hint-highlighted-clue' }
  | { readonly type: 'hint-character-deducible'; readonly characterName: string }
  | {
      readonly type: 'hint-character-position'
      readonly characterName: string
      readonly positionLabel: string
    }
  | { readonly type: 'hint-already-correct'; readonly characterName: string }
  | { readonly type: 'hint-applied'; readonly characterName: string }
