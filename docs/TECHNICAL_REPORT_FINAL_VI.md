# Bookstore Microservice System

## Tóm tắt

Tài liệu này trình bày báo cáo kỹ thuật cho dự án Bookstore Microservice System, một hệ thống nhà sách trực tuyến được xây dựng theo kiến trúc microservice. Mục tiêu của dự án là tách biệt các nhóm chức năng nghiệp vụ thành các dịch vụ nhỏ, độc lập, có thể triển khai và mở rộng riêng biệt, đồng thời vẫn phối hợp được với nhau để hoàn thành các luồng nghiệp vụ xuyên suốt như đăng ký tài khoản, duyệt sách, thao tác giỏ hàng, đặt đơn, ghi nhận thanh toán, tạo vận đơn, đánh giá sách và sinh gợi ý.

Hệ thống sử dụng Django và Django REST Framework cho các backend service, React kết hợp Vite cho frontend và API Gateway làm đầu vào thống nhất cho giao diện người dùng. Cách tổ chức này giúp frontend không cần biết chi tiết cổng chạy hoặc địa chỉ nội bộ của từng service. Mọi lời gọi API từ storefront đều đi qua gateway, sau đó gateway sẽ định tuyến hoặc chuyển tiếp đến service phù hợp. Đây là một lựa chọn kiến trúc quan trọng vì nó giúp giảm độ kết dính giữa giao diện và backend, đồng thời giữ cho khả năng thay đổi hạ tầng ở phía sau linh hoạt hơn.

Điểm mạnh của dự án nằm ở việc nhiều quyết định kiến trúc không chỉ tồn tại trên tài liệu mà đã được phản ánh rõ trong mã nguồn. customer_service chủ động gọi cart_service để tạo giỏ hàng ngay sau khi đăng ký thành công. order_service chịu trách nhiệm đọc giỏ hàng, đối chiếu dữ liệu sách, tính tổng tiền, tạo đơn hàng và điều phối gọi pay_service cùng ship_service. recommender_ai_service lấy dữ liệu sách và dữ liệu đánh giá rồi xếp hạng để tạo danh sách gợi ý. Bên cạnh đó, toàn bộ stack còn được đóng gói bằng Docker Compose với PostgreSQL cho từng service ở môi trường triển khai chính thức.

Từ góc nhìn học thuật, dự án là một ví dụ phù hợp để minh họa việc áp dụng microservice vào bài toán thương mại điện tử quy mô vừa. Từ góc nhìn thực hành, đây là một prototype vận hành được, có tài liệu kiến trúc, tài liệu API, tài liệu Docker và một báo cáo kỹ thuật phục vụ nộp bài hoặc trình bày đồ án. Báo cáo dưới đây tập trung mô tả bài toán, mục tiêu, kiến trúc, thiết kế dịch vụ, cách tích hợp, cơ sở dữ liệu, frontend, triển khai, kiểm thử, hạn chế và hướng phát triển tiếp theo.

## 1. Giới thiệu

Một hệ thống bán sách trực tuyến nhìn bề ngoài có vẻ chỉ cần vài chức năng đơn lẻ như hiển thị sách và tạo đơn hàng. Tuy nhiên, khi triển khai thực tế, hệ thống phải đồng thời xử lý nhiều mối quan tâm khác nhau: quản lý kho sách, danh tính người dùng, giỏ hàng đang hoạt động, đơn hàng, thanh toán, giao hàng, đánh giá sau mua, báo cáo nội bộ và gợi ý sản phẩm. Khi tất cả trách nhiệm này được đặt trong một ứng dụng nguyên khối, mã nguồn thường phát triển theo hướng khó tách lớp, khó bảo trì và khó kiểm thử. Một thay đổi nhỏ ở vùng nghiệp vụ này có thể vô tình tác động tới vùng khác không liên quan.

