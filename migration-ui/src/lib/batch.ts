export interface BatchResult {
  completed: number;
  stopped: boolean;
  error?: unknown;
  busy?: boolean;
}
// Single synchronous owner for individual/bulk intentions on the same page.
export class BatchRunner {
  busy = false;
  async run<T>(
    items: readonly T[],
    current: () => boolean,
    allowed: () => boolean,
    write: (item: T) => Promise<void>,
    confirmed: (item: T) => void,
  ): Promise<BatchResult> {
    if (this.busy) return { completed: 0, stopped: false, busy: true };
    this.busy = true;
    let completed = 0;
    try {
      for (const item of items) {
        if (!current() || !allowed()) return { completed, stopped: true };
        try {
          await write(item);
        } catch (error: unknown) {
          return { completed, stopped: true, error };
        }
        // A completed server write must never update the next session/page.
        if (!current()) return { completed, stopped: true };
        completed++;
        confirmed(item);
      }
      return { completed, stopped: false };
    } finally {
      this.busy = false;
    }
  }
}
