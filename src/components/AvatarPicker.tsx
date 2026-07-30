import { useState } from 'react';
import { AVATAR_OPTIONS } from '../game/config';

interface AvatarPickerProps {
  value: string;
  onChange: (avatar: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="avatar-picker">
      <button
        type="button"
        className="avatar-picker-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Kies een avatar"
      >
        {value}
      </button>
      {open && (
        <div className="avatar-picker-grid">
          {AVATAR_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`avatar-option ${emoji === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
