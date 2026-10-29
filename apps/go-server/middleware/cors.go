package middleware

import (
	"os"

	"github.com/gofiber/fiber/v2"
)

var allowedOrigins = map[string]bool{
	"http://localhost:3000": true,
	"http://localhost:3001": true,
	"http://127.0.0.1:3000": true,
	"http://127.0.0.1:3001": true,
}

func CustomCORS(c *fiber.Ctx) error {
	origin := c.Get("Origin")
	identityKey := c.Get("X-Authorization")
	serverIdentity := os.Getenv("SERVER_IDENTITY")

	if serverIdentity == "" {
		return fiber.NewError(
			fiber.StatusInternalServerError,
			"SERVER_IDENTITY not set",
		)
	}

	// Permit trusted server-to-server requests without a browser Origin.
	if origin == "" {
		if identityKey == serverIdentity {
			return c.Next()
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": true,
			"data":  "Missing or invalid SERVER_IDENTITY",
		})
	}

	// Match the complete origin, not a substring or hostname suffix.
	if allowedOrigins[origin] {
		c.Set("Access-Control-Allow-Origin", origin)
		c.Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Content-Type, X-Authorization")
		c.Set("Access-Control-Allow-Credentials", "true")
		c.Set("Vary", "Origin")

		if c.Method() == fiber.MethodOptions {
			return c.SendStatus(fiber.StatusNoContent)
		}

		return c.Next()
	}

	// Keep the existing server-to-server authentication behavior.
	if identityKey == serverIdentity {
		return c.Next()
	}

	return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
		"data":    nil,
		"message": "CORS policy does not allow this origin",
		"error":   true,
	})
}
