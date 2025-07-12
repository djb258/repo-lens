# Repo Lens Modular Architecture

## 🧭 Module Structure Overview

This directory contains the modular implementation of Repo Lens, following ORBT (Observe, Report, Build, Test) framework and Barton doctrine principles.

### 📁 Module Organization

```
modules/
├── 01-github-index/          # Module 1: GitHub Repo Index Page
├── 02-repo-overview/         # Module 2: Repo Overview Page  
├── 03-diagram-view/          # Module 3: Visual Diagram View
├── 04-module-views/          # Module 4+: Dynamic Module Views
├── shared/                   # Shared components and utilities
└── types/                    # TypeScript type definitions
```

### 🔹 Module 1: GitHub Repo Index Page
**Purpose:** Lists all user repositories with doctrine-compliant navigation
**Features:**
- GitHub API integration with Barton diagnostic tracking
- Auto-refresh on new repo detection
- Doctrine ID generation: `repo_id`, `blueprint_id`
- ORBT cycle integration for repo discovery

### 🔹 Module 2: Repo Overview Page  
**Purpose:** Repository blueprint and metadata display
**Features:**
- README rendering with diagnostic overlays
- ORBT breakdown visualization
- Schema-linked blueprint information
- Navigation hub to other modules

### 🔹 Module 3: Visual Diagram View
**Purpose:** Interactive repository structure visualization
**Features:**
- Clickable module diagrams
- Color-coded error states (green/yellow/red)
- Barton doctrine integration for visual diagnostics
- Dynamic routing to module views

### 🔹 Module 4+: Dynamic Module Views
**Purpose:** Individual component/feature analysis
**Features:**
- Per-module ORBT breakdown
- Module-specific diagnostics and documentation
- Doctrine numbering: `blueprint_id.module_id.submodule_id`
- Error tracking and resolution suggestions

## 🛠️ Development Guidelines

### ORBT Compliance
Every module must implement:
- **Observe:** Data collection and monitoring
- **Report:** Diagnostic logging and error reporting
- **Build:** Component construction and optimization
- **Test:** Validation and health checks

### Barton Doctrine Integration
All modules must include:
- Unique diagnostic identifiers (`bartonId`, `sessionId`)
- Error categorization and severity levels
- System monitoring and health checks
- Auto-resolution capabilities where possible
- Comprehensive logging and audit trails

### Doctrine Numbering System
- Repository Level: `repo_id` (e.g., `39`)
- Module Level: `repo_id.module_id` (e.g., `39.2`)
- Submodule Level: `repo_id.module_id.submodule_id` (e.g., `39.2.1`)

## 🚀 Getting Started

1. Each module is developed in isolation
2. Modules are tested independently before integration
3. Dynamic routing connects modules together
4. Shared utilities and components are in the `shared/` directory

## 📊 Diagnostic Tracking

All modules integrate with the existing diagnostic systems:
- `lib/barton.ts` - Barton doctrine implementation
- `lib/enhanced-orbt.ts` - Enhanced ORBT system
- `lib/diagnostics.ts` - Core diagnostic utilities
- `components/DiagnosticOverlay.tsx` - Visual diagnostic display 