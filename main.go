package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	payment "payment/payments"
	"payment/payments/methods"
)

type createPaymentRequest struct {
	Description string `json:"description"`
	Usd         int    `json:"usd"`
}

func main() {
	paymentModule := payment.NewPaymentModule(methods.NewBank())

	http.HandleFunc("/api/payments", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		switch r.Method {
		case http.MethodPost:
			var request createPaymentRequest

			if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
				http.Error(w, `{"error":"invalid JSON"}`, http.StatusBadRequest)
				return
			}

			if request.Description == "" || request.Usd <= 0 {
				http.Error(w, `{"error":"description and positive usd are required"}`, http.StatusBadRequest)
				return
			}

			id := paymentModule.Pay(request.Description, request.Usd)

			json.NewEncoder(w).Encode(map[string]int{
				"id": id,
			})

		case http.MethodGet:
			json.NewEncoder(w).Encode(paymentModule.AllInfo())

		default:
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/api/payments/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		idText := strings.TrimPrefix(r.URL.Path, "/api/payments/")
		id, err := strconv.Atoi(idText)

		if err != nil {
			http.Error(w, `{"error":"invalid payment id"}`, http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodGet:
			json.NewEncoder(w).Encode(paymentModule.Info(id))

		case http.MethodDelete:
			paymentModule.Cancel(id)

			json.NewEncoder(w).Encode(map[string]string{
				"status": "cancelled",
			})

		default:
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		}
	})

	// Раздаём index.html, script.js и style.css
	http.Handle("/", http.FileServer(http.Dir("./index")))

	log.Println("Server started on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
