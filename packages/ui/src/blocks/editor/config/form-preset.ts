/**
 * Form builder preset configuration for GrapesJS.
 *
 * Configures GrapesJS for building application forms with
 * blocks matching the FormFieldType enum from @compass/utils.
 */

import type { BlockDefinition, EditorPreset } from "../types";

/**
 * Form-specific blocks that map to FormFieldType.
 */
const formBlocks: BlockDefinition[] = [
  // Section block for grouping fields
  {
    id: "form-section",
    label: "Section",
    category: "Form Layout",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>`,
    content: `
      <div class="form-section" data-gjs-type="form-section">
        <h3 class="section-title" data-gjs-editable="true">Section Title</h3>
        <p class="section-description" data-gjs-editable="true">Section description text</p>
        <div class="section-fields" data-gjs-droppable="true"></div>
      </div>
    `,
  },
  // Text input
  {
    id: "field-text",
    label: "Text Input",
    category: "Form Fields",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z"/></svg>`,
    content: {
      type: "form-field",
      fieldType: "text",
      attributes: { class: "form-field" },
      components: [
        { type: "label", content: "Text Field" },
        {
          type: "input",
          attributes: { type: "text", placeholder: "Enter text..." },
        },
      ],
    },
  },
  // Textarea
  {
    id: "field-textarea",
    label: "Text Area",
    category: "Form Fields",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>`,
    content: {
      type: "form-field",
      fieldType: "textarea",
      attributes: { class: "form-field" },
      components: [
        { type: "label", content: "Text Area" },
        {
          type: "textarea",
          attributes: { placeholder: "Enter longer text...", rows: "4" },
        },
      ],
    },
  },
  // Select dropdown
  {
    id: "field-select",
    label: "Dropdown",
    category: "Form Fields",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>`,
    content: {
      type: "form-field",
      fieldType: "select",
      attributes: { class: "form-field" },
      components: [
        { type: "label", content: "Select Field" },
        {
          type: "select",
          components: [
            {
              type: "option",
              content: "Option 1",
              attributes: { value: "option1" },
            },
            {
              type: "option",
              content: "Option 2",
              attributes: { value: "option2" },
            },
            {
              type: "option",
              content: "Option 3",
              attributes: { value: "option3" },
            },
          ],
        },
      ],
    },
  },
  // Radio group
  {
    id: "field-radio",
    label: "Radio Group",
    category: "Form Fields",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`,
    content: {
      type: "form-field",
      fieldType: "radio",
      attributes: { class: "form-field" },
      components: [
        { type: "label", content: "Radio Group" },
        {
          tagName: "div",
          attributes: { class: "radio-group" },
          components: [
            {
              tagName: "label",
              attributes: { class: "radio-option" },
              components: [
                {
                  type: "input",
                  attributes: {
                    type: "radio",
                    name: "radio-group",
                    value: "option1",
                  },
                },
                { type: "text", content: " Option 1" },
              ],
            },
            {
              tagName: "label",
              attributes: { class: "radio-option" },
              components: [
                {
                  type: "input",
                  attributes: {
                    type: "radio",
                    name: "radio-group",
                    value: "option2",
                  },
                },
                { type: "text", content: " Option 2" },
              ],
            },
          ],
        },
      ],
    },
  },
  // Checkbox
  {
    id: "field-checkbox",
    label: "Checkbox",
    category: "Form Fields",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
    content: {
      type: "form-field",
      fieldType: "checkbox",
      attributes: { class: "form-field" },
      components: [
        {
          tagName: "label",
          attributes: { class: "checkbox-label" },
          components: [
            { type: "input", attributes: { type: "checkbox" } },
            { type: "text", content: " Checkbox option" },
          ],
        },
      ],
    },
  },
  // Number input
  {
    id: "field-number",
    label: "Number",
    category: "Form Fields",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14zm-5-7c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/></svg>`,
    content: {
      type: "form-field",
      fieldType: "number",
      attributes: { class: "form-field" },
      components: [
        { type: "label", content: "Number Field" },
        { type: "input", attributes: { type: "number", placeholder: "0" } },
      ],
    },
  },
  // Date picker
  {
    id: "field-date",
    label: "Date",
    category: "Form Fields",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>`,
    content: {
      type: "form-field",
      fieldType: "date",
      attributes: { class: "form-field" },
      components: [
        { type: "label", content: "Date Field" },
        { type: "input", attributes: { type: "date" } },
      ],
    },
  },
  // File upload
  {
    id: "field-file",
    label: "File Upload",
    category: "Form Fields",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11 8 15.01z"/></svg>`,
    content: {
      type: "form-field",
      fieldType: "file",
      attributes: { class: "form-field" },
      components: [
        { type: "label", content: "File Upload" },
        { type: "input", attributes: { type: "file" } },
      ],
    },
  },
  // Email input
  {
    id: "field-email",
    label: "Email",
    category: "Form Fields",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
    content: {
      type: "form-field",
      fieldType: "email",
      attributes: { class: "form-field" },
      components: [
        { type: "label", content: "Email" },
        {
          type: "input",
          attributes: { type: "email", placeholder: "email@example.com" },
        },
      ],
    },
  },
  // Phone input
  {
    id: "field-phone",
    label: "Phone",
    category: "Form Fields",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
    content: {
      type: "form-field",
      fieldType: "phone",
      attributes: { class: "form-field" },
      components: [
        { type: "label", content: "Phone" },
        {
          type: "input",
          attributes: { type: "tel", placeholder: "(555) 123-4567" },
        },
      ],
    },
  },
  // URL input
  {
    id: "field-url",
    label: "URL",
    category: "Form Fields",
    media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
    content: {
      type: "form-field",
      fieldType: "url",
      attributes: { class: "form-field" },
      components: [
        { type: "label", content: "Website URL" },
        {
          type: "input",
          attributes: { type: "url", placeholder: "https://example.com" },
        },
      ],
    },
  },
];

