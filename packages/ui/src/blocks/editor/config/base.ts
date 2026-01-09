/**
 * Base GrapesJS configuration shared across all presets.
 */

import type { EditorConfig } from "../types";

/**
 * Default base configuration for the GrapesJS editor.
 */
export const baseConfig: Partial<EditorConfig> = {
  height: "100%",
  width: "auto",
  storageManager: false, // Disable by default, let consumer handle persistence
  deviceManager: {
    devices: [
      {
        name: "Desktop",
        width: "",
      },
      {
        name: "Tablet",
        width: "768px",
        widthMedia: "992px",
      },
      {
        name: "Mobile",
        width: "320px",
        widthMedia: "480px",
      },
    ],
  },
  canvas: {
    styles: [
      // Base styles for the canvas
      `
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      }
      `,
    ],
  },
};

/**
 * Style sectors for general styling (shared across presets).
 */
export const baseStyleSectors = [
  {
    name: "Dimension",
    open: false,
    buildProps: [
      "width",
      "min-width",
      "max-width",
      "height",
      "min-height",
      "max-height",
      "margin",
      "padding",
    ],
  },
  {
    name: "Typography",
    open: false,
    buildProps: [
      "font-family",
      "font-size",
      "font-weight",
      "letter-spacing",
      "color",
      "line-height",
      "text-align",
      "text-decoration",
      "text-transform",
    ],
  },
  {
    name: "Background",
    open: false,
    buildProps: [
      "background-color",
      "background-image",
      "background-repeat",
      "background-position",
      "background-size",
    ],
  },
  {
    name: "Border",
    open: false,
    buildProps: [
      "border-radius",
      "border",
      "border-width",
      "border-style",
      "border-color",
    ],
  },
  {
    name: "Extra",
    open: false,
    buildProps: ["opacity", "box-shadow", "cursor"],
  },
];

/**
 * Common panel configurations.
 */
export const basePanels = [
  {
    id: "panel-devices",
    el: ".panel__devices",
    buttons: [
      {
        id: "device-desktop",
        label: "Desktop",
        command: "set-device-desktop",
        active: true,
      },
      {
        id: "device-tablet",
        label: "Tablet",
        command: "set-device-tablet",
      },
      {
        id: "device-mobile",
        label: "Mobile",
        command: "set-device-mobile",
      },
    ],
  },
  {
    id: "panel-switcher",
    el: ".panel__switcher",
    buttons: [
      {
        id: "show-layers",
        label: "Layers",
        command: "show-layers",
        active: true,
      },
      {
        id: "show-style",
        label: "Styles",
        command: "show-styles",
      },
      {
        id: "show-traits",
        label: "Settings",
        command: "show-traits",
      },
      {
        id: "show-blocks",
        label: "Blocks",
        command: "show-blocks",
      },
    ],
  },
];
