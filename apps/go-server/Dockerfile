# ----------- Build Stage -----------
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install necessary dependencies
RUN apk add --no-cache git

# Cache go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source files
COPY . .

# Build the binary with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/main.go


# ----------- Run Stage -----------
FROM alpine:latest

WORKDIR /app

# Minimal required runtime deps
RUN apk add --no-cache ca-certificates

# Copy built binary from builder
COPY --from=builder /app/server .

# Expose the port Fiber is running on
EXPOSE 8080

# Run the server binary
# CMD ["./server"]
ENTRYPOINT ["./server"]
# ----------- End of Dockerfile -----------