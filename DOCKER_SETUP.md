# Docker Setup Guide for Bookstore Microservice

## Scope

The repository now includes Dockerfiles for all backend services, a Dockerfile for the React frontend, and a Docker Compose file that starts the complete bookstore stack.

## Included Services

- `frontend`
- `api_gateway`
- `book_service`
- `customer_service`
- `cart_service`
- `staff_service`
- `manager_service`
- `catalog_service`
- `order_service`
- `pay_service`
- `ship_service`
- `comment_rate_service`
- `recommender_ai_service`
- `postgres`

## Prerequisites

- Docker Desktop
- Docker Compose support

## Start the Full Stack

```bash
docker-compose up --build
```

Run in background:

```bash
docker-compose up -d --build
```

Stop all containers:

```bash
docker-compose down
```

## Ports

- Frontend: `5173`
- API Gateway: `8000`
- Book Service: `8002`
- Customer Service: `8004`
- Cart Service: `8003`
- Staff Service: `8005`
- Manager Service: `8006`
- Catalog Service: `8007`
- Order Service: `8008`
- Pay Service: `8009`
- Ship Service: `8010`
- Comment/Rate Service: `8011`
- Recommender AI Service: `8012`

## Architecture Notes

- All containers share the `bookstore-network` Docker network.
- The frontend runs in Docker and proxies all `/api` traffic to `api_gateway`.
- The API gateway is the recommended entry point for frontend API access.
- The Docker deployment uses PostgreSQL instead of SQLite.
- Each service is assigned its own independent PostgreSQL database within the shared PostgreSQL server.

## Useful Commands

View logs for all services:

```bash
docker-compose logs -f
```

View one service log:

```bash
docker-compose logs -f api-gateway
docker-compose logs -f order-service
```

Rebuild from scratch:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

Open a shell in one container:

```bash
docker exec -it api-gateway /bin/bash
```

## Suggested Verification Flow

1. Open `http://localhost:5173/` to verify the frontend is alive.
2. Open `http://localhost:8000/` to verify the API gateway is alive.
3. Register a customer.
4. Add a book to cart.
5. Create an order.
6. Confirm that payment and shipping were triggered.
7. Submit a review and refresh recommendations.

## Deliverable References

- Architecture: `docs/ARCHITECTURE.md`
- Per-service diagrams: `docs/SERVICE_ARCHITECTURE_DIAGRAMS.md`
- API documentation: `docs/API_DOCUMENTATION.md`
- Demo script: `docs/DEMO_VIDEO_SCRIPT.md`
- Deliverable checklist: `docs/DELIVERABLES_STATUS.md`
- Technical report template: `docs/TECHNICAL_REPORT_TEMPLATE.md`
- Technical report: `docs/TECHNICAL_REPORT.md`
