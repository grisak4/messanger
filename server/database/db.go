package database

import (
	"fmt"
	"log"
	"messenger-prot/config"
	"messenger-prot/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB

func ConnectDB() {
	var err error
	connConf := config.GetDatabaseConfig()

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		connConf.User, connConf.Password, connConf.Host, connConf.Port, connConf.DBName)

	// Подключение к базе данных с использованием GORM
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error connecting to the database: %s", err)
	}

	// Автоматическая миграция для создания/обновления таблиц
	err = db.AutoMigrate(&models.User{}, &models.Chat{}, &models.UserChat{}, &models.Message{})
	if err != nil {
		log.Fatalf("Error migrating the database: %s", err)
	}

	fmt.Println("Successfully connected to the database!")
}

func GetDB() *gorm.DB {
	return db
}

func CloseDB() {
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Error getting raw database object: %s", err)
	}
	sqlDB.Close()
}
