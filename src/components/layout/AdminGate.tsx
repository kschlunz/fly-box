import { useState } from 'react';

type Props = {
  children: React.ReactNode;
  onExit: () => void;
};

const SESSION_KEY = 'davidson-fly-box-admin';

function isUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}

export function getStoredAdminPass(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function AdminGate({ children, onExit }: Props) {
  const [unlocked, setUnlocked] = useState(isUnlocked());
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = () => {
    const expected = import.meta.env.VITE_ADMIN_PASS;
    if (!expected) {
      setError('Admin pass not configured');
      return;
    }
    if (input !== expected) {
      setError('Wrong passphrase');
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, input);
    } catch {}
    setUnlocked(true);
    setError(null);
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-dvh bg-page-bg text-text-primary mx-auto max-w-[480px] px-5 py-12 flex flex-col gap-4">
      <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-accent-green">
        RESTRICTED ACCESS
      </div>
      <h1 className="font-display text-[32px] font-bold leading-tight">Field Journal Admin</h1>
      <p className="text-[13px] text-text-secondary">
        Enter the admin passphrase to intake a new report.
      </p>
      <input
        type="password"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleUnlock();
        }}
        placeholder="Passphrase"
        className="w-full text-[14px] px-3 py-3 rounded-[12px] border border-card-border bg-card-bg text-text-primary focus:outline-none focus:border-accent-green"
        autoFocus
      />
      {error && <div className="text-[12px] text-accent-red">{error}</div>}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={handleUnlock}
          className="flex-1 min-h-[48px] rounded-[12px] bg-accent-green text-header-text text-[14px] font-semibold uppercase tracking-[0.1em]"
        >
          Unlock
        </button>
        <button
          type="button"
          onClick={onExit}
          className="min-h-[48px] px-4 text-[13px] text-text-secondary"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
