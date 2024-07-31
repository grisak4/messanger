package authorization

import (
	"database/sql"
	"fmt"
	"messenger-prot/config"
	"messenger-prot/models"
	"messenger-prot/util/jwttoken"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

func PostLoginUser(c *gin.Context, db *sql.DB) {
	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.BindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	rows, err := db.Query("SELECT * FROM Users")
	if err != nil {
		fmt.Println("Error with getTasks: ", err)
		c.IndentedJSON(http.StatusConflict, gin.H{"error": "Error with database"})
		return
	}

	var users []models.User
	for rows.Next() { // вывод с базы
		var user models.User
		if err := rows.Scan(&user.UserID, &user.Username, &user.Password); err != nil {
			fmt.Println("Error with scan")
			c.IndentedJSON(http.StatusConflict, gin.H{"error": "Error with database"})
			return
		}
		users = append(users, user)
	}

	userFound := false
	for _, user := range users {
		if creds.Username == user.Username && creds.Password == user.Password {
			userFound = true
			break
		}
	}
	if !userFound {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	expirationTime := time.Now().Add(5 * time.Hour) // создание времени существования токена
	claims := &jwttoken.Claims{
		Username: creds.Username,
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
