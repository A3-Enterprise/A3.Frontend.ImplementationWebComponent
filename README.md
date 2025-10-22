# Genie Frontend Web Component - Guía de Implementación

Esta es una guía completa para implementar el Web Component de A3 Frontend en tu aplicación.

## 📦 Instalación

### 1. Cargar el Script del Web Component

Agrega el script del web component a tu aplicación:

```html
<script type="module" src="https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js"></script>
```

### 2. Para React/TypeScript

```typescript
async function loadScript(url: string, id: string, type: string) {
  return new Promise((resolve) => {
    document.body.appendChild(
      Object.assign(document.createElement("script"), {
        type: type,
        async: true,
        defer: true,
        id: id,
        src: url,
        onload: resolve,
      })
    );
  });
}

// En tu componente
useEffect(() => {
  loadScript('https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js', "genie-component", "module");
}, []);
```

## 🚀 Uso Básico

### Componente General (Recomendado)

El componente general detecta automáticamente si es enrollment o verificación basado en la URL:

```html
<genie-component-general 
  url="https://enrolldev.idfactory.me/enroll?SubCustomer=YourSubCustomer&key=your-invitation-key"
  token="your-bearer-token">
</genie-component-general>
```

### Ejemplo en React

```typescript
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const container = document.getElementById('container');
    
    // Cargar el script del web component
    loadScript('https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js', "genie-component", "module")
      .then(() => {
        // Insertar el componente
        container.insertAdjacentHTML('afterbegin',
          `<genie-component-general 
              url="https://enrolldev.idfactory.me/verify?SubCustomer=WithHtmltest&key=d8ceca0e84354ab1a6918e34e456b29c24022025105255048"
              token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkJlYXJlciJ9...">
            </genie-component-general>`
        );
      });
  }, []);

  return <div id="container" />;
}
```

## 📋 Parámetros Requeridos

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `url` | string | URL completa de invitación | `https://enrolldev.idfactory.me/enroll?SubCustomer=Test&key=abc123` |
| `token` | string | Token Bearer de autenticación | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 🎯 Tipos de URL

### Enrollment (Registro)
```
https://enrolldev.idfactory.me/enroll?SubCustomer=YourSubCustomer&key=invitation-key
```

### Verificación
```
https://enrolldev.idfactory.me/verify?SubCustomer=YourSubCustomer&key=invitation-key
```

## 📡 Eventos - IMPORTANTE

### Escuchar Eventos

**SIEMPRE** debes escuchar el evento `genieEventGeneral` para recibir el resultado:

```javascript
// Vanilla JavaScript
document.addEventListener("genieEventGeneral", (event) => {
  console.log("Resultado:", event.detail);
  
  if (event.detail.status === 'Success') {
    // Proceso completado exitosamente
    console.log('CSID:', event.detail.CSID);
    console.log('Token:', event.detail.token);
    console.log('Callback URL:', event.detail.callback);
  } else {
    // Error en el proceso
    console.error('Error:', event.detail.message);
  }
});
```

```typescript
// React/TypeScript
useEffect(() => {
  const handleGenieEvent = (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log("Resultado:", customEvent.detail);
    
    // Manejar el resultado aquí
    if (customEvent.detail.status === 'Success') {
      // Éxito - redirigir o mostrar mensaje
    } else {
      // Error - mostrar mensaje de error
    }
  };

  document.addEventListener("genieEventGeneral", handleGenieEvent);

  return () => {
    document.removeEventListener("genieEventGeneral", handleGenieEvent);
  };
}, []);
```

### Estructura del Evento

```javascript
{
  status: 'Success' | 'Failure',
  message: 'Mensaje descriptivo del resultado',
  CSID: 'ID único de la sesión',
  token: 'Token actualizado (si aplica)',
  callback: 'URL de callback (opcional)'
}
```

