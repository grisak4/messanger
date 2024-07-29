package models

type Message struct {
	MessageID int    `json:"message_id"`
	ChatID    int    `json:"chat_id"`
	UserID    int    `json:"user_id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
}
