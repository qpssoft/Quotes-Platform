/**
 * Shared location: shared-modules/models/sync-state.model.ts
 * Used by: quotes-platform (Angular), quotes-native (React Native)
 * Purpose: Track cloud sync status for Firebase Firestore integration (V3+)
 */

export interface SyncState {
  /**
   * Last successful sync timestamp (ISO 8601)
   * Used for: Determining if local data is stale, conflict resolution
   */
  lastSyncAt: Date | null;

  /**
   * Device identifier (UUID v4)
   * Generated on first app launch, persisted in secure storage
   * Used for: Multi-device conflict resolution, analytics
   */
  deviceId: string;

  /**
   * Cloud sync enabled flag
   * Default: false (Phase 2: local-only)
   * V3+: true when user enables Firebase sync
   */
  syncEnabled: boolean;

  /**
   * Number of unresolved sync conflicts
   * Used for: Alerting user to review conflicts
   */
  conflictCount: number;

  /**
   * Optional metadata for sync debugging
   */
  metadata?: {
    lastError?: string;
    lastErrorAt?: Date;
    syncAttempts?: number;
  };
}

/**
 * Type guard for runtime validation
 */
export function isSyncState(obj: unknown): obj is SyncState {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const s = obj as Partial<SyncState>;
  return (
    (s.lastSyncAt === null || s.lastSyncAt instanceof Date) &&
    typeof s.deviceId === 'string' &&
    typeof s.syncEnabled === 'boolean' &&
    typeof s.conflictCount === 'number'
  );
}

/**
 * Default sync state factory (local-only, no sync)
 */
export function createDefaultSyncState(deviceId: string): SyncState {
  return {
    lastSyncAt: null,
    deviceId,
    syncEnabled: false,
    conflictCount: 0
  };
}
