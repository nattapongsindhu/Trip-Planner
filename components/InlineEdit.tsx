'use client'

// Reusable inline-edit component
// Click the text to turn it into an input. Blur or Enter saves. Escape cancels.
// Supports single-line text, multi-line textarea, and number input.
import { useState, useRef, useEffect } from 'react'

type Props = {
  value: string | number | null
  onSave: (newValue: string) => Promise<void> | void
  placeholder?: string
  type?: 'text' | 'textarea' | 'number'
  className?: string      // styling for the display span
  inputClassName?: string // styling for the input while editing
  prefix?: string         // e.g. '€' shown before the value
  disabled?: boolean
}

export function InlineEdit({
  value,
  onSave,
  placeholder = 'Click to edit',
  type = 'text',
  className = '',
  inputClassName = '',
  prefix,
  disabled,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(String(value ?? ''))
  const [saving, setSaving]   = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // keep draft in sync when external value changes (after save/refresh)
  useEffect(() => { setDraft(String(value ?? '')) }, [value])

  // focus + select text when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (type !== 'textarea') (inputRef.current as HTMLInputElement).select()
    }
  }, [editing, type])

  async function commit() {
    const clean = draft.trim()
    if (clean === String(value ?? '').trim()) {
      setEditing(false)
      return
    }
    setSaving(true)
    try { await onSave(clean) } finally { setSaving(false) }
    setEditing(false)
  }

  function cancel() {
    setDraft(String(value ?? ''))
    setEditing(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { e.preventDefault(); cancel() }
    if (e.key === 'Enter' && type !== 'textarea') { e.preventDefault(); commit() }
    if (e.key === 'Enter' && type === 'textarea' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit() }
  }

  if (!editing) {
    const display = value === null || value === '' ? placeholder : `${prefix ?? ''}${value}`
    const isEmpty = value === null || value === ''
    return (
      <span
        onClick={() => !disabled && setEditing(true)}
        className={`${className} ${disabled ? '' : 'cursor-text hover:bg-muted/40 -mx-1 px-1 rounded transition-colors'} ${isEmpty ? 'text-muted-foreground/60 italic' : ''}`}
        title={disabled ? undefined : 'Click to edit'}
      >
        {display}
      </span>
    )
  }

  const commonProps = {
    ref: inputRef as any,
    value: draft,
    onChange: (e: React.ChangeEvent<any>) => setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: handleKey,
    disabled: saving,
    className: `${inputClassName} bg-background border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-full`,
  }

  if (type === 'textarea') {
    return <textarea {...commonProps} rows={3} />
  }

  return <input type={type} {...commonProps} />
}