Dự án Bookstore Microservice System được xây dựng với mục tiêu giải quyết vấn đề đó bằng cách tách từng năng lực nghiệp vụ thành một service độc lập. Mỗi service được tổ chức như một dự án Django riêng, có model, serializer, URL, settings và database ownership riêng. Điều này giúp mã nguồn gọn hơn, trách nhiệm rõ hơn và tạo ra khả năng thay đổi theo từng thành phần. book_service tập trung vào dữ liệu sách, customer_service tập trung vào tài khoản, cart_service quản lý trạng thái giỏ hàng, order_service điều phối checkout, còn các service khác như pay_service, ship_service, comment_rate_service và recommender_ai_service đảm nhiệm những chức năng phụ trợ nhưng vẫn rất quan trọng đối với trải nghiệm người dùng.

Một điểm nổi bật của hệ thống là frontend được thiết kế để luôn đi qua API Gateway. Trong nhiều đồ án microservice, frontend vẫn gọi thẳng từng service, khiến việc chia service ở backend không đem lại nhiều lợi ích trong tích hợp. Ở dự án này, gateway đóng vai trò cửa ngõ chung, nhờ đó frontend chỉ cần biết một đầu mối truy cập duy nhất. Điều này vừa phù hợp với lý thuyết về API Gateway Pattern, vừa thuận tiện cho triển khai Docker và cho hoạt động demo hệ thống.

## 2. Bài toán, mục tiêu và phạm vi

Bài toán mà dự án hướng tới là xây dựng một nền tảng nhà sách trực tuyến với đầy đủ các thành phần cần thiết cho luồng mua hàng cơ bản. Về phía người dùng cuối, hệ thống phải cho phép đăng ký, đăng nhập, duyệt danh sách sách, xem chi tiết sách, thêm sách vào giỏ hàng, thay đổi số lượng, xóa mục khỏi giỏ, tạo đơn hàng, xem lịch sử đơn và gửi đánh giá. Về phía nội bộ, hệ thống cần có các service hỗ trợ nhân viên, quản lý và danh mục để thể hiện đầy đủ bức tranh nghiệp vụ của một nền tảng thương mại điện tử thu gọn.

Mục tiêu kỹ thuật của dự án có thể chia thành bốn nhóm. Nhóm thứ nhất là tách nghiệp vụ thành các service có trách nhiệm rõ ràng, giảm sự phụ thuộc trực tiếp về mã và dữ liệu. Nhóm thứ hai là xây dựng luồng tích hợp bằng REST API, bảo đảm rằng các service giao tiếp qua HTTP thay vì truy cập trực tiếp database của nhau. Nhóm thứ ba là đặt API Gateway làm điểm truy cập thống nhất cho frontend. Nhóm thứ tư là hỗ trợ triển khai đồng bộ nhiều thành phần bằng Docker Compose với PostgreSQL nhằm bám sát yêu cầu về cơ sở dữ liệu độc lập theo service.

Phạm vi hiện tại của hệ thống tập trung vào việc chứng minh tính đúng đắn của kiến trúc và các chức năng cốt lõi hơn là tối ưu toàn diện cho sản phẩm thương mại hoàn chỉnh. Vì vậy, một số năng lực nâng cao như xác thực bằng JWT, tracing phân tán, retry policy, circuit breaker, logging tập trung hoặc gợi ý bằng học máy thực thụ chưa phải trọng tâm chính. Dù vậy, phần khung hiện tại đã đủ rõ ràng để đóng vai trò nền tảng cho những cải tiến này trong giai đoạn tiếp theo.

## 3. Phân tích yêu cầu hệ thống

Dựa trên README, tài liệu API, tài liệu kiến trúc và mã nguồn của các service, có thể thấy hệ thống được xây quanh một số yêu cầu chức năng quan trọng. Đầu tiên, người dùng phải xem được danh sách sách và chi tiết từng đầu sách. Thứ hai, người dùng cần có tài khoản để truy cập các chức năng cá nhân hóa như giỏ hàng, đơn hàng và đánh giá. Thứ ba, sau khi đăng ký tài khoản, một giỏ hàng phải được tạo tự động để giảm bước thao tác ban đầu cho người dùng. Thứ tư, luồng đặt hàng phải đủ hoàn chỉnh để từ giỏ hàng có thể sinh ra đơn hàng, bản ghi thanh toán và bản ghi vận chuyển. Cuối cùng, hệ thống cần hỗ trợ đánh giá và gợi ý để hoàn thiện trải nghiệm sau mua.

