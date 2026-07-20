export interface PlanLimit {
  maxConnectedAccounts: number;
  maxScheduledPostsPerMonth: number;
  maxAiRequestsPerMonth: number;
}

export const PLAN_LIMITS: Record<string, PlanLimit> = {
  FREE: {
    maxConnectedAccounts: 1,
    maxScheduledPostsPerMonth: 5,
    maxAiRequestsPerMonth: 10,
  },
  STARTER: {
    maxConnectedAccounts: 3,
    maxScheduledPostsPerMonth: 30,
    maxAiRequestsPerMonth: 50,
  },
  PRO: {
    maxConnectedAccounts: 5,
    maxScheduledPostsPerMonth: 100,
    maxAiRequestsPerMonth: 200,
  },
  BUSINESS: {
    maxConnectedAccounts: 10,
    maxScheduledPostsPerMonth: 500,
    maxAiRequestsPerMonth: 1000,
  },
  ENTERPRISE: {
    maxConnectedAccounts: 99999, // practically unlimited
    maxScheduledPostsPerMonth: 99999,
    maxAiRequestsPerMonth: 99999,
  },
};
