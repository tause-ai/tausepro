package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	// URL del endpoint de login
	url := "http://localhost:8081/api/v1/auth/login"

	// Datos para la petición
	payload := map[string]string{
		"email":    "admin@example.com",
		"password": "password",
	}

	// Convertir a JSON
	jsonData, err := json.Marshal(payload)
	if err != nil {
		fmt.Println("Error al convertir a JSON:", err)
		return
	}

	// Crear la petición
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error al crear la petición:", err)
		return
	}

	// Añadir headers
	req.Header.Set("Content-Type", "application/json")

	// Enviar la petición
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error al enviar la petición:", err)
		return
	}
	defer resp.Body.Close()

	// Leer la respuesta
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error al leer la respuesta:", err)
		return
	}

	// Mostrar el código de estado y la respuesta
	fmt.Println("Código de estado:", resp.Status)
	fmt.Println("Respuesta:", string(body))
}
