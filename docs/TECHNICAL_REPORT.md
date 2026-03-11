# Bookstore Microservice Technical Report

## 1. Introduction

This project implements a bookstore management platform based on a microservice architecture. The main goal is to separate business capabilities into independent services while still supporting complete end-to-end bookstore workflows such as registration, browsing, cart handling, checkout, review submission, recommendation generation, and reporting. The system is implemented primarily with Django and Django REST Framework for backend services, while the user-facing storefront is implemented with React.

The project targets both functional requirements and software architecture requirements. Functionally, it supports customer actions such as account registration, login, book browsing, cart manipulation, order creation, and book reviews. It also supports administrative flows for staff and manager roles. From a technical perspective, the project uses REST APIs, HTTP-based service-to-service communication, an API gateway, and containerization support through Dockerfiles and Docker Compose.

The final system demonstrates how a bookstore domain can be decomposed into small services that remain focused on one responsibility each. Rather than placing all data and logic in a single Django monolith, the system distributes work across service boundaries including books, customers, carts, orders, payments, shipping, catalog, reviews, recommendations, staff, and manager reporting.

## 2. Problem Statement

An online bookstore contains several distinct business concerns. Book management, customer identity, cart state, checkout, payment processing, shipping, recommendations, and reporting all have different data models and operational needs. A monolithic design can work for small projects, but it tends to couple unrelated responsibilities, making it harder to evolve, test, and scale separate business flows.

Microservices are a suitable fit for this domain because each bounded context can be represented as an independent service. The book service owns book data. The customer service owns customer credentials and identity records. The cart service handles current selections before checkout. The order service orchestrates downstream payment and shipping operations. The review and recommendation services process post-purchase feedback and personalized suggestions. Staff and manager concerns are also isolated from customer-facing functionality.

This separation makes the architecture easier to reason about and document. It also provides a clear path for future scaling and replacement of individual components without requiring a full system rewrite.

## 3. System Architecture

At the highest level, the system consists of a React frontend, an API gateway, and multiple Django microservices. The frontend is designed to call the gateway instead of calling each service directly. The gateway acts as the single entry point for public API traffic. This reduces coupling between frontend code and backend topology, and it centralizes cross-cutting routing behavior.

The architecture is documented in `docs/ARCHITECTURE.md` and expanded service-by-service in `docs/SERVICE_ARCHITECTURE_DIAGRAMS.md`. The main runtime flow is:

1. The frontend sends requests to the API gateway.
2. The API gateway proxies requests to downstream services based on URL prefixes.
3. Some services perform additional internal HTTP calls to other services.
4. Each service stores and retrieves its own data independently.

The most important architectural decision in this project is service ownership. Each service is responsible for its own models, serializers, views, and URL surface. Inter-service communication happens through HTTP requests rather than direct model imports across projects. This is essential for preserving microservice boundaries.

## 4. Service Design

### 4.1 API Gateway

The API gateway is implemented as a Django project that forwards requests to downstream services. It currently proxies book, customer, cart, order, review, and recommendation routes. This means the frontend can remain stable even if internal service ports or hostnames change later.

The gateway also keeps the frontend from needing service-specific networking knowledge. From the frontend perspective, calls go to `/api/book/...`, `/api/customer/...`, `/api/cart/...`, and similar paths. Internally, the gateway resolves the correct target service.

### 4.2 Book Service

The book service owns book inventory data. It supports create, read, update, and delete operations on books. Other services do not directly modify book storage tables. Instead, they query or rely on the book service when they need book information.

This service acts as the source of truth for titles, authors, prices, descriptions, and other inventory-related fields. Staff and catalog behaviors both depend on it.

### 4.3 Customer Service

The customer service manages customer registration and login. Passwords are stored in hashed form. A notable business rule implemented in this service is automatic cart creation when a new customer registers. This ensures that the cart lifecycle begins immediately for every new customer.

The service exposes registration and login endpoints used by the frontend. It also coordinates with the cart service to create a default cart for each newly registered customer.

### 4.4 Cart Service

The cart service manages shopping carts and cart items. It supports creating carts, adding items, updating item quantities, removing items, and retrieving a cart by customer. The service was stabilized to avoid duplicate cart creation and to keep cart behavior consistent across repeated operations.

The cart service validates or references book information through the book service when required. This helps ensure that cart entries remain consistent with actual book identifiers.

### 4.5 Order Service

