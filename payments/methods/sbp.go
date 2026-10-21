package methods

import (
	"fmt"
	"math/rand"
)

type SBP struct{}

func NewSBP() SBP {
	return SBP{}
}

func (SBP) Pay(usd int) int {
	fmt.Println("Оплата через СБП")
	fmt.Println("Размер оплаты:", usd, "руб.")

	return rand.Int()
}

func (SBP) Cancel(id int) {
	fmt.Println("Отмена оплаты через СБП! ID:", id)
}
