import type { ShoppingItem } from '../../data/types';
import { ShoppingRow } from './ShoppingRow';

type Props = {
  label: string;
  items: ShoppingItem[];
  checks: Record<string, boolean>;
  onToggle: (key: string) => void;
};

function keyFor(item: ShoppingItem): string {
  return `${item.name}__${item.sizes}`;
}

export function ShoppingCategoryGroup({ label, items, checks, onToggle }: Props) {
  if (items.length === 0) return null;
  const checkedCount = items.filter((it) => checks[keyFor(it)]).length;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between px-1">
        <h3 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-text-muted">
          {label}
        </h3>
        <div className="text-[11px] text-text-muted font-medium">
          {checkedCount}/{items.length}
        </div>
      </div>
      <div className="bg-card-bg rounded-[16px] border border-card-border px-4">
        {items.map((item, i) => {
          const key = keyFor(item);
          return (
            <ShoppingRow
              key={key}
              item={item}
              checked={!!checks[key]}
              onToggle={() => onToggle(key)}
              isLast={i === items.length - 1}
            />
          );
        })}
      </div>
    </section>
  );
}
