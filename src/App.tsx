import { useEffect, useMemo, useState } from 'react';
import { categoryLabels, categoryOrder } from './data/defaults';
import type { Rig, ShoppingItem } from './data/types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSupabase } from './hooks/useSupabase';

import { AdminGate } from './components/layout/AdminGate';
import { BottomNav, type Tab } from './components/layout/BottomNav';

import { HeroHeader } from './components/stream-report/HeroHeader';
import { WaterVitals } from './components/stream-report/WaterVitals';
import { ActiveHatches } from './components/stream-report/ActiveHatches';
import { StrategyCard } from './components/stream-report/StrategyCard';
import { FeaturedRig } from './components/stream-report/FeaturedRig';
import { ForecastCard } from './components/stream-report/ForecastCard';

import { FilterTabs, type RigFilter } from './components/rigs/FilterTabs';
import { RigPhotoCard } from './components/rigs/RigPhotoCard';
import { SpecimenHighlight } from './components/rigs/SpecimenHighlight';

import { ShoppingHeader } from './components/shopping/ShoppingHeader';
import { ShoppingCategoryGroup } from './components/shopping/ShoppingCategoryGroup';
import { GearCheck } from './components/shopping/GearCheck';

import { FlyIdentifier } from './components/fly-id/FlyIdentifier';
import { AdminIntake } from './components/admin/AdminIntake';

type Route = 'home' | 'admin';

function getRoute(): Route {
  return window.location.hash.startsWith('#/admin') ? 'admin' : 'home';
}

function shoppingKey(item: ShoppingItem): string {
  return `${item.name}__${item.sizes}`;
}

