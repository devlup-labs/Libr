package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/libr-forum/Libr/core/db/internal/keycache"
	peer "github.com/libr-forum/Libr/core/db/internal/network/peers"
	"github.com/libr-forum/Libr/core/db/internal/routing"
	"github.com/libr-forum/Libr/core/db/internal/utils"
)

func main() {
	keycache.InitKeys()
	utils.SetupMongo("mongodb+srv://peer:peerhehe@cluster0.vswojqe.mongodb.net/")
	relayAddrs, err := utils.GetRelayAddr()

	if err != nil {
		fmt.Println("Error while getting relay address, ", err)
	}
	fmt.Println(relayAddrs)

	peer.StartNode(relayAddrs)

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	<-sigChan
	fmt.Println("Interrupt received. Exiting gracefully.")
	if routing.GlobalRT != nil {
		routing.GlobalRT.SaveToDBAsync()
		time.Sleep(1 * time.Second)
	}
}
