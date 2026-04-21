import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
export { hasPermission, canManageUser } from '$lib/utils/permissions';

// ─── Carrega permissões explícitas do banco (para caretakers / roles customizadas)
export async function getUserPermissions(
	supabase: SupabaseClient<Database>,
	userId: string
): Promise<string[]> {
	const { data, error } = await supabase.rpc('get_user_permissions', {
		p_user_id: userId
	});

	if (error) {
		console.error('getUserPermissions error:', error.message);
		return [];
	}

	return (data ?? []).map((row: { name: string }) => row.name);
}

// ─── Roles e permissões para o painel admin ───────────────────────────────────
export interface RoleWithPermissions {
	id: string;
	name: string;
	description: string | null;
	is_system: boolean;
	permissions: string[];
}

export async function fetchRolesWithPermissions(
	supabase: SupabaseClient<Database>
): Promise<RoleWithPermissions[]> {
	const { data: roles, error: rolesErr } = await supabase
		.from('roles')
		.select('id, name, description, is_system')
		.order('name');

	if (rolesErr || !roles) return [];

	const { data: rp, error: rpErr } = await supabase
		.from('role_permissions')
		.select('role_id, permissions(name)');

	if (rpErr) return roles.map((r) => ({ ...r, permissions: [] }));

	const permsByRole: Record<string, string[]> = {};
	for (const row of rp ?? []) {
		if (!permsByRole[row.role_id]) permsByRole[row.role_id] = [];
		const perm = row.permissions as unknown as { name: string } | null;
		if (perm?.name) permsByRole[row.role_id].push(perm.name);
	}

	return roles.map((r) => ({ ...r, permissions: permsByRole[r.id] ?? [] }));
}

export async function fetchAllPermissions(
	supabase: SupabaseClient<Database>
): Promise<{ id: string; name: string; description: string | null }[]> {
	const { data, error } = await supabase
		.from('permissions')
		.select('id, name, description')
		.order('name');

	if (error) return [];
	return data ?? [];
}

export async function assignPermissionToRole(
	supabase: SupabaseClient<Database>,
	roleId: string,
	permissionId: string
): Promise<void> {
	const { error } = await supabase
		.from('role_permissions')
		.insert({ role_id: roleId, permission_id: permissionId });

	if (error) throw new Error(error.message);
}

export async function removePermissionFromRole(
	supabase: SupabaseClient<Database>,
	roleId: string,
	permissionId: string
): Promise<void> {
	const { error } = await supabase
		.from('role_permissions')
		.delete()
		.eq('role_id', roleId)
		.eq('permission_id', permissionId);

	if (error) throw new Error(error.message);
}

// ─── User roles ───────────────────────────────────────────────────────────────
export async function assignRoleToUser(
	supabase: SupabaseClient<Database>,
	userId: string,
	roleId: string,
	assignedBy: string
): Promise<void> {
	const { error } = await supabase
		.from('user_roles')
		.insert({ user_id: userId, role_id: roleId, assigned_by: assignedBy });

	if (error) throw new Error(error.message);
}

export async function removeRoleFromUser(
	supabase: SupabaseClient<Database>,
	userId: string,
	roleId: string
): Promise<void> {
	const { error } = await supabase
		.from('user_roles')
		.delete()
		.eq('user_id', userId)
		.eq('role_id', roleId);

	if (error) throw new Error(error.message);
}
