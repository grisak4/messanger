package routes

import (
	"messenger-prot/services/authorization"
	"messenger-prot/services/chating"
	"messenger-prot/services/chats"
	"messenger-prot/services/messages"
	"messenger-prot/services/registration"
	"messenger-prot/services/user"
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

	// info about user
	router.GET("/api/v1/users/:user_id", func(c *gin.Context) {
		user.GetUser(c, db)
	})

	// chats
	router.GET("/api/v1/chats", func(c *gin.Context) {
		chats.GetChats(c, db)
	})

	// messages
	router.GET("/api/v1/chats/:chat_id/messages", func(c *gin.Context) {
		messages.GetMessages(c, db)
	})

	// chating
	router.GET("/api/v1/ws/chats/:chat_id/users/:user_id", func(c *gin.Context) {
		chating.HandleConnection(c, db)
	})
}

func CorsConfig(r *gin.Engine) {
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Замените на домены вашего приложения
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true, // Не используйте "*" в AllowOrigins, если AllowCredentials установлено в true
		MaxAge:           12 * time.Hour,
	}))
}