Về yêu cầu phi chức năng, dự án nhấn mạnh nhiều vào khả năng tách lớp, tài liệu hóa và triển khai lặp lại được. Việc có các tài liệu riêng cho kiến trúc, sơ đồ từng service, API, Docker và tình trạng deliverables cho thấy hệ thống không chỉ được viết để chạy mà còn được chuẩn bị cho việc trình bày và đánh giá. Docker Compose đóng vai trò quan trọng trong việc giảm sai lệch giữa môi trường phát triển và môi trường trình diễn, đồng thời làm cho việc khởi động toàn bộ stack trở nên nhất quán hơn.

Một yêu cầu đáng chú ý khác là tính độc lập dữ liệu. Theo tài liệu deliverables và docker-compose.yml, mỗi service trong môi trường Docker được gán một cơ sở dữ liệu PostgreSQL riêng. Điều này không chỉ để đáp ứng yêu cầu bài tập mà còn phản ánh đúng tinh thần microservice. Nếu các service vẫn chia sẻ cùng một schema hoặc truy cập chéo bảng của nhau, ranh giới nghiệp vụ sẽ trở nên mờ và lợi ích kiến trúc sẽ suy giảm đáng kể.

## 4. Kiến trúc tổng thể của giải pháp

Kiến trúc chung của hệ thống gồm ba lớp. Lớp ngoài cùng là frontend React, nơi người dùng thực hiện các thao tác như đăng nhập, duyệt sách, quản lý giỏ hàng và xem đơn hàng. Lớp giữa là api_gateway, chịu trách nhiệm tiếp nhận tất cả yêu cầu API từ frontend. Lớp trong cùng là tập hợp các backend service viết bằng Django, mỗi service chịu trách nhiệm cho một năng lực nghiệp vụ. Sơ đồ trong tài liệu kiến trúc chỉ ra rằng frontend luôn đi vào gateway trước, sau đó gateway mới gọi tới book_service, customer_service, cart_service, order_service, comment_rate_service hoặc recommender_ai_service tùy theo loại request.

API Gateway ở đây không chỉ đơn thuần là một reverse proxy cấu hình tĩnh. Trong mã nguồn, gateway có hàm chuyển tiếp request, xây dựng URL đích từ upstream path, giữ nguyên query string và chuyển tiếp method, body cùng content type. Nếu service đích thất bại hoặc không phản hồi, gateway trả về lỗi 503 với thông tin chi tiết. Thiết kế này tạo ra một lớp trung gian hữu ích để che giấu topology nội bộ khỏi frontend, đồng thời giúp chuẩn hóa cách xử lý lỗi tích hợp.

Từ phía frontend, cấu hình Vite proxy tất cả đường dẫn bắt đầu bằng /api về cổng 8000 của gateway. Điều này có nghĩa là code giao diện chỉ nhìn thấy một backend thống nhất, không phụ thuộc vào việc book_service đang chạy ở cổng 8002 hay order_service ở cổng 8008. Đây là một biểu hiện cụ thể của sự nhất quán kiến trúc giữa tầng giao diện và tầng dịch vụ, giúp quá trình triển khai bằng Docker hoặc thay đổi hạ tầng về sau đơn giản hơn nhiều.

## 5. Thiết kế chi tiết các microservice

### 5.1 API Gateway

api_gateway là cửa ngõ công khai của toàn hệ thống. Dựa trên tài liệu API và mã nguồn views.py, gateway hiện hỗ trợ chuyển tiếp các nhóm API chính cho sách, khách hàng, giỏ hàng, đơn hàng, đánh giá và gợi ý. Nó cũng có sẵn các điểm vào cho staff, manager, catalog, pay và ship để phục vụ mở rộng. Với vai trò này, gateway giúp frontend tránh phụ thuộc trực tiếp vào địa chỉ thật của từng service và tạo ra một API thống nhất cho toàn bộ storefront.

