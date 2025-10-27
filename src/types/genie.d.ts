/**
 * Tipos para el Genie Web Component
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'genie-component-general': {
        url: string;
        token: string;
      };
      'genie-component-enroll': {
        'invitation-key': string;
        'sub-customer': string;
        token: string;
      };
      'genie-component-verify': {
        'invitation-key': string;
        'sub-customer': string;
        token: string;
      };
    }
  }
}

/**
 * Detalle del evento emitido por el web component
 */
export interface GenieEventDetail {
  /** Estado del proceso */
  status: 'Success' | 'Pending' | 'Failure';
  
  /** Mensaje descriptivo del resultado */
  message: string;
  
  /** ID único de la sesión */
  CSID: string;
  
  /** URL de callback (opcional) */
  callback?: string;
  
  /** ID de transacción (solo en status Pending) */
  idTransaction?: string;
}

/**
 * Evento personalizado del web component
 */
export interface GenieEvent extends CustomEvent<GenieEventDetail> {
  detail: GenieEventDetail;
}

export {};
