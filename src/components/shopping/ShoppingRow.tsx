import type { ShoppingItem } from '../../data/types';

type Props = {
  item: ShoppingItem;
  checked: boolean;
  onToggle: () => void;
  isLast: boolean;
};

function CheckboxIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <div className="w-6 h-6 rounded-[6px] bg-accent-green flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f2efe8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  return <div className="w-6 h-6 rounded-[6px] border-2 border-card-border bg-card-bg" />;
}

export function ShoppingRow({ item, checked, onToggle, isLast }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={`w-full flex items-start gap-3 py-3 min-h-[56px] text-left ${
        isLast ? '' : 'border-b border-card-border'
      }`}
    >
      <div className="pt-0.5 shrink-0">
        <CheckboxIcon checked={checked} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <div
            className={`text-[16px] font-semibold leading-tight ${
              checked ? 'text-text-muted line-through' : 'text-text-primary'
            }`}
          >
            {item.name}
          </div>
          <div className="text-[12px] text-text-muted font-medium">{item.sizes}</div>
        </div>
        {item.descriptor && (
          <div
            className={`text-[12px] mt-0.5 ${
              checked ? 'text-text-muted' : 'text-text-secondary'
            }`}
          >
            {item.descriptor}
          </div>
        )}
      </div>
      {typeof item.quantity === 'number' && item.quantity > 0 && (
        <div className="shrink-0 pt-1">
          <div
            className={`min-w-[28px] h-6 px-2 rounded-full flex items-center justify-center text-[11px] font-semibold ${
              checked
                ? 'bg-accent-cream text-text-muted'
                : 'bg-accent-green/10 text-accent-green'
            }`}
          >
            ×{item.quantity}
          </div>
        </div>
      )}
    </button>
  );
}
