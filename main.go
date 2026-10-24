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
	Rub         int    `json:"rub"`
	Method      string `json:"method"`
}

// запускает HTTP-сервер и настраивает маршруты для работы с платежами.
func main() {
	// создаём модуль, который будет хранить все платежи в памяти.
	paymentModule := payment.NewPaymentModule(methods.NewBank())

	// регистрируем обработчик для создания платежа и получения списка платежей.
	http.HandleFunc("/api/payments", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		switch r.Method {
		case http.MethodPost:
			// читаем данные нового платежа из JSON-тела запроса.
			var request createPaymentRequest

			if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
				http.Error(w, `{"error":"invalid JSON"}`, http.StatusBadRequest)
				return
			}

			// проверяем обязательные поля и корректность суммы платежа.
			if request.Description == "" || request.Rub <= 0 || request.Method == "" {
				http.Error(w, `{"error":"description, method and positive rub are required"}`, http.StatusBadRequest)
				return
			}

			// выбираем способ оплаты, указанный пользователем.
			paymentMethod, ok := selectedPaymentMethod(request.Method)
			if !ok {
				http.Error(w, `{"error":"unsupported payment method"}`, http.StatusBadRequest)
				return
			}

			// создаём платеж и возвращаем его идентификатор клиенту.
			id := paymentModule.PayWithMethod(paymentMethod, request.Description, request.Rub)
			log.Printf("Создан платёж: ID=%d, описание=%q, сумма=%d ₽, способ оплаты=%s", id, request.Description, request.Rub, request.Method)

			json.NewEncoder(w).Encode(map[string]int{
				"id": id,
			})

		case http.MethodGet:
			// возвращаем информацию обо всех созданных платежах.
			json.NewEncoder(w).Encode(paymentModule.AllInfo())

		default:
			// отклоняем HTTP-методы, которые не поддерживаются этим маршрутом.
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		}
	})

	// регистрируем обработчик для просмотра и отмены отдельного платежа.
	http.HandleFunc("/api/payments/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// извлекаем идентификатор платежа из URL и преобразуем его в число.
		idText := strings.TrimPrefix(r.URL.Path, "/api/payments/")
		id, err := strconv.Atoi(idText)

		if err != nil {
			// возвращаем ошибку, если идентификатор имеет неверный формат.
			http.Error(w, `{"error":"invalid payment id"}`, http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodGet:
			// возвращаем информацию о выбранном платеже.
			json.NewEncoder(w).Encode(paymentModule.Info(id))

		case http.MethodDelete:
			// отменяем выбранный платеж и сообщаем об успешной отмене.
			paymentModule.Cancel(id)

			json.NewEncoder(w).Encode(map[string]string{
				"status": "cancelled",
			})

		default:
			// отклоняем HTTP-методы, которые не поддерживаются этим маршрутом.
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		}
	})

	// раздаём index.html, script.js и style.css.
	http.Handle("/", http.FileServer(http.Dir("./index")))

	// запускаем сервер на локальном порту 8080.
	log.Println("Server started on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// выбирает реализацию способа оплаты по его названию из HTTP-запроса.
func selectedPaymentMethod(method string) (payment.PaymentMethod, bool) {
	switch method {
	case "Карта":
		return methods.NewBank(), true
	case "СБП":
		return methods.NewSBP(), true
	case "Кошелёк":
		return methods.NewWallet(), true
	default:
		return nil, false
	}
}
