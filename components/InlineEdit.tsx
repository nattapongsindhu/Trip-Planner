"use client";
import { useState, useRef, useEffect } from "react";

interface Props {
  value: string;
  onSave: (val: string) => Promise<void>;
  className?: string;
  inputClassName?: string;
  tag?: "h1" | "h2" | "h3" | "p" | "span";
}

export default function InlineEdit({
  value,
  onSave,
  className = "",
  inputClassName = "",
  tag: Tag = "span",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const handleSave = async () => {
    if (text.trim() === value) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(text.trim());
      setEditing(false);
    } catch (err) {
      console.error('InlineEdit save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") { setText(value); setEditing(false); }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKey}
        disabled={saving}
        className={`border-b border-blue-500 outline-none bg-transparent ${inputClassName}`}
      />
    );
  }

  return (
    <Tag
      className={`cursor-pointer hover:bg-gray-100 rounded px-1 ${className}`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {saving ? "..." : value}
    </Tag>
  );
}