# Technical Report Template

## Title Page
- Project title: Bookstore Microservice System
- Course / subject
- Team members
- Student IDs
- Submission date

## 1. Introduction
- Project objective
- Functional requirements summary
- Technical requirements summary

## 2. Problem Statement
- Why a bookstore domain was chosen
- Why microservices are suitable for this problem
- Key users: customer, staff, manager

## 3. System Architecture
- Overview of the full system
- API gateway role
- Frontend to gateway to service communication flow
- Independent database ownership per service

Suggested figure:
- Include the Mermaid diagram from `docs/ARCHITECTURE.md`

## 4. Service Design

### 4.1 api_gateway
- Responsibilities
- Exposed proxy routes
- Why it is useful in this architecture

### 4.2 book_service
- Data managed
- CRUD operations
- Relationship to staff and catalog

### 4.3 customer_service
- Registration
- Login
- Auto cart creation flow

### 4.4 cart_service
- Cart lifecycle
- Add/update/remove cart items

### 4.5 order_service
- Checkout process
- Order history
- Payment and shipment triggers

### 4.6 pay_service
- Payment handling role

### 4.7 ship_service
- Shipment handling role

### 4.8 comment_rate_service
- Ratings and reviews

### 4.9 recommender_ai_service
- Recommendation logic

### 4.10 staff_service
- Staff operations

### 4.11 manager_service
- Dashboard and reporting

### 4.12 catalog_service
- Categories and browsing support

## 5. API Design
- REST style and JSON payloads
- Inter-service communication using HTTP requests
- Important endpoints summary

Suggested appendix:
- Reference `docs/API_DOCUMENTATION.md`

## 6. Database Design
- Explain independent data ownership
- Describe why each service uses its own storage
- Mention that the current implementation uses per-service SQLite files.
- Clarify that the provided Docker Compose setup runs those databases inside each container unless explicit persistent mounts are added.

## 7. Functional Demonstration

### 7.1 Customer registration creates cart
- Steps
- Screenshots or API calls

### 7.2 Staff manages books
- Steps

### 7.3 Customer cart operations
- Steps

### 7.4 Order triggers payment and shipping
- Steps

### 7.5 Customer rates books
- Steps

## 8. Docker Deployment
- Explain Dockerfiles per service
- Explain Docker Compose orchestration
- Explain shared network and separate service containers

## 9. Testing and Validation
- Local service checks
- Frontend build verification
- Gateway proxy verification
- Example request/response results

## 10. Challenges and Lessons Learned
- Service communication
- Debugging local ports
- Keeping frontend consistent with gateway design

## 11. Future Improvements
- Replace SQLite with production-grade DB engines
- Add authentication tokens
- Add observability and centralized logging
- Add automated tests and CI/CD

## 12. Conclusion
- Summarize what the project achieved
- Reconfirm fulfillment of functional and technical requirements

## Appendix A. Demo Video Script Outline
- Intro and system overview
- Registration and login
- Add to cart and update cart
- Checkout to payment and shipping
- Review and recommendation
- Staff and manager features

## Appendix B. Repository Structure
- Paste or summarize the final project structure