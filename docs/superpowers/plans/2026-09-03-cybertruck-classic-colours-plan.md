# Cybertruck Classic Colours Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an interactive Three.js Cybertruck colour configurator to the Classic Colours product family.

**Architecture:** A focused `CybertruckViewer` React component owns the Three.js scene and GLB lifecycle. Colour definitions remain separate from rendering, while the existing product card mounts the viewer only for the Classic Colours family. The GLB is served as a static public asset with a graceful image/card fallback.

**Tech Stack:** React, Three.js, `@react-three/fiber`, `@react-three/drei`, Vite, CSS media queries.

## Global Constraints

- Preserve existing product-family navigation and mobile vertical scrolling.
- Use the approved `Tesla_Cybertruck3.glb` asset.
- Keep every deployed static file below Cloudflare Pages' 25 MiB limit.
- Preserve original non-body materials from the GLB.

### Task 1: Dependencies and model asset

Add Three.js packages and copy the approved GLB into `public/models/`, excluding any oversized or duplicate source archive.

### Task 2: Colour and viewer components

Create colour data and a viewer component with lazy initialization, body-material detection, metallic rough paint, procedural micro-roughness, orbit controls, responsive pixel ratio, and cleanup/error fallback.

### Task 3: Classic Colours integration

Mount the viewer and colour swatches only for the Classic Colours family, preserving the existing card for all other families and keeping selected colour state accessible.

### Task 4: Responsive styling and verification

Add viewer/swatches styles for desktop and touch layouts, run the build and existing tests, and verify no generated asset exceeds 25 MiB.
