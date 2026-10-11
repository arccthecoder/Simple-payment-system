package payment

type PaymentMethod interface {
	Pay(usd int) int
	Cancel(id int)
}

type PaymentModule struct {
	// как сохранять информацию об оплатах

	paymentMethod PaymentMethod
}

func NewPaymentModule(paymentMethod PaymentMethod) *PaymentModule {
	return &PaymentModule{
		paymentMethod: paymentMethod,
	}
}

/*
	Метод Pay()

Принимает:
1. Описание проводимой оплаты
2. Сумма оплаты
Возвращает:
ID проведенной операции
*/
func (p PaymentModule) Pay(description string, usd int) int {
	/* 1. проводить оплату
	2. получать id проведенной оплаты
	3. сохранять информацию о проведенной операции
	- описание операции
	- сколько было потрачено
	- отмененная ли операция
	4. возвращать id проведенной операции*/
	id := p.paymentMethod.Pay(usd)

	info := PaymentInfo{
		Description: description,
		Usd:         usd,
		Cancelled:   false,
	}
}

/*
	Метод Cancel()

Принимает:
1. ID операции
Возвращает:
- ничего не возвращает
*/
func (p PaymentModule) Cancel() {}

/*
	Метод Info()

Принимает:
1. ID операции
Возвращает:
информацию о проведенной операции
*/
func (p PaymentModule) Info() {}

/*
	Метод AllInfo()

Принимает:
- ничего не принимает
Возвращает:
1. информацию о всех проведенных операциях
*/
func (p PaymentModule) AllInfo() {}
