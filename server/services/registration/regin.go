package registration

import (
	"fmt"
	"messenger-prot/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func PostCreateUser(c *gin.Context, db *gorm.DB) {
	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	user := models.User{
		Email:    creds.Email,
		Password: creds.Password,
	}

	if err := db.Create(&user).Error; err != nil {
		fmt.Println("Error with insert:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "userID": user.UserID})
}
