import { supabase } from './supabaseClient'

export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('role, township_id')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export function isSuperAdmin(role: string | null) {
  return role === 'super_admin'
}

export function isAdmin(role: string | null) {
  return role === 'admin' || role === 'super_admin'
}

export function isTownshipAdmin(role: string | null) {
  return role === 'admin'
}