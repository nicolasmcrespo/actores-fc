# shadcn/ui Accessibility Standards

## Context

Accessibility guidelines specific to shadcn/ui components to ensure WCAG 2.1 compliance.

## Component-Specific Requirements

### Form Components

#### Input Fields
- Always include proper `<label>` associations
- Use `aria-describedby` for helper text
- Implement `aria-invalid` for error states
- Preserve original shadcn focus indicators

#### Select/Combobox
- Maintain keyboard navigation (Arrow keys, Enter, Escape)
- Implement `aria-expanded` state management
- Use `role="combobox"` for searchable selects
- Ensure screen reader announces selection changes

#### Checkbox/Radio
- Preserve shadcn's visual indicators
- Maintain `aria-checked` state
- Use fieldset/legend for grouped controls
- Support keyboard navigation between options

### Navigation Components

#### Dialog/Modal
- Implement focus trapping within modal
- Return focus to trigger element on close
- Use `aria-labelledby` for modal titles
- Support Escape key to close

#### Dropdown Menu
- Maintain ARIA menu roles (`menu`, `menuitem`)
- Support arrow key navigation
- Implement `aria-expanded` on triggers
- Close on outside click and Escape

### Data Display

#### Table
- Use proper table semantics (`th`, `scope`)
- Implement sortable column indicators
- Support keyboard navigation for interactive elements
- Provide row/column headers for screen readers

#### Tooltip
- Use `aria-describedby` to link tooltip to trigger
- Ensure tooltip appears on both hover and focus
- Make dismissible with Escape key
- Avoid essential information in tooltips only

## Implementation Guidelines

### Preserving shadcn Aesthetics
- Never remove shadcn's visual focus indicators
- Maintain component variant styling
- Keep animation timings for accessibility
- Preserve dark mode compatibility

### Testing Requirements
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Verify keyboard-only navigation
- Check color contrast ratios (4.5:1 minimum)
- Validate with automated accessibility tools

### Common Patterns
```tsx
// Good: Proper label association
<Label htmlFor="email">Email</Label>
<Input id="email" aria-describedby="email-error" />

// Good: Error state with announcement
<Input
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <p id="email-error" role="alert">
    Please enter a valid email
  </p>
)}
```

## Component Checklist

Before shipping any shadcn component:
- [ ] Proper semantic HTML structure
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Focus management
- [ ] Color contrast compliance
- [ ] Error state accessibility
- [ ] Loading state announcements