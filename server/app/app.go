package app

import (
	"messenger-prot/config"
	"messenger-prot/database"
	"messenger-prot/routes"

	"github.com/gin-gonic/gin"
)

func Run() {
	config.InitConfig()

	database.ConnectDB()
	defer database.CloseDB()

	r := gin.Default()
	routes.CorsConfig(r)
	routes.ReginRoutes(r, database.GetDB())

	r.Run(":8080")
}
