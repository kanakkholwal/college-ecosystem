package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	"github.com/kanakkholwal/go-server/middleware"
	"github.com/kanakkholwal/go-server/routes"
)

func main() {
	godotenv.Load()

	app := fiber.New()

	app.Use(middleware.ErrorHandler)
	app.Use(middleware.CustomCORS)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Welcome to the server!",
			"status":  "healthy",
		})
	})
	// This route is used to check if the server is running and healthy.
	app.Get("/ping", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"ping": "pong"})
	})

	routes.RegisterRoutes(app.Group("/api"))

	log.Fatal(app.Listen("0.0.0.0:8080"))
}
