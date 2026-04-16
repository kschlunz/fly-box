import type { TackleBoxFly } from '../../data/types';

type Props = {
  fly: TackleBoxFly;
  onTap: () => void;
};

export function FlyCard({ fly, onTap }: Props) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="relative aspect-square rounded-[16px] overflow-hidden border border-card-border bg-card-bg text-left group"
    >
      <img
        src={fly.primaryPhotoUrl}
        alt={fly.name}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {fly.size && (
        <span className="absolute top-1.5 right-1.5 bg-card-bg/90 backdrop-blur text-text-primary text-[9px] font-semibold px-1.5 py-0.5 rounded-[8px]">
          {fly.size}
        </span>
      )}

      {fly.count > 1 && (
        <span className="absolute bottom-8 right-1.5 bg-accent-green text-header-text text-[9px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">
          ×{fly.count}
        </span>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2">
        <div className="text-[12px] font-semibold text-white leading-tight line-clamp-2">
          {fly.name}
        </div>
      </div>
    </button>
  );
}
