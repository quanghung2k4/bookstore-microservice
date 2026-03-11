# Demo Video Script

## Goal

Produce a 10-minute demo video that proves the system satisfies the bookstore microservice requirements.

## Recommended structure

### 0:00-1:00 Introduction

- Show the repository root.
- Explain that the project is a bookstore system implemented with Django microservices, REST APIs, and an API gateway.
- Mention the main actors: customer, staff, and manager.

### 1:00-2:00 Architecture overview

- Open `docs/ARCHITECTURE.md`.
- Show that the frontend calls `api_gateway` first.
- Explain that downstream services are separated by responsibility.

### 2:00-3:30 Customer registration and login

- Start the local system.
- Open the frontend.
- Register a new customer.
- Explain that customer registration automatically creates a cart.
- Log in with the created account.

### 3:30-5:00 Book browsing and cart operations

- Browse the book list.
- Search for a book.
- Open a book detail page.
- Add at least one book to cart.
- Open cart view.
- Update quantity.
- Remove one item and add it again if needed.

### 5:00-6:30 Checkout and order flow

- Perform checkout.
- Explain that `order_service` reads cart data, then triggers payment and shipping services.
- Open order history and show the created order.

### 6:30-7:30 Review and recommendation flow

- Open a purchased book.
- Submit a rating and review.
- Refresh recommendations.
- Explain that recommendations use data from books and reviews.

### 7:30-8:30 Staff functionality

- Call or demonstrate staff endpoints.
- Show create, update, or delete book flow.
- Explain that staff service uses book service as source of truth.

### 8:30-9:15 Manager functionality

- Open manager dashboard endpoint or API response.
- Explain that manager service aggregates report data from books, orders, and reviews.

### 9:15-10:00 Closing

- Re-open the architecture doc and summarize service separation.
- Mention API documentation and Docker support.
- State clearly what remains for final submission if databases are not yet migrated to MySQL/PostgreSQL.

## Recording checklist

- Keep terminal font readable.
- Zoom browser to at least 110 percent if text is small.
- Prepare one customer account in advance in case registration fails during recording.
- Keep the architecture and API docs open in separate tabs.
- Avoid dead time while services start.