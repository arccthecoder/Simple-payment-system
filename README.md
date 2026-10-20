# Simple Payment System

Учебная симуляция платёжной системы на Go. Проект показывает, как построить единый модуль для работы с разными способами оплаты, хранить информацию об операциях и управлять их отменой.

> **Статус:** WIP. Это учебный проект: платежи не проходят через реальные платёжные сервисы, а данные хранятся только в памяти процесса.

## Возможности

- создание платежа с описанием и суммой;
- генерация идентификатора операции;
- получение информации о платеже;
- получение списка всех платежей;
- отмена ранее созданной операции;
- единый интерфейс `PaymentMethod` для разных способов оплаты;
- HTTP API на стандартной библиотеке Go;
- демонстрационный веб-интерфейс в каталоге `index`.

## Способы оплаты

В каталоге `payments/methods` доступны симуляции следующих способов оплаты:

- банковская карта — `methods.NewBank()`;
- PayPal — `methods.NewPayPal()`;
- криптовалюта — `methods.NewCrypto()`;
- бонусы — `methods.NewBonus()`.

Каждый метод реализует интерфейс `PaymentMethod`. При проведении операции метод выводит информацию в консоль и возвращает случайный ID. Реального списания средств и интеграции с платёжными провайдерами нет.

## Требования

- Go **1.27.1** или совместимая версия;
- интернет нужен только для первоначальной загрузки зависимостей, если они появятся в проекте.

## Быстрый старт

```bash
git clone https://github.com/arccthecoder/Simple-payment-system.git
cd Simple-payment-system
go run .
```

После запуска сервер будет доступен по адресу:

```text
http://localhost:8080
```

Веб-интерфейс раздаётся из каталога `index`.

## HTTP API

Сервер использует только стандартную библиотеку Go и предоставляет следующие маршруты.

### Создать платёж

```http
POST /api/payments
Content-Type: application/json
```

Тело запроса:

```json
{
  "description": "Покупка товара",
  "usd": 100
}
```

Пример через `curl`:

```bash
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -d '{"description":"Покупка товара","usd":100}'
```

Ответ:

```json
{
  "id": 123456789
}
```

Поле `id` будет сгенерировано программой и может отличаться при каждом запуске.

### Получить все платежи

```http
GET /api/payments
```

```bash
curl http://localhost:8080/api/payments
```

### Получить платёж по ID

```http
GET /api/payments/{id}
```

```bash
curl http://localhost:8080/api/payments/123456789
```

Ответ содержит описание, сумму и признак отмены:

```json
{
  "Description": "Покупка товара",
  "Usd": 100,
  "Cancelled": false
}
```

### Отменить платёж

```http
DELETE /api/payments/{id}
```

```bash
curl -X DELETE http://localhost:8080/api/payments/123456789
```

Ответ:

```json
{
  "status": "cancelled"
}
```

> Текущая реализация хранит платежи в памяти. После перезапуска приложения список операций очищается.

## Пример использования в Go

```go
package main

import (
    payment "payment/payments"
    "payment/payments/methods"
)

func main() {
    method := methods.NewBank()
    paymentModule := payment.NewPaymentModule(method)

    paymentID := paymentModule.Pay("Покупка товара", 100)

    info := paymentModule.Info(paymentID)
    allPayments := paymentModule.AllInfo()

    paymentModule.Cancel(paymentID)

    _, _ = info, allPayments
}
```

## Архитектура

Платёжный модуль отделён от конкретного способа оплаты через интерфейс:

```go
type PaymentMethod interface {
    Pay(usd int) int
    Cancel(id int)
}
```

`PaymentModule` отвечает за:

- вызов выбранного способа оплаты;
- сохранение информации о платеже;
- поиск операции по ID;
- отмену операции;
- выдачу копии списка платежей.

## Добавление нового способа оплаты

1. Создайте новый тип в `payments/methods`.
2. Реализуйте методы `Pay` и `Cancel`.
3. Передайте новый тип в `payment.NewPaymentModule`.

Пример:

```go
type Wallet struct{}

func (Wallet) Pay(usd int) int {
    // Логика симуляции оплаты.
    return 1
}

func (Wallet) Cancel(id int) {
    // Логика симуляции отмены.
}
```

## Структура проекта

```text
.
├── main.go                 # HTTP-сервер и API платежей
├── go.mod                  # модуль и версия Go
├── index/                  # демонстрационный веб-интерфейс
│   ├── index.html
│   ├── script.js
│   └── style.css
└── payments/
    ├── info.go             # модель информации о платеже
    ├── payments.go         # платёжный модуль и интерфейс PaymentMethod
    └── methods/             # симуляции способов оплаты
        ├── bank.go
        ├── bonus.go
        ├── crypto.go
        └── paypal.go
```

## Модель платежа

```go
type PaymentInfo struct {
    Description string
    Usd         int
    Cancelled   bool
}
```

## Планы развития

- добавить постоянное хранилище платежей;
- валидировать суммы, статусы и повторную отмену операций;
- улучшить обработку ошибок и HTTP-статусы;
- добавить модульные и интеграционные тесты;
- заменить `math/rand` на безопасный генератор ID;
- добавить выбор способа оплаты через HTTP API;
- вынести серверную конфигурацию в переменные окружения;
- добавить Docker-конфигурацию и CI;
- определить лицензию проекта.

## Лицензия

Лицензия пока не определена.
