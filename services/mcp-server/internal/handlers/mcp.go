package handlers

import (
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"mcp-server/internal/models"
)

// ExecuteMCPTool ejecuta una herramienta MCP
func ExecuteMCPTool(c *fiber.Ctx) error {
	tenant := c.Locals("tenant").(*models.Tenant)
	user := c.Locals("user").(*models.User)

	var request struct {
		Tool      string                 `json:"tool" validate:"required"`
		AgentID   string                 `json:"agent_id,omitempty"`
		Input     map[string]interface{} `json:"input" validate:"required"`
		Context   map[string]interface{} `json:"context,omitempty"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Datos de herramienta inválidos",
		})
	}

	// Simular ejecución de herramienta MCP
	result, err := executeMCPToolSimulated(request.Tool, request.Input, tenant)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	// Log de ejecución
	execution := map[string]interface{}{
		"execution_id": fmt.Sprintf("exec_%d", time.Now().Unix()),
		"tool":        request.Tool,
		"agent_id":    request.AgentID,
		"tenant_id":   tenant.ID,
		"user_id":     user.ID,
		"status":      "completed",
		"input":       request.Input,
		"output":      result,
		"executed_at": time.Now(),
		"duration_ms": 245, // Simulado
	}

	return c.JSON(fiber.Map{
		"success":   true,
		"message":   "Herramienta MCP ejecutada exitosamente",
		"execution": execution,
	})
}

// ListMCPTools lista las herramientas MCP disponibles
func ListMCPTools(c *fiber.Ctx) error {
	tenant := c.Locals("tenant").(*models.Tenant)
	
	// Herramientas disponibles según el plan y features
	tools := getMCPToolsForTenant(tenant)

	return c.JSON(fiber.Map{
		"success": true,
		"data": map[string]interface{}{
			"tools":     tools,
			"total":     len(tools),
			"plan":      tenant.Plan,
			"features":  tenant.GetPlanFeatures(),
		},
	})
}

// ChatWithAgent maneja chat con un agente MCP
func ChatWithAgent(c *fiber.Ctx) error {
	tenant := c.Locals("tenant").(*models.Tenant)
	user := c.Locals("user").(*models.User)
	
	agentID := c.Params("id")
	if agentID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Agent ID requerido",
		})
	}

	var request struct {
		Message   string `json:"message" validate:"required"`
		SessionID string `json:"session_id,omitempty"`
		Context   map[string]interface{} `json:"context,omitempty"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Mensaje inválido",
		})
	}

	// Simular respuesta del agente MCP
	response := simulateAgentResponse(agentID, request.Message, tenant)
	
	// Crear conversación
	conversation := map[string]interface{}{
		"conversation_id": fmt.Sprintf("conv_%d", time.Now().Unix()),
		"agent_id":       agentID,
		"tenant_id":      tenant.ID,
		"user_id":        user.ID,
		"session_id":     request.SessionID,
		"messages": []map[string]interface{}{
			{
				"role":       "user",
				"content":    request.Message,
				"timestamp":  time.Now(),
			},
			{
				"role":       "assistant",
				"content":    response.Message,
				"timestamp":  time.Now().Add(2 * time.Second),
				"tools_used": response.ToolsUsed,
			},
		},
		"status":     "active",
		"created_at": time.Now(),
	}

	return c.JSON(fiber.Map{
		"success":      true,
		"message":      "Respuesta del agente generada",
		"conversation": conversation,
		"response":     response,
	})
}

// Helper functions

func executeMCPToolSimulated(toolName string, input map[string]interface{}, tenant *models.Tenant) (map[string]interface{}, error) {
	// Simular ejecución de diferentes herramientas MCP
	switch toolName {
	case "product_catalog":
		return executeProductCatalog(input, tenant)
	case "price_calculator":
		return executePriceCalculator(input, tenant)
	case "inventory_check":
		return executeInventoryCheck(input, tenant)
	case "shipping_calculator":
		return executeShippingCalculator(input, tenant)
	case "payment_processor":
		return executePaymentProcessor(input, tenant)
	case "invoice_generator":
		return executeInvoiceGenerator(input, tenant)
	case "faq_searcher":
		return executeFAQSearcher(input, tenant)
	default:
		return nil, fmt.Errorf("herramienta '%s' no encontrada", toolName)
	}
}

