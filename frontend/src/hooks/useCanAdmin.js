import { useAuthStore } from '../store/authStore';
import { useRbacStore } from '../store/rbacStore';
import { IS_DEV, isWebErpRole } from '../constants/rbac';

/** Web ERP roles + dev mode get full access; others use RBAC module permissions. */
export function useCanAdmin(module, action = 'read') {
  const user = useAuthStore((s) => s.user);
  const hasPermission = useRbacStore((s) => s.hasPermission);
  if (!user) return false;
  if (IS_DEV || isWebErpRole(user.role)) return true;
  const userId = user.id || user._id;
  if (!module) return true;
  return hasPermission(userId, module, action);
}

export function useIsAdmin() {
  const role = useAuthStore((s) => s.user?.role);
  return IS_DEV || isWebErpRole(role);
}
