package chating

import (
	"encoding/json"
	"fmt"
	"messenger-prot/models"
	"net/http"
	"strconv"
	"sync"
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

// Хранилище для активных соединений пользователей в разных чатах
var clients = make(map[int]map[int]*websocket.Conn) // chatID -> map[userID]conn
var clientsMutex sync.Mutex

func HandleConnection(c *gin.Context, db *gorm.DB) {
	// соединение WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to establish WebSocket connection"})
		return
	}
	defer conn.Close()

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

	// Сохраняем соединение в список клиентов
	clientsMutex.Lock()
	if clients[chatID] == nil {
		clients[chatID] = make(map[int]*websocket.Conn)
	}
	clients[chatID][userID] = conn
	clientsMutex.Unlock()

	defer func() {
		// Удаляем соединение при закрытии
		clientsMutex.Lock()
		delete(clients[chatID], userID)
		if len(clients[chatID]) == 0 {
			delete(clients, chatID)
		}
		clientsMutex.Unlock()
	}()

	for {
		// Чтение сообщения от клиента
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

		// Запись сообщения в базу данных
		if err := db.Create(&message).Error; err != nil {
			fmt.Println("Ошибка при записи в БД:", err)
			continue
		}

		// Сериализация сообщения
		jsonMessage, err := json.Marshal(message)
		if err != nil {
			fmt.Println("Ошибка сериализации:", err)
			continue
		}

		// Отправляем сообщение всем пользователям чата
		clientsMutex.Lock()
		for _, clientConn := range clients[chatID] {
			if err := clientConn.WriteMessage(messageType, jsonMessage); err != nil {
				fmt.Println("Ошибка отправки сообщения:", err)
			}
		}
		clientsMutex.Unlock()
	}
}
