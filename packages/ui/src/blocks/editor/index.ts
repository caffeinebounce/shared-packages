/**
 * GrapesJS-based visual editors for forms and emails.
 *
 * @module editor
 */

// Base configuration
export { baseConfig, baseStyleSectors } from "./config/base";
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
export type {
  BlockDefinition,
  DeviceConfig,
  EditorConfig,
  EditorPreset,
  ExportedEmailTemplate,
  ExportedFormSchema,
  FormField,
  FormFieldType,
  FormSection,
  PanelConfig,
  StyleSector,
} from "./types";
