# Genie Platform — Ecosystem Context (Full)

## Visión General
Plataforma corporativa de enrolamiento y verificación biométrica. Compuesta por 16 artefactos: 1 BFF, 4 microservicios backend, 7 frontends, 2 SDKs nativos y 2 launchers de ejemplo.

## Artefactos del Ecosistema

### Backend Services

| Artefacto | Stack | Propósito |
|-----------|-------|-----------|
| `A3.Backend.Bff` | Express + TypeScript | BFF central — proxy con cifrado RSA+AES entre frontends y backend APIs |
| `A3.Backend.Enroll` | ASP.NET Core 7 + C# | Microservicio de enrollment biométrico |
| `A3.Backend.Verify` | ASP.NET Core 7 + C# | Microservicio de verificación biométrica |
| `A3.Backend.Reports` | ASP.NET Core 8 + C# | Microservicio de reportes, identidades y búsqueda facial 1:N |
| `A3.Backend.Registry` | ASP.NET Core 8 + C# | Microservicio de consulta a registros civiles gubernamentales (Colombia, etc.) |

### Frontend Applications

| Artefacto | Stack | Propósito |
|-----------|-------|-----------|
| `A3.Frontend.Dashboard` | React 18 + Redux + JS | Panel administrativo (customers, subcustomers, invitations, transactions, L&F) |
| `A3.Frontend.WebComponent` | Stencil 4 + TypeScript | Web Component embebible para enroll/verify biométrico |
| `A3.Frontend.Enroll` | React 18 + JS | App web standalone que embebe el WebComponent para enroll/verify directo por URL |
| `A3.Frontend.ComponentsUiConfig` | JSON configs en S3 | Configuraciones de Liveness y CardCapture por SubCustomer (config.json) |
| `A3.Frontend.DocumentationsV2` | React + Vite + JSX | Portal de documentación de API para clientes, con API tester integrado |
| `A3.Frontend.ImplementationWebComponent` | React 19 + Vite + TypeScript | App de ejemplo/playground para clientes que integran el WebComponent |
| `A3.Frontend.DocumentAuthenticity` | React 18 + Vite + JSX | App interna para técnicos — calificación de autenticidad de documentos |

### Native SDKs

| Artefacto | Stack | Propósito |
|-----------|-------|-----------|
| `SDK_iOS` | Swift (XCFramework) | SDK nativo iOS — WebView invisible que carga el WebComponent |
| `SDK_Kotlin` | Kotlin (AAR) | SDK nativo Android — WebView invisible que carga el WebComponent |
| `Lanzador_SDK_iOS` | Swift (Xcode project) | App de ejemplo/launcher para integrar SDK_iOS |
| `Lanzador_SDK_Kotlin` | Kotlin (Gradle) | App de ejemplo/launcher para integrar SDK_Kotlin |

