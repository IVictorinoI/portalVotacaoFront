import { useSession } from './Session';
export function useReadySession() {
  const { state, controller } = useSession();
  if (state.status !== 'ready') throw new Error('Sessão não está pronta.');
  const current = () =>
    controller.state.status === 'ready' &&
    controller.state.generation === state.generation;
  const key = (resource: string, ...filters: unknown[]) =>
    [
      'scope',
      state.user.id,
      state.assembly,
      state.generation,
      resource,
      ...filters,
    ] as const;
  return { ...state, controller, current, key, http: controller.http };
}
