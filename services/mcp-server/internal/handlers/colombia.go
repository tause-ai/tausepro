package handlers

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/tausepro/mcp-server/internal/models"
	"github.com/tausepro/mcp-server/pkg/errors"
)

// ValidateNIT valida el NIT colombiano
func ValidateNIT(c *fiber.Ctx) error {
	var request struct {
		NIT string `json:"nit" validate:"required"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "NIT requerido",
		})
	}

	// Limpiar NIT (remover espacios, guiones, puntos)
	cleanNIT := strings.ReplaceAll(request.NIT, " ", "")
	cleanNIT = strings.ReplaceAll(cleanNIT, "-", "")
	cleanNIT = strings.ReplaceAll(cleanNIT, ".", "")

	// Validar formato básico
	if len(cleanNIT) < 9 || len(cleanNIT) > 10 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "NIT debe tener entre 9 y 10 dígitos",
			"valid":   false,
		})
	}

	// Separar número y dígito de verificación
	nitNumber := cleanNIT[:len(cleanNIT)-1]
	checkDigit := cleanNIT[len(cleanNIT)-1:]

	// Calcular dígito de verificación
	calculatedDigit := calculateNITCheckDigit(nitNumber)
	isValid := checkDigit == calculatedDigit

	response := map[string]interface{}{
		"valid":           isValid,
		"nit":            cleanNIT,
		"formatted_nit":  formatNIT(cleanNIT),
		"check_digit":    checkDigit,
		"calculated":     calculatedDigit,
	}

	if !isValid {
		response["error"] = true
		response["message"] = fmt.Sprintf("NIT inválido. Dígito de verificación debería ser %s", calculatedDigit)
		return c.Status(fiber.StatusBadRequest).JSON(response)
	}

	// Si es válido, agregar información adicional
	response["message"] = "NIT válido"
	response["company_info"] = map[string]string{
		"status": "Activo", // En producción consultaría RUES
		"type":   "Sociedad por Acciones Simplificada", // Ejemplo
	}

	return c.JSON(response)
}

// ValidateCC valida la cédula de ciudadanía colombiana
func ValidateCC(c *fiber.Ctx) error {
	var request struct {
		CC string `json:"cc" validate:"required"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Cédula requerida",
		})
	}

	// Limpiar cédula
	cleanCC := strings.ReplaceAll(request.CC, ".", "")
	cleanCC = strings.ReplaceAll(cleanCC, ",", "")
	cleanCC = strings.ReplaceAll(cleanCC, " ", "")

	// Validaciones básicas
	if len(cleanCC) < 6 || len(cleanCC) > 10 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Cédula debe tener entre 6 y 10 dígitos",
			"valid":   false,
		})
	}

	// Verificar que solo contenga números
	if _, err := strconv.Atoi(cleanCC); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Cédula debe contener solo números",
			"valid":   false,
		})
	}

	// Formatear cédula con puntos
	formattedCC := formatCC(cleanCC)

	return c.JSON(fiber.Map{
		"valid":        true,
		"cc":          cleanCC,
		"formatted_cc": formattedCC,
		"message":     "Cédula válida",
		"info": map[string]string{
			"document_type": "Cédula de Ciudadanía",
			"country":      "Colombia",
		},
	})
}

// CreateDIANInvoice crea una factura electrónica DIAN
func CreateDIANInvoice(c *fiber.Ctx) error {
	tenant := c.Locals("tenant").(*models.Tenant)

	var request struct {
		CustomerNIT     string  `json:"customer_nit" validate:"required"`
		CustomerName    string  `json:"customer_name" validate:"required"`
		Items          []InvoiceItem `json:"items" validate:"required"`
		PaymentMethod   string  `json:"payment_method" validate:"required"`
		Notes          string  `json:"notes,omitempty"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Datos de factura inválidos",
		})
	}

	// Calcular totales
	subtotal := 0
	totalIVA := 0
	
	for _, item := range request.Items {
		itemSubtotal := item.Quantity * item.UnitPrice
		itemIVA := int(float64(itemSubtotal) * item.IVARate / 100)
		
		subtotal += itemSubtotal
		totalIVA += itemIVA
	}

	total := subtotal + totalIVA

	// Generar número de factura (en producción sería secuencial desde DIAN)
	invoiceNumber := fmt.Sprintf("FE-%d", 1000+len(request.Items))

	// Simular respuesta de DIAN
	invoice := map[string]interface{}{
		"invoice_number":    invoiceNumber,
		"cufe":             "a1b2c3d4e5f6789012345678901234567890abcd", // CUFE simulado
		"qr_code":          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
		"status":           "approved",
		"customer": map[string]string{
			"nit":  request.CustomerNIT,
			"name": request.CustomerName,
		},
		"totals": map[string]int{
			"subtotal_cop": subtotal,
			"iva_cop":      totalIVA,
			"total_cop":    total,
		},
		"payment_method": request.PaymentMethod,
		"issued_at":     "2024-01-15T10:30:00-05:00",
		"due_date":      "2024-01-22T23:59:59-05:00",
		"pdf_url":       "https://api.tause.pro/invoices/" + invoiceNumber + ".pdf",
		"xml_url":       "https://api.tause.pro/invoices/" + invoiceNumber + ".xml",
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Factura DIAN creada exitosamente",
		"data":    invoice,
	})
}

// ProcessPSEPayment procesa un pago PSE
func ProcessPSEPayment(c *fiber.Ctx) error {
	var request struct {
		Amount      int    `json:"amount_cop" validate:"required,min=1000"`
		Description string `json:"description" validate:"required"`
		CustomerEmail string `json:"customer_email" validate:"required,email"`
		Bank        string `json:"bank" validate:"required"`
		DocumentType string `json:"document_type" validate:"required,oneof=CC CE TI"`
		DocumentNumber string `json:"document_number" validate:"required"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Datos de pago inválidos",
		})
	}

	// Simular integración con PSE/Wompi
	paymentReference := fmt.Sprintf("PSE_%d_%s", request.Amount, strings.ToUpper(request.Bank))
	
	// Simular respuesta de PSE
	payment := map[string]interface{}{
		"reference":        paymentReference,
		"status":          "pending",
		"amount_cop":      request.Amount,
		"currency":        "COP",
		"payment_method":  "PSE",
		"bank":           request.Bank,
		"customer": map[string]string{
			"email":           request.CustomerEmail,
			"document_type":   request.DocumentType,
			"document_number": request.DocumentNumber,
		},
		"urls": map[string]string{
			"payment_url": "https://pse.redeban.com.co/pay/" + paymentReference,
			"success_url": "https://app.tause.pro/payment/success",
			"cancel_url":  "https://app.tause.pro/payment/cancel",
		},
		"expires_at": "2024-01-15T11:30:00-05:00", // 1 hora para completar
		"created_at": "2024-01-15T10:30:00-05:00",
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Pago PSE iniciado. Redirige al cliente a payment_url",
		"data":    payment,
	})
}

