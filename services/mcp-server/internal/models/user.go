package models

import "time"

// User representa un usuario de una PYME en TausePro
type User struct {
	ID       string `json:"id" db:"id"`
	Email    string `json:"email" db:"email"`
	Name     string `json:"name" db:"name"`
	Role     string `json:"role" db:"role"` // owner, admin, employee
	TenantID string `json:"tenant_id" db:"tenant_id"`
	
	// Información adicional
	Phone     string `json:"phone,omitempty" db:"phone"`
	Avatar    string `json:"avatar,omitempty" db:"avatar"`
	Position  string `json:"position,omitempty" db:"position"` // Cargo en la empresa
	
	// Configuraciones Colombia
	DocumentType   string `json:"document_type,omitempty" db:"document_type"` // CC, CE, TI
	DocumentNumber string `json:"document_number,omitempty" db:"document_number"`
	
	// Estados
	Active        bool      `json:"active" db:"active"`
	EmailVerified bool      `json:"email_verified" db:"email_verified"`
	LastLoginAt   time.Time `json:"last_login_at,omitempty" db:"last_login_at"`
	
	// Timestamps
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// UserRole define los roles disponibles
type UserRole string

const (
	RoleOwner    UserRole = "owner"    // Dueño de la PYME
	RoleAdmin    UserRole = "admin"    // Administrador
	RoleEmployee UserRole = "employee" // Empleado
)

// UserPermissions permisos por rol
type UserPermissions struct {
	CanManageBilling   bool `json:"can_manage_billing"`
	CanManageUsers     bool `json:"can_manage_users"`
	CanManageAgents    bool `json:"can_manage_agents"`
	CanViewAnalytics   bool `json:"can_view_analytics"`
	CanManageProducts  bool `json:"can_manage_products"`
	CanProcessOrders   bool `json:"can_process_orders"`
	CanManageSettings  bool `json:"can_manage_settings"`
}

// GetPermissions retorna los permisos según el rol
func (u *User) GetPermissions() UserPermissions {
	switch u.Role {
	case string(RoleOwner):
		return UserPermissions{
			CanManageBilling:   true,
			CanManageUsers:     true,
			CanManageAgents:    true,
			CanViewAnalytics:   true,
			CanManageProducts:  true,
			CanProcessOrders:   true,
			CanManageSettings:  true,
		}
	case string(RoleAdmin):
		return UserPermissions{
			CanManageBilling:   false,
			CanManageUsers:     true,
			CanManageAgents:    true,
			CanViewAnalytics:   true,
			CanManageProducts:  true,
			CanProcessOrders:   true,
			CanManageSettings:  false,
		}
	case string(RoleEmployee):
		return UserPermissions{
			CanManageBilling:   false,
			CanManageUsers:     false,
			CanManageAgents:    false,
			CanViewAnalytics:   false,
			CanManageProducts:  true,
			CanProcessOrders:   true,
			CanManageSettings:  false,
		}
	default:
		return UserPermissions{} // Sin permisos para rol desconocido
	}
}

// CanPerform verifica si el usuario puede realizar una acción
func (u *User) CanPerform(action string) bool {
	permissions := u.GetPermissions()
	
	switch action {
	case "manage_billing":
		return permissions.CanManageBilling
	case "manage_users":
		return permissions.CanManageUsers
	case "manage_agents":
		return permissions.CanManageAgents
	case "view_analytics":
		return permissions.CanViewAnalytics
	case "manage_products":
		return permissions.CanManageProducts
	case "process_orders":
		return permissions.CanProcessOrders
	case "manage_settings":
		return permissions.CanManageSettings
	default:
		return false
	}
}

// GetDisplayInfo retorna información para mostrar en UI
func (u *User) GetDisplayInfo() map[string]string {
	roleNames := map[string]string{
		"owner":    "Propietario",
		"admin":    "Administrador",
		"employee": "Empleado",
	}
	
	roleName := roleNames[u.Role]
	if roleName == "" {
		roleName = "Usuario"
	}
	
	return map[string]string{
		"name":          u.Name,
		"email":         u.Email,
		"role":          roleName,
		"position":      u.Position,
		"document_type": u.DocumentType,
	}
}

// LoginRequest para autenticación
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	TenantID string `json:"tenant_id,omitempty"` // Opcional, se puede extraer del subdomain
}

// RegisterRequest para registro de nuevos usuarios
type RegisterRequest struct {
	Name           string `json:"name" validate:"required,min=2"`
	Email          string `json:"email" validate:"required,email"`
	Password       string `json:"password" validate:"required,min=6"`
	CompanyName    string `json:"company_name" validate:"required"`
	NITNumber      string `json:"nit_number" validate:"required"`
	City           string `json:"city" validate:"required"`
	Industry       string `json:"industry" validate:"required"`
	DocumentType   string `json:"document_type" validate:"required,oneof=CC CE TI"`
	DocumentNumber string `json:"document_number" validate:"required"`
	Phone          string `json:"phone,omitempty"`
}

// TokenResponse respuesta de autenticación
type TokenResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
	User         User      `json:"user"`
	Tenant       Tenant    `json:"tenant"`
} 