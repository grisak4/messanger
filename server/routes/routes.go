package routes

import (
	"messenger-prot/services/authorization"
	"messenger-prot/services/chats"
	"messenger-prot/services/messages"
	"messenger-prot/services/registration"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Routes(router *gin.Engine, db *gorm.DB) {
	// registration
	router.POST("/api/v1/regin", func(c *gin.Context) {
		registration.PostCreateUser(c, db)
	})

	// authorization
	router.POST("/api/v1/login", func(c *gin.Context) {
		authorization.PostLoginUser(c, db)
	})

	// chats
	router.GET("/api/v1/chats", func(c *gin.Context) {
		chats.GetChats(c, db)
	})

	// messages
	router.GET("/api/v1/chats/:chat_id/messages", func(c *gin.Context) {
		messages.GetMessages(c, db)
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
