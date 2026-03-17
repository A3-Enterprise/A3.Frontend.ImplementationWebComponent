# Genie Frontend ImplementationWebComponent — Project Context

## Stack
- React 19 + TypeScript
- Vite 6 como bundler
- MUI (Material UI) 6 para componentes UI
- pnpm como package manager
- ESLint para linting

## Propósito
App de ejemplo/referencia para clientes que integran el Genie WebComponent en sus propias aplicaciones. Sirve como:
- **Playground interactivo**: Permite probar el WebComponent con diferentes URLs, tokens y ambientes
- **Documentación viva**: El README.md es la guía de implementación para clientes
- **Referencia de código**: Muestra cómo cargar el script, escuchar eventos y manejar respuestas

## Estructura del Proyecto

```
src/
├── types/
│   └── genie.d.ts        # Tipos TypeScript para el WebComponent (JSX + eventos)
├── App.tsx               # App principal — playground con selector de ambiente
├── App.css               # Estilos
├── main.tsx              # Entry point
└── vite-env.d.ts

public/
├── favicon.png
├── logo.jpeg
└── logo_texto_landscape.svg

README.md                 # Guía de implementación para clientes (ES)
README.en.md              # Guía de implementación para clientes (EN)
.env.example              # Variables de entorno de ejemplo
```

## Funcionalidad del Playground (App.tsx)

### Selector de Ambiente
- **DEV**: `https://enrolldev.idfactory.me` → script desde `id-webcomponent-dev-factory`
- **SANDBOX**: `https://enrollsandbox.idfactory.me` → script desde `id-webcomponent-sandbox-factory`
- **PRD**: `https://enroll.idfactory.me` → script desde `id-webcomponent-prod-factory`

### Flujo
1. Usuario selecciona ambiente
2. Script del WebComponent se carga dinámicamente desde S3
3. Usuario ingresa URL de invitación + token JWT
4. Click "Iniciar" → renderiza `<genie-component-general>`
5. Escucha evento `genieEventGeneral` → muestra respuesta JSON

### Versionamiento
- Muestra versión de la app (`package.json`) y del WebComponent (via `/bff/webComponent/version`)

## Tipos TypeScript (genie.d.ts)

```typescript
// JSX IntrinsicElements para los 3 componentes
'genie-component-general': { url: string; token: string }
'genie-component-enroll': { 'invitation-key': string; 'sub-customer': string; token: string }
'genie-component-verify': { 'invitation-key': string; 'sub-customer': string; token: string }

// Evento
interface GenieEventDetail {
  status: 'Success' | 'Pending' | 'Failure';
  message: string;
  CSID: string;
  callback?: string;
  idTransaction?: string;
}
```

## URLs del WebComponent por Ambiente

| Ambiente | Script CDN |
|----------|-----------|
| DEV | `https://id-webcomponent-dev-factory.s3.amazonaws.com/demo/demo.esm.js` |
| SANDBOX | `https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js` |
| PROD | `https://id-webcomponent-prod-factory.s3.amazonaws.com/demo/demo.esm.js` |

## Variables de Entorno

```bash
VITE_COMPONENT_URL=...     # URL del script del WebComponent
VITE_INVITATION_URL=...    # URL de invitación de ejemplo
VITE_AUTH_TOKEN=...        # Token JWT de ejemplo
```

## Relación con el Ecosistema
- **Consume**: `A3.Frontend.WebComponent` (carga el script compilado desde S3)
- **Documenta**: Cómo integrar el WebComponent en apps de terceros
- **No interactúa directamente** con BFF ni microservicios — eso lo hace el WebComponent internamente
- El README.md es la documentación oficial para clientes externos

## Build y Deploy

```bash
pnpm install
pnpm dev          # Desarrollo (Vite)
pnpm build        # Producción (tsc + vite build)
```

## Convenciones
- Logs con emojis: 📦 carga script, ✅ éxito, ❌ error, 📨 evento recibido, 🔄 cambio ambiente
- Manejo de 3 status: Success → pantalla éxito, Pending → polling, Failure → desactiva componente
