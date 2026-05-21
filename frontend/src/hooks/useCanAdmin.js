import { useAuthStore } from '../store/authStore';
import { useRbacStore } from '../store/rbacStore';

/** ADMIN gets full access; other roles use RBAC module permissions. */
export function useCanAdmin(module, action = 'read') {
  const user = useAuthStore((s) => s.user);
  const hasPermission = useRbacStore((s) => s.hasPermission);
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  const userId = user.id || user._id;
  if (!module) return true;
  return hasPermission(userId, module, action);
}

export function useIsAdmin() {
  return useAuthStore((s) => s.user?.role === 'ADMIN');
}
