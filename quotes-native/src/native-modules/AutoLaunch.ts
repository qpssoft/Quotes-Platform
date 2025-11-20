/**
 * Auto Launch Native Module
 * Enables/disables application launch at Windows startup
 */

import { NativeModules, Platform } from 'react-native';

interface IAutoLaunchModule {
  enableAutoLaunch(): void;
  disableAutoLaunch(): void;
  isAutoLaunchEnabled(): Promise<boolean>;
}

const AutoLaunchModule: IAutoLaunchModule | null =
  Platform.OS === 'windows' && NativeModules.AutoLaunchModule
    ? NativeModules.AutoLaunchModule
    : null;

/**
 * Enable auto-launch at Windows startup
 */
export async function enableAutoLaunch(): Promise<void> {
  if (!AutoLaunchModule) {
    console.warn('Auto-launch not supported on this platform');
    return;
  }

  try {
    AutoLaunchModule.enableAutoLaunch();
  } catch (error) {
    console.error('Failed to enable auto-launch:', error);
    throw error;
  }
}

/**
 * Disable auto-launch at Windows startup
 */
export async function disableAutoLaunch(): Promise<void> {
  if (!AutoLaunchModule) {
    console.warn('Auto-launch not supported on this platform');
    return;
  }

  try {
    AutoLaunchModule.disableAutoLaunch();
  } catch (error) {
    console.error('Failed to disable auto-launch:', error);
    throw error;
  }
}

/**
 * Check if auto-launch is currently enabled
 */
export async function isAutoLaunchEnabled(): Promise<boolean> {
  if (!AutoLaunchModule) {
    return false;
  }

  try {
    return await AutoLaunchModule.isAutoLaunchEnabled();
  } catch (error) {
    console.error('Failed to check auto-launch status:', error);
    return false;
  }
}

/**
 * Toggle auto-launch on/off
 */
export async function toggleAutoLaunch(): Promise<boolean> {
  const currentlyEnabled = await isAutoLaunchEnabled();
  
  if (currentlyEnabled) {
    await disableAutoLaunch();
    return false;
  } else {
    await enableAutoLaunch();
    return true;
  }
}

/**
 * Check if auto-launch is supported on this platform
 */
export function isAutoLaunchSupported(): boolean {
  return AutoLaunchModule !== null;
}

export default AutoLaunchModule;
