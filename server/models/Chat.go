package models

import "time"

type Chat struct {
	ChatID    uint   `gorm:"primaryKey;autoIncrement"`
	ChatName  string `gorm:"size:255;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
