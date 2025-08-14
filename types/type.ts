export interface MigrationResponse {
  success: boolean;
  migrated: boolean;
  userData: {
    balance: number;
    hashrate: number;
    telegramId?: number;
  };
  error?: string;
}