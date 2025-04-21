package middleware

import (
	"github.com/gofiber/fiber/v2"
)

func ErrorHandler(c *fiber.Ctx) error {
	err := c.Next()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Something went wrong!",
			"error":   err.Error(),
		})
	}
	return nil
}
