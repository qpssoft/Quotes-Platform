# Service Contracts: Multi-Platform React Native Expansion

**Feature Branch**: `002-react-native-expansion`  
**Created**: 2025-11-20  
**Purpose**: Define service interfaces for shared business logic and platform-specific APIs

## Overview

This directory contains TypeScript interface specifications for all services used across web (Angular) and native (React Native) platforms. These contracts ensure consistent behavior while allowing platform-specific implementations.

## Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Shared Business Logic Services             │
│              (shared-modules/services/)                 │
├─────────────────────────────────────────────────────────┤
│  - SearchService: Full-text search, filtering           │
│  - RotationService: Random selection, timer management  │
│  - TextService: Vietnamese text processing, NFC         │
│  - StorageService: Abstract storage interface           │
└─────────────────────────────────────────────────────────┘
                          │
                          │ implements
                          ▼
┌──────────────────────┬──────────────────────────────────┐
│  Platform Services   │   Platform Services              │
│  (quotes-platform/)  │   (quotes-native/)               │
├──────────────────────┼──────────────────────────────────┤
│  - WebStorageService │ - NativeStorageService           │
│  - WebAudioService   │ - NativeAudioService             │
│  - N/A               │ - HapticService                  │
│  - N/A               │ - BackgroundService              │
│  - N/A               │ - WatchConnectivityService       │
└──────────────────────┴──────────────────────────────────┘
```

## Contract Files

1. **storage-service.contract.ts**: Abstract storage interface for all platforms
2. **search-service.contract.ts**: Full-text search and filtering service
3. **rotation-service.contract.ts**: Auto-rotation and random selection service
4. **audio-service.contract.ts**: Audio notification playback
5. **haptic-service.contract.ts**: Haptic feedback (mobile/wearables only)
6. **background-service.contract.ts**: Background operation (mobile only)
7. **watch-connectivity-service.contract.ts**: Watch sync (wearables only)

Each contract file defines:
- TypeScript interface with method signatures
- Input/output types
- Error handling strategy
- Platform implementation notes
- Usage examples
