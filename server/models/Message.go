package models

import "time"

type Message struct {
	MessageID      uint      `gorm:"primaryKey;autoIncrement"`
	ChatID         uint      `gorm:"not null"`
	UserID         uint      `gorm:"not null"`
	MessageContent string    `gorm:"type:text;not null"`
	TimeSent       time.Time `gorm:"type:datetime;not null"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
