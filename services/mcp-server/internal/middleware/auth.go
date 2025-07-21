package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"mcp-server/internal/models"
	"mcp-server/pkg/errors"
)

// AuthMiddleware verifica la autenticación JWT para usuarios de PYMEs
func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Rutas públicas que no requieren autenticación
		if isPublicRoute(c.Path()) {
			return c.Next()
		}

		// Obtener token del header Authorization
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return errors.NewAuthError("Token de autorización requerido", "TOKEN_MISSING")
		}

		// Verificar formato Bearer
		if !strings.HasPrefix(authHeader, "Bearer ") {
			return errors.NewAuthError("Formato de token inválido", "INVALID_TOKEN_FORMAT")
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Validar y parsear JWT
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Verificar algoritmo de firma
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.NewAuthError("Algoritmo de firma inválido", "INVALID_SIGNING_METHOD")
			}
			return []byte(getJWTSecret()), nil
		})

		if err != nil {
			return errors.NewAuthError("Token inválido", "INVALID_TOKEN")
		}

		// Verificar que el token sea válido
		if !token.Valid {
			return errors.NewAuthError("Token expirado o inválido", "TOKEN_INVALID")
		}

		// Extraer claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return errors.NewAuthError("Claims del token inválidos", "INVALID_CLAIMS")
		}

		// Crear usuario desde claims
		user := &models.User{
			ID:       claims["user_id"].(string),
			Email:    claims["email"].(string),
			Name:     claims["name"].(string),
			Role:     claims["role"].(string),
			TenantID: claims["tenant_id"].(string),
		}

		// Verificar que el usuario pertenezca al tenant actual
		currentTenant := c.Locals("tenant").(*models.Tenant)
		if user.TenantID != currentTenant.ID {
			return errors.NewAuthError("Usuario no pertenece a este tenant", "TENANT_MISMATCH")
		}

		// Guardar usuario en contexto
		c.Locals("user", user)
		c.Locals("userID", user.ID)

		return c.Next()
	}
}

func isPublicRoute(path string) bool {
	publicRoutes := []string{
		"/health",
		"/api/v1/auth/login",
		"/api/v1/auth/register",
		"/api/v1/auth/refresh",
		"/api/v1/colombia/validate", // Validaciones públicas
	}

	for _, route := range publicRoutes {
		if strings.HasPrefix(path, route) {
			return true
		}
	}

	return false
}

func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// Secret por defecto para desarrollo (cambiar en producción)
		return "tausepro-jwt-secret-colombia-pymes-2024"
	}
	return secret
}

// RequireRole middleware para verificar roles específicos
func RequireRole(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user, ok := c.Locals("user").(*models.User)
		if !ok {
			return errors.NewAuthError("Usuario no autenticado", "USER_NOT_AUTHENTICATED")
		}

		// Verificar si el usuario tiene uno de los roles permitidos
		for _, role := range allowedRoles {
			if user.Role == role {
				return c.Next()
			}
		}

		return errors.NewAuthError("Permisos insuficientes", "INSUFFICIENT_PERMISSIONS")
	}
}

// RequireOwnerOrAdmin middleware para verificar que el usuario sea propietario o admin
func RequireOwnerOrAdmin() fiber.Handler {
	return RequireRole("owner", "admin")
} 