### 5.2 book_service

book_service là nguồn dữ liệu chuẩn cho thực thể sách. Service này chịu trách nhiệm lưu trữ và cung cấp các thao tác CRUD cho đầu sách. Các service khác có thể đọc hoặc dựa vào dữ liệu sách, nhưng không nên trực tiếp sở hữu hoặc thay đổi dữ liệu đó ở nơi khác. Đây là quyết định hợp lý vì dữ liệu sách là một bounded context riêng biệt, có thể phát triển độc lập với giỏ hàng, đơn hàng hay đánh giá.

### 5.3 customer_service

customer_service xử lý đăng ký và đăng nhập khách hàng. Điểm mạnh nằm ở chỗ service không chỉ lưu người dùng mà còn áp dụng một quy tắc nghiệp vụ cụ thể: sau khi đăng ký thành công, hệ thống sẽ tạo giỏ hàng mặc định bằng cách gọi sang cart_service. Trong mã nguồn, nếu lời gọi này thất bại thì customer vừa được tạo sẽ bị xóa. Cơ chế đó giúp tránh trạng thái không nhất quán, nơi có tài khoản nhưng không có giỏ hàng tương ứng.

### 5.4 cart_service

cart_service lưu trữ giỏ hàng và các mục trong giỏ. Nó hỗ trợ tạo giỏ, lấy giỏ theo khách hàng, thêm mục, cập nhật số lượng và xóa mục. Từ góc nhìn nghiệp vụ, cart_service đóng vai trò duy trì trạng thái mua sắm tạm thời trước khi checkout. Từ góc nhìn kiến trúc, service này tạo ra một vùng tách biệt rõ ràng giữa việc “người dùng đang cân nhắc mua gì” và việc “người dùng đã đặt hàng gì”. Sự tách biệt này rất có ích cho khả năng thay đổi logic checkout về sau.

### 5.5 order_service

order_service là thành phần điều phối luồng đặt hàng. Khi nhận yêu cầu tạo đơn, service đọc dữ liệu giỏ hàng từ cart_service, đọc danh sách sách từ book_service để tính toán giá trị đơn, tạo bản ghi đơn hàng và chi tiết đơn hàng, sau đó gọi pay_service và ship_service để tạo các bản ghi thanh toán và giao vận. Nếu một trong hai bước downstream thất bại, service sẽ xóa đơn vừa tạo như một cơ chế rollback ở mức ứng dụng. Nếu thành công, service xóa các mục đã mua trong giỏ và cập nhật trạng thái đơn. Đây là phần thể hiện rõ nhất tư duy orchestration trong dự án.

### 5.6 pay_service và ship_service

pay_service và ship_service là các service hỗ trợ cho checkout. Chúng không cần biết toàn bộ ngữ cảnh đặt hàng, mà chỉ tập trung lưu thông tin thanh toán hoặc vận chuyển. Khi order_service đã hoàn tất bước dựng đơn hàng, nó lần lượt gọi hai service này để hoàn thiện quy trình. Cách chia nhỏ này giúp cho mỗi service giữ được trách nhiệm hẹp và dễ thay đổi. Nếu sau này muốn thay thế cách lưu thanh toán hoặc tích hợp với nhà vận chuyển khác, phạm vi ảnh hưởng sẽ được giới hạn tốt hơn.

### 5.7 comment_rate_service

comment_rate_service quản lý điểm đánh giá và nhận xét văn bản của khách hàng. Tài liệu API cho thấy service này có thể trả về toàn bộ review, review theo từng book và dữ liệu tổng hợp rating. Điều này cho phép frontend vừa hiển thị nhận xét chi tiết trên trang sách, vừa dùng dữ liệu tổng hợp cho các logic cao hơn như đề xuất sách hoặc báo cáo cho quản lý.

