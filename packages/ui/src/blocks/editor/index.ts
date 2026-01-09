/**
 * GrapesJS-based visual editors for forms and emails.
 *
 * @module editor
 */

// Base configuration
export { baseConfig, baseDevices, baseStyleSectors } from "./config/base";
export { emailPreset } from "./config/email-preset";
// Presets
export { formPreset } from "./config/form-preset";
export type { EditorToolbarProps } from "./EditorToolbar";
// Toolbar
export { EditorToolbar } from "./EditorToolbar";
export type { GrapesEditorProps } from "./GrapesEditor";
// Core editor component
export { GrapesEditor } from "./GrapesEditor";

// Types
export {
  type BlockDefinition,
  type DeviceConfig,
  type EditorConfig,
  type EditorPreset,
  type ExportedEmailTemplate,
  type ExportedFormSchema,
  FormFieldType,
  type PanelConfig,
  type StyleSector,
} from "./types";
