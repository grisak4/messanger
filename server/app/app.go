package app

import (
	"messenger-prot/database"
	"messenger-prot/routes"

	"github.com/gin-gonic/gin"
)

func Run() {
	database.ConnectDB()
	defer database.CloseDB()

	r := gin.Default()
	routes.CorsConfig(r)
	routes.ReginRoutes(r, database.InitDb())

	r.Run(":8080")
}
