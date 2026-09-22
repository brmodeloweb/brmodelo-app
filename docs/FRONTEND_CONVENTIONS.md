# Frontend conventions

Short conventions for React/TypeScript contributions to BRMW. These align with the existing [Code of Conduct](../CODE_OF_CONDUCT.md) and [CLAUDE.md](../CLAUDE.md).

## Interactive controls

- Prefer native `<button type="button">` for actions (not `<a>` without `href`).
- Icon-only controls must expose a localized accessible name (`aria-label` via i18n).
- Keep existing visual classes (`br-button`, action-cell styles) when swapping markup for a11y.

## Jest + ESLint

- In `*.test.ts`, `*.test.tsx`, and `*.test.js`, import Jest APIs from `@jest/globals`:

```ts
import { describe, expect, jest, test } from "@jest/globals";
```

- This keeps ESLint `no-undef` quiet when the Jest environment is not wired as globals for every file pattern.

## TypeScript + React

- Component props are typed with TypeScript interfaces/types.
- Keep `"react/prop-types": "off"` in [`eslint.config.js`](../eslint.config.js) for `app/react/**/*.{ts,tsx}`.

## Filename sanitization

- When stripping unsafe characters from download names, match Unicode control characters with `\p{Cc}` and the `u` flag:

```ts
name.replace(/[<>:"/\\|?*\p{Cc}]/gu, "_")
```

- Avoid literal control ranges such as `\u0000-\u001f` (ESLint `no-control-regex`).

## SQL export safety

- Before concatenating model data into generated SQL, validate:
  - table and column identifiers (`IDENTIFIER_REGEX`)
  - column type tokens against an allow-list / supported grammar (base type, optionally `(n)` or `(p,s)`)
- Reject unsupported type strings so imported/malicious model JSON cannot inject arbitrary SQL text into the script.

## Stable hook APIs for lifecycle effects

- Modal/service hooks that return object APIs (for example `useConfirmationModal`) must return a memoized value (`useCallback` / `useMemo`).
- Unstable object identities in `useEffect` dependency arrays can remount editors and re-trigger `loadModel`.

## Link selection tools

- When changing the selected JointJS link, clear tools on the previously selected link (`clearSelectedLinkTools`) before assigning a new `selectedLinkId`.
- Preserve tools when the same link is re-selected.
