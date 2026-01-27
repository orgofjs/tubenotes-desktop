# Changelog

All notable changes to TubeNotes will be documented in this file.

## [0.2.1] - 2026-01-26

###  Bug Fixes
- **Canvas Position Persistence**: Fixed markdown node position not being saved correctly when dragging
- **Node State Synchronization**: Implemented automatic ref synchronization for all node changes (drag, resize, etc.)
- **Data Mutation Prevention**: Removed direct data mutations in ShapeNode and CodeMirrorNode to prevent state corruption

###  Technical Improvements
- Added `useEffect` hooks to sync `internalNodes` and `internalEdges` with refs automatically
- Enhanced `onNodesChange` and `onEdgesChange` handling to ensure position updates are captured
- Improved state management reliability for all canvas operations
- Added `[NODES SYNCED]` debug logging for better development tracking

###  Verified Features
- Canvas notes now persist correctly across:
  - Canvas switching
  - Application restart
  - Node drag operations
  - Node resize operations
  - Label/content editing

## [0.2.0] - 2026-01-25

###  New Features
- **Canvas Mode**: Infinite canvas with React Flow
- **Manual Save System**: Ctrl+S to save, preventing data loss
- **Shape Nodes**: Drag-to-create rectangles, circles, diamonds
- **Text Nodes**: Quick text note creation with click tool
- **Markdown Nodes**: CodeMirror-powered markdown editor nodes
- **Canvas Import/Export**: Save and load canvas as JSON files

###  Technical Stack
- React Flow 12.10.0 for canvas rendering
- SQLite database with better-sqlite3
- Electron 40.0.0 desktop application
- Next.js 16.1.3 with Turbopack
- TypeScript 5 strict mode

###  Build System
- Windows .exe build support
- Static export for production
- Electron packaging with electron-builder

---

## [0.1.1] - 2026-01-20

---

## [0.1.0] - 2026-01-20

---

## Version Format

Versions follow Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible
