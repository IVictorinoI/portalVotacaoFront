import { record } from '../auth/session-controller';
export const LEGACY_KEY = 'usuarioLogado';
export const LEGACY_OWNER = 'usuarioLogado:primaryOwner';
export interface LegacyUser extends Record<string, unknown> {
  _id: string;
  nome?: string;
}
export function legacyUser(value: unknown): LegacyUser | null {
  return record(value) && typeof value._id === 'string' && !!value._id
    ? (value as LegacyUser)
    : null;
}
export function readLegacy(
  storage: Pick<Storage, 'getItem'>,
  primaryId: string,
): LegacyUser | null {
  try {
    const user = legacyUser(JSON.parse(storage.getItem(LEGACY_KEY) ?? 'null'));
    const owner = storage.getItem(LEGACY_OWNER);
    return user && (owner === primaryId || (!owner && user._id === primaryId))
      ? user
      : null;
  } catch {
    return null;
  }
}
export function legacyLoginUrl(login: string, senha: string) {
  return '/usuarios?sort=-_id&login=' + login + '&senha=' + senha;
}
