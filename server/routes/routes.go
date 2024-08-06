package routes

import (
	"messenger-prot/services/authorization"
	"messenger-prot/services/registration"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ReginRoutes(router *gin.Engine, db *gorm.DB) {
	router.POST("/regin", func(c *gin.Context) {
		registration.PostCreateUser(c, db)
	})
	router.POST("/login", func(c *gin.Context) {
		authorization.PostLoginUser(c, db)
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
