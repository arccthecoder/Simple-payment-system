package main

import (
	"fmt"

	"github.com/k0kubun/pp"
)

/*
1. сохранять большое количество PaymentInfo
2. находить конкретный элемент PaymentInfo в множестве
*/

type PaymentInfo struct {
	ID          int
	Description string
	Usd         int
	Cancelled   bool
}

type PaymentModuleSlice struct {
	s []PaymentInfo
}

func (m *PaymentModuleSlice) AddInfo(info PaymentInfo) {
	m.s = append(m.s, info)
}

func (m *PaymentModuleSlice) GetInfo(id int) PaymentInfo {
	for _, info := range m.s {
		if info.ID == id {
			return info
		}
	}
	return PaymentInfo{}
}

// -----------------------------------
type PaymentModuleMap struct {
	m map[int]PaymentInfo
}

func (m *PaymentModuleMap) AddInfo(info PaymentInfo) {
	m.m[info.ID] = info
}

func (m *PaymentModuleMap) GetInfo(id int) PaymentInfo {
	info, ok := m.m[id]
	if !ok {
		return PaymentInfo{}
	}
	return info
}

func main() {
	info1 := PaymentInfo{
		ID:          10,
		Description: "burger",
		Usd:         5,
		Cancelled:   false,
	}

	pSlice := PaymentModuleSlice{}
	pMap := PaymentModuleMap{
		m: map[int]PaymentInfo{},
	}

	pSlice.AddInfo(info1)
	pMap.AddInfo(info1)

	pp.Println("pslice:", pSlice)
	pp.Println("pmap", pMap)

	i1 := pSlice.GetInfo(10)
	i2 := pMap.GetInfo(10)

	fmt.Println(i1, i2)
}
