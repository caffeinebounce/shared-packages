/**
 * StudioEditor - GrapesJS Studio SDK wrapper for visual editing.
 *
 * Provides a production-ready visual editor with:
 * - Beautiful built-in UI (no CSS battles!)
 * - Multi-page support
 * - Asset manager
 * - Global styles
 * - Theme customization
 *
 * @example
 * ```tsx
 * import { StudioEditor } from "@caffeinebounce/ui";
 *
 * function FormBuilder() {
 *   return (
 *     <StudioEditor
 *       projectType="web"
 *       initialContent="<h1>Hello World</h1>"
 *       onSave={(data) => console.log(data)}
 *     />
 *   );
 * }
 * ```
 */

"use client";

import StudioEditorSDK from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import type { Editor } from "grapesjs";
import { useCallback, useMemo, useRef } from "react";

/** Project types supported by the Studio SDK */
export type StudioProjectType = "web" | "email";

/** Theme options for the editor */
export type StudioTheme = "light" | "dark";

/** Block category configuration */
export interface StudioBlockCategory {
  id: string;
  label: string;
  order?: number;
  open?: boolean;
}

/** Custom block definition for the editor */
export interface StudioBlock {
  id: string;
  label: string;
  category?: string;
  content: string | { type: string; [key: string]: unknown };
  media?: string;
  attributes?: Record<string, string>;
}

/** Props for the StudioEditor component */
export interface StudioEditorProps {
  /** Type of project - "web" for forms/pages, "email" for newsletters */
  projectType?: StudioProjectType;
  /** Initial HTML content to load in the editor */
  initialContent?: string;
  /** Called when content changes */
  onChange?: (html: string, css: string, json: unknown) => void;
  /** Called when user explicitly saves */
  onSave?: (data: { html: string; css: string; json: unknown }) => void;
  /** Editor theme - defaults to "light" */
  theme?: StudioTheme;
  /** Custom blocks to add to the editor */
  customBlocks?: StudioBlock[];
  /** Custom block categories */
  blockCategories?: StudioBlockCategory[];
  /** Whether to show the pages panel (for multi-page projects) */
  showPages?: boolean;
  /** Whether to show the layers panel */
  showLayers?: boolean;
  /** Height of the editor container */
  height?: string | number;
  /** Additional CSS to inject into the canvas */
  canvasStyles?: string;
  /** License key - use "DEV_LICENSE_KEY" for localhost development */
  licenseKey?: string;
  /** Called when editor is ready */
  onReady?: (editor: Editor) => void;
  /** Custom storage configuration */
  storage?: {
    /** Storage type: "browser" for local, "self" for custom handlers, "cloud" for GrapesJS cloud, or false to disable */
    type?: "browser" | "self" | "cloud" | false;
    /** Autosave after this many changes (0 to disable) */
    autosaveChanges?: number;
    /** Autosave after this many milliseconds (0 to disable) */
    autosaveIntervalMs?: number;
  };
}

/** Form-specific blocks for the form builder */
const formBlocks: StudioBlock[] = [
  {
    id: "form-section",
    label: "Form Section",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <div class="form-section" data-gjs-droppable="true" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 class="section-title" style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0; color: #111827;">Section Title</h3>
        <p class="section-description" style="color: #6b7280; margin: 0 0 24px 0; font-size: 14px;">Section description text</p>
        <div class="section-fields" data-gjs-droppable="true" style="min-height: 60px;"></div>
      </div>
    `,
  },
  {
    id: "text-input",
    label: "Text Input",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><line x1="7" y1="12" x2="12" y2="12" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <div class="form-field" style="margin-bottom: 20px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151;">Field Label</label>
        <input type="text" placeholder="Enter text..." style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #ffffff; color: #111827;" />
      </div>
    `,
  },
  {
    id: "email-input",
    label: "Email Input",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><path d="M3 7l9 6 9-6" stroke="currentColor" fill="none" stroke-width="2"/></svg>`,
    content: `
      <div class="form-field" style="margin-bottom: 20px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151;">Email Address</label>
        <input type="email" placeholder="email@example.com" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #ffffff; color: #111827;" />
      </div>
    `,
  },
  {
    id: "textarea",
    label: "Textarea",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" stroke-width="2"/><line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" stroke-width="2"/><line x1="7" y1="16" x2="12" y2="16" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <div class="form-field" style="margin-bottom: 20px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151;">Description</label>
        <textarea placeholder="Enter description..." rows="4" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #ffffff; color: #111827; resize: vertical; min-height: 100px;"></textarea>
      </div>
    `,
  },
  {
    id: "select-dropdown",
    label: "Select Dropdown",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><path d="M8 10l4 4 4-4" stroke="currentColor" fill="none" stroke-width="2"/></svg>`,
    content: `
      <div class="form-field" style="margin-bottom: 20px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151;">Select Option</label>
        <select style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #ffffff; color: #111827;">
          <option value="">Select an option...</option>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </div>
    `,
  },
  {
    id: "checkbox",
    label: "Checkbox",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><path d="M9 12l2 2 4-4" stroke="currentColor" fill="none" stroke-width="2"/></svg>`,
    content: `
      <div class="form-field" style="margin-bottom: 20px;">
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; color: #374151;">
          <input type="checkbox" style="width: 18px; height: 18px; border-radius: 4px;" />
          <span>Checkbox label</span>
        </label>
      </div>
    `,
  },
  {
    id: "radio-group",
    label: "Radio Group",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>`,
    content: `
      <div class="form-field" style="margin-bottom: 20px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 12px; color: #374151;">Select one option</label>
        <div class="radio-group" style="display: flex; flex-direction: column; gap: 10px;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 12px; border-radius: 8px; font-size: 14px; color: #374151;">
            <input type="radio" name="radio-group" style="width: 18px; height: 18px;" />
            <span>Option 1</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 12px; border-radius: 8px; font-size: 14px; color: #374151;">
            <input type="radio" name="radio-group" style="width: 18px; height: 18px;" />
            <span>Option 2</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 12px; border-radius: 8px; font-size: 14px; color: #374151;">
            <input type="radio" name="radio-group" style="width: 18px; height: 18px;" />
            <span>Option 3</span>
          </label>
        </div>
      </div>
    `,
  },
  {
    id: "submit-button",
    label: "Submit Button",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="7" width="18" height="10" rx="5" stroke="currentColor" fill="none" stroke-width="2"/></svg>`,
    content: `
      <button type="submit" style="display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">
        Submit
      </button>
    `,
  },
];

