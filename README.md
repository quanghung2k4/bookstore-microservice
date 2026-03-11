# Bookstore Microservice

Bookstore Microservice là hệ thống nhà sách xây theo kiến trúc microservice với Django, Django REST Framework, React và API Gateway. Frontend gọi API thông qua gateway, còn các nghiệp vụ được tách thành các service độc lập như sách, khách hàng, giỏ hàng, đơn hàng, thanh toán, vận chuyển, đánh giá và gợi ý.

## Thành phần chính

- `frontend`: giao diện React chạy bằng Vite.
- `api_gateway`: đầu vào duy nhất cho frontend.
- `book_service`: quản lý dữ liệu sách.
- `customer_service`: đăng ký, đăng nhập khách hàng.
- `cart_service`: quản lý giỏ hàng.
- `order_service`: tạo đơn hàng và điều phối thanh toán, vận chuyển.
- `pay_service`: xử lý thông tin thanh toán.
- `ship_service`: xử lý giao hàng.
- `comment_rate_service`: đánh giá và nhận xét sách.
- `recommender_ai_service`: gợi ý sách.
- `staff_service`, `manager_service`, `catalog_service`: nghiệp vụ nội bộ và quản trị.

## Chạy dự án

### Chạy local

Repo có script để chạy nhanh môi trường local:

```powershell
./start_local.ps1
```

Chạy đầy đủ thêm các service nội bộ:

```powershell
./start_local.ps1 -Full
```

Mặc định frontend chạy tại `http://127.0.0.1:5173` và API Gateway tại `http://127.0.0.1:8000`.

### Chạy bằng Docker

Khởi động toàn bộ stack:

```bash
docker compose up --build
```

Chạy nền:

```bash
docker compose up -d --build
```

Dừng stack:

```bash
docker compose down
```

Chi tiết Docker xem thêm trong `DOCKER_SETUP.md`.

## Service Ports

- Frontend: `5173`
- API Gateway: `8000`
- Book Service: `8002`
- Cart Service: `8003`
- Customer Service: `8004`
- Staff Service: `8005`
- Manager Service: `8006`
- Catalog Service: `8007`
- Order Service: `8008`
- Pay Service: `8009`
- Ship Service: `8010`
- Comment/Rate Service: `8011`
- Recommender AI Service: `8012`

## Tài liệu

Toàn bộ tài liệu nằm trong thư mục `docs/`.

- `docs/ARCHITECTURE.md`: kiến trúc tổng thể hệ thống.
- `docs/SERVICE_ARCHITECTURE_DIAGRAMS.md`: sơ đồ chi tiết theo service.
- `docs/API_DOCUMENTATION.md`: tài liệu API và endpoint gateway.
- `docs/TECHNICAL_REPORT.md`: báo cáo kỹ thuật hoàn chỉnh.
- `docs/TECHNICAL_REPORT_TEMPLATE.md`: mẫu báo cáo kỹ thuật.
- `docs/DELIVERABLES_STATUS.md`: trạng thái deliverables.
- `docs/DEMO_VIDEO_SCRIPT.md`: kịch bản demo video.

## Luồng sử dụng cơ bản

1. Mở frontend tại `http://localhost:5173`.
2. Đăng ký hoặc đăng nhập khách hàng.
3. Xem danh sách sách.
4. Thêm sách vào giỏ hàng.
5. Tạo đơn hàng.
6. Kiểm tra thanh toán, vận chuyển, đánh giá và gợi ý.

## Gợi ý đọc tài liệu

Nếu mới vào project, nên đọc theo thứ tự sau:

1. `docs/ARCHITECTURE.md`
2. `docs/API_DOCUMENTATION.md`
3. `DOCKER_SETUP.md`
4. `docs/TECHNICAL_REPORT.md`