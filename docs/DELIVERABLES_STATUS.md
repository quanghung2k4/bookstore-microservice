# Deliverables Status

## 1. GitHub repository

Status: partially ready

- The project source code exists in this workspace.
- There is no repository URL documented in this repo yet.
- If you need this deliverable to be complete, the code must be pushed to GitHub and the final repository link should be added here.

Suggested final format:

```text
https://github.com/<your-account>/<your-repository>
```

## 2. Architecture diagram for each service

Status: available

- System-wide architecture: `docs/ARCHITECTURE.md`
- Per-service architecture diagrams: `docs/SERVICE_ARCHITECTURE_DIAGRAMS.md`

## 3. API documentation

Status: available

- Main API reference: `docs/API_DOCUMENTATION.md`

## 4. 10-minute demo video

Status: not included in repository

- A real video file has not been created by the repository.
- Recording guide and speaking flow: `docs/DEMO_VIDEO_SCRIPT.md`

## 5. 8-12 page technical report

Status: available

- Final report draft: `docs/TECHNICAL_REPORT.md`
- Original outline template: `docs/TECHNICAL_REPORT_TEMPLATE.md`

## 6. Independent databases using only MySQL and PostgreSQL

Status: available in Docker deployment

- The Docker deployment now uses PostgreSQL for all services.
- Each service is assigned its own independent PostgreSQL database.
- The Django settings keep a SQLite fallback only for optional non-Docker local development.

PostgreSQL-enabled areas:

- `api_gateway/api_gateway/settings.py`
- `book_service/book_service/settings.py`
- `cart_service/cart_service/settings.py`
- `customer_service/customer_service/settings.py`
- `staff_service/staff_service/settings.py`
- `manager_service/manager_service/settings.py`
- `catalog_service/catalog_service/settings.py`
- `order_service/order_service/settings.py`
- `pay_service/pay_service/settings.py`
- `ship_service/ship_service/settings.py`
- `comment_rate_service/comment_rate_service/settings.py`
- `recommender_ai_service/recommender_ai_service/settings.py`
- `docker-compose.yml`
- `docker/postgres/init-multiple-databases.sql`