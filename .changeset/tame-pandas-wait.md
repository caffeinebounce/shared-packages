---
"@caffeinebounce/ui": minor
---

Make the optional 3D marketing peers opt-in for consumers, route UI client
components through the logger client entrypoint, and move 3D marketing exports
to `@caffeinebounce/ui/marketing-3d` to avoid root and non-3D marketing import
edges pulling in `three`.

This is a behavior change for consumers using `CanvasRevealEffect`,
`CardSpotlight`, or `BentoGridSection`: import them from
`@caffeinebounce/ui/marketing-3d` and add explicit dependencies on `three` and
`@react-three/fiber` in your application.
