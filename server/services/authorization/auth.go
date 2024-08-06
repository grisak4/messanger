package authorization

import (
	"fmt"
	"messenger-prot/config"
	"messenger-prot/models"
	"messenger-prot/util/jwttoken"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func PostLoginUser(c *gin.Context, db *gorm.DB) {
	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	var user models.User
	result := db.Where("email = ? AND password = ?", creds.Email, creds.Password).First(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}
		fmt.Println("Error querying database:", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	expirationTime := time.Now().Add(5 * time.Hour) // создание времени существования токена
	claims := &jwttoken.Claims{
		Email: creds.Email,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims) // создание токена
	jwtKey := []byte(config.GetJWTConfig().Secret)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		fmt.Println("Error signing token:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}
