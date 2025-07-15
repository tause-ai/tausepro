package colombia

import (
	"fmt"
	"strconv"
	"strings"
)

// Service servicio para utilidades específicas de Colombia
type Service struct {
	// En producción podría tener conexiones a APIs de DIAN, RUES, etc.
}

// NewService crea una nueva instancia del servicio Colombia
func NewService() *Service {
	return &Service{}
}

// ValidateNIT valida un NIT colombiano
func (s *Service) ValidateNIT(nit string) (*NITValidation, error) {
	// Limpiar NIT
	cleanNIT := s.cleanNIT(nit)
	
	// Validar formato
	if len(cleanNIT) < 9 || len(cleanNIT) > 10 {
		return &NITValidation{
			Valid:   false,
			Message: "NIT debe tener entre 9 y 10 dígitos",
		}, nil
	}

	// Separar número y dígito de verificación
	nitNumber := cleanNIT[:len(cleanNIT)-1]
	checkDigit := cleanNIT[len(cleanNIT)-1:]

	// Calcular dígito de verificación
	calculatedDigit := s.calculateNITCheckDigit(nitNumber)
	isValid := checkDigit == calculatedDigit

	return &NITValidation{
		Valid:          isValid,
		NIT:           cleanNIT,
		FormattedNIT:  s.formatNIT(cleanNIT),
		CheckDigit:    checkDigit,
		CalculatedDigit: calculatedDigit,
		Message:       s.getNITMessage(isValid, calculatedDigit),
	}, nil
}

// ValidateCC valida una cédula de ciudadanía colombiana
func (s *Service) ValidateCC(cc string) (*CCValidation, error) {
	// Limpiar cédula
	cleanCC := s.cleanCC(cc)
	
	// Validaciones básicas
	if len(cleanCC) < 6 || len(cleanCC) > 10 {
		return &CCValidation{
			Valid:   false,
			Message: "Cédula debe tener entre 6 y 10 dígitos",
		}, nil
	}

	// Verificar que solo contenga números
	if _, err := strconv.Atoi(cleanCC); err != nil {
		return &CCValidation{
			Valid:   false,
			Message: "Cédula debe contener solo números",
		}, nil
	}

	return &CCValidation{
		Valid:       true,
		CC:         cleanCC,
		FormattedCC: s.formatCC(cleanCC),
		Message:    "Cédula válida",
	}, nil
}

// ValidatePhone valida un número de teléfono colombiano
func (s *Service) ValidatePhone(phone string) (*PhoneValidation, error) {
	// Limpiar teléfono
	cleanPhone := s.cleanPhone(phone)
	
	// Validaciones para móviles colombianos
	if len(cleanPhone) == 10 && strings.HasPrefix(cleanPhone, "3") {
		return &PhoneValidation{
			Valid:         true,
			Phone:        cleanPhone,
			FormattedPhone: s.formatPhone(cleanPhone),
			Type:         "Móvil",
			Message:      "Número móvil válido",
		}, nil
	}
	
	// Validaciones para fijos
	if len(cleanPhone) == 7 || len(cleanPhone) == 10 {
		return &PhoneValidation{
			Valid:         true,
			Phone:        cleanPhone,
			FormattedPhone: s.formatPhone(cleanPhone),
			Type:         "Fijo",
			Message:      "Número fijo válido",
		}, nil
	}

	return &PhoneValidation{
		Valid:   false,
		Phone:  cleanPhone,
		Message: "Número de teléfono inválido para Colombia",
	}, nil
}

// GetCitiesByDepartment retorna ciudades por departamento
func (s *Service) GetCitiesByDepartment(department string) []string {
	cities := map[string][]string{
		"Bogotá D.C.": {"Bogotá"},
		"Antioquia": {"Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Turbo"},
		"Valle del Cauca": {"Cali", "Palmira", "Buenaventura", "Cartago", "Tuluá"},
		"Atlántico": {"Barranquilla", "Soledad", "Malambo", "Puerto Colombia"},
		"Santander": {"Bucaramanga", "Floridablanca", "Girón", "Piedecuesta"},
		"Bolívar": {"Cartagena", "Magangué", "Turbaco", "Arjona"},
		"Cundinamarca": {"Soacha", "Fusagasugá", "Chía", "Zipaquirá", "Facatativá"},
		"Córdoba": {"Montería", "Lorica", "Cereté", "Sahagún"},
		"Norte de Santander": {"Cúcuta", "Ocaña", "Villa del Rosario", "Los Patios"},
		"Tolima": {"Ibagué", "Espinal", "Girardot", "Melgar"},
	}

	if cityList, exists := cities[department]; exists {
		return cityList
	}
	return []string{}
}

