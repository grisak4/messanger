package models

type Chat struct {
	ChatID    int    `json:"chat_id"`
	ChatName  string `json:"chat_name"`
	CreatedAt string `json:"created_at"`
}
