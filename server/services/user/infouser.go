package user

import (
	"messenger-prot/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetUser(c *gin.Context, db *gorm.DB) {
	userID := c.Param("user_id")

	var user models.User
	if err := db.Where("user_id = ?", userID).Find(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}
