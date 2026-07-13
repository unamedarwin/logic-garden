export type CheckFeedback = {
  readonly type: 'assignment-incomplete' | 'assignment-incorrect' | 'assignment-correct'
  readonly correctCount: number
  readonly totalCount: number
}

export type GameFeedback =
  | CheckFeedback
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

export const isCheckFeedback = (feedback: GameFeedback): feedback is CheckFeedback =>
  feedback.type === 'assignment-incomplete' ||
  feedback.type === 'assignment-incorrect' ||
  feedback.type === 'assignment-correct'