func executeProductCatalog(input map[string]interface{}, tenant *models.Tenant) (map[string]interface{}, error) {
	// Simular búsqueda de productos
	query, _ := input["query"].(string)
	category, _ := input["category"].(string)
	
	products := []map[string]interface{}{
		{
			"id":          "prod_001",
			"name":        "Camiseta Polo",
			"description": "Camiseta polo de algodón 100%",
			"price_cop":   45000,
			"category":    "ropa",
			"stock":       25,
			"image":       "https://ejemplo.com/camiseta.jpg",
		},
		{
			"id":          "prod_002",
			"name":        "Pantalón Jean",
			"description": "Pantalón jean slim fit",
			"price_cop":   89000,
			"category":    "ropa",
			"stock":       12,
			"image":       "https://ejemplo.com/jean.jpg",
		},
	}

	return map[string]interface{}{
		"products": products,
		"total":    len(products),
		"query":    query,
		"category": category,
		"message":  fmt.Sprintf("Encontrados %d productos", len(products)),
	}, nil
}

func executePriceCalculator(input map[string]interface{}, tenant *models.Tenant) (map[string]interface{}, error) {
	productID, _ := input["product_id"].(string)
	quantity, _ := input["quantity"].(float64)
	
	// Simular cálculo de precio
	unitPrice := 45000 // $45.000 COP
	subtotal := int(quantity) * unitPrice
	discount := 0
	
	if quantity >= 5 {
		discount = int(float64(subtotal) * 0.1) // 10% descuento por cantidad
	}
	
	iva := int(float64(subtotal-discount) * 0.19) // IVA 19%
	total := subtotal - discount + iva

	return map[string]interface{}{
		"product_id": productID,
		"quantity":   int(quantity),
		"unit_price_cop": unitPrice,
		"subtotal_cop":   subtotal,
		"discount_cop":   discount,
		"iva_cop":        iva,
		"total_cop":      total,
		"formatted_total": fmt.Sprintf("$%s", formatCOPAmount(total)),
		"message": fmt.Sprintf("Precio calculado para %d unidades", int(quantity)),
	}, nil
}

func executeInventoryCheck(input map[string]interface{}, tenant *models.Tenant) (map[string]interface{}, error) {
	productID, _ := input["product_id"].(string)
	
	// Simular consulta de inventario
	stock := 25
	reserved := 3
	available := stock - reserved
	
	return map[string]interface{}{
		"product_id": productID,
		"stock":      stock,
		"reserved":   reserved,
		"available":  available,
		"status":     getStockStatus(available),
		"message":    fmt.Sprintf("Disponibles: %d unidades", available),
	}, nil
}

func executeShippingCalculator(input map[string]interface{}, tenant *models.Tenant) (map[string]interface{}, error) {
	city, _ := input["city"].(string)
	weight, _ := input["weight"].(float64)
	
	// Simular cálculo de envío
	baseCost := 12000 // $12.000 COP base
	if weight > 1000 {
		baseCost += int((weight - 1000) / 500 * 2000) // $2.000 por cada 500g adicionales
	}
	
	return map[string]interface{}{
		"city":           city,
		"weight_grams":   int(weight),
		"cost_cop":       baseCost,
		"formatted_cost": fmt.Sprintf("$%s", formatCOPAmount(baseCost)),
		"delivery_days":  2,
		"carrier":        "Servientrega",
		"message":        fmt.Sprintf("Envío a %s: $%s", city, formatCOPAmount(baseCost)),
	}, nil
}

func executePaymentProcessor(input map[string]interface{}, tenant *models.Tenant) (map[string]interface{}, error) {
	amount, _ := input["amount"].(float64)
	method, _ := input["method"].(string)
	
	// Simular procesamiento de pago
	reference := fmt.Sprintf("PAY_%d", time.Now().Unix())
	
	return map[string]interface{}{
		"reference":     reference,
		"amount_cop":    int(amount),
		"payment_method": method,
		"status":        "pending",
		"payment_url":   fmt.Sprintf("https://pse.redeban.com.co/pay/%s", reference),
		"expires_at":    time.Now().Add(1 * time.Hour),
		"message":       "Pago iniciado. Redirige al cliente para completar el pago.",
	}, nil
}

func executeInvoiceGenerator(input map[string]interface{}, tenant *models.Tenant) (map[string]interface{}, error) {
	customerName, _ := input["customer_name"].(string)
	items, _ := input["items"].([]interface{})
	
	// Simular generación de factura
	invoiceNumber := fmt.Sprintf("FE-%d", time.Now().Unix())
	
	return map[string]interface{}{
		"invoice_number": invoiceNumber,
		"customer_name":  customerName,
		"items_count":    len(items),
		"status":         "generated",
		"cufe":          "ABC123456789", // CUFE simulado
		"pdf_url":       fmt.Sprintf("https://api.tause.pro/invoices/%s.pdf", invoiceNumber),
		"message":       fmt.Sprintf("Factura %s generada exitosamente", invoiceNumber),
	}, nil
}

