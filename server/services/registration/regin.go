package registration

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func PostCreateUser(c *gin.Context, db *sql.DB) {
	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.BindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	result, err := db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", creds.Username, creds.Password)
	if err != nil {
		fmt.Println("Error with insert: ", err)
		c.IndentedJSON(http.StatusInternalServerError, "Error with post")
		return
	}

	lastInsertID, err := result.LastInsertId()
	if err != nil {
		fmt.Println("Error getting last insert ID:", err)
		c.IndentedJSON(http.StatusInternalServerError, "Error with post")
		return
	}

	c.IndentedJSON(http.StatusCreated, lastInsertID)
}
