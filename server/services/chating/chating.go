package chating

import (
	"fmt"
	"messenger-prot/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

// преобразование HTTP-соединения в WebSocket.
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleConnection(c *gin.Context, db *gorm.DB) {
	// соединение WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to establish WebSocket connection"})
		return
	}
	defer conn.Close()

	var message models.Message

	// chatid
	chatid := c.Query("chat_id")
	if chatid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "chat_id is required"})
		return
	}
	chatID, err := strconv.Atoi(chatid)
	if err != nil {
		fmt.Println("Ошибка конвертации:", err)
		return
	}

	// userid
	userid := c.Query("user_id")
	if userid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}
	userID, err := strconv.Atoi(userid)
	if err != nil {
		fmt.Println("Ошибка конвертации:", err)
		return
	}

	message.UserID = uint(userID)
	message.ChatID = uint(chatID)

	// цикл обработки сообщений от клиента
	for {
		messageType, msg, err := conn.ReadMessage()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read message"})
			return
		}

		message.MessageContent = string(msg)
		message.TimeSent = time.Now()

		fmt.Println("Message recieved: ", message)
		if err := db.Create(&message).Error; err != nil {
			fmt.Println("Error with insert:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not send message"})
			return
		}

		err = conn.WriteMessage(messageType, msg)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write message"})
			return
		}
	}
}
