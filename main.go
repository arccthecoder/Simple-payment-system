package main

import (
	payment "payment/payments"
	"payment/payments/methods"

	"github.com/k0kubun/pp"
)

func main() {
	method := methods.NewBonus()

	paymentModule := payment.NewPaymentModule(method)

	paymentModule.Pay("Бургер", 5)
	idPhone := paymentModule.Pay("Телефон", 500)
	idGame := paymentModule.Pay("Игра", 20)

	paymentModule.Cancel(idPhone)

	AllInfo := paymentModule.AllInfo()

	pp.Println("Все оплаты:", AllInfo)

	gameInfo := paymentModule.Info(idGame)
	pp.Println(gameInfo)
}
