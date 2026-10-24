package methods

import (
	"fmt"
	"math/rand"
)

type Crypto struct{}

func NewCrypto() Crypto {
	return Crypto{}
}

func (c Crypto) Pay(rub int) int {
	fmt.Println("Оплата криптовалютой")
	fmt.Println("Размер оплаты:", rub, "руб.")

	return rand.Int()
}

func (c Crypto) Cancel(id int) {
	fmt.Println("Отмена крипто-операции! ID:", id)
}
