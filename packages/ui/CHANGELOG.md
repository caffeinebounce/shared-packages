# @caffeinebounce/ui

## 0.2.1

### Patch Changes

- 9d4fee2: Add autoFocusSelector prop to FormWizard

  New optional prop `autoFocusSelector` allows specifying a CSS selector for the element that should receive focus when the wizard mounts. This is useful for focusing the first input field when a form dialog opens.

  Example usage:

  ```tsx
  <FormWizard
    autoFocusSelector='[role="dialog"] input[name="name"]'
    // ... other props
  >
  ```

## 0.2.0

### Minor Changes

- Add Combobox component and keyboard shortcuts to FormWizard

  - Add Combobox component with search and create-new functionality
  - Add Command and Popover components (dependencies for Combobox)
  - Add onCancel and onSubmit props to FormWizard for Escape and Cmd+Enter shortcuts
