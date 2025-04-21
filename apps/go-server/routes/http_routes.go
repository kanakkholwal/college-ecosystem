package routes

import "github.com/gofiber/fiber/v2"

func RegisterRoutes(router fiber.Router) {
	router.Get("/ping", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"ping": "pong"})
	})
}
