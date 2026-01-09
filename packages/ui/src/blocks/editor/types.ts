/**
 * Types for the GrapesJS editor components.
 */

import type { Editor } from "grapesjs";

/**
 * Configuration options for the GrapesEditor component.
 */
export interface EditorConfig {
  /** Container element ID or element reference */
  container?: string | HTMLElement;
  /** Initial HTML content to load */
  initialContent?: string;
  /** Initial GrapesJS project data (JSON) */
  initialData?: Record<string, unknown>;
  /** Editor height */
  height?: string;
  /** Editor width */
  width?: string;
  /** Enable local storage persistence */
  storageManager?: boolean | StorageConfig;
  /** Canvas configuration */
  canvas?: CanvasConfig;
  /** Panel configuration */
  panels?: PanelConfig[];
  /** Block manager configuration */
  blockManager?: BlockManagerConfig;
  /** Style manager configuration */
  styleManager?: StyleManagerConfig;
  /** Device manager configuration */
  deviceManager?: DeviceConfig;
  /** Custom plugins to load */
  plugins?: EditorPlugin[];
  /** Plugin options */
  pluginsOpts?: Record<string, unknown>;
}

export interface StorageConfig {
  type?: "local" | "remote" | "none";
  autosave?: boolean;
  autoload?: boolean;
  stepsBeforeSave?: number;
}

export interface CanvasConfig {
  styles?: string[];
  scripts?: string[];
}

export interface PanelConfig {
  id: string;
  el?: string;
  buttons?: PanelButton[];
  visible?: boolean;
}

export interface PanelButton {
  id: string;
  className?: string;
  command?: string | (() => void);
  attributes?: Record<string, string>;
  label?: string;
  active?: boolean;
}

export interface BlockManagerConfig {
  appendTo?: string | HTMLElement;
  blocks?: BlockDefinition[];
}

export interface StyleManagerConfig {
  appendTo?: string | HTMLElement;
  sectors?: StyleSector[];
}

export interface StyleSector {
  name: string;
  open?: boolean;
  buildProps?: string[];
  properties?: StyleProperty[];
}

export interface StyleProperty {
  name: string;
  property: string;
  type?: "number" | "select" | "color" | "slider" | "radio" | "composite";
  units?: string[];
  defaults?: string;
  options?: { value: string; name: string }[];
}

export interface DeviceConfig {
  devices?: Device[];
}

export interface Device {
  name: string;
  width?: string;
  widthMedia?: string;
}

export type EditorPlugin = string | ((editor: Editor, opts?: unknown) => void);

/**
 * Block definition for the block manager.
 */
export interface BlockDefinition {
  /** Unique block identifier */
  id: string;
  /** Display label */
  label: string;
  /** Category for grouping */
  category?: string;
  /** HTML content of the block */
  content: string | { type: string; [key: string]: unknown };
  /** Block attributes */
  attributes?: Record<string, string>;
  /** Media (icon) for the block */
  media?: string;
  /** Whether the block is active */
  activate?: boolean;
  /** Whether to select the block after drop */
  select?: boolean;
  /** Whether to reset ID on each drop */
  resetId?: boolean;
  /** Disable the block */
  disable?: boolean;
}

/**
 * Preset configuration for different editor modes.
 */
export interface EditorPreset {
  /** Preset identifier */
  id: "form" | "email" | "custom";
  /** Display name */
  name: string;
  /** GrapesJS plugins to load */
  plugins: EditorPlugin[];
  /** Plugin options */
  pluginsOpts: Record<string, unknown>;
  /** Custom blocks to add */
  blocks: BlockDefinition[];
  /** Style manager sectors */
  styleSectors?: StyleSector[];
  /** Canvas styles */
  canvasStyles?: string[];
  /** Device configurations */
  devices?: Device[];
}

/**
 * Exported form schema (compatible with @compass/utils FormSchemaType).
 */
export interface ExportedFormSchema {
  /** Form title */
  title: string;
  /** Form description */
  description?: string;
  /** Form sections */
  sections: FormSection[];
  /** GrapesJS project data for re-editing */
  gjsData?: Record<string, unknown>;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: FieldValidation;
  options?: FieldOption[];
  conditionalDisplay?: ConditionalRule;
}

export type FormFieldType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "number"
  | "date"
  | "file"
  | "combobox"
  | "email"
  | "phone"
  | "url";

export interface FieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface ConditionalRule {
  field: string;
  operator: "equals" | "notEquals" | "contains" | "notContains";
  value: string | string[];
}

/**
 * Exported email template.
 */
export interface ExportedEmailTemplate {
  /** Template name */
  name: string;
  /** Template subject line */
  subject?: string;
  /** Rendered HTML */
  html: string;
  /** Plain text version */
  text?: string;
  /** MJML source (if using MJML) */
  mjml?: string;
  /** GrapesJS project data for re-editing */
  gjsData: Record<string, unknown>;
}
