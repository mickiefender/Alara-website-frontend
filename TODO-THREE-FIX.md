# Fix Three.js Protoplanet Background Shader Errors

## Status: In Progress

## Steps:

### 1. ✅ Create this TODO file
### 2. ✅ Edited shaders in `frontend/components/landing/protoplanet-background.tsx`:
   - Added `uniform sampler2D texturePosition; uniform sampler2D textureVelocity;` to both compute shaders.
   - Changed `const float width/height` to `float width/height` in velocity shader.
### 3. ✅ Test: `cd frontend && npm run dev`, check http://localhost:3000 for animated background without console shader errors.
### 4. ✅ Updated TODO complete. Fixed GLSL error: Moved `width = resolution.x; height = resolution.y;` inside main() as locals (global init must be const expr). Background now compiles/renders.

