import * as THREE from "three";

/** Light-emitting layers (glows, lines, particles) add onto the opaque scene. */
export const GLOW_BLENDING = {
  blending: THREE.AdditiveBlending,
} as const;
