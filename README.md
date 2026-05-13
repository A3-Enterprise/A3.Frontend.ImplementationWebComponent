# Genie Web Component - Guía de Implementación

Guía completa para integrar el Web Component de verificación de identidad y enrollment de Genie en tu aplicación.

## 📋 Tabla de Contenidos

- [Instalación](#-instalación)
- [Uso Básico](#-uso-básico)
- [Integración en React](#-integración-en-react)
- [Integración en HTML Vanilla](#-integración-en-html-vanilla)
- [Eventos y Respuestas](#-eventos-y-respuestas)
- [Mensajes de Error](#-mensajes-de-error)
- [Ejemplos Completos](#-ejemplos-completos)
- [Troubleshooting](#-troubleshooting)

## 🚀 Instalación

### Opción 1: CDN (Recomendado)

**Desarrollo:**
```html
<script type="module" src="https://id-webcomponent-dev-factory.s3.amazonaws.com/demo/demo.esm.js"></script>
```

**Sandbox:**
```html
<script type="module" src="https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js"></script>
```

**Producción:**
```html
<script type="module" src="https://id-webcomponent-prod-factory.s3.amazonaws.com/demo/demo.esm.js"></script>
```

### Opción 2: NPM (Próximamente)

```bash
npm install @genie/web-component
```

## 📦 Uso Básico

El componente requiere dos parámetros obligatorios:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `url` | string | URL de invitación completa (enrollment o verificación) |
| `token` | string | Token JWT de autenticación (sin prefijo "Bearer") |

### Ejemplos de URLs

**Enrollment:**
```
https://enrolldev.idfactory.me/enroll?SubCustomer=TestCustomer&key=abc123
```

**Verificación:**
```
https://enrolldev.idfactory.me/verify?SubCustomer=TestCustomer&key=xyz789
```

## ⚛️ Integración en React

### 1. Declarar el Tipo del Componente

```typescript
// src/types/genie.d.ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'genie-component-general': {
        url: string;
        token: string;
      };
    }
  }
}

export interface GenieEventDetail {
  status: 'Success' | 'Pending' | 'Failure';
  message: string;
  CSID: string;
  callback?: string;
  idTransaction?: string;
}
```

### 2. Cargar el Script

```typescript
import { useEffect, useState } from 'react';

function App() {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js';
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  return scriptLoaded ? <YourComponent /> : <Loading />;
}
```

### 3. Usar el Componente

```typescript
import { useEffect } from 'react';
import type { GenieEventDetail } from './types/genie';

function GenieComponent() {
  const url = 'https://enrolldev.idfactory.me/enroll?SubCustomer=Test&key=abc123';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

  useEffect(() => {
    const handleGenieEvent = (event: Event) => {
      const customEvent = event as CustomEvent<GenieEventDetail>;
      const result = customEvent.detail;

      switch (result.status) {
        case 'Success':
          console.log('✅ Proceso completado:', result.CSID);
          // Redirigir o mostrar mensaje de éxito
          break;

        case 'Pending':
          console.log('⏳ Pendiente de aprobación:', result.idTransaction);
          // Implementar polling para verificar estado
          break;

        case 'Failure':
          console.error('❌ Error:', result.message);
          // Mostrar mensaje de error al usuario
          break;
      }
    };

    document.addEventListener('genieEventGeneral', handleGenieEvent);

    return () => {
      document.removeEventListener('genieEventGeneral', handleGenieEvent);
    };
  }, []);

  return <genie-component-general url={url} token={token} />;
}
```

## 🌐 Integración en HTML Vanilla

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Genie Web Component</title>
  
  <!-- Cargar el Web Component -->
  <script type="module" src="https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js"></script>
</head>
<body>
  <!-- Usar el componente -->
  <genie-component-general
    url="https://enrolldev.idfactory.me/enroll?SubCustomer=TestCustomer&key=abc123"
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
  </genie-component-general>

  <script>
    // Escuchar eventos
    document.addEventListener('genieEventGeneral', (event) => {
      const result = event.detail;
      console.log('Resultado:', result);

      if (result.status === 'Success') {
        alert('¡Proceso completado exitosamente!');
        window.location.href = '/success';
      } else if (result.status === 'Failure') {
        alert('Error: ' + result.message);
      }
    });
  </script>
</body>
</html>
```

## 📡 Eventos y Respuestas

### Evento Principal: `genieEventGeneral`

**⚠️ IMPORTANTE:** Solo necesitas escuchar este evento. Contiene todas las respuestas tanto de enrollment como de verificación.

### Estructura de la Respuesta

```typescript
{
  status: 'Success' | 'Pending' | 'Failure',
  message: string,
  CSID: string,
  callback?: string,
  idTransaction?: string  // Solo en status 'Pending'
}
```

### Status Posibles

#### ✅ Success - Proceso Completado

El usuario completó exitosamente todo el flujo.

```json
{
  "status": "Success",
  "message": "Process completed successfully",
  "CSID": "abc123-def456-ghi789",
  "callback": "https://your-callback-url.com"
}
```

**Acciones recomendadas:**
- Guardar el CSID en tu base de datos
- Redirigir al usuario a página de éxito
- Enviar notificación de confirmación

#### ⏳ Pending - Aprobación Manual Requerida

El proceso requiere revisión manual por parte del equipo de operaciones.

```json
{
  "status": "Pending",
  "message": "Manual review required",
  "CSID": "abc123-def456-ghi789",
  "idTransaction": "txn-123456",
  "callback": "https://your-callback-url.com"
}
```

**Acciones recomendadas:**
- Implementar polling para verificar cambio de estado
- Mostrar mensaje al usuario indicando tiempo de espera
- Guardar idTransaction para seguimiento

**Ejemplo de Polling:**

```typescript
async function checkTransactionStatus(idTransaction: string) {
  const response = await fetch(`/api/transaction/${idTransaction}/status`);
  const data = await response.json();
  
  if (data.status === 'Success') {
    // Proceso aprobado
  } else if (data.status === 'Failure') {
    // Proceso rechazado
  } else {
    // Seguir esperando, reintentar en 30 segundos
    setTimeout(() => checkTransactionStatus(idTransaction), 30000);
  }
}
```

#### ❌ Failure - Error en el Proceso

Ocurrió un error durante el proceso.

```json
{
  "status": "Failure",
  "message": "Unauthorized",
  "CSID": ""
}
```

**Acciones recomendadas:**
- Mostrar mensaje de error específico al usuario
- Permitir reintentar el proceso
- Registrar el error para análisis

## 🚨 Mensajes de Error

### Errores de Autenticación

#### Token Inválido o Expirado

```json
{
  "status": "Failure",
  "message": "Unauthorized",
  "CSID": ""
}
```

**Causa:** El token JWT es inválido, ha expirado o no tiene permisos.

**Solución:**
- Verificar que el token no haya expirado
- Generar un nuevo token
- Confirmar que el token tenga los permisos necesarios

**⚠️ Token Expirado Durante el Proceso (sin F5):**

Si el usuario deja el proceso activo en pantalla por más de 1 hora sin recargar la página, el token puede expirar mientras el componente sigue montado. El componente detecta automáticamente esta situación en el próximo request y emite `genieEventGeneral` con `status: 'Failure'` y `message: 'Unauthorized'`.

Este comportamiento aplica tanto para el flujo de **Enrollment** como de **Verify**, y tanto cuando el componente es lanzado desde la plataforma Genie (con cookie de sesión) como desde un **cliente externo** (con token prop). En ambos casos el evento se emite de forma garantizada.

**Ejemplo de manejo:**

```typescript
document.addEventListener('genieEventGeneral', (event) => {
  const result = event.detail;
  
  if (result.status === 'Failure' && result.message === 'Unauthorized') {
    // Opción 1: Renovar token y reiniciar
    renewToken().then(newToken => {
      restartComponent(newToken);
    });
    
    // Opción 2: Redirigir a login
    window.location.href = '/login?expired=true';
    
    // Opción 3: Mostrar modal
    showModal({
      title: 'Sesión Expirada',
      message: 'Tu sesión ha expirado. Por favor, inicia el proceso nuevamente.'
    });
  }
});
```

#### Invitation Key Inválida

```json
{
  "status": "Failure",
  "message": "Invitation key isn't valid",
  "CSID": ""
}
```

**Causa:** La invitation key no existe, ya fue utilizada o ha expirado.

**Solución:**
- Generar una nueva invitation key
- Verificar que la key no haya sido usada previamente
- Confirmar que la key no haya expirado

#### Usuario Rechaza Consentimiento

```json
{
  "status": "Failure",
  "message": "Deny consent",
  "CSID": "",
  "callback": "..."
}
```

**Causa:** El usuario rechazó explícitamente el consentimiento.

**Solución:**
- El usuario debe aceptar el consentimiento para continuar
- Explicar al usuario por qué es necesario el consentimiento

### Errores de Liveness

#### Error de Detección de Vida

```json
{
  "status": "Failure",
  "message": "Internal Server Error Liveness",
  "CSID": ""
}
```

**Causa:** Problemas durante la captura de selfie o validación biométrica.

**Solución:**
- Permitir al usuario reintentar el proceso
- Verificar condiciones de iluminación
- Asegurar que la cámara funcione correctamente

### Errores de Configuración

#### Pantalla HTML Faltante

```json
{
  "status": "Failure",
  "msg": " Html Error => Screen front does not exist"
}
```

**Causa:** El SubCustomer no tiene configuradas las pantallas HTML necesarias para el flujo.

**Solución:**
- Verificar que el SubCustomer tenga todas las pantallas configuradas
- Contactar al administrador para configurar las pantallas faltantes
- Usar un SubCustomer de prueba que esté completamente configurado

### Errores de Permisos

> **⚠️ IMPORTANTE:** Los errores de permisos de cámara y geolocalización **NO emiten eventos**. El componente muestra una pantalla interna con instrucciones y un botón "Retry".

**Permisos de Cámara Denegados:**
- El componente muestra instrucciones para habilitar la cámara
- El usuario debe habilitar permisos y presionar "Retry"
- No se emite evento `genieEventGeneral`

**Permisos de Ubicación Denegados:**
- Solo si la geolocalización es obligatoria
- El componente muestra instrucciones para habilitar ubicación
- El usuario debe habilitar permisos y presionar "Retry"
- No se emite evento `genieEventGeneral`

## 💡 Ejemplos Completos

### Ejemplo React con Manejo Completo de Estados

```typescript
import { useState, useEffect } from 'react';

function GenieIntegration() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [csid, setCsid] = useState('');

  useEffect(() => {
    const handleGenieEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const result = customEvent.detail;

      switch (result.status) {
        case 'Success':
          setStatus('success');
          setCsid(result.CSID);
          // Guardar en base de datos
          saveToDatabase(result.CSID);
          break;

        case 'Pending':
          setStatus('loading');
          // Iniciar polling
          startPolling(result.idTransaction);
          break;

        case 'Failure':
          setStatus('error');
          setErrorMessage(getErrorMessage(result.message));
          break;
      }
    };

    document.addEventListener('genieEventGeneral', handleGenieEvent);
    return () => document.removeEventListener('genieEventGeneral', handleGenieEvent);
  }, []);

  const getErrorMessage = (message: string): string => {
    if (message === 'Unauthorized') {
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }
    if (message.includes('Invitation key')) {
      return 'El enlace de invitación no es válido o ha expirado.';
    }
    if (message === 'Deny consent') {
      return 'Debes aceptar el consentimiento para continuar.';
    }
    if (message.includes('Liveness')) {
      return 'Hubo un problema con la verificación facial. Por favor, inténtalo de nuevo.';
    }
    return 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
  };

  const saveToDatabase = async (csid: string) => {
    await fetch('/api/save-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csid })
    });
  };

  const startPolling = async (idTransaction: string) => {
    // Implementar lógica de polling
  };

  if (status === 'success') {
    return (
      <div className="success-screen">
        <h2>¡Verificación Completada!</h2>
        <p>Tu identidad ha sido verificada exitosamente.</p>
        <p>ID de sesión: {csid}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="error-screen">
        <h2>Error en la Verificación</h2>
        <p>{errorMessage}</p>
        <button onClick={() => window.location.reload()}>
          Intentar de Nuevo
        </button>
      </div>
    );
  }

  return (
    <genie-component-general
      url="https://enrolldev.idfactory.me/enroll?SubCustomer=Test&key=abc123"
      token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    />
  );
}
```

### Ejemplo HTML con Redirección Automática

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Verificación de Identidad</title>
  <script type="module" src="https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js"></script>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    .loading { text-align: center; padding: 2rem; }
  </style>
</head>
<body>
  <genie-component-general
    url="https://enrolldev.idfactory.me/verify?SubCustomer=MyCompany&key=xyz789"
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
  </genie-component-general>

  <script>
    document.addEventListener('genieEventGeneral', (event) => {
      const result = event.detail;

      if (result.status === 'Success') {
        // Guardar CSID en sessionStorage
        sessionStorage.setItem('verificationCSID', result.CSID);
        
        // Redirigir a página de éxito
        window.location.href = '/verification-success';
      } 
      else if (result.status === 'Pending') {
        // Guardar ID de transacción
        sessionStorage.setItem('transactionId', result.idTransaction);
        
        // Redirigir a página de espera
        window.location.href = '/verification-pending';
      }
      else if (result.status === 'Failure') {
        // Guardar mensaje de error
        sessionStorage.setItem('errorMessage', result.message);
        
        // Redirigir a página de error
        window.location.href = '/verification-error';
      }
    });
  </script>
</body>
</html>
```

## 🔒 Requisitos de Content Security Policy (CSP) y Permissions-Policy

> **⚠️ Esta sección solo aplica si tu sitio web tiene headers de seguridad configurados (Content-Security-Policy y/o Permissions-Policy).** Si no tienes estos headers, el componente funcionará sin configuración adicional.

### Content-Security-Policy (CSP)

Si tu sitio tiene una CSP configurada, debes agregar los siguientes dominios según el ambiente:

#### Dominios requeridos

| Directiva | Dominios (Producción) | Propósito |
|-----------|----------------------|----------|
| `script-src` | `'unsafe-eval' blob: https://id-webcomponent-prod-factory.s3.amazonaws.com https://ado.sfserv.net https://oz-idfactory-websdk.idfactory.me` | Scripts del WebComponent, Microblink y OZ Liveness |
| `script-src-elem` | _(mismos que script-src)_ | Scripts como elementos |
| `style-src` | `'unsafe-inline' https://id-webcomponent-prod-factory.s3.amazonaws.com https://oz-idfactory-websdk.idfactory.me` | Estilos del componente y OZ Liveness |
| `style-src-elem` | _(mismos que style-src)_ | Estilos como elementos |
| `connect-src` | `https://idfactory.me https://core-ui-configurations.idfactory.me https://id-webcomponent-prod-factory.s3.amazonaws.com https://ado.sfserv.net https://oz-idfactory-websdk.idfactory.me https://notification.jscrambler.com https://baltazar.microblink.com https://ping.microblink.com` | APIs, configuraciones y servicios biométricos |
| `frame-src` | `https://core-ui-components.idfactory.me` | Iframe de Liveness V1 y Card Capture V1 |
| `worker-src` | `blob: https://id-webcomponent-prod-factory.s3.amazonaws.com` | Web Workers de Microblink |
| `img-src` | `data: https:` | Imágenes del componente |
| `font-src` | `data: https:` | Fuentes |
| `media-src` | `blob: data:` | Captura de video/audio |

#### Ejemplo CSP completo (Producción)

```
script-src 'self' 'unsafe-eval' blob: https://id-webcomponent-prod-factory.s3.amazonaws.com https://ado.sfserv.net https://oz-idfactory-websdk.idfactory.me; style-src 'self' 'unsafe-inline' https://id-webcomponent-prod-factory.s3.amazonaws.com https://oz-idfactory-websdk.idfactory.me; connect-src 'self' https://idfactory.me https://core-ui-configurations.idfactory.me https://id-webcomponent-prod-factory.s3.amazonaws.com https://ado.sfserv.net https://oz-idfactory-websdk.idfactory.me https://notification.jscrambler.com https://baltazar.microblink.com https://ping.microblink.com; frame-src 'self' https://core-ui-components.idfactory.me; worker-src 'self' blob: https://id-webcomponent-prod-factory.s3.amazonaws.com; img-src 'self' data: https:; font-src 'self' data: https:; media-src 'self' blob: data:;
```

#### Dominios por ambiente

| Ambiente | S3 WebComponent | BFF | Config UI | UI Components |
|----------|----------------|-----|-----------|---------------|
| DEV | `id-webcomponent-dev-factory.s3.amazonaws.com` | `dev.idfactory.me` | `core-ui-configurations-dev.idfactory.me` | `core-ui-components-dev.idfactory.me` |
| Sandbox | `id-webcomponent-sandbox-factory.s3.amazonaws.com` | `sandbox.idfactory.me` | `core-ui-configurations-sandbox.idfactory.me` | `core-ui-components-sandbox.idfactory.me` |
| Producción | `id-webcomponent-prod-factory.s3.amazonaws.com` | `idfactory.me` | `core-ui-configurations.idfactory.me` | `core-ui-components.idfactory.me` |

> **Nota:** Los dominios `https://ado.sfserv.net`, `https://oz-idfactory-websdk.idfactory.me`, `https://notification.jscrambler.com`, `https://baltazar.microblink.com` y `https://ping.microblink.com` son los mismos en todos los ambientes.

### Permissions-Policy

Si tu sitio tiene un header `Permissions-Policy`, debes permitir cámara y micrófono para el dominio de UI Components (usado por Liveness V1 y Card Capture V1 en iframes):

```
camera=(self "https://core-ui-components.idfactory.me"), microphone=(self "https://core-ui-components.idfactory.me"), geolocation=(self)
```

| Ambiente | Dominio para Permissions-Policy |
|----------|---------------------------------|
| DEV | `https://core-ui-components-dev.idfactory.me` |
| Sandbox | `https://core-ui-components-sandbox.idfactory.me` |
| Producción | `https://core-ui-components.idfactory.me` |

### ¿Cómo saber si necesito configurar esto?

Si al integrar el componente ves errores en la consola del navegador como:
- `Refused to load the script...` → Necesitas ajustar `script-src`
- `Refused to connect to...` → Necesitas ajustar `connect-src`
- `Refused to frame...` → Necesitas ajustar `frame-src`
- `Permissions policy violation: camera is not allowed` → Necesitas ajustar `Permissions-Policy`

Si no ves ninguno de estos errores, tu sitio no tiene CSP/Permissions-Policy y no necesitas hacer nada.

## 🔧 Troubleshooting

### El componente no se carga

**Problema:** El componente no aparece en la página.

**Soluciones:**
1. Verificar que el script esté cargado correctamente
2. Abrir la consola del navegador y buscar errores
3. Confirmar que la URL del CDN sea correcta
4. Verificar que no haya bloqueadores de contenido activos

### No se reciben eventos

**Problema:** El listener no captura los eventos del componente.

**Soluciones:**
1. Confirmar que el listener esté registrado **antes** de que el componente se inicialice
2. Verificar que el nombre del evento sea exactamente `genieEventGeneral`
3. Revisar la consola para errores de JavaScript
4. Asegurar que el listener no se haya removido accidentalmente

### Token inválido constantemente

**Problema:** Siempre se recibe error "Unauthorized".

**Soluciones:**
1. Verificar que el token no incluya el prefijo "Bearer " (el componente lo agrega automáticamente)
2. Confirmar que el token no haya expirado
3. Validar que el token tenga los permisos correctos
4. Generar un nuevo token desde el backend

### El componente se cierra inesperadamente

**Problema:** El componente desaparece sin emitir evento.

**Soluciones:**
1. Revisar la consola del navegador para errores
2. Verificar que la URL de invitación sea correcta
3. Confirmar que el SubCustomer exista en el sistema
4. Validar que la invitation key no haya expirado

## 📞 Soporte

Para soporte técnico o consultas adicionales:

- **Email:** support@idfactory.me
- **Documentación:** https://docs.idfactory.me
- **Portal de Desarrolladores:** https://developers.idfactory.me

## 🔄 Manejo del F5 y Recarga de Página

> **⚠️ CRÍTICO:** Cuando el usuario recarga la página (F5) mientras el WebComponent está activo, el proceso biométrico se interrumpe completamente. El WebComponent se desmonta, pierde su estado y el token en memoria desaparece. Debes implementar una de las tres estrategias descritas a continuación.

### El problema

El token que pasas al WebComponent vive únicamente en memoria JavaScript. Un F5 lo destruye:

```
Usuario hace F5
  ↓
WebComponent se desmonta — proceso perdido
  ↓
Tu página recarga — ¿tienes el token disponible para volver a montarlo?
  ↓
Si no → WebComponent se monta sin token → Failure: Unauthorized
```

---

### Estrategia 1 — Bloquear el F5 (Recomendada para procesos críticos)

Impide que el usuario recargue la página mientras el proceso está activo.

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault()
    e.returnValue = '' // Muestra diálogo de confirmación del browser
  }

  window.addEventListener('beforeunload', handleBeforeUnload)

  return () => {
    // Desactivar cuando el proceso termina
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}, [])
```

**Cuándo usar:** Procesos donde reiniciar implica generar una nueva invitation key.

---

### Estrategia 2 — Obtener nuevo token desde tu backend (Recomendada para producción)

Al recargar, tu frontend solicita un nuevo token a **tu propio backend**. El token nunca se almacena en el cliente.

```typescript
// ✅ CORRECTO — token obtenido del backend en cada carga
function VerificationPage() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/get-genie-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    })
      .then(res => res.json())
      .then(data => setToken(data.token))
      .catch(() => navigate('/error'))
  }, [])

  if (!token) return <Loading />

  return <genie-component-general url={invitationUrl} token={token} />
}
```

```
// Tu backend — las credenciales NUNCA llegan al browser
POST /api/get-genie-token
  → Llama a la API de Genie con credenciales guardadas en variables de entorno
  → Retorna el token al frontend
