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
import { useCallback, useEffect, useMemo, useRef } from "react";

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
  /** Initial HTML content to load in the editor (use for new content) */
  initialContent?: string;
  /** Initial project data to load (use for restoring saved projects) */
  initialProject?: Record<string, unknown>;
  /** Called when content changes */
  onChange?: (html: string, css: string, json: unknown) => void;
  /** Called when user explicitly saves */
  onSave?: (data: { html: string; css: string; json: unknown }) => void;
  /** Editor theme - "light" or "dark". Defaults to "light" */
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
  /** Unique key to identify this editor instance (used for storage isolation). Changing this forces a remount. */
  editorKey?: string;
  /** Start the editor in preview mode (hides panels, shows canvas only). Useful for read-only views. */
  previewMode?: boolean;
  /** Lock the editor in preview mode - prevents user from exiting preview. Used with previewMode. */
  lockPreview?: boolean;
  /** Initial device to select (e.g., "Desktop", "Mobile", "Tablet"). */
  initialDevice?: string;
  /** Called when user changes the device. Receives the device name. */
  onDeviceChange?: (device: string) => void;
}

/** Width constant for email content containers. Standard email width for compatibility. */
const EMAIL_CONTENT_MAX_WIDTH = 600;

/**
 * Email-specific content blocks optimized for HTML email templates.
 *
 * These blocks are only registered when `projectType` is set to `"email"`.
 * They use table-based layouts and inline styles to maximize compatibility
 * across major email clients (Gmail, Outlook, Apple Mail, etc.).
 *
 * Note: Some properties like border-radius may not render in older Outlook
 * versions using the Word rendering engine, but degrade gracefully.
 *
 * @see StudioProjectType
 * @see StudioBlock
 */
