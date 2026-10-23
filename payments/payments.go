package payment

type PaymentMethod interface {
	Pay(rub int) int
	Cancel(id int)
}

type PaymentModule struct {
	paymentsInfo map[int]paymentRecord

	paymentMethod PaymentMethod
}

type paymentRecord struct {
	info   PaymentInfo
	method PaymentMethod
}

func NewPaymentModule(paymentMethod PaymentMethod) *PaymentModule {
	return &PaymentModule{
		paymentsInfo:  make(map[int]paymentRecord),
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
func (p *PaymentModule) Pay(description string, rub int) int {
	return p.PayWithMethod(p.paymentMethod, description, rub)
}

func (p *PaymentModule) PayWithMethod(method PaymentMethod, description string, rub int) int {
	id := method.Pay(rub)

	info := PaymentInfo{
		Description: description,
		Rub:         rub,
		Cancelled:   false,
	}

	// 3. сохранять информацию о проведенной операции
	// - описание операции
	// - сколько было потрачено
	// - отмененная ли операция
	p.paymentsInfo[id] = paymentRecord{
		info:   info,
		method: method,
	}

	return id
}

/*
	Метод Cancel()

Принимает:
1. ID операции
Возвращает:
- ничего не возвращает
*/
func (p *PaymentModule) Cancel(id int) {
	record, ok := p.paymentsInfo[id]
	if !ok {
		return
	}

	record.method.Cancel(id)

	record.info.Cancelled = true

	p.paymentsInfo[id] = record
}

/*
	Метод Info()

Принимает:
1. ID операции
Возвращает:
информацию о проведенной операции
*/
func (p *PaymentModule) Info(id int) PaymentInfo {
	record, ok := p.paymentsInfo[id]
	if !ok {
		return PaymentInfo{}
	}

	return record.info
}

/*
	Метод AllInfo()

Принимает:
- ничего не принимает
Возвращает:
1. информацию о всех проведенных операциях
*/
func (p *PaymentModule) AllInfo() map[int]PaymentInfo {
	tempMap := make(map[int]PaymentInfo, len(p.paymentsInfo))
	for k, v := range p.paymentsInfo {
		tempMap[k] = v.info
	}

	return tempMap
}
