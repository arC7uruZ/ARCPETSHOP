import type { UserRole } from '$lib/types';

// root_admin → acesso total
// admin      → acesso total (restrições de "gerenciar outros admins" são por contexto)
// outros     → verificam permissões explícitas
export function hasPermission(
	role: UserRole,
	permissions: string[],
	permission: string
): boolean {
	if (role === 'root_admin') return true;
	if (role === 'admin') return true;
	return permissions.includes(permission);
}

// Verifica se actorRole pode gerenciar um usuário com targetRole
export function canManageUser(actorRole: UserRole, targetRole: UserRole): boolean {
	if (actorRole === 'root_admin') return true;
	if (actorRole === 'admin') {
		return targetRole !== 'admin' && targetRole !== 'root_admin';
	}
	return false;
}
