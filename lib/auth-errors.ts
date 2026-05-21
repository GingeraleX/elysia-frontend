/**
 * Authentication error handler with user-friendly messages and categorization
 */

export enum AuthErrorType {
  INVALID_CREDENTIALS = "invalid_credentials",
  USER_EXISTS = "user_exists",
  WEAK_PASSWORD = "weak_password",
  INVALID_EMAIL = "invalid_email",
  MISSING_FIELDS = "missing_fields",
  NETWORK_ERROR = "network_error",
  TIMEOUT = "timeout",
  SERVER_ERROR = "server_error",
  VALIDATION_ERROR = "validation_error",
  UNKNOWN = "unknown",
}

export interface AuthError {
  type: AuthErrorType;
  userMessage: string;
  technicalMessage: string;
  statusCode?: number;
}

/**
 * Parse backend error responses and map to user-friendly messages
 */
export function parseAuthError(error: any, _defaultMessage: string = "Autenticazione non riuscita"): AuthError {
  let message = "";
  let statusCode: number | undefined;

  // Extract message from various error formats
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (error?.message) {
    message = error.message;
    statusCode = error?.status;
  } else if (error?.detail) {
    message = error.detail;
    statusCode = error?.status;
  }

  const lowerMessage = message.toLowerCase();

  // LOGIN ERRORS
  if (statusCode === 401 || lowerMessage.includes("invalid email or password")) {
    return {
      type: AuthErrorType.INVALID_CREDENTIALS,
      userMessage: "Email o password non valide. Controlla e riprova.",
      technicalMessage: message,
      statusCode: statusCode || 401,
    };
  }

  // REGISTER ERRORS - User already exists
  if (lowerMessage.includes("user already exists") || lowerMessage.includes("already registered")) {
    return {
      type: AuthErrorType.USER_EXISTS,
      userMessage: "Questa email è già registrata. Effettua l'accesso.",
      technicalMessage: message,
      statusCode: statusCode || 400,
    };
  }

  // Password validation errors
  if (lowerMessage.includes("password must") || lowerMessage.includes("password")) {
    if (lowerMessage.includes("at least 6") || lowerMessage.includes("6 characters")) {
      return {
        type: AuthErrorType.WEAK_PASSWORD,
        userMessage: "La password deve contenere almeno 6 caratteri, lettere e numeri.",
        technicalMessage: message,
        statusCode: statusCode || 400,
      };
    }
    if (lowerMessage.includes("letters and numbers")) {
      return {
        type: AuthErrorType.WEAK_PASSWORD,
        userMessage: "La password deve contenere sia lettere sia numeri.",
        technicalMessage: message,
        statusCode: statusCode || 400,
      };
    }
    return {
      type: AuthErrorType.WEAK_PASSWORD,
      userMessage: "La password non soddisfa i requisiti. Riprova.",
      technicalMessage: message,
      statusCode: statusCode || 400,
    };
  }

  // Email validation errors
  if (lowerMessage.includes("email")) {
    return {
      type: AuthErrorType.INVALID_EMAIL,
      userMessage: "Inserisci un indirizzo email valido.",
      technicalMessage: message,
      statusCode: statusCode || 400,
    };
  }

  // Missing fields
  if (lowerMessage.includes("required")) {
    return {
      type: AuthErrorType.MISSING_FIELDS,
      userMessage: "Compila tutti i campi obbligatori.",
      technicalMessage: message,
      statusCode: statusCode || 400,
    };
  }

  // Network errors
  if (lowerMessage.includes("timeout")) {
    return {
      type: AuthErrorType.TIMEOUT,
      userMessage: "Richiesta scaduta. Controlla la connessione e riprova.",
      technicalMessage: message,
      statusCode: statusCode || 408,
    };
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
    return {
      type: AuthErrorType.NETWORK_ERROR,
      userMessage: "Errore di rete. Controlla la connessione internet e riprova.",
      technicalMessage: message,
      statusCode: statusCode || 0,
    };
  }

  // Server errors
  if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
    return {
      type: AuthErrorType.SERVER_ERROR,
      userMessage: "Il server è temporaneamente non disponibile. Riprova più tardi.",
      technicalMessage: message,
      statusCode,
    };
  }

  // Validation errors
  if (statusCode === 400) {
    return {
      type: AuthErrorType.VALIDATION_ERROR,
      userMessage: "Controlla i dati inseriti e riprova.",
      technicalMessage: message,
      statusCode,
    };
  }

  // Default error handling
  return {
    type: AuthErrorType.UNKNOWN,
    userMessage: "Qualcosa è andato storto. Riprova.",
    technicalMessage: message,
    statusCode: statusCode || 0,
  };
}

