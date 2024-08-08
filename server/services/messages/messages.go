package messages

import (
	"messenger-prot/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetMessages(c *gin.Context, db *gorm.DB) {
	chatID := c.Param("chat_id")

	var messages []models.Message
	if err := db.Where("chat_id = ?", chatID).Order("time_sent asc").Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}
