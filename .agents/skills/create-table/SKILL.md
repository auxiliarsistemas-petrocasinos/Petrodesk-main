---
name: create-table
description: Create accessible responsive data tables with typed columns, server pagination, sorting, filtering, selection, complete states, and performance safeguards. Use for lists, grids, or administrative data views.
---
# Create a table
1. Confirm table semantics, row volume, authorization, stable identity, and query responsibilities.
2. Use typed columns, captions, headers, scopes, keyboard actions, and screen-reader labels.
3. Prefer server pagination/filtering/sorting for large data and never fetch unauthorized columns.
4. Preserve meaning on mobile using overflow, priority columns, or a documented card alternative.
5. Handle loading, empty, error, partial, selection, and destructive actions.
6. Test query state, accessibility, permissions, and boundary sizes; measure before virtualizing.
