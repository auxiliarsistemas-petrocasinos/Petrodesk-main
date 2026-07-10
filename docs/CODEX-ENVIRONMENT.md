# Entorno Codex Full Stack

## Base

- ECC oficial: `affaan-m/ECC`, clonado en `.ecc/source`.
- Sincronización: flujo oficial `scripts/sync-ecc-to-codex.sh`, con respaldo y fusión aditiva.
- Reglas del proyecto: `AGENTS.md`.
- Configuración y roles: `.codex/config.toml` y `.codex/agents/`.
- Skills bajo demanda: `.agents/skills/`.

## Flujo obligatorio

Analizar → explicar plan → identificar riesgos → comparar alternativas → implementar → verificar → documentar.

## Especialistas

Arquitectura, Frontend, React, Next.js, TypeScript, Supabase, PostgreSQL, Seguridad, Performance, Testing, Documentación y Code Review. Son roles de lectura y se invocan únicamente cuando su dominio es material para el cambio.

## Quality gates

Los hooks Git globales de ECC ejecutan controles de pre-commit y pre-push. Además, cada cambio debe usar los comandos reales del paquete afectado para lint, typecheck, tests y build. El repositorio actual tiene paquetes separados `client` y `server`; todavía usa React/Vite y NestJS/Prisma, no Next.js App Router ni Edge Functions.

## MCP

Se preservó el MCP de Supabase existente. No se añadió el MCP `chrome-devtools` propuesto por ECC porque la detección local generaba `bunx` sin Bun disponible y Codex ya dispone del navegador integrado. No se copiaron secretos ni se añadieron conectores que requieran credenciales.

## Actualización

Desde `.ecc/source`, actualizar con `git pull`, reinstalar dependencias y ejecutar primero `scripts/sync-ecc-to-codex.sh --dry-run`. Mantener `ECC_DISABLED_MCPS=chrome-devtools` mientras no exista un lanzador compatible o el navegador integrado cubra la necesidad.
