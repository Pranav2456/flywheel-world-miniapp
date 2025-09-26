'use client';

interface RoleSnapshotProps {
  role: 'requester' | 'resolver' | 'both';
  activeAssignments: number;
  pendingRequests: number;
}

const roleCopy: Record<RoleSnapshotProps['role'], string> = {
  requester: 'Requester Mode',
  resolver: 'Resolver Mode',
  both: 'Dual Mode',
};

const roleHint: Record<RoleSnapshotProps['role'], string> = {
  requester: 'Create new leverage missions to let resolvers manage on your behalf.',
  resolver: 'Claim missions and keep leverage within safety guardrails.',
  both: 'You can create and resolve missions. Switch modes as needed.',
};

export const RoleSnapshot = ({
  role,
  activeAssignments,
  pendingRequests,
}: RoleSnapshotProps) => {
  return (
    <section className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold leading-none">
            {roleCopy[role]}
          </p>
          <p className="text-sm text-gray-500">{roleHint[role]}</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-primary-200 px-3 py-1 text-sm font-semibold text-primary-600"
        >
          Switch role
        </button>
      </header>
      <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
        <div className="rounded-xl bg-primary-50 p-3">
          <p className="text-xs uppercase text-primary-500">Active missions</p>
          <p className="text-lg text-primary-800">{activeAssignments}</p>
        </div>
        <div className="rounded-xl bg-gray-100 p-3">
          <p className="text-xs uppercase text-gray-500">Pending requests</p>
          <p className="text-lg text-gray-800">{pendingRequests}</p>
        </div>
      </div>
    </section>
  );
};


