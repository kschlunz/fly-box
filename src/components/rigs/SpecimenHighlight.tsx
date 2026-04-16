import type { Fly } from '../../data/types';

type Props = {
  fly: Fly;
  description: string;
  tyingNotes: string;
};

function SpecimenIcon() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2c5a42"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.5"
    >
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c0 -5 -4 -7 -8 -7" />
      <path d="M12 10c0 -5 4 -7 8 -7" />
      <path d="M12 14c0 4 -3 6 -7 6" />
      <path d="M12 14c0 4 3 6 7 6" />
    </svg>
  );
}

export function SpecimenHighlight({ fly, description, tyingNotes }: Props) {
  return (
    <section className="mx-4 bg-accent-cream rounded-[16px] overflow-hidden">
      <div className="relative w-full h-[180px] rig-photo-fallback flex items-center justify-center">
        <SpecimenIcon />
        <span className="absolute top-3 left-3 bg-header-bg text-header-text text-[10px] font-semibold uppercase tracking-[0.16em] px-3 py-1 rounded-[14px]">
          Specimen Highlight
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-display italic text-[24px] font-semibold text-text-primary leading-tight">
            {fly.name}
          </h3>
          <div className="text-[12px] uppercase tracking-[0.14em] font-semibold text-text-muted">
            {fly.size}
            {fly.descriptor && <span className="normal-case tracking-normal font-medium text-text-secondary italic"> · {fly.descriptor}</span>}
          </div>
        </div>

        <p className="text-[14px] text-text-secondary leading-relaxed">{description}</p>

        <div className="border-t border-card-border pt-3 mt-1 flex flex-col gap-1.5">
          <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-text-muted">
            Tying Notes
          </div>
          <p className="text-[13px] italic text-text-secondary leading-relaxed">{tyingNotes}</p>
        </div>
      </div>
    </section>
  );
}
