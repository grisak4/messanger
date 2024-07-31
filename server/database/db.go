package database

import (
	"database/sql"
	"fmt"
	"log"
	"messenger-prot/config"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func ConnectDB() {
	var err error
	connConf := config.GetDatabaseConfig()

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s",
		connConf.User, connConf.Password, connConf.Host, connConf.Port, connConf.DBName)

	// Подключение к базе данных
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Error connecting to the database: %s", err)
	}

	err = db.Ping()
	if err != nil {
		fmt.Println("Error pinging database: ", err)
		return
	}

	fmt.Println("Successfully connected to the database!")
}

func InitDb() *sql.DB {
	return db
}

func CloseDB() {
	db.Close()
}
