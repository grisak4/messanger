package models

import "time"

type Message struct {
	MessageID      uint      `gorm:"primaryKey;autoIncrement"`
	ChatID         uint      `gorm:"not null"`
	UserID         uint      `gorm:"not null"`
	MessageContent string    `gorm:"type:text;not null"`
	TimeSent       time.Time `gorm:"type:timestamptz;not null"` // Изменено с datetime на timestamptz
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
