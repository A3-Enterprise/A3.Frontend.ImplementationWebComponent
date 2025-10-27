import { useState, useEffect } from 'react';
import type { GenieEventDetail } from './types/genie';
import packageJson from '../package.json';
import './App.css';

type Environment = 'dev' | 'sandbox' | 'prd';

interface EnvironmentConfig {
  baseUrl: string;
  example: { url: string; token: string };
}

const environments: Record<Environment, EnvironmentConfig> = {
  dev: {
    baseUrl: 'https://enrolldev.idfactory.me',
    example: {
      url: 'https://enrolldev.idfactory.me/enroll?SubCustomer=TestCustomer&key=your-key',
      token: 'your-dev-token'
    }
  },
  sandbox: {
    baseUrl: 'https://enrollsandbox.idfactory.me',
    example: {
      url: 'https://enrollsandbox.idfactory.me/enroll?SubCustomer=SandboxSubProjectA3&key=638efc21023d4c789e792b70c3d40a4f27102025093520470',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkJlYXJlciJ9.eyJuYW1laWQiOiI2NiIsIm5iZiI6MTc2MTYwMDMzMywiZXhwIjoxNzYxNjAzOTMzLCJpYXQiOjE3NjE2MDAzMzMsImlzcyI6Imh0dHBzOi8vc2FuZGJveC5pZGZhY3RvcnkubWUiLCJhdWQiOiJodHRwczovL3NhbmRib3guaWRmYWN0b3J5Lm1lIn0.wU_IHGP9Kzjc3XEvSlmgF95nhu9-1lwrm4PflHSiM7s'
    }
  },
  prd: {
    baseUrl: 'https://enroll.idfactory.me',
    example: {
      url: 'https://enroll.idfactory.me/enroll?SubCustomer=YourCustomer&key=your-key',
      token: 'your-prd-token'
    }
  }
};

