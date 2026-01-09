/**
 * GrapesEditor - Core React wrapper for GrapesJS visual editor.
 *
 * Provides a unified editor interface for both form and email builders.
 *
 * **Note on CSS**: This component imports GrapesJS CSS from node_modules.
 * Ensure your bundler (webpack, vite, etc.) is configured to handle
 * CSS imports from node_modules. For Next.js, this works out of the box.
 *
 * @example
 * ```tsx
 * import { GrapesEditor, formPreset } from "@caffeinebounce/ui";
 *
 * function FormBuilder() {
 *   // Memoize callbacks to prevent unnecessary editor re-initialization
 *   const handleChange = useCallback((html, json) => {
 *     console.log({ html, json });
 *   }, []);
 *
 *   return (
 *     <GrapesEditor
 *       preset={formPreset}
 *       initialContent={existingHtml}
 *       onChange={handleChange}
 *       onSave={(html, json) => saveToDatabase(html, json)}
 *     />
 *   );
 * }
 * ```
 */

"use client";

import grapesjs, { type Editor } from "grapesjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { baseConfig, baseStyleSectors } from "./config/base";
import { EditorToolbar } from "./EditorToolbar";
import type {
  EditorConfig,
  EditorPreset,
  ExportedEmailTemplate,
  ExportedFormSchema,
} from "./types";

// Import GrapesJS CSS
import "grapesjs/dist/css/grapes.min.css";

/**
 * Props for GrapesEditor component.
 */
export interface GrapesEditorProps {
  /** Preset configuration (formPreset or emailPreset) */
  preset: EditorPreset;
  /** Initial HTML content to load */
  initialContent?: string;
  /** Custom editor configuration overrides */
  config?: Partial<EditorConfig>;
  /**
   * Callback when content changes.
   * **Important**: Memoize this callback with useCallback to prevent
   * unnecessary editor re-initialization on parent re-renders.
   */
  onChange?: (html: string, json: unknown) => void;
  /** Callback when save is triggered */
  onSave?: (html: string, json: unknown) => void;
  /** Callback when export is triggered (returns structured data) */
  onExport?: (data: ExportedFormSchema | ExportedEmailTemplate) => void;
  /** Height of the editor container */
  height?: string;
  /** Whether editor is read-only */
  readOnly?: boolean;
  /** CSS class for the container */
  className?: string;
}

/**
 * GrapesEditor component - Visual block-based editor for forms and emails.
 */
