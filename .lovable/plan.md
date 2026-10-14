# Complete DecorHub’s personalized room-planning flow

## Build
- Preserve the current DecorHub home screen, visual language, and existing room-plan tabs.
- Replace the abbreviated intake with the full seven-step flow: room/photo, profile, lifestyle, style, budget, future and safety needs, and review.
- Keep controlled answers and a locally selected photo through back/forward navigation and refresh; validate the room measurements, profile selections, and INR budget.
- Replace static euro-based sample recommendations with a deterministic rule-based engine driven by submitted room, profile, activity, style, material, accessibility, future-needs, and budget answers. Clearly label estimates and avoid exceeding the budget.
- Show answer-linked explanations, retain/rearrange/replace/purchase guidance, a responsive illustrative layout, safety and adaptability notes, and a printable/downloadable report.

## Verification
- Walk through the flow with differing budgets and work/accessibility needs, confirm values survive backward navigation and refresh, and check photo preview plus report output.
- Inspect the live preview at desktop and mobile widths and review the current build/runtime diagnostics.

## Technical details
- Keep the existing TanStack Start frontend-only architecture; no AI service or server analysis is connected, so recommendations will be clearly identified as rule-based and photo content will not be claimed as computer-vision analysis.
- Store the local photo as a bounded data URL with the session answers in browser storage; retain existing image and UI dependencies.
