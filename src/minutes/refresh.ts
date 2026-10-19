// Um evento recebido durante GET não pode se limitar ao snapshot já em voo.
export async function refreshAfterEvent(
  query: { isFetching: () => boolean; refetch: () => Promise<unknown> },
  current: () => boolean,
): Promise<void> {
  if (!current()) return;
  const pending = query.isFetching();
  await query.refetch();
  if (pending && current()) await query.refetch();
}
