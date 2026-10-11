package methods

import (
	"fmt"
	"math/rand"
)

type Bonus struct{}

func NewBonus() Bonus {
	return Bonus{}
}

func (c Bonus) Pay(usd int) int {
	fmt.Println("Оплата бонусами")
	fmt.Println("Размер оплаты:", usd, "бонусов")

	return rand.Int()
}

func (c Bonus) Cancel(id int) {
	fmt.Println("Отмена крипто-операции! ID:", id)
}
