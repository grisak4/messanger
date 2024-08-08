package models

import "time"

type UserChat struct {
	UserID    uint `gorm:"primaryKey"`
	ChatID    uint `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
