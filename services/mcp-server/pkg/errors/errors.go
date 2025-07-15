package errors

import (
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

// TauseProError error personalizado para TausePro
type TauseProError struct {
	Code       string `json:"code"`
	Message    string `json:"message"`
	StatusCode int    `json:"status_code"`
	Details    any    `json:"details,omitempty"`
}

func (e *TauseProError) Error() string {
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

// NewTauseProError crea un error personalizado
func NewTauseProError(code, message string, statusCode int, details any) *TauseProError {
	return &TauseProError{
		Code:       code,
		Message:    message,
		StatusCode: statusCode,
		Details:    details,
	}
}

// Errores de Autenticación
func NewAuthError(message, code string) *TauseProError {
	return NewTauseProError(code, message, http.StatusUnauthorized, nil)
}

// Errores de Tenant (Multi-tenancy)
func NewTenantError(message, code string) *TauseProError {
	return NewTauseProError(code, message, http.StatusBadRequest, nil)
}

// Errores de Paywall
func NewPaywallError(message, code string) *TauseProError {
	return NewTauseProError(code, message, http.StatusPaymentRequired, nil)
}

// Errores de Validación
func NewValidationError(message string, details any) *TauseProError {
	return NewTauseProError("VALIDATION_ERROR", message, http.StatusBadRequest, details)
}

// Errores de Colombia (validaciones específicas)
func NewColombiaValidationError(message, field string) *TauseProError {
	return NewTauseProError("COLOMBIA_VALIDATION_ERROR", message, http.StatusBadRequest, map[string]string{
		"field":   field,
		"country": "Colombia",
	})
}

// Errores de MCP
func NewMCPError(message, code string) *TauseProError {
	return NewTauseProError(code, message, http.StatusInternalServerError, nil)
}

// Errores específicos comunes para PYMEs

// ErrNITInvalido error de NIT inválido
func ErrNITInvalido(nit string) *TauseProError {
	return NewColombiaValidationError(
		fmt.Sprintf("El NIT '%s' no es válido. Verifica el formato y dígito de verificación.", nit),
		"nit_number",
	)
}

// ErrCedulaInvalida error de cédula inválida
func ErrCedulaInvalida(cedula string) *TauseProError {
	return NewColombiaValidationError(
		fmt.Sprintf("La cédula '%s' no es válida. Verifica el número.", cedula),
		"document_number",
	)
}

// ErrTenantNotFound error de tenant no encontrado
func ErrTenantNotFound(tenantID string) *TauseProError {
	return NewTenantError(
		fmt.Sprintf("La empresa con ID '%s' no fue encontrada.", tenantID),
		"TENANT_NOT_FOUND",
	)
}

// ErrPaywallLimitReached error de límite de paywall alcanzado
func ErrPaywallLimitReached(metric string, limit int) *TauseProError {
	messages := map[string]string{
		"api_calls":         "Has alcanzado el límite de llamadas a la API",
		"mcp_agents":        "Has alcanzado el límite de agentes MCP",
		"whatsapp_messages": "Has alcanzado el límite de mensajes de WhatsApp",
	}
	
	message := messages[metric]
	if message == "" {
		message = "Has alcanzado el límite de tu plan"
	}
	
	return NewPaywallError(
		fmt.Sprintf("%s (%d). Upgradeate para continuar usando TausePro.", message, limit),
		"PAYWALL_LIMIT_REACHED",
	)
}

// ErrInsufficientPermissions error de permisos insuficientes
func ErrInsufficientPermissions(action string) *TauseProError {
	return NewAuthError(
		fmt.Sprintf("No tienes permisos para realizar la acción '%s'.", action),
		"INSUFFICIENT_PERMISSIONS",
	)
}

// ErrMCPAgentNotFound error de agente MCP no encontrado
func ErrMCPAgentNotFound(agentID string) *TauseProError {
	return NewMCPError(
		fmt.Sprintf("El agente MCP '%s' no fue encontrado.", agentID),
		"MCP_AGENT_NOT_FOUND",
	)
}

// HandleError maneja errores de Fiber y los convierte a formato TausePro
func HandleError(c *fiber.Ctx, err error) error {
	// Si ya es un error de TausePro, retornarlo tal como está
	if tauseProErr, ok := err.(*TauseProError); ok {
		return c.Status(tauseProErr.StatusCode).JSON(fiber.Map{
			"error":   true,
			"code":    tauseProErr.Code,
			"message": tauseProErr.Message,
			"details": tauseProErr.Details,
		})
	}

	// Si es un error de Fiber, convertirlo
	if fiberErr, ok := err.(*fiber.Error); ok {
		return c.Status(fiberErr.Code).JSON(fiber.Map{
			"error":   true,
			"code":    "FIBER_ERROR",
			"message": fiberErr.Message,
		})
	}

	// Error genérico
	return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
		"error":   true,
		"code":    "INTERNAL_ERROR",
		"message": "Error interno del servidor. Por favor intenta de nuevo.",
		"details": err.Error(),
	})
}

// Mensajes de error en español para PYMEs
var ErrorMessages = map[string]string{
	// Autenticación
	"TOKEN_MISSING":           "Token de autorización requerido",
	"TOKEN_INVALID":           "Token inválido o expirado",
	"INVALID_CREDENTIALS":     "Email o contraseña incorrectos",
	"USER_NOT_FOUND":          "Usuario no encontrado",
	"EMAIL_ALREADY_EXISTS":    "Este email ya está registrado",
	
	// Tenant
	"TENANT_NOT_FOUND":        "Empresa no encontrada",
	"TENANT_INACTIVE":         "Esta empresa está inactiva",
	"TENANT_SUSPENDED":        "Esta empresa ha sido suspendida",
	
	// Paywall
	"UPGRADE_REQUIRED":        "Upgrade requerido para continuar",
	"PAYMENT_FAILED":          "Error en el pago. Intenta de nuevo",
	"SUBSCRIPTION_EXPIRED":    "Tu suscripción ha expirado",
	
	// Colombia
	"INVALID_NIT":             "NIT inválido",
	"INVALID_CEDULA":          "Cédula inválida",
	"INVALID_PHONE":           "Número de teléfono inválido",
	"DIAN_API_ERROR":          "Error conectando con DIAN",
	"PSE_PAYMENT_ERROR":       "Error en el pago PSE",
	
	// MCP
	"MCP_AGENT_ERROR":         "Error en el agente MCP",
	"MCP_TOOL_NOT_FOUND":      "Herramienta MCP no encontrada",
	"MCP_EXECUTION_FAILED":    "Error ejecutando herramienta MCP",
} 