## 🔧 Ejemplo Completo - HTML Vanilla

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A3 Web Component Example</title>
</head>
<body>
  <div id="container"></div>

  <script type="module">
    // Cargar el web component
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js';
    
    script.onload = () => {
      // Insertar el componente
      document.getElementById('container').innerHTML = `
        <genie-component-general 
          url="https://enrolldev.idfactory.me/enroll?SubCustomer=TestCustomer&key=your-invitation-key"
          token="your-bearer-token">
        </genie-component-general>
      `;
    };
    
    document.head.appendChild(script);

    // Escuchar el evento de resultado
    document.addEventListener('genieEventGeneral', (event) => {
      console.log('Resultado del proceso:', event.detail);
      
      if (event.detail.status === 'Success') {
        alert('¡Proceso completado exitosamente!');
        // Aquí puedes redirigir o realizar otras acciones
      } else {
        alert('Error: ' + event.detail.message);
      }
    });
  </script>
</body>
</html>
```

## 🔧 Ejemplo Completo - React

```typescript
import { useEffect } from "react";

function App() {
  // Función para cargar el script
  async function loadScript(url: string, id: string, type: string) {
    return new Promise((resolve) => {
      document.body.appendChild(
        Object.assign(document.createElement("script"), {
          type: type,
          async: true,
          defer: true,
          id: id,
          src: url,
          onload: resolve,
        })
      );
    });
  }

  // Cargar el web component
  useEffect(() => {
    const container = document.getElementById('container');
    if (!container) {
      console.error('Container element not found');
      return;
    }

    loadScript('https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js', "genie-component", "module")
      .then(() => {
        container.insertAdjacentHTML('afterbegin',
          `<genie-component-general 
              url="https://enrolldev.idfactory.me/verify?SubCustomer=WithHtmltest&key=d8ceca0e84354ab1a6918e34e456b29c24022025105255048"
              token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkJlYXJlciJ9.eyJuYW1laWQiOiI0OSIsIm5iZiI6MTc0MDQzNjg3OSwiZXhwIjoxNzQwNDQwNDc5LCJpYXQiOjE3NDA0MzY4NzksImlzcyI6Imh0dHBzOi8vZGV2LmlkZmFjdG9yeS5tZSIsImF1ZCI6Imh0dHBzOi8vZGV2LmlkZmFjdG9yeS5tZSJ9.4lxxWOuC1CZoAtYWwT59fN1aG5yeAuONEaK77QIup48">
            </genie-component-general>`
        );
      });
  }, []);

  // Escuchar eventos del web component
  useEffect(() => {
    const handleGenieEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log("Resultado del proceso:", customEvent.detail);
      
      // Manejar el resultado
      if (customEvent.detail.status === 'Success') {
        // Proceso exitoso
        console.log('CSID:', customEvent.detail.CSID);
        console.log('Token:', customEvent.detail.token);
        // Redirigir o mostrar mensaje de éxito
      } else {
        // Error en el proceso
        console.error('Error:', customEvent.detail.message);
        // Mostrar mensaje de error
      }
    };
  
    document.addEventListener("genieEventGeneral", handleGenieEvent);

    return () => {
      document.removeEventListener("genieEventGeneral", handleGenieEvent);
    };
  }, []);

  return (
    <div id="container" />
  );
}

export default App;
```

## ⚠️ Puntos Importantes

1. **Siempre escucha el evento**: El evento `genieEventGeneral` es OBLIGATORIO para recibir el resultado
2. **Carga el script primero**: Asegúrate de que el script esté cargado antes de insertar el componente
3. **URLs válidas**: Usa URLs de invitación válidas con SubCustomer y key correctos
4. **Token válido**: El token debe estar vigente y tener los permisos necesarios
5. **Contenedor**: Asegúrate de que el contenedor DOM exista antes de insertar el componente

## 🐛 Debugging

En entornos de desarrollo, el componente muestra logs detallados en la consola para:
- Requests y responses de APIs
- Validación de tokens y keys
- Estados de carga y errores

## 📞 Soporte

Para más información o soporte técnico, contacta al equipo de desarrollo de Genie Frontend.
