import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { readConfig } from '../src/lib/config.ts';
try {
  readConfig(
    loadEnv(
      'production',
      fileURLToPath(new URL('../', import.meta.url)),
      'VITE_',
    ),
  );
  console.log('Configuração pública do build validada.');
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : 'Configuração pública do build inválida.',
  );
  process.exitCode = 1;
}