function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f2efe8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1 -2 2h-18a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l2 -3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute());
  const [tab, setTab] = useState<Tab>('stream-report');
  const [showIdentifier, setShowIdentifier] = useState(false);
  const [rigFilter, setRigFilter] = useState<RigFilter>('all');

  const [favorites, setFavorites] = useLocalStorage<Record<string, boolean>>(
    'davidson-favorites',
    {}
  );
  const [notes, setNotes] = useLocalStorage<Record<string, string>>(
    'davidson-notes',
    {}
  );
  const [shoppingChecks, setShoppingChecks] = useLocalStorage<Record<string, boolean>>(
    'davidson-shopping-checks',
    {}
  );
  const [gearChecks, setGearChecks] = useLocalStorage<Record<string, boolean>>(
    'davidson-gear-checks',
    {}
  );

  const { conditions, rigs, shoppingList, gear } = useSupabase();

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const savedCount = useMemo(
    () => Object.values(favorites).filter(Boolean).length,
    [favorites]
  );

  const featuredRig = useMemo<Rig | undefined>(
    () => rigs.find((r) => r.hot) ?? rigs[0],
    [rigs]
  );

  const visibleRigs = useMemo(() => {
    if (rigFilter === 'all') return rigs;
    if (rigFilter === 'saved') return rigs.filter((r) => favorites[r.id]);
    return rigs.filter((r) => r.section === rigFilter);
  }, [rigFilter, favorites, rigs]);

  const shoppingByCategory = useMemo(() => {
    return categoryOrder.map((cat) => ({
      category: cat,
      label: categoryLabels[cat],
      items: shoppingList.filter((s) => s.category === cat),
    }));
  }, [shoppingList]);

  const packedCount = useMemo(
    () => shoppingList.filter((s) => shoppingChecks[shoppingKey(s)]).length,
    [shoppingList, shoppingChecks]
  );

  const toggleFavorite = (id: string) =>
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));

  const setNote = (id: string, value: string) =>
    setNotes((prev) => {
      const next = { ...prev };
      if (value) next[id] = value;
      else delete next[id];
      return next;
    });

  const toggleShopping = (key: string) =>
    setShoppingChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleGear = (name: string) =>
    setGearChecks((prev) => ({ ...prev, [name]: !prev[name] }));

  const scrollToForecast = () => {
    document.getElementById('forecast-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (route === 'admin') {
    return (
      <AdminGate onExit={() => {
        window.location.hash = '';
        setRoute('home');
      }}>
        <AdminIntake />
      </AdminGate>
    );
  }

  return (
    <div className="min-h-dvh bg-page-bg text-text-primary mx-auto max-w-[480px] relative shadow-[0_0_60px_rgba(26,46,36,0.08)]">
      {tab === 'stream-report' && (
        <>
          <HeroHeader
            label="Stream report"
            title="Davidson River"
            subtitle={conditions.updated}
            variant="tall"
          />
          <WaterVitals conditions={conditions} />
          <section className="px-4 pt-4 pb-28 flex flex-col gap-4">
            <ActiveHatches hatches={conditions.hatches} />
            <StrategyCard conditions={conditions} onViewForecast={scrollToForecast} />
            {featuredRig && <FeaturedRig rig={featuredRig} />}
            <ForecastCard />
          </section>
        </>
      )}

      {tab === 'rigs' && (
        <>
          <HeroHeader
            label="Field rigs"
            title="Rig Library"
            subtitle={`${rigs.length} rigs · updated ${conditions.updated}`}
            variant="short"
          />
          <FilterTabs
            active={rigFilter}
            onChange={setRigFilter}
            savedCount={savedCount}
          />
          <section className="px-4 pt-2 pb-28 flex flex-col gap-4">
            {visibleRigs.length === 0 ? (
              <div className="text-center py-12 text-[13px] text-text-muted italic">
                {rigFilter === 'saved'
                  ? 'No starred rigs yet. Tap ☆ on any rig to save it.'
                  : 'No rigs to show.'}
              </div>
            ) : (
              visibleRigs.map((rig) => (
                <RigPhotoCard
                  key={rig.id}
                  rig={rig}
                  isSaved={!!favorites[rig.id]}
                  onToggleSave={() => toggleFavorite(rig.id)}
                  note={notes[rig.id] ?? ''}
                  onNoteChange={(v) => setNote(rig.id, v)}
                />
              ))
            )}
            {featuredRig && featuredRig.flies[0] && (
              <SpecimenHighlight
                fly={featuredRig.flies[0]}
                description={
                  featuredRig.description ??
                  'A standout pattern working on the Davidson right now.'
                }
                tyingNotes={featuredRig.tip}
              />
            )}
          </section>
        </>
      )}

      {tab === 'shopping' && (
        <>
          <HeroHeader
            label="Shopping"
            title="Box Check"
            subtitle="What to restock before your next trip"
            variant="short"
          />
          <ShoppingHeader packed={packedCount} total={shoppingList.length} />
          <section className="px-4 pt-2 pb-28 flex flex-col gap-5">
            {shoppingByCategory.map(({ category, label, items }) =>
              items.length > 0 ? (
                <ShoppingCategoryGroup
                  key={category}
                  label={label}
                  items={items}
                  checks={shoppingChecks}
                  onToggle={toggleShopping}
                />
              ) : null
            )}
            {gear.length > 0 && (
              <GearCheck items={gear} checks={gearChecks} onToggle={toggleGear} />
            )}
          </section>
        </>
      )}

      <button
        type="button"
        aria-label="Identify a fly"
        onClick={() => setShowIdentifier(true)}
        className="fixed bottom-[88px] w-[52px] h-[52px] rounded-full bg-accent-green shadow-[0_6px_18px_rgba(26,46,36,0.35)] flex items-center justify-center z-40"
        style={{ right: 'max(16px, calc(50vw - 240px + 16px))' }}
      >
        <CameraIcon />
      </button>

      <BottomNav active={tab} onChange={setTab} />

      {showIdentifier && (
        <FlyIdentifier rigs={rigs} onClose={() => setShowIdentifier(false)} />
      )}
    </div>
  );
}