// CreateShipment crea un envío con Servientrega
func CreateShipment(c *fiber.Ctx) error {
	var request struct {
		OriginCity      string `json:"origin_city" validate:"required"`
		DestinyCity     string `json:"destiny_city" validate:"required"`
		RecipientName   string `json:"recipient_name" validate:"required"`
		RecipientPhone  string `json:"recipient_phone" validate:"required"`
		RecipientAddress string `json:"recipient_address" validate:"required"`
		Weight          int    `json:"weight_grams" validate:"required,min=1"`
		DeclaredValue   int    `json:"declared_value_cop" validate:"required,min=1000"`
		PaymentType     string `json:"payment_type" validate:"required,oneof=origen destino"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Datos de envío inválidos",
		})
	}

	// Calcular costo de envío (simulado)
	shippingCost := calculateShippingCost(request.OriginCity, request.DestinyCity, request.Weight)
	
	// Generar número de guía
	trackingNumber := fmt.Sprintf("SER%d%02d", 2024001, request.Weight%100)

	// Simular respuesta de Servientrega
	shipment := map[string]interface{}{
		"tracking_number": trackingNumber,
		"status":         "created",
		"origin":         request.OriginCity,
		"destiny":        request.DestinyCity,
		"recipient": map[string]string{
			"name":    request.RecipientName,
			"phone":   request.RecipientPhone,
			"address": request.RecipientAddress,
		},
		"package": map[string]interface{}{
			"weight_grams":        request.Weight,
			"declared_value_cop":  request.DeclaredValue,
		},
		"costs": map[string]int{
			"shipping_cop":        shippingCost,
			"insurance_cop":       int(float64(request.DeclaredValue) * 0.001), // 0.1%
			"total_cop":          shippingCost + int(float64(request.DeclaredValue) * 0.001),
		},
		"estimated_delivery": "2024-01-17", // 2 días hábiles
		"payment_type":       request.PaymentType,
		"created_at":        "2024-01-15T10:30:00-05:00",
		"tracking_url":      "https://www.servientrega.com/rastreo/" + trackingNumber,
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Envío creado exitosamente",
		"data":    shipment,
	})
}

// Helper types and functions

type InvoiceItem struct {
	Description string  `json:"description" validate:"required"`
	Quantity    int     `json:"quantity" validate:"required,min=1"`
	UnitPrice   int     `json:"unit_price_cop" validate:"required,min=1"`
	IVARate     float64 `json:"iva_rate" validate:"required,oneof=0 5 19"`
}

func calculateNITCheckDigit(nit string) string {
	// Algoritmo de cálculo de dígito de verificación NIT Colombia
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

func formatNIT(nit string) string {
	if len(nit) < 9 {
		return nit
	}
	// Formato: 900.123.456-7
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

func formatCC(cc string) string {
	// Formato: 1.234.567
	formatted := ""
	for i, d := range cc {
		if i > 0 && (len(cc)-i)%3 == 0 {
			formatted += "."
		}
		formatted += string(d)
	}
	return formatted
}

func calculateShippingCost(origin, destiny string, weight int) int {
	// Costos base por ciudad (simulados)
	baseCosts := map[string]map[string]int{
		"Bogotá": {
			"Medellín":     12000,
			"Cali":         15000,
			"Barranquilla": 18000,
			"Cartagena":    20000,
		},
		"Medellín": {
			"Bogotá":       12000,
			"Cali":         10000,
			"Barranquilla": 16000,
		},
	}
	
	// Costo base
	cost := 8000 // Costo mínimo
	if originCosts, exists := baseCosts[origin]; exists {
		if destinyCost, exists := originCosts[destiny]; exists {
			cost = destinyCost
		}
	}
	
	// Agregar costo por peso (cada 100g adicionales después de 500g)
	if weight > 500 {
		extraWeight := (weight - 500) / 100
		cost += extraWeight * 500
	}
	
	return cost
} 