// GetDepartments retorna lista de departamentos colombianos
func (s *Service) GetDepartments() []string {
	return []string{
		"Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.",
		"Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca",
		"Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare",
		"Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander",
		"Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia",
		"Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada",
	}
}

// FormatCurrency formatea una cantidad en pesos colombianos
func (s *Service) FormatCurrency(amount int) string {
	// Formatear con separadores de miles y símbolo de peso
	amountStr := strconv.Itoa(amount)
	
	// Agregar separadores de miles
	formatted := ""
	for i, digit := range amountStr {
		if i > 0 && (len(amountStr)-i)%3 == 0 {
			formatted += "."
		}
		formatted += string(digit)
	}
	
	return "$" + formatted
}

// Helper methods

func (s *Service) cleanNIT(nit string) string {
	clean := strings.ReplaceAll(nit, " ", "")
	clean = strings.ReplaceAll(clean, "-", "")
	clean = strings.ReplaceAll(clean, ".", "")
	return clean
}

func (s *Service) cleanCC(cc string) string {
	clean := strings.ReplaceAll(cc, ".", "")
	clean = strings.ReplaceAll(clean, ",", "")
	clean = strings.ReplaceAll(clean, " ", "")
	return clean
}

func (s *Service) cleanPhone(phone string) string {
	clean := strings.ReplaceAll(phone, " ", "")
	clean = strings.ReplaceAll(clean, "-", "")
	clean = strings.ReplaceAll(clean, "(", "")
	clean = strings.ReplaceAll(clean, ")", "")
	clean = strings.ReplaceAll(clean, "+57", "")
	return clean
}

func (s *Service) calculateNITCheckDigit(nit string) string {
	weights := []int{3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71}
	sum := 0
	
	for i, digit := range nit {
		if d, err := strconv.Atoi(string(digit)); err == nil {
			sum += d * weights[len(weights)-len(nit)+i]
		}
	}
	
	remainder := sum % 11
	if remainder < 2 {
		return strconv.Itoa(remainder)
	}
	return strconv.Itoa(11 - remainder)
}

func (s *Service) formatNIT(nit string) string {
	if len(nit) < 9 {
		return nit
	}
	
	digits := nit[:len(nit)-1]
	checkDigit := nit[len(nit)-1:]
	
	formatted := ""
	for i, d := range digits {
		if i > 0 && (len(digits)-i)%3 == 0 {
			formatted += "."
		}
		formatted += string(d)
	}
	
	return formatted + "-" + checkDigit
}

func (s *Service) formatCC(cc string) string {
	formatted := ""
	for i, d := range cc {
		if i > 0 && (len(cc)-i)%3 == 0 {
			formatted += "."
		}
		formatted += string(d)
	}
	return formatted
}

func (s *Service) formatPhone(phone string) string {
	if len(phone) == 10 {
		// Formato móvil: +57 3XX XXX XXXX
		return "+57 " + phone[:3] + " " + phone[3:6] + " " + phone[6:]
	}
	if len(phone) == 7 {
		// Formato fijo: XXX XXXX
		return phone[:3] + " " + phone[3:]
	}
	return phone
}

func (s *Service) getNITMessage(isValid bool, calculatedDigit string) string {
	if isValid {
		return "NIT válido"
	}
	return fmt.Sprintf("NIT inválido. Dígito de verificación debería ser %s", calculatedDigit)
}

// Types for validation responses

type NITValidation struct {
	Valid           bool   `json:"valid"`
	NIT            string `json:"nit,omitempty"`
	FormattedNIT   string `json:"formatted_nit,omitempty"`
	CheckDigit     string `json:"check_digit,omitempty"`
	CalculatedDigit string `json:"calculated_digit,omitempty"`
	Message        string `json:"message"`
}

type CCValidation struct {
	Valid       bool   `json:"valid"`
	CC         string `json:"cc,omitempty"`
	FormattedCC string `json:"formatted_cc,omitempty"`
	Message     string `json:"message"`
}

type PhoneValidation struct {
	Valid          bool   `json:"valid"`
	Phone         string `json:"phone,omitempty"`
	FormattedPhone string `json:"formatted_phone,omitempty"`
	Type          string `json:"type,omitempty"`
	Message       string `json:"message"`
} 