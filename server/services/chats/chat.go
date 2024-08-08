package chats

import (
	"messenger-prot/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetChats(c *gin.Context, db *gorm.DB) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	var userChats []models.UserChat
	if err := db.Where("user_id = ?", userID).Find(&userChats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get chats"})
		return
	}

	var chatIDs []uint
	for _, userChat := range userChats {
		chatIDs = append(chatIDs, userChat.ChatID)
	}

	var chats []models.Chat
	if err := db.Where("chat_id IN ?", chatIDs).Find(&chats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get chats"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"chats": chats})
}