## Arquitectura de Comunicación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Dashboard]        [WebComponent]      [Enroll App]      [SDKs iOS/Android]│
│       │                   │                  │                    │         │
│       │ RSA+AES           │ RSA+AES          │ embeds             │ WebView │
│       ▼                   ▼                  ▼                    ▼         │
├─────────────────────────────────────────────────────────────────────────────┤
│                              BFF LAYER (Express + TS)                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  /bff/dashboard/*    /bff/webComponent/*    /bff/public-key          │   │
│  │  /bff/docAuth/*      /bff/transactionFraud/*  /bff/healthCheck       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│       │                   │                        │                        │
├───────┼───────────────────┼────────────────────────┼────────────────────────┤
│       ▼                   ▼                        ▼                        │
│                         BACKEND MICROSERVICES (.NET)                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐    │
│  │ A3.Backend     │  │ A3.Backend     │  │ A3.Backend.Reports         │    │
│  │ .Enroll        │  │ .Verify        │  │ (reportes, identidades,    │    │
│  │ /Enroll/*      │  │ /Verify/*      │  │  búsqueda facial 1:N)      │    │
│  │                │  │                │  │ /Reports/*                 │    │
│  └───────┬────────┘  └───────┬────────┘  └─────────────┬──────────────┘    │
│          │                   │                         │                    │
├──────────┼───────────────────┼─────────────────────────┼────────────────────┤
│          ▼                   ▼                         ▼                    │
│                         SHARED SERVICES                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  MySQL (RDS)  │  S3 (images)  │  Anonybit  │  ABIS  │  Scanovate    │   │
│  │  ManagerDB    │  OZ Liveness  │  Vault     │  Registry (Gov APIs)   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

[DocumentationsV2] ──→ directo a Backend APIs (sin BFF, solo para testing)
[ComponentsUiConfig] ──→ S3 estático (config.json) ──→ consumido por WebComponent
[ImplementationWebComponent] ──→ carga WebComponent desde S3 CDN ──→ playground para clientes
[DocumentAuthenticity] ──→ Backend DocumentAuthenticity API (via BFF /bff/docAuth/*) ──→ calificación manual
```

## Backend Microservices — Endpoints

### A3.Backend.Enroll
| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/Enroll/HealthCheck` | Health check |
| POST | `/Enroll/EnrollFromData` | Proceso de enrollment biométrico |

### A3.Backend.Verify
| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/Verify/HealthCheck` | Health check |
| POST | `/Verify/VerifyFromData` | Proceso de verificación biométrica |

### A3.Backend.Registry
| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/HealthCheck` | Health check |
| GET | `/GetInfo` | Consulta registro civil (Colombia) |

### A3.Backend.Reports
| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/Reports/HealthCheck` | Health check (con UI) |
| POST | `/Reports/GetAll` | Listar transacciones |
| POST | `/Reports/GetAllReport` | Exportar transacciones |
| POST | `/Reports/GetIdentities` | Listar identidades |
| POST | `/Reports/GetTransactionReport` | Reporte por identidad |
| GET | `/Reports/GetTransactionById` | Detalle de transacción |
| GET | `/Reports/GetImagesById` | Imágenes de transacción |
| GET | `/Reports/GetFaces` | Búsqueda facial 1:N |

## Ambientes

| Ambiente | BFF URL | Config UI | Backend APIs |
|----------|---------|-----------|--------------|
| dev-factory | `https://dev.idfactory.me/bff` | `https://core-ui-configurations-dev.idfactory.me` | `https://dev.idfactory.me/{Enroll,Verify,Reports}` |
| qa-factory | `https://qa.idfactory.me/bff` | `https://core-ui-configurations-qa.idfactory.me` | `https://qa.idfactory.me/{Enroll,Verify,Reports}` |
| sandbox-factory | `https://sandbox.idfactory.me/bff` | `https://core-ui-configurations-sandbox.idfactory.me` | `https://sandbox.idfactory.me/{Enroll,Verify,Reports}` |
| prod-factory | `https://idfactory.me/bff` | `https://core-ui-configurations.idfactory.me` | `https://app.idfactory.me/{Enroll,Verify,Reports}` |

## Deploy
- **Frontends web** → S3 + CloudFront via GitHub Actions
- **BFF** → Docker + ECS/Fargate via GitHub Actions
- **Backend Microservices** → Docker + ECS/Fargate via GitHub Actions
  - Enroll/Verify: .NET 7 runtime, puerto 80
  - Reports: .NET 8 runtime, puerto 8080
  - Registry: .NET 8 runtime, puerto 8080
- **SDKs** → AAR/XCFramework distribuidos manualmente a clientes
- **ComponentsUiConfig** → S3 estático
- **Branches**: `dev-factory`, `qa-factory`, `sandbox-factory`, `prod-factory` (frontends/BFF) | `dev`, `qa`, `sandbox`, `prod` (microservicios)

## Entidades Compartidas (Dominio)
- **Customer**: Organización cliente
- **SubCustomer**: Proyecto/configuración dentro de un Customer
- **Invitation**: Enlace de enroll/verify con key única
- **Transaction**: Resultado de un proceso biométrico
- **Identity**: Persona registrada en el sistema
- **LookAndFeel**: Archivos HTML/CSS personalizados por SubCustomer y lenguaje

## Flujo End-to-End
1. **Dashboard**: Admin crea Customer → SubCustomer → configura LookAndFeel → genera Invitation
2. **WebComponent/Enroll/SDKs**: Usuario final abre URL → valida key/token → ejecuta enroll o verify → emite evento con resultado
3. **BFF**: Recibe request cifrado → descifra → rutea a microservicio correspondiente (Enroll/Verify) → cifra respuesta
4. **Microservicios**: Procesan biometría (ABIS/Anonybit/Scanovate) → guardan en S3 → registran transacción en MySQL
5. **Dashboard**: Admin consulta transacciones, identidades, reportes via Reports API

## Impacto Cruzado — Puntos de Contacto

| Cambio en | Afecta a |
|-----------|----------|
| Endpoints BFF (`urls.ts`) | Dashboard, WebComponent, Enroll (indirectamente) |
| Endpoints Microservicios | BFF (ruteo), Dashboard (si consume directo) |
| Estructura de SubCustomer | Dashboard (CRUD), WebComponent (consume config), ComponentsUiConfig (config.json), Microservicios (conexión DB dinámica) |
| Invitation keys | Dashboard (genera), WebComponent/Enroll/SDKs (validan) |
| LookAndFeel files | Dashboard (sube/edita), WebComponent (renderiza) |
| Cifrado (public key) | BFF, Dashboard, WebComponent |
| Config Liveness/CardCapture | ComponentsUiConfig (define), WebComponent (consume) |
| Evento `genieEventGeneral` | WebComponent (emite), Enroll (escucha), SDK_iOS/SDK_Kotlin (bridge a native), ImplementationWebComponent (ejemplo) |
| Modelos de Transaction | Microservicios (crean), Reports (consulta), Dashboard (muestra) |
| Servicios biométricos (ABIS/Anonybit) | Enroll, Verify, Reports (búsqueda 1:N) |
| Calificación manual (DocumentAuthenticity) | Enroll/Verify (genera pendientes), DocumentAuthenticity (califica), Reports/Dashboard (muestra resultado) |
| Registro civil (Registry) | Enroll (consume durante enrollment), Dashboard (configura por SubCustomer en registryTabs) |
| Script WebComponent (S3 CDN) | ImplementationWebComponent (carga), Enroll (embebe), SDKs (WebView) |

## Convenciones Transversales
- Logs solo en `localhost` o dominios con `dev`
- Datos sensibles cifrados antes de enviar al BFF (RSA+AES)
- Variables de entorno con prefijo `REACT_APP_` (frontends legacy)
- Tokens como `Bearer ${token}` en header `Authorization`
- Conexión DB dinámica por SubCustomer via ManagerDB service
- Respuestas de microservicios: `Result<T>` con `EResult` status