func executeFAQSearcher(input map[string]interface{}, tenant *models.Tenant) (map[string]interface{}, error) {
	query, _ := input["query"].(string)
	
	// Simular búsqueda en FAQ
	faqs := []map[string]interface{}{
		{
			"question": "¿Cuánto cuesta el envío?",
			"answer":   "El envío varía según la ciudad. Generalmente entre $8.000 y $15.000 COP.",
			"relevance": 0.95,
		},
		{
			"question": "¿Aceptan PSE?",
			"answer":   "Sí, aceptamos PSE, Nequi, tarjetas y efectivo.",
			"relevance": 0.87,
		},
	}
	
	return map[string]interface{}{
		"query":   query,
		"results": faqs,
		"total":   len(faqs),
		"message": fmt.Sprintf("Encontradas %d respuestas para '%s'", len(faqs), query),
	}, nil
}

func getMCPToolsForTenant(tenant *models.Tenant) []map[string]interface{} {
	allTools := []map[string]interface{}{
		{
			"name":        "product_catalog",
			"display_name": "Catálogo de Productos",
			"description": "Buscar y listar productos disponibles",
			"category":    "ventas",
			"available":   true,
		},
		{
			"name":        "price_calculator",
			"display_name": "Calculadora de Precios",
			"description": "Calcular precios con descuentos e IVA",
			"category":    "ventas",
			"available":   true,
		},
		{
			"name":        "inventory_check",
			"display_name": "Consulta de Inventario",
			"description": "Verificar disponibilidad de productos",
			"category":    "ventas",
			"available":   true,
		},
		{
			"name":        "shipping_calculator",
			"display_name": "Calculadora de Envíos",
			"description": "Calcular costos de envío a diferentes ciudades",
			"category":    "logistica",
			"available":   tenant.IsFeatureEnabled("ecommerce_tool"),
		},
		{
			"name":        "payment_processor",
			"display_name": "Procesador de Pagos",
			"description": "Procesar pagos PSE, Nequi, etc.",
			"category":    "ventas",
			"available":   tenant.IsFeatureEnabled("ecommerce_tool"),
		},
		{
			"name":        "invoice_generator",
			"display_name": "Generador de Facturas DIAN",
			"description": "Crear facturas electrónicas DIAN",
			"category":    "contabilidad",
			"available":   true,
		},
		{
			"name":        "faq_searcher",
			"display_name": "Buscador de FAQ",
			"description": "Buscar respuestas en preguntas frecuentes",
			"category":    "soporte",
			"available":   true,
		},
	}

	// Filtrar herramientas disponibles según el plan
	var availableTools []map[string]interface{}
	for _, tool := range allTools {
		if tool["available"].(bool) {
			availableTools = append(availableTools, tool)
		}
	}

	return availableTools
}

func simulateAgentResponse(agentID, message string, tenant *models.Tenant) *AgentResponse {
	// Simular respuesta inteligente del agente
	responses := map[string]string{
		"precio":      "El precio del producto es $45.000 COP. ¿Te interesa conocer los costos de envío?",
		"envio":       "El envío a Bogotá cuesta $12.000 COP y demora 2 días hábiles.",
		"pago":        "Aceptamos PSE, Nequi, tarjetas y efectivo. ¿Con cuál prefieres pagar?",
		"disponible":  "Tenemos 25 unidades disponibles en stock.",
		"horarios":    "Atendemos de lunes a viernes de 8:00 AM a 6:00 PM y sábados de 9:00 AM a 2:00 PM.",
	}

	// Buscar respuesta más relevante
	response := "Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?"
	toolsUsed := []string{}

	for keyword, resp := range responses {
		if contains(message, keyword) {
			response = resp
			toolsUsed = append(toolsUsed, "faq_searcher")
			break
		}
	}

	return &AgentResponse{
		Message:   response,
		ToolsUsed: toolsUsed,
		Confidence: 0.85,
		Timestamp: time.Now(),
	}
}

// Helper functions

func formatCOPAmount(amount int) string {
	amountStr := fmt.Sprintf("%d", amount)
	formatted := ""
	for i, digit := range amountStr {
		if i > 0 && (len(amountStr)-i)%3 == 0 {
			formatted += "."
		}
		formatted += string(digit)
	}
	return formatted
}

func getStockStatus(available int) string {
	if available <= 0 {
		return "agotado"
	}
	if available < 5 {
		return "pocas_unidades"
	}
	return "disponible"
}

func contains(text, keyword string) bool {
	return fmt.Sprintf("%s", text) != fmt.Sprintf("%s", strings.ReplaceAll(text, keyword, ""))
}

// Types

type AgentResponse struct {
	Message    string    `json:"message"`
	ToolsUsed  []string  `json:"tools_used"`
	Confidence float64   `json:"confidence"`
	Timestamp  time.Time `json:"timestamp"`
} 