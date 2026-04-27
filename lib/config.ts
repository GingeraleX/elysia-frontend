// frontend/lib/config.ts
/**
 * Feature toggles for development
 * Disable heavy features to speed up development
 * 
 * Performance Impact (Approximate):
 * - ENABLE_THREEJS: -50% compile time
 * - ENABLE_SHADERS: -30% compile time
 * - ENABLE_CANVAS: -20% compile time
 * - ENABLE_ANIMATIONS: -10% compile time
 * - ENABLE_EFFECTS: -5% compile time
 * 
 * Disable all 5 = ~60-70% faster development!
 */

export const FEATURE_FLAGS = {
  // ⭐ THREE.JS - The main performance killer
  // Disables: AbstractSphere, Globe, Canvas components
  // Impact: HUGE - saves ~50% compile time
  ENABLE_THREEJS: false,
  
  // 🎨 SHADERS - GLSL shader compilation
  // Disables: vertex.glsl, fragment.glsl, globeVertex.glsl, globeFragment.glsl
  // Impact: HIGH - saves ~30% compile time
  // Note: THREEJS must be false for this to matter
  ENABLE_SHADERS: false,
  
  // 📦 CANVAS - React Three Fiber canvas
  // Disables: Canvas context, renderer setup
  // Impact: MEDIUM - saves ~20% compile time
  ENABLE_CANVAS: false,
  
  // ✨ ANIMATIONS - CSS and JavaScript animations
  // Disables: Framer Motion, transitions, keyframes
  // Impact: MEDIUM - saves ~10% compile time
  ENABLE_ANIMATIONS: true,
  
  // 🌈 EFFECTS - Visual effects and filters
  // Disables: Blur, shadow, glow effects
  // Impact: LOW - saves ~5% compile time
  ENABLE_EFFECTS: true,
};

export default FEATURE_FLAGS;

