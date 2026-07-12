interface UpdatePromptProps {
  readonly message: string
  readonly action: string
  readonly onUpdate: () => void
}

export const UpdatePrompt = ({ message, action, onUpdate }: UpdatePromptProps) => (
  <aside className="update-prompt" role="status">
    <span>{message}</span>
    <button type="button" onClick={onUpdate}>
      {action}
    </button>
  </aside>
)
