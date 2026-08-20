import { useAuditContext } from '../context/AuditContext';

export function useAudit() {
  return useAuditContext();
}