### 5.8 recommender_ai_service

recommender_ai_service là service chuyên trách logic gợi ý. Ở phiên bản hiện tại, service lấy danh sách sách từ book_service và dữ liệu rating tổng hợp từ comment_rate_service, sau đó sắp xếp theo điểm trung bình và tồn kho để trả về năm gợi ý đầu tiên. Cách làm này chưa phải là mô hình recommendation phức tạp, nhưng nó rất phù hợp với một đồ án microservice vì chứng minh được việc tách riêng năng lực gợi ý thành một service độc lập có thể phát triển dần theo thời gian.

### 5.9 staff_service, manager_service và catalog_service

Ba service này đại diện cho các bối cảnh nghiệp vụ ngoài luồng mua hàng của khách hàng. staff_service phục vụ thao tác quản lý sách ở góc độ nhân viên. manager_service tổng hợp dữ liệu từ nhiều nguồn để tạo báo cáo hoặc dashboard cho quản lý. catalog_service hỗ trợ duyệt sách theo cấu trúc danh mục. Sự hiện diện của chúng làm cho dự án có chiều sâu hơn, vì hệ thống thương mại điện tử thực tế không chỉ có người mua mà còn có người vận hành nội bộ.

## 6. Thiết kế API và các luồng nghiệp vụ chính

Thiết kế API của hệ thống bám theo phong cách REST và được mô tả khá rõ trong docs/API_DOCUMENTATION.md. Một số endpoint quan trọng gồm GET /api/book/books/ để lấy danh sách sách, POST /api/customer/customers/register/ để đăng ký, POST /api/customer/customers/login/ để đăng nhập, GET /api/cart/carts/customer/{customer_id}/ để lấy trạng thái giỏ hàng, POST /api/order/orders/ để tạo đơn hàng, GET /api/review/reviews/book/{book_id}/ để lấy đánh giá theo sách và GET /api/recommend/recommendations/{customer_id}/ để lấy gợi ý. Cách đặt đường dẫn này khá trực quan và nhất quán với cách tổ chức gateway.

Luồng đăng ký tài khoản là ví dụ điển hình cho giao tiếp service-to-service. Sau khi frontend gửi dữ liệu đăng ký qua gateway, customer_service xác thực dữ liệu, lưu thông tin khách hàng, mã hóa mật khẩu rồi gọi cart_service để tạo giỏ hàng mặc định. Nếu bước tạo giỏ thất bại, quá trình đăng ký bị rollback. Điều này thể hiện một tư duy thiết kế có trách nhiệm: thay vì chấp nhận trạng thái không đầy đủ, hệ thống ưu tiên nhất quán nghiệp vụ.

Luồng đặt hàng cho thấy rõ vai trò orchestration của order_service. Service này đọc giỏ hiện tại, đối chiếu book_id với book_service, tính tổng tiền, tạo bản ghi Order và OrderItem, rồi gọi pay_service và ship_service. Sau khi nhận được phản hồi thành công từ các service downstream, order_service xóa các mục trong giỏ và đánh dấu trạng thái confirmed. Đây là luồng quan trọng nhất của toàn hệ thống vì nó kết nối nhiều bounded context trong cùng một giao dịch nghiệp vụ ở mức ứng dụng.

Sau giao dịch, hệ thống tiếp tục hỗ trợ vòng lặp phản hồi thông qua đánh giá và gợi ý. comment_rate_service nhận review mới và cung cấp dữ liệu theo sách hoặc dữ liệu tổng hợp. recommender_ai_service tận dụng dữ liệu đó để tạo recommendation cho khách hàng. Cách tách hai service này khỏi luồng checkout giúp hệ thống dễ mở rộng từng phần mà không làm phức tạp service đơn hàng.

## 7. Chiến lược dữ liệu và cơ sở dữ liệu

