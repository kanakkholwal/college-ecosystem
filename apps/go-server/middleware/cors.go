package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
)

var allowedOrigins = []string{
	"https://nith.eu.org",
	"https://app.nith.eu.org",
}

func CustomCORS(c *fiber.Ctx) error {
	origin := c.Get("Origin")
	identityKey := c.Get("X-Authorization")
	serverIdentity := os.Getenv("SERVER_IDENTITY")

	if serverIdentity == "" {
		return fiber.NewError(fiber.StatusInternalServerError, "SERVER_IDENTITY not set")
	}

	if origin == "" {
		if identityKey == serverIdentity {
			return c.Next()
		}
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": true,
			"data":  "Missing or invalid SERVER_IDENTITY",
		})
	}

	allowed := false
	env := os.Getenv("NODE_ENV")

	if env == "production" {
		for _, o := range allowedOrigins {
			if strings.HasSuffix(origin, o) {
				allowed = true
				break
			}
		}
	} else {
		allowed = strings.HasPrefix(origin, "http://localhost:")
	}

	if allowed {
		c.Set("Access-Control-Allow-Origin", origin)
		c.Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Content-Type,X-Authorization")
		c.Set("Access-Control-Allow-Credentials", "true")

		if c.Method() == fiber.MethodOptions {
			return c.SendStatus(fiber.StatusOK)
		}
		return c.Next()
	}

	if identityKey == serverIdentity {
		return c.Next()
	}

	return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
		"data":    nil,
		"message": "CORS policy does not allow this origin",
		"error":   true,
	})
}
