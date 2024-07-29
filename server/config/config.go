package config

import (
	"log"

	"github.com/spf13/viper"
)

type DBConnection struct {
	Host         string
	Port         int
	User         string
	Password     string
	DatabaseName string
}

func ReadConfigDatabase() DBConnection {
	var dbCon DBConnection

	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")

	// Чтение конфигурации
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file, %s", err)
	}

	// Получение значений из конфигурационного файла
	dbCon.Host = viper.GetString("database.host")
	dbCon.Port = viper.GetInt("database.port")
	dbCon.User = viper.GetString("database.user")
	dbCon.Password = viper.GetString("database.password")
	dbCon.DatabaseName = viper.GetString("database.dbname")

	return dbCon
}
