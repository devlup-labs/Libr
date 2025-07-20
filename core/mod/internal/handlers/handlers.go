package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"

	"github.com/gorilla/mux"

	"github.com/devlup-labs/Libr/core/crypto/cryptoutils"
	"github.com/devlup-labs/Libr/core/mod/internal/service"
	"github.com/devlup-labs/Libr/core/mod/models"
)

var (
	msgStore = make(map[string]models.ModResponse)
	mu       sync.RWMutex
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Welcome to LIBR prototype"))
}

func MsgIN(w http.ResponseWriter, r *http.Request) {
	var req models.UserMsg
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Invalid user message: %v", err)
		http.Error(w, "invalid JSON body", http.StatusBadRequest)
		return
	}

	// Basic validation
	if req.TimeStamp == "0" || strings.TrimSpace(req.Content) == "" {
		http.Error(w, "timestamp or content missing", http.StatusBadRequest)
		return
	}

	// Moderate message
	moderationStatus, err := service.ModerateMsg(req)
	fmt.Println(moderationStatus)
	if err != nil {
		log.Printf("Moderation error: %v", err)
		http.Error(w, "error during moderation", http.StatusInternalServerError)
		return
	}

	// Load keys to sign
	pub, priv, err := cryptoutils.LoadKeys()
	if err != nil {
		log.Printf("Key load error: %v", err)
		http.Error(w, "failed to load keys", http.StatusInternalServerError)
		return
	}

	// Sign
	signed, err := service.ModSign(req, moderationStatus, priv, pub)
	if err != nil {
		log.Printf("Signing error: %v", err)
		http.Error(w, "error signing message", http.StatusInternalServerError)
		return
	}

	mu.Lock()
	msgStore[req.TimeStamp] = signed
	mu.Unlock()

	// Respond
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(signed)
}

func MsgOUT(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	timestamp := vars["timestamp"]

	mu.RLock()
	msg, exists := msgStore[timestamp]
	mu.RUnlock()

	if !exists {
		http.Error(w, "message not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msg)
}
