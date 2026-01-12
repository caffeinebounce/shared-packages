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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
}: StudioEditorProps) {
  const editorRef = useRef<Editor | null>(null);

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

      // Set up save listener - called when user clicks save button or autosave triggers
      if (onSave) {
        editor.on("storage:store", () => {
          const html = editor.getHtml();
          const css = editor.getCss();
          const json = editor.getProjectData();
          onSave({ html, css: css || "", json });
        });
      }

      onReady?.(editor);
    },
    [allBlocks, onChange, onSave, onReady],
  );

  // Get theme styles for injection via SDK plugins
  const themeStyles = useMemo(
    () => canvasStyles || getCanvasStyles(theme, projectType),
    [canvasStyles, theme, projectType],
  );

  // Build default project content (without embedded CSS - CSS is added via plugins)
  const defaultProject = useMemo(() => {
    const isEmail = projectType === "email";

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

  // Create a plugin that injects theme styles via CssComposer
  // This is the SDK-recommended way to add global CSS to the canvas
  const themeStylesPlugin = useCallback(
    (editor: Editor) => {
      editor.onReady(() => {
        // Use CssComposer.addRules() to add CSS rules to the canvas
        // This properly adds styles to GrapesJS's CSS management system
        editor.Css.addRules(themeStyles);
      });
    },
    [themeStyles],
  );

  // Use editorKey to force remount when switching between different forms/content
  // This ensures the SDK doesn't use cached data from previous sessions
  return (
    <div
      key={editorKey}
      className="studio-editor-container"
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        minHeight: 400, // Minimum usable height
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