function App() {
  const [environment, setEnvironment] = useState<Environment>('sandbox');
  const [url, setUrl] = useState(environments.sandbox.example.url);
  const [token, setToken] = useState(environments.sandbox.example.token);
  const [isComponentActive, setIsComponentActive] = useState(false);
  const [response, setResponse] = useState<GenieEventDetail | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [componentVersion, setComponentVersion] = useState<string>('...');

  const handleEnvironmentChange = (env: Environment) => {
    setEnvironment(env);
    setUrl(environments[env].example.url);
    setToken(environments[env].example.token);
    console.log(`🔄 Entorno cambiado a: ${env.toUpperCase()}`);
  };

  const fetchComponentVersion = async () => {
    try {
      const response = await fetch('https://dev.idfactory.me/bff/webComponent/version');
      if (response.ok) {
        const data = await response.json();
        setComponentVersion(data.version || 'N/A');
      } else {
        setComponentVersion('N/A');
      }
    } catch (error) {
      console.warn('No se pudo obtener la versión del Web Component:', error);
      setComponentVersion('N/A');
    }
  };

  useEffect(() => {
    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        const existingScript = document.getElementById('genie-component-script');
        if (existingScript) {
          existingScript.remove();
        }

        const scriptUrl = `https://id-webcomponent-${environment === 'prd' ? 'prod' : environment}-factory.s3.amazonaws.com/demo/demo.esm.js`;

        console.log(`📦 Cargando script desde: ${scriptUrl}`);

        const script = document.createElement('script');
        script.id = 'genie-component-script';
        script.type = 'module';
        script.src = scriptUrl;
        script.onload = () => {
          console.log('✅ Script cargado exitosamente');
          setScriptLoaded(true);
          resolve();
        };
        script.onerror = (error) => {
          console.error('❌ Error cargando script:', error);
          console.error('URL que falló:', scriptUrl);
          reject(new Error(`Failed to load script from ${scriptUrl}`));
        };
        document.head.appendChild(script);
      });
    };

    setScriptLoaded(false);
    loadScript().catch((error) => {
      console.error('Error al cargar el script del Web Component:', error);
      alert(`Error: No se pudo cargar el Web Component para el entorno ${environment.toUpperCase()}. Verifica la consola para más detalles.`);
    });
  }, [environment]);

  useEffect(() => {
    fetchComponentVersion();
  }, []);

  useEffect(() => {
    const handleGenieEvent = (event: Event) => {
      const customEvent = event as CustomEvent<GenieEventDetail>;
      console.log('📨 Evento recibido:', customEvent.detail);
      setResponse(customEvent.detail);

      if (customEvent.detail.status === 'Failure') {
        setIsComponentActive(false);
      }
    };

    document.addEventListener('genieEventGeneral', handleGenieEvent);

    return () => {
      document.removeEventListener('genieEventGeneral', handleGenieEvent);
    };
  }, []);

  const startComponent = () => {
    if (!url || !token) {
      alert('URL y Token son requeridos');
      return;
    }
    setResponse(null);
    setIsComponentActive(true);
    console.log('🚀 Componente iniciado');
  };

  const resetComponent = () => {
    setIsComponentActive(false);
    setResponse(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return '✅';
      case 'Pending':
        return '⏳';
      case 'Failure':
        return '❌';
      default:
        return '⚠️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return '#28a745';
      case 'Pending':
        return '#ffc107';
      case 'Failure':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <>
      <div className="main-container" style={{ display: isComponentActive ? 'none' : 'block' }}>
        <div className="header">
          <h1>
            <i className="fas fa-cube"></i> Genie Frontend Web Component
          </h1>
          <div className="version-badge">
            <i className="fas fa-check-circle"></i> Web Component v{componentVersion} | App v{packageJson.version}
          </div>
          <p className="subtitle">Ejemplo de Implementación en React</p>
        </div>

        <div className="content-section">
          <h3 className="section-title">
            <i className="fas fa-cog"></i> Configuración del Componente
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label"><i className="fas fa-server"></i> Entorno</label>
              <select
                className="form-control"
                value={environment}
                onChange={(e) => handleEnvironmentChange(e.target.value as Environment)}
              >
                <option value="dev">DEV - Desarrollo</option>
                <option value="sandbox">SANDBOX - Pruebas</option>
                <option value="prd">PRD - Producción</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label"><i className="fas fa-link"></i> URL Base</label>
              <input
                className="form-control"
                type="text"
                value={environments[environment].baseUrl}
                readOnly
                style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">URL de Invitación</label>
              <input
                className="form-control"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="URL completa de invitación"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Token de Autenticación</label>
              <input
                className="form-control"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="JWT token"
              />
            </div>
          </div>

          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={startComponent}
              disabled={!scriptLoaded}
            >
              <i className="fas fa-play"></i> Iniciar
            </button>
            {isComponentActive && (
              <button className="btn btn-danger" onClick={resetComponent}>
                <i className="fas fa-redo"></i> Reiniciar
              </button>
            )}
          </div>

          {!scriptLoaded && (
            <div className="loading-message">
              <i className="fas fa-spinner fa-spin"></i> Cargando web component...
            </div>
          )}
        </div>

        {response && (
          <div className="content-section">
            <h3 className="section-title">
              <i className="fas fa-bell"></i> Respuesta del Componente
            </h3>
            <div className="response-container">
              <div className="response-header" style={{ borderLeftColor: getStatusColor(response.status) }}>
                <span className="status-badge" style={{ background: getStatusColor(response.status) }}>
                  {getStatusIcon(response.status)} {response.status}
                </span>
                <span className="response-message">{response.message}</span>
              </div>
              <pre className="response-json">{JSON.stringify(response, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {isComponentActive && scriptLoaded && (
        <div className="component-container">
          <genie-component-general url={url} token={token} />
        </div>
      )}
    </>
  );
}

export default App;
