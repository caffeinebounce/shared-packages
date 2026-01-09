/**
 * Email builder preset configuration for GrapesJS.
 *
 * Configures GrapesJS for building email templates with
 * email-safe HTML and responsive layouts.
 */

import type { BlockDefinition, EditorPreset } from "../types";

/**
 * Email-specific blocks for the newsletter builder.
 */
const emailBlocks: BlockDefinition[] = [
  // Branded header with logo
  {
    id: "email-header",
    label: "Header",
    category: "Layout",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v4h2V5h18v4h2V5c0-1.1-.9-2-2-2z"/></svg>`,
    content: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1e3a5f;">
        <tr>
          <td align="center" style="padding: 24px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <img src="https://via.placeholder.com/180x60?text=Logo" alt="Logo" style="max-width: 180px; height: auto;" />
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  // Text block
  {
    id: "email-text",
    label: "Text Block",
    category: "Content",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z"/></svg>`,
    content: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;">
                  <p style="margin: 0 0 16px 0;">Your text content goes here. Click to edit this paragraph and customize your message.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  // Heading
  {
    id: "email-heading",
    label: "Heading",
    category: "Content",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4v3h5.5v12h3V7H19V4H5z"/></svg>`,
    content: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px 20px 10px 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <h1 style="font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #1e3a5f; margin: 0;">
                    Your Heading Here
                  </h1>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  // CTA Button
  {
    id: "email-button",
    label: "Button",
    category: "Content",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"/></svg>`,
    content: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="background-color: #3b82f6; border-radius: 6px;">
                  <a href="#" style="display: inline-block; padding: 14px 32px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none;">
                    Call to Action
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  // Image block
  {
    id: "email-image",
    label: "Image",
    category: "Content",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,
    content: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <img src="https://via.placeholder.com/600x300" alt="Image" style="max-width: 100%; height: auto; display: block;" />
          </td>
        </tr>
      </table>
    `,
  },
  // Divider
  {
    id: "email-divider",
    label: "Divider",
    category: "Layout",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 11h16v2H4z"/></svg>`,
    content: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-bottom: 1px solid #e5e7eb; height: 1px; font-size: 0; line-height: 0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  // Two columns
  {
    id: "email-columns-2",
    label: "2 Columns",
    category: "Layout",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h5V5h-5v13zm-6 0h5V5H4v13zM16 5v13h5V5h-5z"/></svg>`,
    content: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="290" valign="top" style="padding-right: 10px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
                        Left column content
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="290" valign="top" style="padding-left: 10px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
                        Right column content
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  // Social links
  {
    id: "email-social",
    label: "Social Links",
    category: "Content",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>`,
    content: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding: 0 8px;">
                  <a href="#" style="display: inline-block;">
                    <img src="https://via.placeholder.com/32x32?text=X" alt="X" width="32" height="32" style="display: block;" />
                  </a>
                </td>
                <td style="padding: 0 8px;">
                  <a href="#" style="display: inline-block;">
                    <img src="https://via.placeholder.com/32x32?text=LI" alt="LinkedIn" width="32" height="32" style="display: block;" />
                  </a>
                </td>
                <td style="padding: 0 8px;">
                  <a href="#" style="display: inline-block;">
                    <img src="https://via.placeholder.com/32x32?text=FB" alt="Facebook" width="32" height="32" style="display: block;" />
                  </a>
                </td>
                <td style="padding: 0 8px;">
                  <a href="#" style="display: inline-block;">
                    <img src="https://via.placeholder.com/32x32?text=IG" alt="Instagram" width="32" height="32" style="display: block;" />
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  // Footer
  {
    id: "email-footer",
    label: "Footer",
    category: "Layout",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19H3c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2zm0-12H3v10h18V7z"/></svg>`,
    content: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6;">
        <tr>
          <td align="center" style="padding: 32px 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #6b7280;">
                  <p style="margin: 0 0 8px 0;">© 2026 Capital Collective. All rights reserved.</p>
                  <p style="margin: 0 0 8px 0;">
                    123 Business Street, Suite 100<br />
                    City, State 12345
                  </p>
                  <p style="margin: 0;">
                    <a href="#" style="color: #3b82f6; text-decoration: none;">Unsubscribe</a> |
                    <a href="#" style="color: #3b82f6; text-decoration: none;">View in browser</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  // Spacer
  {
    id: "email-spacer",
    label: "Spacer",
    category: "Layout",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 13H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>`,
    content: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="height: 40px; font-size: 0; line-height: 0;">&nbsp;</td>
        </tr>
      </table>
    `,
  },
];

/**
 * Email canvas styles for proper rendering.
 */
const emailCanvasStyles = `
  body {
    margin: 0;
    padding: 0;
    background-color: #f9fafb;
    font-family: Arial, sans-serif;
  }
  table {
    border-collapse: collapse;
  }
  img {
    border: 0;
    outline: none;
    text-decoration: none;
  }
  a {
    color: #3b82f6;
    text-decoration: none;
  }
`;

/**
 * Email builder preset for GrapesJS.
 */
export const emailPreset: EditorPreset = {
  id: "email",
  name: "Email Builder",
  plugins: ["gjs-preset-newsletter"],
  pluginsOpts: {
    "gjs-preset-newsletter": {
      modalTitleImport: "Import HTML",
      modalBtnImport: "Import",
      importPlaceholder: "Paste your HTML here...",
      cellStyle: {
        "font-size": "14px",
        "font-family": "Arial, sans-serif",
      },
    },
  },
  blocks: emailBlocks,
  canvasStyles: [emailCanvasStyles],
  devices: [
    { name: "Desktop", width: "600px" },
    { name: "Mobile", width: "320px", widthMedia: "480px" },
  ],
};
