function integer(value: unknown, fallback: number, name: string): number {
  const raw = value === undefined || value === '' ? String(fallback) : String(value);
  if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`);
  }
  return Number(raw);
}

function boolean(value: unknown, fallback: boolean, name: string): boolean {
  if (value === undefined || value === '') return fallback;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  throw new Error(`${name} must be true or false.`);
}

export function validateEnvironment(input: Record<string, unknown>) {
  const dbType = String(input.DB_TYPE ?? 'sqlite');
  if (!['sqlite', 'postgres', 'mysql'].includes(dbType)) {
    throw new Error('DB_TYPE must be sqlite, postgres, or mysql.');
  }
  return {
    ...input,
    NODE_ENV: String(input.NODE_ENV ?? 'development'),
    PORT: integer(input.PORT, 3000, 'PORT'),
    HOST: String(input.HOST ?? '127.0.0.1'),
    DB_TYPE: dbType,
    DB_DATABASE: String(input.DB_DATABASE ?? './data/shop.sqlite'),
    DB_SYNCHRONIZE: boolean(input.DB_SYNCHRONIZE, true, 'DB_SYNCHRONIZE'),
    DB_LOGGING: boolean(input.DB_LOGGING, false, 'DB_LOGGING'),
    DB_HOST: String(input.DB_HOST ?? '127.0.0.1'),
    DB_PORT: integer(input.DB_PORT, dbType === 'mysql' ? 3306 : 5432, 'DB_PORT'),
    DB_USERNAME: String(input.DB_USERNAME ?? (dbType === 'mysql' ? 'root' : 'postgres')),
    DB_PASSWORD: String(input.DB_PASSWORD ?? ''),
    DB_NAME: String(input.DB_NAME ?? 'shop_lab'),
  };
}