```

> **⚠️ NUNCA hagas esto:**
> ```typescript
> // ❌ INCORRECTO — credenciales expuestas en el frontend
> const response = await fetch('https://api.genie.com/getToken', {
>   headers: {
>     username: 'mi-usuario',  // ← visible en el browser
>     password: 'mi-password'  // ← visible en el browser
>   }
> })
> ```

**Cuándo usar:** Cuando el proceso puede reiniciarse con la misma o una nueva invitation key.

---

### Estrategia 3 — Manejar el evento `Unauthorized`

Captura el evento `Failure: Unauthorized` y guía al usuario para reiniciar.

```typescript
document.addEventListener('genieEventGeneral', (event) => {
  const result = event.detail

  if (result.status === 'Failure' && result.message === 'Unauthorized') {
    // Opción A: Obtener nuevo token y reiniciar automáticamente
    getNewTokenFromBackend().then(newToken => {
      remountComponent(newToken)
    })

    // Opción B: Redirigir para reiniciar el flujo
    window.location.href = '/start-verification'

    // Opción C: Mostrar mensaje al usuario
    showMessage({
      title: 'Sesión interrumpida',
      message: 'La página fue recargada. Por favor, inicia el proceso nuevamente.'
    })
  }
})
```

**Cuándo usar:** Como fallback o cuando el proceso puede reiniciarse fácilmente.

---

### Resumen de estrategias

| Estrategia | Complejidad | UX | Recomendada para |
|------------|-------------|-----|------------------|
| Bloquear F5 | Baja | Browser muestra diálogo de confirmación | Procesos críticos de un solo uso |
| Token desde backend | Media | Transparente para el usuario | Producción — mejor opción de seguridad |
| Manejar Unauthorized | Baja | Usuario debe reiniciar manualmente | Fallback o procesos reiniciables |

---

### Lo que NUNCA debes hacer

```typescript
// ❌ NO guardar el token en storage del browser
localStorage.setItem('genieToken', token)
sessionStorage.setItem('genieToken', token)

