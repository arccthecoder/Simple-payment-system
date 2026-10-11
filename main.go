package main

import (
	"fmt"
	"strconv"
	"time"
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
	pSlice := PaymentModuleSlice{}
	pMap := PaymentModuleMap{
		m: make(map[int]PaymentInfo),
	}

	iterations := 100

	// -- замерить время
	before := time.Now()

	for i := 0; i < iterations; i++ {
		info := PaymentInfo{
			ID:          i,
			Description: strconv.Itoa(i),
		}

		pSlice.AddInfo(info)
	}

	fmt.Println("slice add:", time.Since(before))
	// -- до сюда
	// тоже время замерить
	before = time.Now()
	for i := 0; i < iterations; i++ {
		info := PaymentInfo{
			ID:          i,
			Description: strconv.Itoa(i),
		}

		pMap.AddInfo(info)
	}

	fmt.Println("mapp add:", time.Since(before))
} // до сюда епт