const emailBlocks: StudioBlock[] = [
  {
    id: "email-header",
    label: "Header with Logo",
    category: "Email",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="6" rx="1" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="7" cy="7" r="2" stroke="currentColor" fill="none" stroke-width="2"/><line x1="11" y1="7" x2="20" y2="7" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%);">
        <tr>
          <td align="center" style="padding: 32px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: ${EMAIL_CONTENT_MAX_WIDTH}px;">
              <tr>
                <td align="left" style="padding-bottom: 8px;">
                  <span style="font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Your Company</span>
                  <span style="font-size: 24px; font-weight: 400; color: #94a3b8; letter-spacing: -0.5px;"> Name Here</span>
                </td>
              </tr>
              <tr>
                <td align="left">
                  <span style="font-size: 14px; color: #94a3b8;">Add your email header tagline here</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    id: "email-hero",
    label: "Hero Section",
    category: "Email",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><line x1="6" y1="8" x2="18" y2="8" stroke="currentColor" stroke-width="2"/><line x1="6" y1="12" x2="14" y2="12" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
        <tr>
          <td align="center" style="padding: 48px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: ${EMAIL_CONTENT_MAX_WIDTH}px;">
              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #111827; line-height: 1.2;">Your Headline Here</h1>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom: 32px;">
                  <p style="margin: 0; font-size: 18px; color: #6b7280; line-height: 1.6;">Write a compelling introduction that captures your reader's attention and sets the stage for your message.</p>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <a href="#" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">Get Started</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    id: "email-text",
    label: "Text Block",
    category: "Email",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2"/><line x1="3" y1="18" x2="15" y2="18" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
        <tr>
          <td align="center" style="padding: 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: ${EMAIL_CONTENT_MAX_WIDTH}px;">
              <tr>
                <td style="color: #374151; font-size: 16px; line-height: 1.6;">
                  <p style="margin: 0 0 16px 0;">This is a paragraph of text. You can edit this content to say whatever you need. Keep your paragraphs short and focused for better readability in email clients.</p>
                  <p style="margin: 0;">Add multiple paragraphs as needed to communicate your message effectively.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    id: "email-button",
    label: "Button",
    category: "Email",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="7" width="18" height="10" rx="5" stroke="currentColor" fill="none" stroke-width="2"/></svg>`,
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 24px;">
            <a href="#" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">Call to Action</a>
          </td>
        </tr>
      </table>
    `,
  },
  {
    id: "email-image",
    label: "Image",
    category: "Email",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" fill="none" stroke-width="2"/></svg>`,
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 24px;">
            <img src="https://placehold.co/600x300/e5e7eb/6b7280?text=Your+Image" alt="Image description" width="100%" style="max-width: ${EMAIL_CONTENT_MAX_WIDTH}px; height: auto; display: block;" />
          </td>
        </tr>
      </table>
    `,
  },
  {
    id: "email-divider",
    label: "Divider",
    category: "Email",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 16px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: ${EMAIL_CONTENT_MAX_WIDTH}px;">
              <tr>
                <td style="border-bottom: 1px solid #e5e7eb;"></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    id: "email-spacer",
    label: "Spacer",
    category: "Email",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-dasharray="2,2"/></svg>`,
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="height: 32px; line-height: 32px; font-size: 1px;">&nbsp;</td>
        </tr>
      </table>
    `,
  },
  {
    id: "email-two-columns",
    label: "Two Columns",
    category: "Email",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="3" width="8" height="18" rx="1" stroke="currentColor" fill="none" stroke-width="2"/><rect x="14" y="3" width="8" height="18" rx="1" stroke="currentColor" fill="none" stroke-width="2"/></svg>`,
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
        <tr>
          <td align="center" style="padding: 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: ${EMAIL_CONTENT_MAX_WIDTH}px;">
              <tr>
                <td width="48%" valign="top" style="padding-right: 12px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #111827;">Column One</h3>
                  <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">Add your content here. This column takes up about half the width.</p>
                </td>
                <td width="4%"></td>
                <td width="48%" valign="top" style="padding-left: 12px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #111827;">Column Two</h3>
                  <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">Add your content here. This column takes up about half the width.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    id: "email-feature-card",
    label: "Feature Card",
    category: "Email",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="12" cy="9" r="3" stroke="currentColor" fill="none" stroke-width="2"/><line x1="7" y1="15" x2="17" y2="15" stroke="currentColor" stroke-width="2"/><line x1="9" y1="18" x2="15" y2="18" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
        <tr>
          <td align="center" style="padding: 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 280px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
              <tr>
                <td align="center" style="padding: 32px 24px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                    <tr>
                      <td align="center" style="width: 56px; height: 56px; background-color: #dbeafe; text-align: center; line-height: 56px;">
                        <svg role="img" aria-label="Feature icon" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="#1d4ed8" />
                        </svg>
                      </td>
                    </tr>
                  </table>
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #111827;">Feature Title</h3>
                  <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">Describe this feature and its benefits for the reader.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    id: "email-social-links",
    label: "Social Links",
    category: "Email",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="3" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="18" cy="12" r="3" stroke="currentColor" fill="none" stroke-width="2"/></svg>`,
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 0 8px;">
                  <a href="#" aria-label="Visit our X (Twitter) profile" title="X (Twitter)" style="display: inline-block; width: 40px; height: 40px; background-color: #000000; text-align: center; line-height: 40px; text-decoration: none; color: #ffffff; font-size: 18px; font-weight: bold;">X</a>
                </td>
                <td style="padding: 0 8px;">
                  <a href="#" aria-label="Visit our LinkedIn profile" title="LinkedIn" style="display: inline-block; width: 40px; height: 40px; background-color: #0077b5; text-align: center; line-height: 40px; text-decoration: none; color: #ffffff; font-size: 16px; font-weight: bold;">in</a>
                </td>
                <td style="padding: 0 8px;">
                  <a href="#" aria-label="Visit our Instagram profile" title="Instagram" style="display: inline-block; width: 40px; height: 40px; background-color: #e4405f; text-align: center; line-height: 40px; text-decoration: none; color: #ffffff; font-size: 14px; font-weight: bold;">IG</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    id: "email-footer",
    label: "Footer",
    category: "Email",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="14" width="20" height="6" rx="1" stroke="currentColor" fill="none" stroke-width="2"/><line x1="6" y1="17" x2="18" y2="17" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
        <tr>
          <td align="center" style="padding: 32px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: ${EMAIL_CONTENT_MAX_WIDTH}px;">
              <tr>
                <td align="center" style="padding-bottom: 16px;">
                  <span style="font-size: 16px; font-weight: 600; color: #374151;">Your Company Name</span>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom: 16px;">
                  <span style="font-size: 13px; color: #6b7280;">123 Street Address, Suite 100</span><br/>
                  <span style="font-size: 13px; color: #6b7280;">City, State 00000</span>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom: 16px;">
                  <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 13px;">Unsubscribe</a>
                  <span style="color: #d1d5db; margin: 0 8px;">|</span>
                  <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 13px;">Manage Preferences</a>
                  <span style="color: #d1d5db; margin: 0 8px;">|</span>
                  <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 13px;">View in Browser</a>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <span style="font-size: 12px; color: #9ca3af;">© 2026 Your Company. All rights reserved.</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
];

/** Email canvas styles for email-safe rendering */
const emailCanvasStyles = `
  * {
    box-sizing: border-box;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #111827;
    margin: 0;
    padding: 0;
    background: #f3f4f6;
    -webkit-font-smoothing: antialiased;
  }
  table {
    border-collapse: collapse;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  img {
    border: 0;
    height: auto;
    line-height: 100%;
    outline: none;
    text-decoration: none;
    -ms-interpolation-mode: bicubic;
  }
  a {
    color: #3b82f6;
  }
`;

/** Form-specific blocks for the form builder */
const formBlocks: StudioBlock[] = [
  {
    id: "form-section",
    label: "Form Section",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <div class="form-section" data-gjs-name="Form Section" data-gjs-droppable="true" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 class="section-title" data-gjs-name="Section Title" style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0; color: #111827;">Section Title</h3>
        <p class="section-description" data-gjs-name="Section Description" style="color: #6b7280; margin: 0 0 24px 0; font-size: 14px;">Section description text</p>
        <div class="section-fields" data-gjs-name="Section Fields Container" data-gjs-droppable="true" style="min-height: 60px;"></div>
      </div>
    `,
  },
  {
    id: "text-input",
    label: "Text Input",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><line x1="7" y1="12" x2="12" y2="12" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <div class="form-field" data-gjs-name="Text Input Field" style="margin-bottom: 20px;">
        <label data-gjs-name="Field Label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151;">Field Label</label>
        <input type="text" data-gjs-name="Text Input" placeholder="Enter text..." style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #ffffff; color: #111827;" />
      </div>
    `,
  },
  {
    id: "email-input",
    label: "Email Input",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><path d="M3 7l9 6 9-6" stroke="currentColor" fill="none" stroke-width="2"/></svg>`,
    content: `
      <div class="form-field" data-gjs-name="Email Input Field" style="margin-bottom: 20px;">
        <label data-gjs-name="Email Label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151;">Email Address</label>
        <input type="email" data-gjs-name="Email Input" placeholder="email@example.com" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #ffffff; color: #111827;" />
      </div>
    `,
  },
  {
    id: "textarea",
    label: "Textarea",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" stroke-width="2"/><line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" stroke-width="2"/><line x1="7" y1="16" x2="12" y2="16" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <div class="form-field" data-gjs-name="Textarea Field" style="margin-bottom: 20px;">
        <label data-gjs-name="Textarea Label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151;">Description</label>
        <textarea data-gjs-name="Textarea Input" placeholder="Enter description..." rows="4" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #ffffff; color: #111827; resize: vertical; min-height: 100px;"></textarea>
      </div>
    `,
  },
  {
    id: "select-dropdown",
    label: "Select Dropdown",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><path d="M8 10l4 4 4-4" stroke="currentColor" fill="none" stroke-width="2"/></svg>`,
    content: `
      <div class="form-field" data-gjs-name="Select Dropdown Field" style="margin-bottom: 20px;">
        <label data-gjs-name="Select Label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151;">Select Option</label>
        <select data-gjs-name="Select Dropdown" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #ffffff; color: #111827;">
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
      <div class="form-field" data-gjs-name="Checkbox Field" style="margin-bottom: 20px;">
        <label data-gjs-name="Checkbox Label" style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; color: #374151;">
          <input type="checkbox" data-gjs-name="Checkbox Input" style="width: 18px; height: 18px; border-radius: 4px;" />
          <span data-gjs-name="Checkbox Text">Checkbox label</span>
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
      <div class="form-field" data-gjs-name="Radio Group Field" style="margin-bottom: 20px;">
        <label data-gjs-name="Radio Group Label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 12px; color: #374151;">Select one option</label>
        <div class="radio-group" data-gjs-name="Radio Options Container" style="display: flex; flex-direction: column; gap: 10px;">
          <label data-gjs-name="Radio Option 1" style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 12px; border-radius: 8px; font-size: 14px; color: #374151;">
            <input type="radio" data-gjs-name="Radio Input 1" name="radio-group" style="width: 18px; height: 18px;" />
            <span data-gjs-name="Radio Text 1">Option 1</span>
          </label>
          <label data-gjs-name="Radio Option 2" style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 12px; border-radius: 8px; font-size: 14px; color: #374151;">
            <input type="radio" data-gjs-name="Radio Input 2" name="radio-group" style="width: 18px; height: 18px;" />
            <span data-gjs-name="Radio Text 2">Option 2</span>
          </label>
          <label data-gjs-name="Radio Option 3" style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 12px; border-radius: 8px; font-size: 14px; color: #374151;">
            <input type="radio" data-gjs-name="Radio Input 3" name="radio-group" style="width: 18px; height: 18px;" />
            <span data-gjs-name="Radio Text 3">Option 3</span>
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
      <button type="submit" data-gjs-name="Submit Button" style="display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">
        Submit
      </button>
    `,
  },
  {
    id: "number-input",
    label: "Number Input",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><text x="12" y="14" text-anchor="middle" font-size="8" fill="currentColor">123</text></svg>`,
    content: `
      <div class="form-field" data-gjs-name="Number Input Field" style="margin-bottom: 20px;">
        <label data-gjs-name="Number Label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151;">Number</label>
        <input type="number" data-gjs-name="Number Input" placeholder="0" min="0" max="100" step="1" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #ffffff; color: #111827;" />
      </div>
    `,
  },
  {
    id: "date-input",
    label: "Date Picker",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/></svg>`,
    content: `
      <div class="form-field" data-gjs-name="Date Picker Field" style="margin-bottom: 20px;">
        <label data-gjs-name="Date Label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151;">Date</label>
        <input type="date" data-gjs-name="Date Input" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #ffffff; color: #111827;" />
      </div>
    `,
  },
  {
    id: "file-upload",
    label: "File Upload",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" fill="none" stroke-width="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" fill="none" stroke-width="2"/><line x1="12" y1="18" x2="12" y2="12" stroke="currentColor" stroke-width="2"/><polyline points="9 15 12 12 15 15" stroke="currentColor" fill="none" stroke-width="2"/></svg>`,
    content: `
      <div class="form-field" data-gjs-name="File Upload Field" style="margin-bottom: 20px;">
        <label data-gjs-name="File Label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151;">Upload File</label>
        <div data-gjs-name="File Upload Zone" style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: border-color 0.2s;">
          <input type="file" data-gjs-name="File Input" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style="display: none;" />
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="margin: 0 auto 12px;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p data-gjs-name="Upload Text" style="margin: 0 0 4px 0; font-size: 14px; color: #374151;">Click to upload or drag and drop</p>
          <p data-gjs-name="Upload Hint" style="margin: 0; font-size: 12px; color: #9ca3af;">PDF, DOC, DOCX, PNG, JPG up to 10MB</p>
        </div>
      </div>
    `,
  },
  {
    id: "combobox",
    label: "Combobox",
    category: "Form",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="8" cy="12" r="2" stroke="currentColor" fill="none" stroke-width="2"/><line x1="12" y1="12" x2="18" y2="12" stroke="currentColor" stroke-width="2"/><path d="M17 10l2 2-2 2" stroke="currentColor" fill="none" stroke-width="2"/></svg>`,
    content: `
      <div class="form-field" data-gjs-name="Combobox Field" style="margin-bottom: 20px;">
        <label data-gjs-name="Combobox Label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151;">Search & Select</label>
        <div data-gjs-name="Combobox Container" style="position: relative;">
          <input type="text" data-gjs-name="Combobox Input" list="combobox-options" placeholder="Type to search..." style="width: 100%; padding: 10px 40px 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #ffffff; color: #111827;" />
          <datalist id="combobox-options" data-gjs-name="Combobox Options">
            <option value="Option 1">Option 1</option>
            <option value="Option 2">Option 2</option>
            <option value="Option 3">Option 3</option>
          </datalist>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>
    `,
  },
];

/** Default block categories for forms */
const _formBlockCategories: StudioBlockCategory[] = [
  { id: "Form", label: "Form Elements", order: 1, open: true },
  { id: "Basic", label: "Basic", order: 2, open: false },
];

/** Light mode canvas styles for the form builder - Typeform-inspired design */
const lightCanvasStyles = `
  :root {
    --bg-page: #ffffff;
    --bg-card: #ffffff;
    --bg-input: #ffffff;
    --bg-hover: #f4f4f5;
    --bg-option: #fafafa;
    --bg-option-hover: #f4f4f5;
    --bg-option-selected: #18181b;
    --text-primary: #18181b;
    --text-secondary: #71717a;
    --text-muted: #a1a1aa;
    --text-on-selected: #fafafa;
    --border-default: #e4e4e7;
    --border-focus: #18181b;
    --accent: #18181b;
    --primary: #3b82f6;
    --success: #22c55e;
    --error: #ef4444;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --radius: 12px;
    --radius-sm: 8px;
    --transition: 0.15s ease;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: var(--text-primary);
    background: var(--bg-page);
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    padding: 24px;
  }

  .form-container {
    max-width: 640px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
  }

  .form-section {
    background: var(--bg-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius);
    padding: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-sm);
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
  }

  .section-description {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    margin: 0 0 2rem 0;
    line-height: 1.5;
  }

  .form-field {
    margin-bottom: 2rem;
  }
  .form-field:last-child {
    margin-bottom: 0;
  }

  label, .label {
    display: block;
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
  }

  .field-hint {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: -0.25rem 0 0.75rem 0;
  }

  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="url"],
  input[type="number"],
  input[type="password"],
  input[type="date"],
  .form-input {
    display: block;
    width: 100%;
    height: 2.5rem;
    padding: 0 0.875rem;
    font-size: 0.875rem;
    font-family: inherit;
    color: var(--text-primary);
    background: var(--bg-input);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    transition: all var(--transition);
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.08);
  }

  textarea, .form-textarea {
    display: block;
    width: 100%;
    min-height: 100px;
    padding: 0.75rem 0.875rem;
    font-size: 0.875rem;
    font-family: inherit;
    color: var(--text-primary);
    background: var(--bg-input);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    resize: vertical;
  }

  select, .form-select {
    display: block;
    width: 100%;
    height: 2.5rem;
    padding: 0 2.5rem 0 0.875rem;
    font-size: 0.875rem;
    font-family: inherit;
    color: var(--text-primary);
    background-color: var(--bg-input);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e");
    background-position: right 0.75rem center;
    background-repeat: no-repeat;
    background-size: 1rem;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    cursor: pointer;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .radio-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .radio-option {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 0.875rem;
    background: var(--bg-option);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition);
  }
  .radio-option:hover {
    background: var(--bg-option-hover);
    border-color: var(--text-muted);
  }
  .radio-option:has(input:checked) {
    background: var(--bg-option-selected);
    border-color: var(--bg-option-selected);
    color: var(--text-on-selected);
  }
  .radio-horizontal .radio-option {
    flex: 1;
    min-width: 80px;
    justify-content: center;
  }

  /* Hide radio/checkbox inputs inside styled option cards (Typeform-style) */
  .radio-option input[type="radio"],
  .checkbox-option input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  /* Show radio/checkbox inputs when not inside styled cards */
  input[type="radio"],
  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    accent-color: var(--accent);
    cursor: pointer;
    flex-shrink: 0;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .checkbox-option {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.625rem 0.875rem;
    background: var(--bg-option);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    cursor: pointer;
  }
  .checkbox-option:hover {
    background: var(--bg-option-hover);
  }
  .checkbox-option:has(input:checked) {
    background: var(--bg-option-selected);
    border-color: var(--bg-option-selected);
    color: var(--text-on-selected);
  }

  .conditional-field,
  [data-condition-field] {
    display: none;
    position: relative;
  }
  .conditional-field.visible,
  [data-condition-field].visible {
    display: block;
    margin-top: 1.5rem;
  }

  button {
    font-family: inherit;
  }
