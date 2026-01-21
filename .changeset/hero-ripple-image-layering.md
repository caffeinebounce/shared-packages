---
"@caffeinebounce/ui": minor
---

Add proper image layering to HeroSectionWithRipple

- Restructure HeroSectionWithRipple to properly layer images below ripple effect
- Images render at z-0, ripple at z-10 (semi-transparent), content at z-20
- Add `showArrows` prop to HeroSection to control arrow navigation visibility
- Add `carouselState` prop to HeroSection for external carousel control
- Add `rippleOpacity` prop to HeroSectionWithRipple (default 40% with images)
- Export CarouselState type from marketing barrel
- Remove arrow navigation in HeroSectionWithRipple (only dot indicators shown)