/** Default block categories for forms */
const formBlockCategories: StudioBlockCategory[] = [
  { id: "Form", label: "Form Elements", order: 1, open: true },
  { id: "Basic", label: "Basic", order: 2, open: false },
];

/** Default canvas styles for the form builder */
const defaultCanvasStyles = `
  * {
    box-sizing: border-box;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #111827;
    margin: 0;
    padding: 24px;
    background: #ffffff;
  }
  .form-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
  }
  .form-field {
    margin-bottom: 20px;
  }
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #374151;
  }
  input, select, textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    background: #ffffff;
    color: #111827;
    font-family: inherit;
  }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
  button {
    font-family: inherit;
  }
`;

/**
 * StudioEditor component using GrapesJS Studio SDK.
 * Production-ready visual editor with beautiful built-in UI.
 */
export function StudioEditor({
  projectType = "web",
  initialContent,
  onChange,
  onSave,
  theme = "light",
  customBlocks,
  blockCategories,
  showPages = false,
  showLayers = true,
  height = "100%",
  canvasStyles,
  licenseKey = "DEV_LICENSE_KEY",
  onReady,
  storage = { type: false },
}: StudioEditorProps) {
  const editorRef = useRef<Editor | null>(null);

  // Merge custom blocks with form blocks
  const allBlocks = useMemo(() => {
    const blocks = [...formBlocks];
    if (customBlocks) {
      blocks.push(...customBlocks);
    }
    return blocks;
  }, [customBlocks]);

  // Merge categories
  const allCategories = useMemo(() => {
    if (blockCategories) {
      return blockCategories;
    }
    return formBlockCategories;
  }, [blockCategories]);

  // Handle editor ready
  const handleReady = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      // Register custom blocks
      const blockManager = editor.Blocks;
      for (const block of allBlocks) {
        blockManager.add(block.id, {
          label: block.label,
          category: block.category,
          content: block.content,
          media: block.media,
          attributes: block.attributes,
        });
      }

      // Set up change listener
      if (onChange) {
        editor.on("update", () => {
          const html = editor.getHtml();
          const css = editor.getCss();
          const json = editor.getProjectData();
          onChange(html, css || "", json);
        });
      }

      onReady?.(editor);
    },
    [allBlocks, onChange, onReady],
  );

  // Build default project content
  const defaultProject = useMemo(() => {
    const styles = canvasStyles || defaultCanvasStyles;
    const content =
      initialContent ||
      "<div data-gjs-droppable='true' style='min-height: 200px; padding: 24px;'><p>Drop form elements here to build your form</p></div>";

    return {
      pages: [
        {
          name: "Form",
          component: content,
          styles: styles,
        },
      ],
    };
  }, [initialContent, canvasStyles]);

  // Get project data for saving
  const handleSaveRequest = useCallback(() => {
    if (editorRef.current && onSave) {
      const editor = editorRef.current;
      onSave({
        html: editor.getHtml(),
        css: editor.getCss() || "",
        json: editor.getProjectData(),
      });
    }
  }, [onSave]);

  return (
    <div
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      <StudioEditorSDK
        options={{
          licenseKey,
          theme: theme,
          project: {
            type: projectType,
            default: defaultProject,
          },
          storage:
            storage.type === false
              ? undefined
              : {
                  type: storage.type || "browser",
                  autosaveChanges: storage.autosaveChanges,
                  autosaveIntervalMs: storage.autosaveIntervalMs,
                },
        }}
        onEditor={handleReady}
      />
    </div>
  );
}

export default StudioEditor;
