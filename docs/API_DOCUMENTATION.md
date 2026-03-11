# API Documentation

## Access Pattern

For the frontend, all requests go through the API gateway.

Base URL:

```text
http://localhost:8000
```

## Gateway Proxy Endpoints

### Book APIs

`GET /api/book/books/`
- Returns all books.

`GET /api/book/books/{book_id}/`
- Returns one book.

`POST /api/book/books/`
- Creates a book.

`PATCH /api/book/books/{book_id}/`
- Updates a book.

`DELETE /api/book/books/{book_id}/`
- Deletes a book.

### Customer APIs

`POST /api/customer/customers/register/`
- Registers a customer.
- Automatically triggers cart creation.

Example payload:

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "secret123"
}
```

`POST /api/customer/customers/login/`
- Logs in a customer.

Example payload:

```json
{
  "email": "a@example.com",
  "password": "secret123"
}
```

### Cart APIs

`POST /api/cart/carts/`
- Creates a cart for a customer.

`GET /api/cart/carts/customer/{customer_id}/`
- Returns cart and cart items for a customer.

`POST /api/cart/cart-items/`
- Adds an item to cart.

Example payload:

```json
{
  "cart_id": 1,
  "book_id": 2,
  "quantity": 1
}
```

`PATCH /api/cart/cart-items/{item_id}/`
- Updates cart item quantity.

`DELETE /api/cart/cart-items/{item_id}/`
- Removes a cart item.

### Order APIs

`POST /api/order/orders/`
- Creates an order.
- Triggers payment and shipping.

Example payload:

```json
{
  "customer_id": 1,
  "payment_method": "COD",
  "shipping_method": "Express",
  "shipping_address": "123 Test Street"
}
```

`GET /api/order/orders/customer/{customer_id}/`
- Returns order history for a customer.

### Review APIs

`GET /api/review/reviews/`
- Returns all reviews.

`POST /api/review/reviews/`
- Creates a new review.

Example payload:

```json
{
  "customer_id": 1,
  "book_id": 2,
  "rating": 5,
  "comment": "Sach rat hay"
}
```

`GET /api/review/reviews/book/{book_id}/`
- Returns reviews for a specific book.

`GET /api/review/reviews/summary/`
- Returns rating summary by book.

### Recommendation APIs

`GET /api/recommend/recommendations/{customer_id}/`
- Returns personalized recommendation candidates for a customer.

## Service-Internal Endpoints

These endpoints are also available directly on each service port during development.

### book_service
- `GET/POST /books/`
- `GET/PATCH/DELETE /books/{book_id}/`

### customer_service
- `GET/POST /customers/`
- `POST /customers/register/`
- `POST /customers/login/`

### cart_service
- `POST /carts/`
- `GET /carts/customer/{customer_id}/`
- `POST /cart-items/`
- `PATCH/DELETE /cart-items/{item_id}/`

### order_service
- `POST /orders/`
- `GET /orders/customer/{customer_id}/`

### comment_rate_service
- `GET/POST /reviews/`
- `GET /reviews/book/{book_id}/`
- `GET /reviews/summary/`

### recommender_ai_service
- `GET /recommendations/{customer_id}/`

### staff_service
- `GET/POST /staff/`
- `GET/POST /staff/books/`
- `GET/PATCH/DELETE /staff/books/{book_id}/`

### manager_service
- `GET /reports/dashboard/`

### catalog_service
- `GET/POST /categories/`
- `GET /catalog/books/`

### pay_service
- `GET/POST /payment-methods/`
- `POST /payments/charge/`

### ship_service
- `GET/POST /shipping-methods/`
- `POST /shipments/`