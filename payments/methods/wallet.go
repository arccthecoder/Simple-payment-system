package methods

import (
	"fmt"
	"math/rand"
)

type Wallet struct{}

func NewWallet() Wallet {
	return Wallet{}
}

func (Wallet) Pay(usd int) int {
	fmt.Println("Оплата через электронный кошелёк")
	fmt.Println("Размер оплаты:", usd, "руб.")

	return rand.Int()
}

func (Wallet) Cancel(id int) {
	fmt.Println("Отмена оплаты через электронный кошелёк! ID:", id)
}
