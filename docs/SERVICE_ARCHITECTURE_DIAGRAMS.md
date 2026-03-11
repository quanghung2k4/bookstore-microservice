# Service Architecture Diagrams

This document provides a focused architecture view for each service in the bookstore system.

## 1. api_gateway

```mermaid
flowchart LR
    Frontend[React Frontend] --> Gateway[api_gateway]
    Gateway --> Book[book_service]
    Gateway --> Customer[customer_service]
    Gateway --> Cart[cart_service]
    Gateway --> Order[order_service]
    Gateway --> Review[comment_rate_service]
    Gateway --> Recommend[recommender_ai_service]
```

## 2. book_service

```mermaid
flowchart LR
    Staff[staff_service] --> Book[book_service]
    Catalog[catalog_service] --> Book
    Manager[manager_service] --> Book
    Gateway[api_gateway] --> Book
    Book --> BookDB[(Book Database)]
```

## 3. customer_service

```mermaid
flowchart LR
    Gateway[api_gateway] --> Customer[customer_service]
    Customer --> CustomerDB[(Customer Database)]
    Customer --> Cart[cart_service]
```

## 4. cart_service

```mermaid
flowchart LR
    Gateway[api_gateway] --> Cart[cart_service]
    Customer[customer_service] --> Cart
    Cart --> Book[book_service]
    Cart --> CartDB[(Cart Database)]
```

## 5. order_service

```mermaid
flowchart LR
    Gateway[api_gateway] --> Order[order_service]
    Order --> Cart[cart_service]
    Order --> Book[book_service]
    Order --> Pay[pay_service]
    Order --> Ship[ship_service]
    Order --> OrderDB[(Order Database)]
```

## 6. pay_service

```mermaid
flowchart LR
    Order[order_service] --> Pay[pay_service]
    Pay --> PayDB[(Payment Database)]
```

## 7. ship_service

```mermaid
flowchart LR
    Order[order_service] --> Ship[ship_service]
    Ship --> ShipDB[(Shipping Database)]
```

## 8. comment_rate_service

```mermaid
flowchart LR
    Gateway[api_gateway] --> Review[comment_rate_service]
    Manager[manager_service] --> Review
    Review --> ReviewDB[(Review Database)]
```

## 9. recommender_ai_service

```mermaid
flowchart LR
    Gateway[api_gateway] --> Recommend[recommender_ai_service]
    Recommend --> Book[book_service]
    Recommend --> Review[comment_rate_service]
    Recommend --> RecommendDB[(Recommendation Database)]
```

## 10. staff_service

```mermaid
flowchart LR
    StaffUI[Staff Client or API Caller] --> Staff[staff_service]
    Staff --> Book[book_service]
    Staff --> StaffDB[(Staff Database)]
```

## 11. manager_service

```mermaid
flowchart LR
    ManagerUI[Manager Client or API Caller] --> Manager[manager_service]
    Manager --> Book[book_service]
    Manager --> Order[order_service]
    Manager --> Review[comment_rate_service]
    Manager --> ManagerDB[(Manager Database)]
```

## 12. catalog_service

```mermaid
flowchart LR
    CatalogClient[Catalog Client or API Caller] --> Catalog[catalog_service]
    Catalog --> Book[book_service]
    Catalog --> CatalogDB[(Catalog Database)]
```