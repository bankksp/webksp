export const SUPER_ADMIN_EMAIL = 'nanthaphat@ksp.ac.th';

export type SessionUser = {
  id?: string;
  email?: string;
  role?: string;
  status?: string;
  idCard?: string;
  name?: string;
  imageUrl?: string;
};

export function isAdminRole(role?: string): boolean {
  return String(role || '').toLowerCase() === 'admin';
}

/** ตรวจสิทธิ์แอดมิน — role=admin ใน Users/Staff หรือ super admin email */
export function isSiteAdmin(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  if (isAdminRole(user.role)) return true;
  return user.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL;
}

export function resolveAdminRole(userRole?: string, staffRole?: string): string {
  if (isAdminRole(userRole) || isAdminRole(staffRole)) return 'admin';
  return userRole || staffRole || 'user';
}
