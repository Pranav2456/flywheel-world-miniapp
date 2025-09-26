'use client';

import { Button, TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';
import { useState } from 'react';

export type RequesterMissionStatus = 'active' | 'settlement' | 'history';

export interface RequesterMission {
  id: string;
  title: string;
  status: RequesterMissionStatus;
  collateral: string;
  leverage: string;
  pnl: string;
}

const statusLabel: Record<RequesterMissionStatus, string> = {
  active: 'Active',
  settlement: 'Pending settlement',
  history: 'History',
};

export const RequesterMissions = ({ missions }: { missions: RequesterMission[] }) => {
  const [currentTab, setCurrentTab] = useState<RequesterMissionStatus>('active');

  const filteredMissions = missions.filter((mission) => mission.status === currentTab);

  return (
    <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold">My leverage missions</p>
          <p className="text-xs text-gray-500">
            Track active strategies, pending settlements, and history.
          </p>
        </div>
        <Link href="/requester" className="inline-flex">
          <Button size="sm" variant="primary">
            Create request
          </Button>
        </Link>
      </header>
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as RequesterMissionStatus)}>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <TabItem value="active" label="Active" icon={<span />} />
          <TabItem value="settlement" label="Pending settlement" icon={<span />} />
          <TabItem value="history" label="History" icon={<span />} />
        </div>
      </Tabs>
      <div className="grid gap-3">
        {filteredMissions.length === 0 ? (
          <p className="rounded-xl bg-gray-100 p-4 text-sm text-gray-500">
            {currentTab === 'active'
              ? 'No active missions yet. Create one to get started.'
              : currentTab === 'settlement'
              ? 'No missions awaiting settlement right now.'
              : 'Historical missions will appear here once completed.'}
          </p>
        ) : (
          filteredMissions.map((mission) => (
            <div
              key={mission.id}
              className="grid gap-2 rounded-xl border border-gray-100 p-4 text-sm"
            >
              <div className="flex items-center justify-between">
                <div className="grid gap-1">
                  <p className="font-semibold">{mission.title}</p>
                  <p className="text-xs text-gray-500">
                    {mission.collateral} · {mission.leverage} leverage
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  {statusLabel[mission.status]}
                </span>
              </div>
              <p className="text-xs text-gray-500">PnL: {mission.pnl}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="grow">
                  View details
                </Button>
                {mission.status !== 'history' ? (
                  <Button size="sm" variant="tertiary" className="grow">
                    {mission.status === 'settlement' ? 'Settle / Withdraw' : 'Update guardrails'}
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};


