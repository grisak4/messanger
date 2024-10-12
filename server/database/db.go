package database

import (
	"fmt"
	"log"
	"messenger-prot/config"
	"messenger-prot/models"

	/*  */
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func ConnectDB() {
	var err error
	connConf := config.GetDatabaseConfig()

	// Строка подключения для PostgreSQL
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=UTC",
		connConf.Host, connConf.User, connConf.Password, connConf.DBName, connConf.Port)

	// Подключение к базе данных с использованием GORM и PostgreSQL драйвера
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
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