The order service is the orchestration layer for checkout. It reads cart state, calculates order data, stores the order record, and triggers payment and shipping downstream services. It also exposes order history retrieval by customer.

This service is a key example of service composition. It does not directly own payment processing or shipment creation logic, but it coordinates those tasks through REST calls to the appropriate services.

### 4.6 Pay Service

The pay service is responsible for payment-related records and payment method handling. When the order service performs checkout, it calls the pay service to simulate or record the payment phase. The service is intentionally small and focused.

### 4.7 Ship Service

The ship service creates shipment records and stores shipping method information. Similar to the pay service, it is invoked by the order service during checkout rather than being exposed as a primary customer-facing workflow.

### 4.8 Comment and Rate Service

The comment and rate service stores ratings and textual reviews for books. The frontend uses it to show comments and accept customer reviews. This service also provides summary information that can be consumed by recommendation or reporting logic.

### 4.9 Recommender AI Service

The recommendation service builds customer-specific recommendation output by combining book data and review summary data. The current implementation is lightweight, but it still demonstrates how recommendation logic can be isolated from both frontend code and core transaction services.

### 4.10 Staff Service

The staff service represents staff-facing book management workflows. Rather than duplicating book ownership, it works with the book service as the authoritative data source. This design keeps business ownership clear.

### 4.11 Manager Service

The manager service aggregates information from books, orders, and reviews to support dashboard-like reporting. This service demonstrates how managerial reporting can be composed from multiple upstream systems without breaking their independence.

### 4.12 Catalog Service

The catalog service supports category and browsing structures. It works with book data to organize browsing-related views. Its role is conceptually distinct from inventory ownership, even though both concern the product domain.

## 5. API Design

The system follows a REST-oriented design. Each service exposes JSON endpoints, and the API gateway re-exposes important customer-facing flows under gateway-prefixed URLs. This keeps the API surface consistent for the frontend.

Examples include:

- `GET /api/book/books/` to list books
- `POST /api/customer/customers/register/` to register a customer
- `POST /api/customer/customers/login/` to authenticate a customer
- `GET /api/cart/carts/customer/{customer_id}/` to retrieve cart state
- `POST /api/order/orders/` to create an order
- `GET /api/review/reviews/book/{book_id}/` to fetch comments for one book
- `GET /api/recommend/recommendations/{customer_id}/` to fetch recommendations

The complete endpoint inventory is documented in `docs/API_DOCUMENTATION.md`.

The API style intentionally separates public access paths from internal service paths. During development, services can still be called directly on their own ports, but the preferred integration path is the gateway. This decision better reflects the intended system architecture.

## 6. Database Design

The intended database strategy is service isolation. Each microservice should own its own database and should never query another service database directly. This is a core architectural principle because it prevents tight coupling at the persistence layer.

The Docker deployment now uses PostgreSQL for all services. Each microservice is assigned its own independent PostgreSQL database while remaining on the same PostgreSQL server container. This means persistence technology is no longer SQLite in the containerized deployment, and the deployment now matches the allowed database technologies requirement.

For convenience, the Django settings still keep a SQLite fallback when database environment variables are not provided. That fallback is intended only for optional local development outside Docker. The official containerized deployment path uses PostgreSQL.

## 7. Functional Demonstration

### 7.1 Customer registration creates cart

The customer registration flow proves that a business rule can span multiple services while still preserving independence. A user submits registration data through the frontend. The frontend sends the request to the gateway. The gateway forwards it to the customer service. The customer service creates the customer record, hashes the password, and sends an HTTP request to the cart service to create an empty cart.

This demonstrates service-to-service communication without shared database access.

### 7.2 Staff manages books

The staff service demonstrates role-specific administrative behavior. Book creation and editing still rely on the book service as the canonical owner of book data. This prevents data duplication and preserves a clean responsibility split.

### 7.3 Customer cart operations

The customer can browse books, add a title to cart, open the cart view, update item quantity, and remove an item. These operations travel from frontend to gateway to cart service. The cart service maintains the mutable basket state independently from the order service.

### 7.4 Order triggers payment and shipping

The checkout flow shows orchestration in action. The order service reads current cart data, builds an order, and sends downstream requests to payment and shipping services. This is one of the clearest examples of why microservices are useful in the project: specialized services remain independent while still participating in one user workflow.

### 7.5 Customer rates books and sees recommendations

After an order is placed, the customer can view book details and submit a rating and comment. The review service stores the feedback, and the recommendation service later consumes review information along with book data to generate recommendation output.

