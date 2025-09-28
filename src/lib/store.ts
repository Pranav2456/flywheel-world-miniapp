type RequestItem = {
  id: string;
  manager: string;
  title: string;
  description?: string;
  budgetToken: 'USDC' | 'WLD';
  budgetAmount: string;
  ownerWalletAddress?: string;
  createdAt: number;
};

type ExecutionLog = {
  id: string; // reference
  requestId: string;
  note?: string;
  ts: number;
};

const db = {
  requests: new Map<string, RequestItem>(),
  executions: new Map<string, ExecutionLog>(),
};

export const store = {
  upsertRequest(item: RequestItem) {
    db.requests.set(item.id, item);
    return item;
  },
  getRequest(id: string) {
    return db.requests.get(id) || null;
  },
  listRequests(limit = 50) {
    const items = Array.from(db.requests.values()).sort((a, b) => b.createdAt - a.createdAt);
    return items.slice(0, limit);
  },
  addExecution(log: ExecutionLog) {
    db.executions.set(log.id, log);
    return log;
  },
};


