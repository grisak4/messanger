package chating

import (
	"encoding/json"
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

	for {
		chatid := c.Param("chat_id")
		if chatid == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "chat_id is required"})
			return
		}
		chatID, err := strconv.Atoi(chatid)
		if err != nil {
			fmt.Println("Ошибка конвертации:", err)
			return
		}

		userid := c.Param("user_id")
		if userid == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
			return
		}
		userID, err := strconv.Atoi(userid)
		if err != nil {
			fmt.Println("Ошибка конвертации:", err)
			return
		}

		messageType, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Ошибка чтения сообщения:", err)
			return // Закрытие соединения при ошибке
		}

		// Создание сообщения
		message := models.Message{
			ChatID:         uint(chatID),
			UserID:         uint(userID),
			MessageContent: string(msg),
			TimeSent:       time.Now(),
		}

		// Попробуйте вставить сообщение в БД
		if err := db.Create(&message).Error; err != nil {
			fmt.Println("Ошибка при записи в БД:", err)
			continue
		}

		fmt.Println("Получено сообщение: ", message)

		// Сериализация сообщения
		jsonMessage, err := json.Marshal(message)
		if err != nil {
			fmt.Println("Ошибка сериализации:", err)
			continue // Не закрываем соединение, продолжаем слушать
		}

		// Отправка сообщения обратно через WebSocket
		if err := conn.WriteMessage(messageType, jsonMessage); err != nil {
			fmt.Println("Ошибка отправки сообщения:", err)
			return // Закрываем соединение, если отправка не удалась
		}
	}
}