export function GrapesEditor({
  preset,
  initialContent = "",
  config: customConfig,
  onChange,
  onSave,
  onExport,
  height = "600px",
  readOnly = false,
  className = "",
}: GrapesEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  /**
   * Initialize GrapesJS editor.
   */
  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    // Destructure panels from customConfig since GrapesJS has a different type for it
    const { panels: _panels, ...restCustomConfig } = customConfig || {};

    const editor = grapesjs.init({
      container: containerRef.current,
      height,
      width: "100%",
      fromElement: false,
      storageManager: false, // We handle storage externally

      // Merge base config with preset and custom config
      ...baseConfig,
      ...restCustomConfig,

      // Configure devices from preset
      // Note: GrapesJS DeviceProperties type has incompatible width/height types
      // (string | undefined vs string | null). We cast to any here because the
      // runtime values are compatible - this is a GrapesJS type definition issue.
      deviceManager: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        devices: (preset.devices ||
          baseConfig.deviceManager?.devices ||
          []) as any,
      },

      // Configure style manager
      styleManager: {
        sectors: baseStyleSectors,
      },

      // Configure canvas styles
      canvas: {
        styles: preset.canvasStyles || [],
      },
    });

    // Load plugins from preset
    if (preset.plugins) {
      // Note: Plugins should be loaded via npm and registered globally
      // The preset specifies which plugins to use
    }

    // Register custom blocks from preset
    const blockManager = editor.BlockManager;
    for (const block of preset.blocks) {
      blockManager.add(block.id, {
        label: block.label,
        category: block.category || "Basic",
        media: block.media,
        content: block.content,
        attributes: block.attributes,
      });
    }

    // Load initial content
    if (initialContent) {
      editor.setComponents(initialContent);
    }

    // Set read-only mode if specified
    // Note: GrapesJS's editor.setReadOnly() method exists at runtime but is not
    // in the TypeScript definitions. Using the preview command as an alternative
    // which hides editing UI and shows only the canvas. This is a reasonable
    // approximation for read-only mode in visual builder contexts.
    if (readOnly) {
      editor.Commands.run("preview");
    }

    // Listen for content changes
    editor.on("component:update", () => {
      if (onChange) {
        const html = editor.getHtml();
        const json = editor.getProjectData();
        onChange(html, json);
      }
      updateUndoRedoState();
    });

    // Listen for undo/redo changes
    const updateUndoRedoState = () => {
      const undoManager = editor.UndoManager;
      setCanUndo(undoManager.hasUndo());
      setCanRedo(undoManager.hasRedo());
    };

    editor.on("change:changesCount", updateUndoRedoState);

    // Store editor reference
    editorRef.current = editor;
    setIsReady(true);

    // Cleanup on unmount
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [preset, initialContent, customConfig, height, readOnly, onChange]);

  /**
   * Handle save action.
   */
  const handleSave = useCallback(() => {
    if (onSave && editorRef.current) {
      const html = editorRef.current.getHtml();
      const json = editorRef.current.getProjectData();
      onSave(html, json);
    }
  }, [onSave]);

  /**
   * Handle export action - exports structured data based on preset type.
   */
  const handleExport = useCallback(() => {
    if (!onExport || !editorRef.current) return;

    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();

    if (preset.id === "form") {
      // Export as form schema
      const formSchema: ExportedFormSchema = {
        html,
        css: css || "",
        fields: extractFormFields(editorRef.current),
        sections: extractFormSections(editorRef.current),
        gjsData: editorRef.current.getProjectData(),
      };
      onExport(formSchema);
    } else if (preset.id === "email") {
      // Export as email template
      const emailTemplate: ExportedEmailTemplate = {
        html: inlineEmailStyles(html, css || ""),
        subject: "",
        previewText: "",
        variables: extractEmailVariables(html),
        gjsData: editorRef.current.getProjectData(),
      };
      onExport(emailTemplate);
    }
  }, [onExport, preset.id]);

  /**
   * Handle preview action.
   */
  const handlePreview = useCallback(() => {
    if (!editorRef.current) return;

    // Open preview in new window
    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    const previewWindow = window.open("", "_blank");

    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Preview</title>
            <style>${css}</style>
          </head>
          <body>${html}</body>
        </html>
      `);
      previewWindow.document.close();
    }
  }, []);

  /**
   * Handle undo action.
   */
  const handleUndo = useCallback(() => {
    editorRef.current?.UndoManager.undo();
  }, []);

  /**
   * Handle redo action.
   */
  const handleRedo = useCallback(() => {
    editorRef.current?.UndoManager.redo();
  }, []);

  /**
   * Handle clear action.
   */
  const handleClear = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.DomComponents.clear();
      editorRef.current.CssComposer.clear();
    }
  }, []);

  return (
    <div className={`grapes-editor-container ${className}`}>
      <EditorToolbar
        onSave={onSave ? handleSave : undefined}
        onExport={onExport ? handleExport : undefined}
        onPreview={handlePreview}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        canUndo={canUndo}
        canRedo={canRedo}
        isReady={isReady}
        presetName={preset.name}
      />
      <div ref={containerRef} className="grapes-editor" style={{ height }} />
    </div>
  );
}

/**
 * Extract form fields from editor components.
 */
function extractFormFields(editor: Editor): ExportedFormSchema["fields"] {
  const fields: ExportedFormSchema["fields"] = [];
  const wrapper = editor.DomComponents.getWrapper();

  if (!wrapper) return fields;

  // Find all form field components
  const findFields = (component: ReturnType<typeof wrapper.find>[0]) => {
    const type = component.get("type");
    const attributes = component.getAttributes();

    // Check if this is a form field
    if (type?.startsWith("field-") || attributes["data-field-type"]) {
      // Parse options and validation with error handling
      let options: unknown;
      let validation: unknown;

      if (attributes["data-options"]) {
        try {
          options = JSON.parse(attributes["data-options"]);
        } catch {
          // Invalid JSON, skip options
          options = undefined;
        }
      }

      if (attributes["data-validation"]) {
        try {
          validation = JSON.parse(attributes["data-validation"]);
        } catch {
          // Invalid JSON, skip validation
          validation = undefined;
        }
      }

      fields.push({
        id: attributes.id || `field-${fields.length + 1}`,
        type: (attributes["data-field-type"] ||
          type?.replace("field-", "") ||
          "text") as ExportedFormSchema["fields"][0]["type"],
        label: attributes["data-label"] || "",
        placeholder: attributes.placeholder || "",
        required:
          attributes.required === "true" || attributes.required === true,
        options: options as ExportedFormSchema["fields"][0]["options"],
        validation: validation as ExportedFormSchema["fields"][0]["validation"],
      });
    }

    // Recurse into children
    const children = component.components();
    if (children) {
      for (const child of children) {
        findFields(child);
      }
    }
  };

  for (const comp of wrapper.components()) {
    findFields(comp);
  }
  return fields;
}

/**
 * Extract form sections from editor components.
 */
function extractFormSections(editor: Editor): ExportedFormSchema["sections"] {
  const sections: ExportedFormSchema["sections"] = [];
  const wrapper = editor.DomComponents.getWrapper();

  if (!wrapper) return sections;

  // Find all section components using for...of for consistency with other
  // component iteration patterns in this file (see findFields function above)
  const children = wrapper.components();
  let index = 0;
  for (const component of children) {
    const type = component.get("type");
    const attributes = component.getAttributes();

    if (type === "form-section" || attributes["data-section"]) {
      sections.push({
        id: attributes.id || `section-${index + 1}`,
        title: attributes["data-title"] || `Section ${index + 1}`,
        description: attributes["data-description"] || undefined,
        order: index,
      });
    }
    index++;
  }

  return sections;
}

/**
 * Wrap email HTML with CSS in a complete document.
 *
 * **Important**: This is a basic implementation that wraps CSS in a style tag.
 * For production email templates that need maximum client compatibility,
 * use a CSS inlining library like `juice` or `inline-css` to convert
 * CSS rules into inline style attributes on each element.
 *
 * Example with juice:
 * ```ts
 * import juice from "juice";
 * const inlinedHtml = juice(html + `<style>${css}</style>`);
 * ```
 */
function inlineEmailStyles(html: string, css: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>${css}</style>
      </head>
      <body>${html}</body>
    </html>
  `;
}

/**
 * Extract template variables from email HTML (e.g., {{name}}, {{email}}).
 */
function extractEmailVariables(html: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables = new Set<string>();

  const matches = html.matchAll(regex);
  for (const match of matches) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}
