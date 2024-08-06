package models

import (
	"time"
)

type User struct {
	UserID       uint   `gorm:"primaryKey;autoIncrement"`
	Username     string `gorm:"size:255;not null"`
	Email        string `gorm:"size:255;not null;unique"`
	Password     string `gorm:"size:255;not null"`
	ProfileImage string `gorm:"size:255"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
