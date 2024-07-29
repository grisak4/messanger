package routes

import (
	"database/sql"
	"messenger-prot/services/registration"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func ReginRoutes(router *gin.Engine, db *sql.DB) {
	router.POST("/regin", func(c *gin.Context) {
		registration.PostCreateUser(c, db)
	})
}

func CorsConfig(r *gin.Engine) {
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
}
