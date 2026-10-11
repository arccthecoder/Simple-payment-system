package main

import (
	"payment/payment"
	"payment/payment/methods"

	"github.com/k0kubun/pp"
)

func main() {
	method := methods.NewCrypto()

	paymentModule := payment.NewPaymentModule(method)

	paymentModule.Pay("Бургер", 5)
	paymentModule.Pay("Телефон", 500)
	paymentModule.Pay("Игра", 20)

	AllInfo := paymentModule.Allinfo()

	pp.Println("Все оплаты:", AllInfo)
}