// ❌ NO incluir el token en la URL
window.location.href = `/verify?token=${token}`

// ❌ NO hardcodear el token en el código fuente
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// ❌ NO obtener el token con credenciales desde el frontend
const token = await fetch('https://api.genie.com/getToken', {
  headers: { username: 'user', password: 'pass' }
})
```

Almacenar el token en el cliente lo expone a ataques XSS. Un script malicioso puede robarlo y usarlo para hacer peticiones en nombre del usuario.

---

## 📝 Notas Importantes

1. **Seguridad:** Nunca expongas tokens en el código del cliente. Genera tokens dinámicamente desde tu backend en cada carga de página.

2. **F5 y Recarga:** Implementa una de las tres estrategias descritas arriba. Sin esto, el proceso biométrico se interrumpirá y el usuario recibirá `Failure: Unauthorized`.

3. **HTTPS:** El componente requiere HTTPS en producción para acceder a la cámara.

4. **Compatibilidad:** El componente funciona en navegadores modernos (Chrome, Firefox, Safari, Edge).

5. **Permisos:** El usuario debe otorgar permisos de cámara y ubicación (si es requerida).

6. **Tokens:** Los tokens tienen tiempo de expiración configurado por tu SubCustomer. Si el usuario deja el proceso inactivo y el token expira, recibirás `Failure: Unauthorized`. Implementa la Estrategia 2 o 3 para manejarlo.

## 🔄 Changelog

### Última versión
- ✅ Corrección del óvalo de liveness
- ✅ Optimización del z-index del loader
- ✅ Mejoras en la detección automática de proceso
- ✅ Unificación de eventos bajo `genieEventGeneral`
- ✅ Simplificación de respuestas (eliminación del campo `token`)
- ✅ Mejoras en manejo de errores

---

**Última actualización:** Enero 2025  
**© ID Factory LLC**
