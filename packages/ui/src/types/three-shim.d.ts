// Minimal type shims for three and @react-three/fiber
// Full types are provided by the consumer app (peer deps)
// These exist only to allow the shared-packages build to typecheck without
// installing the actual packages (which cause JSX type conflicts).

declare module "three" {
  export class Mesh {
    material: unknown;
  }
  export class Vector2 {
    constructor(x?: number, y?: number);
    fromArray(array: number[]): this;
  }
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    fromArray(array: number[]): this;
  }
  export class ShaderMaterial {
    uniforms: Record<string, { value: unknown }>;
    constructor(params?: {
      vertexShader?: string;
      fragmentShader?: string;
      uniforms?: Record<string, unknown>;
      glslVersion?: string;
      blending?: number;
      blendSrc?: number;
      blendDst?: number;
    });
  }
  export const GLSL3: string;
  export const CustomBlending: number;
  export const SrcAlphaFactor: number;
  export const OneFactor: number;
}

declare module "@react-three/fiber" {
  import type { FC, ReactNode } from "react";

  export interface Size {
    width: number;
    height: number;
    top: number;
    left: number;
  }

  export interface RootState {
    elapsed: number;
    size: Size;
    [key: string]: unknown;
  }

  export interface CanvasProps {
    className?: string;
    children?: ReactNode;
    [key: string]: unknown;
  }

  export const Canvas: FC<CanvasProps>;

  export function useFrame(
    callback: (state: RootState, delta: number) => void,
    priority?: number,
  ): void;

  export function useThree(): RootState;
  export function useThree<T>(selector: (state: RootState) => T): T;
}

// Extend JSX IntrinsicElements for r3f mesh/geometry primitives
declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      mesh: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { ref?: React.Ref<unknown> };
      planeGeometry: { args?: [number, number] };
      primitive: { object: unknown; attach?: string };
    }
  }
}