## 8. Frontend and User Experience

The frontend is implemented with React and Vite. The application was refactored so that the main container logic is separated from presentational components. Views such as home, cart, orders, reviews, and book detail are handled in a more maintainable manner.

The frontend also enforces important business behavior. Customers must log in before using customer-specific actions. Cart, order history, and reviews are separated into their own views. Book detail pages display comment information for the selected title. Search behavior was changed to an explicit submit flow for stability and clarity.

This frontend restructuring is important from a technical report perspective because it shows that the project is not only a backend demonstration. The user-facing application is aligned with the service architecture and uses the gateway as intended.

## 9. Docker Deployment

Docker support was added across the backend services by providing Dockerfiles for all backend projects, a Dockerfile for the frontend, and a root `docker-compose.yml` that starts the service stack. The compose file defines service builds, ports, environment variables, PostgreSQL databases, and the shared Docker network used for service-to-service communication.

The API gateway is positioned as the primary backend entry point in Docker as well. This keeps the deployment layout consistent with the local development layout.

The Compose stack now includes a PostgreSQL container with separate databases for each service. Containers run Django migrations automatically before starting gunicorn, and the frontend is also included in the Compose stack so the full application can be started with one command.

## 10. Testing and Validation

Several parts of the system were validated during development:

- gateway proxy routes returned successful responses for book and review endpoints
- frontend build completed successfully after the gateway rewire
- login and registration flows were tested through the customer service
- cart duplicate issues were stabilized
- local startup automation was improved with a PowerShell script
- Docker Compose syntax was validated using `docker compose config`

These checks confirm that the current codebase is functional as a working bookstore microservice prototype.

## 11. Challenges and Lessons Learned

One of the main challenges was keeping the architecture honest. It is easy to claim a microservice design while still coupling the frontend directly to individual services or coupling services through shared persistence assumptions. The gateway refactor addressed the first problem by ensuring the frontend goes through `api_gateway` as the main entry point.

Another challenge involved documentation and deliverable readiness. A codebase can function correctly while still failing assignment requirements because diagrams, API docs, Docker support, and a formal report are missing. Creating these assets is an important engineering task, not just administrative work.

The database requirement is another example. Although the current implementation maintains logical separation by using separate SQLite files, the rubric specifically requires MySQL and PostgreSQL. That means architectural intent alone is not enough; the technology choices must also match the requirement exactly.

## 12. Future Improvements

The most important next step is to replace SQLite with MySQL or PostgreSQL for each service. This requires updating Django settings, dependency lists, container configuration, and initialization steps. Ideally, each service should own a distinct database instance or schema and keep credentials isolated.

Other meaningful future improvements include:

- token-based authentication instead of lightweight local session storage
- stronger automated test coverage for cross-service flows
- centralized logging and tracing across services
- CI/CD pipelines for build and deployment checks
- more advanced recommendation logic
- stronger role-based access control for staff and manager operations

## 13. Conclusion

This project successfully demonstrates a bookstore platform decomposed into multiple Django microservices with an API gateway and a React frontend. The codebase satisfies a large portion of the functional and architectural intent of the assignment: service decomposition, REST APIs, cross-service communication, gateway-based integration, customer workflows, staff workflows, manager reporting, and containerization support.

The remaining non-code deliverables are mainly operational: pushing the repository to GitHub and recording the demo video. From a code and deployment perspective, the project now includes a frontend container, an API gateway-based integration path, and independent PostgreSQL databases for the service stack.

## Appendix A. Repository Structure Summary

- `api_gateway/` contains the gateway Django project and proxy logic
- `book_service/` owns book inventory
- `customer_service/` handles registration and login
- `cart_service/` manages carts and cart items
- `order_service/` handles checkout and order history
- `pay_service/` stores payment actions
- `ship_service/` stores shipment actions
- `comment_rate_service/` stores reviews and ratings
- `recommender_ai_service/` produces recommendations
- `staff_service/` provides staff-facing workflows
- `manager_service/` provides reporting flows
- `catalog_service/` supports category and browsing structures
- `docs/` contains architecture, API, report, and deliverable assets

## Appendix B. Demo Assets

- `docs/ARCHITECTURE.md`
- `docs/SERVICE_ARCHITECTURE_DIAGRAMS.md`
- `docs/API_DOCUMENTATION.md`
- `docs/DEMO_VIDEO_SCRIPT.md`
- `docs/DELIVERABLES_STATUS.md`