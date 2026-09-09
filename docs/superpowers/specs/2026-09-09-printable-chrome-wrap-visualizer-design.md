# Printable Super Glossy Chrome Wrap Visualizer Design

## Goal

Add an interactive Cybertruck print preview to the `Printable Super Glossy Chrome Wrap Film` series. A visitor uploads artwork, positions it on the default visible left side of the vehicle, and compares glossy and matte overlaminate finishes without changing the existing classic-colour viewer.

## Scope

- Render the configurator only when the active series is `Printable Super Glossy Chrome Wrap Film`.
- Reuse the existing Cybertruck GLB, camera controls, studio environment, and protected non-paint material classification.
- Keep the classic-colour configurator and all existing paint alpha values unchanged.
- Apply artwork only to the vehicle's left-side paint panels. Glass, tyres, wheels, wheel arches, chassis, lights, trim, and the opposite side remain untouched.
- Process uploads locally in the browser. No image is sent to a server or persisted after the page is closed.

## User Experience

The configurator presents a Silver mirror-chrome Cybertruck, an upload control, finish selection, transform controls, and a short privacy note.

Accepted image formats are PNG, JPEG, and WebP. After a successful upload, the artwork is centred on the left-side printable region with a contain-style fit that preserves its aspect ratio. Transparent PNG pixels reveal the Silver chrome substrate.

The visitor can:

- drag horizontally and vertically on the vehicle stage to reposition the artwork;
- use a scale slider to resize it while preserving aspect ratio;
- use a rotation slider to rotate it;
- choose `Glossy` or `Matte` overlaminate;
- reset placement and finish to their defaults;
- replace or remove the uploaded image.

Dragging the artwork must not accidentally rotate the vehicle. A clear edit/rotate affordance separates artwork positioning from normal orbit controls. The default camera shows the printable left side immediately.

## Rendering Architecture

Create a dedicated printable-wrap viewer mode rather than adding upload state to the classic-colour mode. The shared viewer continues to own model loading, camera framing, lighting, environment generation, error boundaries, and drag guidance.

The printable mode builds a layered material for the existing paint meshes:

1. **Substrate:** fixed Silver mirror-chrome base.
2. **Print layer:** uploaded image sampled through object-space planar projection across the identified left-side printable region.
3. **Side mask:** limits the print layer to outward-facing left-side paint surfaces and clamps it before wheel arches, glass, trim, and chassis.
4. **Overlaminate:** finish parameters applied above the print layer.

The projection uses stable model-local coordinates, so artwork remains attached when the vehicle rotates. It does not rely on the GLB's UV layout. The upload texture uses sRGB colour space, preserves alpha, uses linear filtering, and is disposed whenever the artwork is replaced or the viewer unmounts.

## Finish Model

`Glossy` is the default. It preserves strong, sharp environment reflections with low roughness and a clear-coat response. `Matte` raises roughness, softens reflection highlights, and enables the existing fine-grain roughness texture. Both finishes retain the Silver metallic substrate beneath the printed colour. Neither finish modifies material opacity or alpha mode.

Exact roughness, metalness, clear-coat, and environment intensity values will be tuned during browser verification against the existing Silver reference, while remaining within explicit tested bounds.

## State and Data Flow

The category page determines the active series and mounts the printable configurator only for its exact series name. The configurator owns:

- uploaded object URL and decoded texture;
- placement `{ x, y, scale, rotation }`;
- finish mode `glossy | matte`;
- interaction mode `positionArtwork | rotateVehicle`;
- validation and loading status.

Placement state is passed to the Three.js material as uniforms, so dragging and slider changes update without rebuilding the model. Replacing or removing an image revokes its previous object URL and disposes its GPU texture.

## Validation and Error Handling

- Reject unsupported file types with an inline English message.
- Enforce a practical file-size and decoded-dimension limit before creating a GPU texture.
- Show decoding/loading progress without unmounting the rest of the page.
- If image decoding fails, keep the Silver vehicle usable and allow another upload.
- If WebGL or the GLB fails, preserve the existing viewer fallback.
- Reset restores centred placement, default scale, zero rotation, and `Glossy` finish.

## Responsive and Accessible Behaviour

Desktop uses direct pointer dragging on the stage plus scale and rotation sliders. Mobile uses one-finger artwork dragging when edit mode is active; vehicle rotation remains available through the explicit rotate mode. Controls remain outside the canvas, have visible labels, keyboard focus styles, and meaningful status text. Reduced-motion preference disables non-essential hint animation but not direct manipulation.

## Testing and Acceptance

Automated tests cover:

- exact-series routing and isolation from classic colours;
- accepted/rejected upload types and size limits;
- object URL and texture cleanup;
- placement clamping and reset behaviour;
- finish parameter mapping without alpha changes;
- print material application only to protected left-side paint meshes;
- responsive controls and accessible labels.

Browser verification must confirm:

- the Silver vehicle appears before upload;
- an uploaded transparent test image is visible only on the left side;
- drag, scale, and rotation update the print without moving it off the vehicle;
- orbiting the vehicle keeps the print attached;
- Glossy and Matte produce visibly different reflections;
- glass, wheel arches, chassis, wheels, and the right side remain unprinted;
- replacing and removing artwork works without stale textures or page errors.

## Out of Scope

- Server uploads, accounts, saved designs, or team sharing;
- printing on both sides, roof, bonnet, tailgate, glass, or trim;
- freehand masks, multiple artwork layers, text tools, or production-ready print exports;
- modifying or re-exporting the Blender source model.
