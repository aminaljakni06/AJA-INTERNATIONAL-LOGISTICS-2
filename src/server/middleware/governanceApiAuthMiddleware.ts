import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth';

const GOVERNANCE_API_ROLES = new Set([
  'SUPER_ADMIN',
  'SYSTEM_ADMIN',
  'PLATFORM_ADMIN',
  'ADMIN',
  'ERP_ADMIN',
  'CEO',
  'COO',
  'CFO',
  'AUDITOR',
  'COMPLIANCE_OFFICER',
  'LEGAL_COUNSEL',
]);

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

export function requireGovernanceApiAccess(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const user = req.user as any;
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const role = typeof user.role === 'string' ? user.role : 'GUEST';
  const grants = [...getStringArray(user.permissions), ...getStringArray(user.customPermissions)];
  const hasGovernanceGrant = grants.some(
    (grant) => grant === '*' || grant === 'governance:*' || grant.startsWith('governance:')
  );

  if (GOVERNANCE_API_ROLES.has(role) || hasGovernanceGrant) {
    next();
    return;
  }

  res.status(403).json({ error: 'Governance API access forbidden.' });
}
