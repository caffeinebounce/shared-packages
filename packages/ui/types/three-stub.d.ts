declare module "three" {
  export class Mesh {
    material: any;
  }

  export class Vector2 {
    constructor(x?: number, y?: number);
    fromArray(values: number[]): this;
  }

  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    fromArray(values: number[]): this;
  }

  export class ShaderMaterial {
    uniforms: Record<string, { value: unknown }>;
    constructor(options?: Record<string, unknown>);
  }

  export const GLSL3: unknown;
  export const CustomBlending: unknown;
  export const SrcAlphaFactor: unknown;
  export const OneFactor: unknown;
}