Một nguyên tắc cốt lõi của kiến trúc microservice là mỗi service phải sở hữu dữ liệu của riêng mình. Dự án đã phản ánh nguyên tắc này trong cấu hình Docker. docker-compose.yml khai báo PostgreSQL dùng chung như một máy chủ database, nhưng mỗi service được gán một database độc lập thông qua các biến môi trường DB_NAME khác nhau. Ví dụ, book_service dùng book_service_db, customer_service dùng customer_service_db, cart_service dùng cart_service_db và tương tự cho các service còn lại. Cách làm này vừa tiết kiệm tài nguyên hơn việc chạy nhiều container PostgreSQL, vừa vẫn giữ được tính độc lập dữ liệu.

Trong môi trường phát triển local, các Django settings vẫn hỗ trợ SQLite như một lựa chọn fallback khi biến môi trường database chưa được cấu hình. Đây là cách tiếp cận thực dụng vì giúp khởi động nhanh khi cần chỉnh sửa một service độc lập. Tuy nhiên, tài liệu deliverables đã phân biệt rất rõ rằng đường triển khai chính thức và đường nộp bài dùng PostgreSQL. Sự phân biệt này quan trọng để vừa thuận tiện cho phát triển, vừa không vi phạm yêu cầu kỹ thuật của hệ thống mục tiêu.

Về cách trao đổi dữ liệu, các service giao tiếp với nhau qua API và truyền ID hoặc payload ở mức giao tiếp, thay vì truy cập chéo bảng dữ liệu. Điều này làm tăng số lượng lời gọi HTTP, nhưng bù lại giữ cho ranh giới giữa các service sạch và dễ hiểu hơn. Đây là đánh đổi điển hình của microservice: hy sinh một phần đơn giản cục bộ để đạt được tính độc lập, khả năng bảo trì và khả năng thay thế thành phần về lâu dài.

## 8. Frontend và trải nghiệm người dùng

Frontend của dự án được viết bằng React và chạy qua Vite. App.jsx cho thấy ứng dụng được tổ chức theo hai trạng thái lớn: khi chưa có currentCustomer thì hiển thị khu vực đăng ký hoặc đăng nhập; khi đã có người dùng thì chuyển sang shell của storefront. Kiến trúc này giúp code giao diện rõ ràng hơn, bởi phần xác thực và phần thao tác nghiệp vụ sau đăng nhập được tách biệt về trách nhiệm. Nó cũng phản ánh đúng luồng sử dụng của một cửa hàng trực tuyến, nơi nhiều tính năng chỉ có ý nghĩa sau khi người dùng được nhận diện.

Frontend còn lưu phiên khách hàng vào localStorage với khóa bookstore-customer-session. Trong bối cảnh prototype hoặc đồ án, đây là một lựa chọn hợp lý vì dễ triển khai, dễ quan sát và đủ tốt cho trải nghiệm trình diễn. Người dùng không bị mất trạng thái ngay khi tải lại trang. Tuy nhiên, đây cũng là một điểm cần nâng cấp nếu dự án đi xa hơn, vì cơ chế local session đơn giản không đáp ứng đầy đủ các yêu cầu bảo mật và quản lý phiên của môi trường production.

Một lợi ích rất rõ của cấu trúc frontend hiện tại là toàn bộ API call đều đi qua gateway. vite.config.js cấu hình proxy toàn bộ /api về api_gateway, nhờ đó giao diện không phụ thuộc vào cổng thật của backend service. Chính điều này làm cho việc chạy local bằng start_local.ps1 và việc chuyển sang Docker Compose trở nên thống nhất hơn. Từ góc nhìn kiến trúc, frontend đã được thiết kế theo đúng tinh thần gateway-first chứ không chỉ là một lớp giao diện tạm thời gọi API rời rạc.

## 9. Triển khai, vận hành và Docker

Dự án hỗ trợ hai cách chạy chính. Cách thứ nhất là chạy local bằng script PowerShell start_local.ps1. Script này tự động mở các cửa sổ PowerShell riêng cho api_gateway, book_service, customer_service, cart_service, order_service, pay_service, ship_service, comment_rate_service, recommender_ai_service và frontend. Khi chạy với tham số Full, script khởi động thêm staff_service, manager_service và catalog_service. Đây là giải pháp thuận tiện cho phát triển và demo vì người dùng không cần tự khởi động từng service bằng tay.

