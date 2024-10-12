package messages

import (
	"messenger-prot/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetMessages(c *gin.Context, db *gorm.DB) {
	chatID := c.Param("chat_id")

	// Fetch messages from the database based on chatID
	var messages []models.Message
	if err := db.Where("chat_id = ?", chatID).Find(&messages).Error; err != nil {
		c.JSON(500, gin.H{"error": "Ошибка загрузки сообщений"})
		return
	}

	c.JSON(200, gin.H{"messages": messages})
}
