package config

import (
	"log"

	"github.com/spf13/viper"
)

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}
type JWTConfig struct {
	Secret string
}

func InitConfig() {
	viper.SetConfigName("config") // имя файла конфигурации без расширения
	viper.SetConfigType("yaml")   // тип файла конфигурации
	viper.AddConfigPath(".")      // путь к файлу конфигурации

	err := viper.ReadInConfig()
	if err != nil {
		log.Fatalf("Error reading config file: %v", err)
	}
}

func GetDatabaseConfig() DatabaseConfig {
	return DatabaseConfig{
		Host:     viper.GetString("database.host"),
		Port:     viper.GetInt("database.port"),
		User:     viper.GetString("database.user"),
		Password: viper.GetString("database.password"),
		DBName:   viper.GetString("database.dbname"),
	}
}

func GetJWTConfig() JWTConfig {
	return JWTConfig{
		Secret: viper.GetString("jwt.secret"),
	}
}