/**
 * Form canvas styles for a clean form appearance.
 */
const formCanvasStyles = `
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #374151;
    background-color: #f9fafb;
  }
  .form-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #111827;
  }
  .section-description {
    color: #6b7280;
    margin: 0 0 20px 0;
    font-size: 14px;
  }
  .section-fields {
    min-height: 60px;
    padding: 8px;
    border: 2px dashed #e5e7eb;
    border-radius: 6px;
  }
  .form-field {
    margin-bottom: 16px;
  }
  .form-field label {
    display: block;
    font-weight: 500;
    margin-bottom: 6px;
    color: #374151;
  }
  .form-field input[type="text"],
  .form-field input[type="email"],
  .form-field input[type="tel"],
  .form-field input[type="url"],
  .form-field input[type="number"],
  .form-field input[type="date"],
  .form-field select,
  .form-field textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  .radio-group,
  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .radio-option,
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .radio-option input,
  .checkbox-label input {
    width: 16px;
    height: 16px;
  }
`;

/**
 * Form builder preset for GrapesJS.
 */
export const formPreset: EditorPreset = {
  id: "form",
  name: "Form Builder",
  plugins: ["gjs-blocks-basic", "gjs-plugin-forms"],
  pluginsOpts: {
    "gjs-blocks-basic": {
      blocks: ["column1", "column2", "column3", "text", "link", "image"],
      flexGrid: true,
    },
    "gjs-plugin-forms": {
      blocks: [], // We provide our own form blocks
    },
  },
  blocks: formBlocks,
  canvasStyles: [formCanvasStyles],
  devices: [
    { name: "Desktop", width: "" },
    { name: "Tablet", width: "768px", widthMedia: "992px" },
    { name: "Mobile", width: "375px", widthMedia: "480px" },
  ],
};