`;

/** JavaScript for conditional logic in forms */
const conditionalLogicScript = `
<script>
(function() {
  function initConditionalLogic() {
    var conditionalFields = document.querySelectorAll('[data-condition-field]');

    conditionalFields.forEach(function(field) {
      var conditionField = field.getAttribute('data-condition-field');
      var conditionValue = field.getAttribute('data-condition-value');

      if (!conditionField) return;

      var controlInputs = document.querySelectorAll(
        'input[name="' + conditionField + '"], ' +
        'select[name="' + conditionField + '"], ' +
        '[data-field-name="' + conditionField + '"] input, ' +
        '[data-field-name="' + conditionField + '"] select'
      );

      function checkCondition() {
        var shouldShow = false;

        controlInputs.forEach(function(input) {
          if (input.type === 'radio' || input.type === 'checkbox') {
            if (input.checked) {
              var inputValue = input.value || input.parentElement.textContent.trim();
              if (!conditionValue || inputValue === conditionValue) {
                shouldShow = true;
              }
            }
          } else if (input.tagName === 'SELECT') {
            if (!conditionValue || input.value === conditionValue) {
              shouldShow = input.value !== '';
            }
          } else {
            if (!conditionValue || input.value === conditionValue) {
              shouldShow = input.value !== '';
            }
          }
        });

        field.classList.toggle('visible', shouldShow);
      }

      controlInputs.forEach(function(input) {
        input.addEventListener('change', checkCondition);
        input.addEventListener('input', checkCondition);
      });

      checkCondition();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConditionalLogic);
  } else {
    initConditionalLogic();
  }

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        setTimeout(initConditionalLogic, 100);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
</script>
`;

/** Dark mode canvas styles for the form builder - Typeform-inspired design */
const darkCanvasStyles = `
  :root {
    --bg-page: #09090b;
    --bg-card: #18181b;
    --bg-input: #27272a;
    --bg-hover: #27272a;
    --bg-option: #27272a;
    --bg-option-hover: #3f3f46;
    --bg-option-selected: #fafafa;
    --text-primary: #fafafa;
    --text-secondary: #a1a1aa;
    --text-muted: #71717a;
    --text-on-selected: #18181b;
    --border-default: #3f3f46;
    --border-focus: #fafafa;
    --accent: #fafafa;
    --primary: #3b82f6;
    --success: #22c55e;
    --error: #ef4444;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
    --radius: 12px;
    --radius-sm: 8px;
    --transition: 0.15s ease;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: var(--text-primary);
    background: var(--bg-page);
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    padding: 24px;
  }

  .form-container {
    max-width: 640px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
  }

  .form-section {
    background: var(--bg-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius);
    padding: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-sm);
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
  }

  .section-description {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    margin: 0 0 2rem 0;
    line-height: 1.5;
  }

  .form-field {
    margin-bottom: 2rem;
  }
  .form-field:last-child {
    margin-bottom: 0;
  }

  label, .label {
    display: block;
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
  }

  .field-hint {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: -0.25rem 0 0.75rem 0;
  }

  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="url"],
  input[type="number"],
  input[type="password"],
  input[type="date"],
  .form-input {
    display: block;
    width: 100%;
    height: 2.5rem;
    padding: 0 0.875rem;
    font-size: 0.875rem;
    font-family: inherit;
    color: var(--text-primary);
    background: var(--bg-input);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    transition: all var(--transition);
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(250, 250, 250, 0.1);
  }

  input::placeholder, textarea::placeholder {
    color: var(--text-muted);
  }

  textarea, .form-textarea {
    display: block;
    width: 100%;
    min-height: 100px;
    padding: 0.75rem 0.875rem;
    font-size: 0.875rem;
    font-family: inherit;
    color: var(--text-primary);
    background: var(--bg-input);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    resize: vertical;
  }

  select, .form-select {
    display: block;
    width: 100%;
    height: 2.5rem;
    padding: 0 2.5rem 0 0.875rem;
    font-size: 0.875rem;
    font-family: inherit;
    color: var(--text-primary);
    background-color: var(--bg-input);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e");
    background-position: right 0.75rem center;
    background-repeat: no-repeat;
    background-size: 1rem;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    cursor: pointer;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .radio-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .radio-option {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 0.875rem;
    background: var(--bg-option);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition);
  }
  .radio-option:hover {
    background: var(--bg-option-hover);
    border-color: var(--text-muted);
  }
  .radio-option:has(input:checked) {
    background: var(--bg-option-selected);
    border-color: var(--bg-option-selected);
    color: var(--text-on-selected);
  }
  .radio-horizontal .radio-option {
    flex: 1;
    min-width: 80px;
    justify-content: center;
  }

  /* Hide radio/checkbox inputs inside styled option cards (Typeform-style) */
  .radio-option input[type="radio"],
  .checkbox-option input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  /* Show radio/checkbox inputs when not inside styled cards */
  input[type="radio"],
  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    accent-color: var(--accent);
    cursor: pointer;
    flex-shrink: 0;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .checkbox-option {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.625rem 0.875rem;
    background: var(--bg-option);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    cursor: pointer;
  }
  .checkbox-option:hover {
    background: var(--bg-option-hover);
  }
  .checkbox-option:has(input:checked) {
    background: var(--bg-option-selected);
    border-color: var(--bg-option-selected);
    color: var(--text-on-selected);
  }

  .conditional-field,
  [data-condition-field] {
    display: none;
    position: relative;
  }
  .conditional-field.visible,
  [data-condition-field].visible {
    display: block;
    margin-top: 1.5rem;
  }

  button {
    font-family: inherit;
  }
`;

/** Get canvas styles based on theme */
const getCanvasStyles = (theme: StudioTheme, projectType: "web" | "email") => {
  if (projectType === "email") {
    return emailCanvasStyles; // Email styles stay consistent for compatibility
  }
  return theme === "dark" ? darkCanvasStyles : lightCanvasStyles;
};

/**
 * StudioEditor component using GrapesJS Studio SDK.
 * Production-ready visual editor with beautiful built-in UI.
 */
export function StudioEditor({
  projectType = "web",
  initialContent,
  initialProject,
  onChange,
  onSave,
  theme = "light",
  customBlocks,
  blockCategories: _blockCategories,
  showPages: _showPages = false,
  showLayers: _showLayers = true,
  height = "100%",
  canvasStyles,
  licenseKey = "DEV_LICENSE_KEY",
  onReady,
  storage = { type: false },
  editorKey,
  previewMode = false,
  lockPreview = false,
  initialDevice,
  onDeviceChange,
}: StudioEditorProps) {
  const editorRef = useRef<Editor | null>(null);

  // Clear GrapesJS localStorage when storage is disabled or when editorKey changes
  // This prevents stale data from being loaded instead of the initialProject
  useEffect(() => {
    if (storage.type === false && typeof window !== "undefined") {
      // GrapesJS uses various localStorage keys - clear all of them
      // to ensure initialProject is used instead of cached data
      try {
        const keysToRemove = [
          "gjsProject",
          "gjs-project",
          "gjs",
          "gjsData",
          "gjs-data",
          "gjs-studio",
          "gjsStudio",
          "gjs-assets",
          "gjsAssets",
        ];
        for (const key of keysToRemove) {
          localStorage.removeItem(key);
        }
        // Also clear any keys that start with common GrapesJS prefixes
        const allKeys = Object.keys(localStorage);
        for (const key of allKeys) {
          if (
            key.startsWith("gjs-") ||
            key.startsWith("gjs") ||
            key.startsWith("grapes")
          ) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Ignore localStorage errors (e.g., in private browsing)
      }
    }
  }, [storage.type]);

  // Choose blocks based on project type (memoized to avoid reference changes)
  const baseBlocks = useMemo(
    () => (projectType === "email" ? emailBlocks : formBlocks),
    [projectType],
  );

  // Merge custom blocks with base blocks
  const allBlocks = useMemo(() => {
    const blocks = [...baseBlocks];
    if (customBlocks) {
      blocks.push(...customBlocks);
    }
    return blocks;
  }, [baseBlocks, customBlocks]);

  // Handle editor ready
  const handleReady = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      console.log("[StudioEditor] handleReady called:", {
        hasInitialProject: !!initialProject,
        initialProjectKeys: initialProject ? Object.keys(initialProject) : null,
        previewMode,
        lockPreview,
      });

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

      // Debug: Check what the SDK loaded via project.default
      editor.onReady(() => {
        const loadedData = editor.getProjectData();
        console.log("[StudioEditor] onReady - SDK loaded data:", loadedData);
        console.log("[StudioEditor] onReady - getHtml():", editor.getHtml());
        console.log(
          "[StudioEditor] onReady - Components:",
          editor.getComponents().length,
        );

        // Debug: Check canvas state
        const canvasEl = editor.Canvas.getElement();
        const canvasDoc = editor.Canvas.getDocument();
        const canvasBody = editor.Canvas.getBody();
        const canvasFrame = editor.Canvas.getFrameEl();

        // Check for wrapper element
        const wrapper = editor.getWrapper();

        console.log("[StudioEditor] onReady - Canvas debug:", {
          canvasEl: canvasEl,
          canvasElDimensions: canvasEl
            ? { width: canvasEl.offsetWidth, height: canvasEl.offsetHeight }
            : null,
          canvasDoc: canvasDoc,
          canvasBody: canvasBody,
          canvasBodyChildren: canvasBody?.children?.length,
          canvasFrame: canvasFrame,
          canvasFrameSrc: canvasFrame?.src,
          wrapper: wrapper,
          wrapperHtml: wrapper?.toHTML?.(),
        });

        // List all children of the canvas body
        if (canvasBody) {
          console.log("[StudioEditor] Canvas body children:");
          Array.from(canvasBody.children).forEach((child, i) => {
            console.log(`  [${i}] ${child.tagName}`, child);
          });
        }

        // Check wrapper computed styles
        const wrapperEl = canvasBody?.querySelector(
          '[data-gjs-type="wrapper"]',
        ) as HTMLElement | null;
        if (wrapperEl) {
          const styles = window.getComputedStyle(wrapperEl);
          console.log("[StudioEditor] Wrapper element styles:", {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            height: styles.height,
            width: styles.width,
            overflow: styles.overflow,
            position: styles.position,
            zIndex: styles.zIndex,
            backgroundColor: styles.backgroundColor,
          });
          console.log(
            "[StudioEditor] Wrapper element dimensions:",
            wrapperEl.getBoundingClientRect(),
          );
          console.log(
            "[StudioEditor] Wrapper innerHTML preview:",
            wrapperEl.innerHTML.substring(0, 300),
          );
        }

        // Check canvas frame styles
        if (canvasFrame) {
          const frameStyles = window.getComputedStyle(canvasFrame);
          console.log("[StudioEditor] Canvas frame styles:", {
            display: frameStyles.display,
            visibility: frameStyles.visibility,
            opacity: frameStyles.opacity,
            height: frameStyles.height,
            width: frameStyles.width,
            position: frameStyles.position,
          });
          console.log(
            "[StudioEditor] Canvas frame dimensions:",
            canvasFrame.getBoundingClientRect(),
          );
        }
      });

      // Set up change listener
      if (onChange) {
        editor.on("update", () => {
          const html = editor.getHtml();
          const css = editor.getCss();
          const json = editor.getProjectData();
          onChange(html, css || "", json);
        });
      }

      // Set up save listener - called when user clicks save button or autosave triggers
      // Skip the first storage event which fires on initialization
      if (onSave) {
        let isInitialLoad = true;
        editor.on("storage:store", () => {
          // Skip the initial store event that fires when loading project
          if (isInitialLoad) {
            isInitialLoad = false;
            return;
          }
          const html = editor.getHtml();
          const css = editor.getCss();
          const json = editor.getProjectData();
          onSave({ html, css: css || "", json });
        });
      }

      // Set up device change listener
      if (onDeviceChange) {
        editor.on("change:device", () => {
          const device = editor.getDevice();
          onDeviceChange(device);
        });
      }

      // Set initial device if specified
      if (initialDevice) {
        editor.setDevice(initialDevice);
      }

      // Start in preview mode if requested
      if (previewMode) {
        // Wait for the editor to be fully ready including canvas
        editor.onReady(() => {
          // Additional delay to ensure canvas iframe is fully loaded
          const attemptPreview = (retries = 0) => {
            const canvasDoc = editor.Canvas.getDocument();
            if (canvasDoc?.body) {
              editor.runCommand("core:preview");

              // If preview is locked, intercept attempts to exit preview
              if (lockPreview) {
                editor.on(
                  "command:stop:before:core:preview",
                  (options: { abort?: boolean }) => {
                    // Prevent exiting preview mode
                    options.abort = true;
                  },
                );
              }
            } else if (retries < 10) {
              // Retry up to 10 times with increasing delay
              setTimeout(
                () => attemptPreview(retries + 1),
                100 * (retries + 1),
              );
            }
          };
          // Start attempting after a short initial delay
          setTimeout(() => attemptPreview(), 200);
        });
      }

      onReady?.(editor);
    },
    [
      allBlocks,
      initialProject,
      onChange,
      onSave,
      onReady,
      onDeviceChange,
      initialDevice,
      previewMode,
      lockPreview,
    ],
  );

  // Get theme styles for injection via SDK plugins
  const themeStyles = useMemo(
    () => canvasStyles || getCanvasStyles(theme, projectType),
    [canvasStyles, theme, projectType],
  );

  // Build default project content (without embedded CSS - CSS is added via plugins)
  const defaultProject = useMemo(() => {
    const isEmail = projectType === "email";

    console.log("[StudioEditor] defaultProject computation:", {
      hasInitialProject: !!initialProject,
      initialProjectLength: initialProject
        ? Object.keys(initialProject).length
        : 0,
      willUseInitialProject: !!(
        initialProject && Object.keys(initialProject).length > 0
      ),
    });

    // If initialProject is provided, use it as-is (CSS will be added via plugins)
    if (initialProject && Object.keys(initialProject).length > 0) {
      return initialProject;
    }

    const defaultEmailContent = `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; min-height: 100vh;">
        <tr>
          <td align="center" style="padding: 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" data-gjs-droppable="true">
              <tr>
                <td data-gjs-droppable="true" style="min-height: 200px;">
                  <p style="text-align: center; color: #6b7280; padding: 48px 24px;">Drop email blocks here to build your template</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    const defaultFormContent =
      "<div data-gjs-droppable='true' style='min-height: 200px; padding: 24px;'><p>Drop form elements here to build your form</p></div>";

    const content =
      initialContent || (isEmail ? defaultEmailContent : defaultFormContent);

    return {
      pages: [
        {
          name: isEmail ? "Email" : "Form",
          component: content,
        },
      ],
    };
  }, [initialContent, initialProject, projectType]);

  // Create a plugin that injects theme styles and conditional logic via CssComposer
  // This is the SDK-recommended way to add global CSS to the canvas
  const themeStylesPlugin = useCallback(
    (editor: Editor) => {
      editor.onReady(() => {
        // Use CssComposer.addRules() to add CSS rules to the canvas
        // This properly adds styles to GrapesJS's CSS management system
        editor.Css.addRules(themeStyles);

        // Inject conditional logic script into the canvas iframe
        // This enables dynamic show/hide based on data-condition-field attributes
        if (projectType === "web") {
          const canvasDoc = editor.Canvas.getDocument();
          if (canvasDoc) {
            // Check if script already exists
            const existingScript = canvasDoc.getElementById(
              "conditional-logic-script",
            );
            if (!existingScript) {
              const scriptEl = canvasDoc.createElement("script");
              scriptEl.id = "conditional-logic-script";
              scriptEl.textContent = conditionalLogicScript.replace(
                /<\/?script>/g,
                "",
              );
              canvasDoc.body.appendChild(scriptEl);
            }
          }
        }
      });
    },
    [themeStyles, projectType],
  );

  // Use editorKey to force remount when switching between different forms/content
  // This ensures the SDK doesn't use cached data from previous sessions
  return (
    <div
      key={editorKey}
      className={`studio-editor-container${lockPreview ? " studio-editor-locked-preview" : ""}`}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        minHeight: 400, // Minimum usable height
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* CSS overrides to force GrapesJS SDK to fill container height */}
      <style>{`
        .studio-editor-container {
          overflow: hidden !important;
        }
        /* SDK root wrapper - the gs-studio-root element */
        .studio-editor-container > div:first-child,
        .studio-editor-container .gs-studio-root,
        .studio-editor-container .gs-studio-editor {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          overflow: hidden !important;
        }
        /* The main row containing sidebars and canvas */
        .studio-editor-container .gs-cmp-row {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }
        /* Canvas sidebar top - contains the canvas area */
        .studio-editor-container .gs-canvas-sidebar-top {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }
        /* The canvas wrapper element */
        .studio-editor-container .gs-canvas {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }
        /* GrapesJS editor container */
        .studio-editor-container .gjs-editor-cont,
        .studio-editor-container .gjs-editor {
          height: 100% !important;
          overflow: hidden !important;
        }
        /* Canvas container - this is where the iframe lives */
        .studio-editor-container .gjs-cv-canvas {
          height: 100% !important;
          overflow: hidden !important;
        }
        /* The frames wrapper inside canvas */
        .studio-editor-container .gjs-cv-canvas__frames {
          height: 100% !important;
          overflow: hidden !important;
        }
        /* Frame wrapper that contains the iframe */
        .studio-editor-container .gjs-frame-wrapper {
          height: 100% !important;
          overflow: hidden !important;
        }
        /* The actual iframe - allow internal scrolling only */
        .studio-editor-container .gjs-frame {
          height: 100% !important;
          width: 100% !important;
          border: none !important;
        }
        /* Hide the duplicate canvas */
        .studio-editor-container .cv-canvas {
          display: none !important;
        }
        /* Ensure sidebars don't create scrollbars */
        .studio-editor-container .gs-sidebar-left,
        .studio-editor-container .gs-sidebar-right {
          overflow: hidden !important;
        }
        /* Allow layer manager to scroll internally */
        .studio-editor-container .gs-layer-manager {
          overflow: hidden !important;
        }
        .studio-editor-container .gs-layer-manager > div:last-child {
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        /* Remove outer border from the editor wrapper */
        .studio-editor-container .gjs-editor-wrapper {
          border: none !important;
        }
        /* Hide exit preview button when preview is locked */
        .studio-editor-locked-preview .gs-cmp-close-preview {
          display: none !important;
        }
      `}</style>
      <StudioEditorSDK
        options={{
          licenseKey,
          theme,
          project: {
            type: projectType,
            default: defaultProject,
          },
          // Use plugins to inject CSS via CssComposer - the SDK-native approach
          plugins: [themeStylesPlugin],
          storage:
            storage.type === false
              ? (false as unknown as undefined)
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