Cách chạy thứ hai là dùng Docker Compose. Tài liệu DOCKER_SETUP.md và tệp docker-compose.yml chỉ ra rằng toàn bộ stack gồm frontend, api_gateway, các backend service và PostgreSQL đều có thể được dựng bằng một lệnh. Mỗi service có Dockerfile riêng, thực hiện migrate trước khi chạy gunicorn, còn frontend nhận biến VITE_API_PROXY_TARGET để trỏ tới gateway trong mạng nội bộ Docker. Cấu hình depends_on và healthcheck cho PostgreSQL giúp giảm rủi ro lỗi khởi động do phụ thuộc chưa sẵn sàng.

Việc toàn bộ container dùng chung bookstore-network giúp các service giao tiếp với nhau qua tên service thay vì địa chỉ IP tĩnh. Đây là một lựa chọn triển khai tiêu chuẩn nhưng rất quan trọng, vì nó làm cho cấu hình dễ đọc, dễ tái tạo và bền vững hơn khi môi trường thay đổi. Nhìn tổng thể, phần Docker của dự án không chỉ để “có cho đủ”, mà đã mô tả được tương đối đầy đủ cách các thành phần của hệ thống được tổ chức trong một môi trường chạy thống nhất.

## 10. Kiểm thử và đánh giá kết quả

Hiện trạng kiểm thử của dự án cho thấy nhóm phát triển đã bắt đầu chú ý tới automated test nhưng chưa phủ đều trên toàn bộ hệ thống. customer_service có các test thực sự hữu ích: kiểm tra đăng ký có tạo giỏ hay không, mật khẩu có được băm đúng cách hay không, đăng nhập thành công với thông tin đúng và bị từ chối với thông tin sai. Các test này có giá trị vì chúng chạm đúng vào các quy tắc nghiệp vụ quan trọng nhất của service khách hàng.

Ngược lại, book_service và cart_service hiện vẫn để file tests.py ở trạng thái khởi tạo mặc định. Điều này cho thấy độ bao phủ test của toàn dự án còn thấp, đặc biệt ở các luồng cần xác minh qua nhiều service. Với kiến trúc microservice, rủi ro thường nằm ở biên tích hợp giữa các thành phần. Vì vậy, để hệ thống đáng tin cậy hơn, giai đoạn tiếp theo nên ưu tiên viết integration test cho các luồng như đăng ký-kèm-tạo-giỏ, checkout-kèm-thanh-toán-và-vận-chuyển, cũng như gửi đánh giá-kèm-cập-nhật-gợi-ý.

Mặc dù chưa có bộ test tự động đầy đủ, dự án vẫn cung cấp một kịch bản xác minh thủ công tương đối rõ ràng trong tài liệu Docker Setup. Theo kịch bản này, người dùng mở frontend, đăng ký tài khoản, thêm sách vào giỏ, đặt hàng, xác nhận thanh toán và giao hàng, sau đó gửi đánh giá và làm mới gợi ý. Kịch bản như vậy rất hữu ích cho hoạt động demo vì nó cho thấy được mối liên kết thực sự giữa các service trong một chuỗi nghiệp vụ hoàn chỉnh.

## 11. Thách thức, hạn chế và hướng phát triển

Thách thức đầu tiên của dự án là giữ cho kiến trúc microservice được thể hiện trung thực ở cả tài liệu lẫn mã nguồn. Không khó để vẽ ra sơ đồ nhiều service, nhưng khó hơn nhiều để đảm bảo frontend không phá vỡ kiến trúc bằng cách gọi trực tiếp từng service hoặc service này âm thầm phụ thuộc vào database của service khác. Ở điểm này, dự án đã làm khá tốt khi đưa frontend đi qua gateway và thiết kế database ownership theo service trong môi trường Docker. Tuy nhiên, việc duy trì tính kỷ luật kiến trúc này khi dự án mở rộng vẫn là một thách thức lâu dài.

