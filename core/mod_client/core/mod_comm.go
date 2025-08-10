package core

import (
	"context"
	"log"
	"strconv"
	"sync"
	"time"

	cache "github.com/devlup-labs/Libr/core/mod_client/cache_handler"
	"github.com/devlup-labs/Libr/core/mod_client/network"
	"github.com/devlup-labs/Libr/core/mod_client/types"
	util "github.com/devlup-labs/Libr/core/mod_client/util"

	"github.com/devlup-labs/Libr/core/crypto/cryptoutils"
)

func ManualSendToMods(cert types.MsgCert, mods []types.Mod, reason string, firstTry bool) []types.ModCert {
	var (
		totalMods    = len(mods)
		ackCount     int
		rejCount     int
		unresponsive int

		modcertList []types.ModCert
		ackMods     []string // ✅ for AwaitingMods
		mu          sync.Mutex
		wg          sync.WaitGroup
	)

	// Attach the reason (first try may have a reason, retries usually "")
	if reason != "" {
		cert.Reason = reason
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	for _, mod := range mods {
		wg.Add(1)
		go func(mod types.Mod) {
			defer wg.Done()

			modCtx, modCancel := context.WithTimeout(ctx, 3*time.Second)
			defer modCancel()

			respChan := make(chan interface{}, 1)

			// Send report to mod
			go func() {
				resp, err := network.SendTo(mod.IP, mod.Port, "/route=manual", cert, "mod")
				if err != nil {
					log.Printf("Error sending to %s:%s — %v", mod.IP, mod.Port, err)
					return
				}
				respChan <- resp
			}()

			select {
			case <-modCtx.Done():
				log.Printf("Mod %s:%s unresponsive (timeout)", mod.IP, mod.Port)
				mu.Lock()
				unresponsive++
				mu.Unlock()

			case res := <-respChan:
				modcert, ok := res.(types.ModCert)
				if !ok {
					log.Printf("Unknown response type from %s:%s", mod.IP, mod.Port)
					return
				}

				// If they ACK, store for retry
				if modcert.Status == "acknowledged" && modcert.Sign == cert.Sign {
					mu.Lock()
					ackMods = append(ackMods, mod.PublicKey) // always store for AwaitingMods
					if firstTry {
						ackCount++ // ✅ Only count ACKs in the first try
					}
					mu.Unlock()
					log.Printf("Mod %s:%s acknowledged", mod.IP, mod.Port)
					return
				}

				// Verify signature for non-acknowledgement
				msgHash := cert.Sign + modcert.Status
				if cryptoutils.VerifySignature(modcert.PublicKey, msgHash, modcert.Sign) {
					log.Printf("Received valid modcert from %s:%s", mod.IP, mod.Port)
					mu.Lock()
					modcertList = append(modcertList, modcert)
					if modcert.Status != "1" {
						rejCount++
					}
					mu.Unlock()
				} else {
					log.Printf("Invalid signature from mod %s:%s", mod.IP, mod.Port)
				}
			}
		}(mod)
	}

	wg.Wait()

	log.Printf("Moderation summary for %s: finalCerts=%d acks=%d unresponsive=%d total=%d",
		cert.Sign, len(modcertList), ackCount, unresponsive, totalMods)

	// Save pending state only if there are ACKs
	if len(ackMods) > 0 {
		log.Printf("🔄 Saving %d ACK mods for retry", len(ackMods))
		pending := types.PendingModeration{
			MsgSign:      cert.Sign,
			MsgCert:      cert,
			PartialCerts: modcertList,
			AwaitingMods: ackMods,
			CreatedAt:    time.Now(),
		}

		if err := cache.SavePendingModeration(pending); err != nil {
			log.Printf("❌ Failed to save pending moderation: %v", err)
		} else if firstTry {
			// Start cron only on first try
			go StartModerationCron(&cert)
		}
	}

	return modcertList
}

func AutoSendToMods(message string, ts int64) ([]types.ModCert, error) {

	msg := types.Msg{
		Content: message,
		Ts:      ts,
	}

	onlineMods, err := util.GetOnlineMods()
	if err != nil {
		log.Fatalf("failed to get online mods: %v", err)
	}
	noOfMods := len(onlineMods)

	var (
		totalMods   = noOfMods
		modcertList []types.ModCert
		accpCount   int
		mu          sync.Mutex
		wg          sync.WaitGroup
		once        sync.Once
	)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	for _, mod := range onlineMods {
		wg.Add(1)
		go func(mod types.Mod) {
			defer wg.Done()
			defer func() {
				if r := recover(); r != nil {
					log.Printf("[PANIC] Recovered in mod goroutine for %s:%s: %v", mod.IP, mod.Port, r)
				}
			}()

			modCtx, modCancel := context.WithTimeout(ctx, 5*time.Second)
			defer modCancel()

			responseChan := make(chan types.ModCert, 1)

			// Send the request to the mod
			go func() {
				defer func() {
					if r := recover(); r != nil {
						log.Printf("[PANIC] Recovered in mod response goroutine for %s:%s: %v", mod.IP, mod.Port, r)
					}
				}()
				response, err := network.SendTo(mod.IP, mod.Port, "/route=auto", msg, "mod")
				log.Printf("[DEBUG] Sent to mod %s:%s, response: %v, err: %v", mod.IP, mod.Port, response, err)
				if err != nil {
					log.Printf("[ERROR] Failed to contact mod at %s:%s: %v", mod.IP, mod.Port, err)
					return
				}

				modcert, ok := response.(types.ModCert)
				log.Printf("[DEBUG] Modcert from %s:%s: %v (ok=%v)", mod.IP, mod.Port, modcert, ok)
				if !ok {
					log.Printf("[ERROR] Invalid mod response format from %s:%s: %v", mod.IP, mod.Port, response)
					return
				}

				if modcert.PublicKey != mod.PublicKey {
					log.Printf("[ERROR] Response public key mismatch from mod %s:%s. Expected: %s, Got: %s", mod.IP, mod.Port, mod.PublicKey, modcert.PublicKey)
					return
				}

				if cryptoutils.VerifySignature(modcert.PublicKey, message+strconv.FormatInt(ts, 10)+modcert.Status, modcert.Sign) {
					log.Printf("[INFO] Valid signature from mod %s:%s, status: %s", mod.IP, mod.Port, modcert.Status)
					responseChan <- modcert
				} else {
					log.Printf("[ERROR] Invalid signature from mod %s:%s. Data: %s, Sign: %s", mod.IP, mod.Port, message+strconv.FormatInt(ts, 10)+modcert.Status, modcert.Sign)
				}
			}()

			select {
			case res := <-responseChan:
				log.Printf("[INFO] Received modcert from %s:%s, status: %s", mod.IP, mod.Port, res.Status)
				if res.Status == "1" {
					mu.Lock()
					modcertList = append(modcertList, res)
					accpCount++
					curAccp := accpCount
					curTotal := totalMods
					mu.Unlock()

					log.Printf("[WARN] Mod %s:%s Accepted. AccCount: %d, TotalMods: %d", mod.IP, mod.Port, curAccp, curTotal)
					if curAccp > (noOfMods / 2) {
						once.Do(func() {
							log.Println("Majority accepted.")
							cancel()
						})
					}
				}

			case <-modCtx.Done():
				log.Printf("[WARN] Mod %s:%s timed out or cancelled", mod.IP, mod.Port)
				mu.Lock()
				totalMods--
				curAcc := accpCount
				curTotal := totalMods
				mu.Unlock()

				log.Printf("[WARN] Timeout. RejCount: %d, TotalMods: %d", curAcc, curTotal)
				if curAcc > (noOfMods / 2) {
					once.Do(func() {
						log.Println("Majority Accepted.")
						cancel()
					})
				}
			}
		}(mod)
	}

	wg.Wait()

	mu.Lock()
	finalAccp := accpCount
	finalTotal := totalMods
	mu.Unlock()

	if finalTotal > (noOfMods/2) && float32(finalAccp)/float32(noOfMods) >= 0.3 && float32(finalAccp)/float32(finalTotal) >= 0.5 {
		return modcertList, nil
	}
	return nil, nil
}
