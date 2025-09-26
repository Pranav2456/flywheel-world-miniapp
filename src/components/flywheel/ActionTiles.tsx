'use client';

import Link from 'next/link';

interface ActionTile {
  href: string;
  label: string;
  description: string;
}

const defaultTiles: ActionTile[] = [
  {
    href: '/requester',
    label: 'Create Request',
    description: 'Set leverage targets and guardrails for resolvers to follow.',
  },
  {
    href: '/requests',
    label: 'Browse Missions',
    description: 'Review open leverage missions and accept one to start.',
  },
  {
    href: '/resolver',
    label: 'My Settlements',
    description: 'Track commissions, payouts, and settlement references.',
  },
];

export const ActionTiles = ({ tiles = defaultTiles }: { tiles?: ActionTile[] }) => {
  return (
    <section className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-base font-semibold">Take action</p>
      <div className="grid gap-3">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="grid gap-1 rounded-xl border border-gray-100 p-4 text-left hover:border-primary-200"
          >
            <p className="text-sm font-semibold">{tile.label}</p>
            <p className="text-xs text-gray-500">{tile.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};



