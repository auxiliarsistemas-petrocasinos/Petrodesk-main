---
name: create-component
description: Create reusable React components with strict TypeScript, composition, accessible behavior, responsive Tailwind styles, complete states, and tests. Use for shared UI, design-system primitives, or feature components.
---
# Create a component
1. Inspect existing primitives and prove reuse is warranted.
2. Define one responsibility, typed API, composition points, variants, and accessibility contract.
3. Prefer semantic HTML, small pieces, server compatibility, and the smallest client boundary.
4. Cover loading, empty, error, disabled, focus, keyboard, and responsive states as relevant.
5. Avoid `any`, boolean-prop explosions, duplicated styles, speculative memoization, and hidden effects.
6. Test public behavior, run quality gates, and document non-obvious constraints.