Hạn chế lớn tiếp theo là mức độ hoàn thiện của các cơ chế production-grade. Hệ thống hiện chủ yếu dựa vào request đồng bộ giữa các service qua thư viện requests. Cách này dễ hiểu và phù hợp cho đồ án, nhưng khi quy mô hoặc độ phức tạp tăng lên, hệ thống sẽ cần timeout, retry, circuit breaker, logging tập trung và tracing để theo dõi request xuyên service. Tương tự, xác thực hiện tại mới phù hợp cho prototype chứ chưa nên xem là đủ mạnh cho môi trường thực tế.

Riêng với recommender_ai_service, logic xếp hạng dựa trên rating trung bình và tồn kho là cách tiếp cận hợp lý để bắt đầu, nhưng còn khá đơn giản. Nếu có thêm thời gian, nhóm phát triển có thể mở rộng service này bằng collaborative filtering, content-based recommendation hoặc mô hình học máy dựa trên lịch sử tương tác. Khi đó, recommender_ai_service sẽ không chỉ là một minh họa kiến trúc mà còn trở thành nơi thử nghiệm các kỹ thuật AI hoặc data-driven feature của hệ thống.

Nhìn về phía trước, các hướng phát triển nên bao gồm: bổ sung xác thực bằng token, tăng mạnh độ bao phủ test, thêm CI/CD, chuẩn hóa error handling ở gateway, xây dựng dashboard quan sát, và hoàn thiện giao diện quản trị nội bộ. Các cải tiến này sẽ không làm thay đổi cấu trúc lõi của dự án, nhưng sẽ nâng chất lượng hệ thống lên mức gần hơn với một sản phẩm có thể triển khai thử nghiệm thực tế.

## 12. Kết luận

Bookstore Microservice System là một dự án có giá trị thực tiễn và học thuật rõ ràng. Dự án cho thấy cách áp dụng microservice vào một miền nghiệp vụ quen thuộc nhưng đủ phong phú để bộc lộ nhiều vấn đề thiết kế quan trọng: phân ranh giới service, điều phối giao dịch nhiều bước, quản lý quyền sở hữu dữ liệu, chuẩn hóa đầu vào qua gateway và duy trì sự nhất quán giữa frontend, backend và hạ tầng triển khai. Tài liệu, cấu hình và mã nguồn của hệ thống bổ trợ cho nhau khá tốt, giúp người đọc không chỉ hiểu được ý tưởng mà còn quan sát được cách ý tưởng được hiện thực.

Nếu xem đây là một đồ án hoặc một prototype kỹ thuật, hệ thống đã đạt được phần cốt lõi cần thiết: có kiến trúc rõ ràng, có frontend, có API Gateway, có các service nghiệp vụ chính, có Docker Compose và có khả năng trình diễn các luồng quan trọng. Nếu xem đây là nền tảng cho giai đoạn phát triển tiếp theo, dự án cũng đã tạo ra một bộ khung đủ tốt để tiếp tục mở rộng về kiểm thử, bảo mật, giám sát và chất lượng recommendation. Vì vậy, đây là một cơ sở phù hợp để hoàn thành deliverable “8-12 page technical report” và đồng thời là nền móng tốt cho các bước cải tiến kế tiếp.

## Tài liệu tham chiếu

- README.md
- DOCKER_SETUP.md
- docs/ARCHITECTURE.md
- docs/SERVICE_ARCHITECTURE_DIAGRAMS.md
- docs/API_DOCUMENTATION.md
- docs/DELIVERABLES_STATUS.md
- docs/TECHNICAL_REPORT.md
- docker-compose.yml
- api_gateway/api_gateway/views.py
- customer_service/app/views.py
- order_service/app/views.py
- recommender_ai_service/app/views.py
- frontend/src/App.jsx
- frontend/src/app/useBookstoreApp.js
- frontend/vite.config.js
- start_local.ps1