declare module "@react-three/fiber" {
  import type * as React from "react";

  export type RootState = {
    clock?: {
      getElapsedTime?: () => number;
    };
    elapsed?: number;
  };

  export const Canvas: React.ComponentType<Record<string, unknown>>;

  export function useFrame(callback: (state: RootState) => void): void;
  export function useThree(): {
    size: {
      width: number;
      height: number;
    };
  };
}
