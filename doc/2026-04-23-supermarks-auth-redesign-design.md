# Supermarks Auth Redesign
> Date: 2026-04-23
> Scope: `supermarks` login and register entry flow
> Status: Approved for spec drafting, pending implementation

## Summary

Redesign the `supermarks` login and register pages into a shared "night convenience store" auth experience. The current pages work functionally but read as a generic dark form card. The redesign should keep all existing auth logic, routes, and field behavior while upgrading the entrance into a branded retail-style gateway that feels closer to a snack mall than a backend admin shell.

## Goals

- Create a stronger first impression for the auth flow without changing business logic.
- Make login and register feel like one coherent entry system rather than two isolated forms.
- Shift the tone from "plain system form" to "snack retail brand entrance".
- Preserve quick task completion: users should still understand what to do within seconds.
- Work well on desktop and mobile using the current React + CSS structure.

## Non-Goals

- No API, routing, validation, or submission flow changes.
- No role logic changes beyond visual framing.
- No redesign of post-login workspace pages in this pass.
- No asset pipeline or image dependency requirement.

## Design Direction

The visual metaphor is a late-night convenience store entrance:

- The page background acts like the storefront exterior: deep blue-black, warm orange signage glow, layered atmosphere.
- The brand panel acts like the lit window display: bold headline, short selling lines, role/benefit markers, and shelf-like strips.
- The form panel acts like the checkout counter: bright enough to feel active, structured enough to finish a task quickly.

This should feel commercial and inviting, not luxurious or corporate. The result should be more atmospheric than the current card, but still crisp and operational.

## Shared Page Architecture

Both login and register will use the same auth shell:

1. Full-screen auth stage with a layered background.
2. A centered auth frame using a two-column layout on desktop.
3. Left column as brand/story panel.
4. Right column as action panel containing the form.
5. Mobile collapses to a single column with the brand block reduced but still present above the form.

## Visual System

### Color

- Keep the existing dark navy and orange foundation so the redesign still belongs to the current app.
- Add more tonal separation:
  - outer background: near-black blue
  - mid glass surfaces: blue-charcoal
  - accents: warm orange and amber
  - supportive highlights: muted cream text and subtle cyan-blue depth tones
- Orange remains the primary action color and the "sign glow" identity anchor.

### Typography

- Keep `Teko` for display headlines because it already gives the project a retail sign feel.
- Keep `Noto Sans SC` for body copy and form labels.
- Increase contrast between signage copy, helper copy, and field labels.
- Use tighter headline composition and short stacked copy blocks instead of long paragraphs.

### Shape and Material

- Replace the plain auth card feel with a composed frame:
  - outer auth container with soft border and stronger shadow
  - inner surfaces that feel like tinted glass and lit panels
  - accent strips and badge chips inspired by price labels and shelf tabs
- Corners should stay rounded, but the layout should gain more internal structure and segmentation.

### Motion

- Limit motion to two interactions:
  - a soft entrance fade/slide for the auth frame
  - a light hover lift/glow on chips and buttons
- No continuous looping effects, parallax, or decorative motion layers.

## Login Page Content Design

The login page should emphasize fast access to the correct workspace.

### Left Panel

- Kicker copy uses `SUPERMARKS` with a secondary line feel, not a separate slogan system.
- Main headline framed like storefront signage, centered around the Chinese login title.
- Short supporting copy describing automatic role routing after login.
- Two or three compact info chips such as:
  - user shopping
  - merchant fulfillment
  - one account, one entrance
- A redirect hint block, when present, should appear as a highlighted notice tile rather than a plain muted line.

### Right Panel

- Visible section title uses `进入工作台`.
- Username and password fields remain the same in behavior.
- Login button becomes wider and more assertive.
- Bottom secondary link to register stays present but treated as a quieter footer action.
- Error messages should sit directly above the primary button and use a clearer warning container style.

## Register Page Content Design

The register page should feel like opening a new membership or merchant account, not filling out a technical form.

### Left Panel

- Reuse the same visual shell as login for continuity.
- Change narrative emphasis to account creation and role onboarding.
- Highlight the two supported identities with badge-like modules:
  - ordinary user
  - merchant

### Right Panel

- Title uses `开通新账号`.
- Role selector should become more visually prominent because it is the key branch decision.
- Field order remains unchanged to avoid behavior risk.
- Optional fields should read as optional but still polished.
- Bottom link back to login stays in the same structural position as the login page footer link.

## Responsive Behavior

### Desktop

- Two-column layout with a visually richer left panel and task-focused right panel.
- Target a `56 / 44` split so the storefront panel has presence without squeezing the form.

### Tablet

- Reduce decorative density and panel padding.
- Keep two columns until the width gets too tight for comfortable form entry.

### Mobile

- Collapse to one column.
- Brand panel becomes a shorter stacked header with headline, one short line of copy, and a small chip row.
- Form remains the dominant block below.
- Inputs and buttons keep large touch targets.

## Accessibility and UX Constraints

- Maintain clear label-to-field pairing.
- Ensure text contrast remains readable on dark surfaces.
- Do not rely on decorative elements to communicate required actions.
- Preserve focus states and make them stronger if needed.
- Keep error messages textual and near the action area.

## Implementation Plan Boundary

Implementation should be limited to:

- `supermarks/src/pages/LoginPage.tsx`
- `supermarks/src/pages/RegisterPage.tsx`
- `supermarks/src/styles.css`

Implementation pattern:

- Add a shared auth shell structure in both pages.
- Introduce auth-specific utility classes in `styles.css`.
- Reuse existing button/input tokens where possible, extending them for the new auth treatment instead of rewriting the whole design system.

## Testing and Verification

- Manually verify login page rendering on desktop and mobile widths.
- Manually verify register page rendering on desktop and mobile widths.
- Confirm login still submits and redirects exactly as before.
- Confirm register still submits and navigates back to login exactly as before.
- Confirm redirect hint, error state, and disabled submit states still render correctly.

## Risks and Mitigations

- Risk: The auth redesign feels disconnected from the rest of the app.
  - Mitigation: keep the existing color DNA and typography, and avoid introducing a brand-new palette.
- Risk: Decorative structure reduces clarity.
  - Mitigation: reserve the strongest contrast for headings, labels, fields, and primary actions.
- Risk: Login and register diverge visually.
  - Mitigation: use one shared auth shell with only content-level variation.

## Acceptance Criteria

- Login and register pages clearly read as one designed auth system.
- The pages feel more like a snack retail brand entrance than a generic admin form.
- Existing auth functionality remains unchanged.
- The pages remain usable and readable on small screens.
