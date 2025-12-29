# Database Practical - Tổng hợp các chức năng đã thực hiện

Dự án này bao gồm các bài thực hành về cơ sở dữ liệu quan hệ (SQL Server) và cơ sở dữ liệu NoSQL (MongoDB).

---

## 📁 Cấu trúc thư mục

### 1. **RDM/** - Relational Database Management (SQL Server)
Thư mục chứa các bài thực hành về SQL Server với hệ thống ngân hàng (Bank_DB).

### 2. **No_SQL/mongodb/** - MongoDB Queries
Thư mục chứa các bài thực hành về MongoDB với các collection mẫu và các truy vấn.

---

## 🗄️ RDM - SQL Server

### **Functions (Hàm)**

#### Scalar Functions (Hàm trả về giá trị đơn)
- **f_countAccount**: Đếm số lượng tài khoản của một chủ tài khoản dựa trên AccountHolderID
- **f_sumAccount**: Tính tổng số dư của tất cả tài khoản thuộc một chủ tài khoản
- **f_taxCode**: Lấy mã số thuế (TaxCode) của một chủ tài khoản
- **f_balance**: Lấy số dư hiện tại của một tài khoản
- **f_transaction1**: Tính tổng số tiền giao dịch theo loại (rút/nạp) của một tài khoản
- **f_countInactiveAccount**: Đếm tổng số tài khoản đang ở trạng thái không hoạt động (inactive)

#### Table-Valued Functions (Hàm trả về bảng)
- **f_getActiveAccounts**: Trả về danh sách tất cả các tài khoản đang hoạt động của một chủ tài khoản, bao gồm AccountHolderId, status và Balance
- **f_getTaxiCode**: Trả về danh sách tất cả các giao dịch của chủ tài khoản có mã số thuế cụ thể, bao gồm accountID, transactionTime, contentTransaction và amount

### **Stored Procedures (Thủ tục lưu trữ)**

#### Quản lý tài khoản và giao dịch
- **sp_account_statement**: Hiển thị tất cả các giao dịch của một tài khoản trong khoảng thời gian cụ thể (từ startDate đến endDate)
- **sp_insert_AccountHolder**: Thêm mới một chủ tài khoản với kiểm tra điều kiện đầu vào
- **sp_Accounts**: Phân loại tài khoản theo số dư thành các hạng: Diamond (≥10000), Gold (≥5000), Silver (≥3000), Normal (<3000)

#### Giao dịch ngân hàng với Transaction Management
- **sp_withdraw**: Thực hiện rút tiền từ tài khoản với các kiểm tra:
  - Xác thực tài khoản tồn tại
  - Kiểm tra số dư đủ (cho phép thấu chi 50)
  - Kiểm tra trạng thái tài khoản (phải active)
  - Xử lý race condition với UPDLOCK và ROWLOCK
  - Ghi log giao dịch tự động
  - Sử dụng TRY-CATCH để xử lý lỗi và rollback transaction

- **sp_deposit**: Thực hiện nộp tiền vào tài khoản với các kiểm tra:
  - Xác thực số tiền hợp lệ (> 0)
  - Kiểm tra tài khoản tồn tại
  - Kiểm tra trạng thái tài khoản (phải active)
  - Ghi log giao dịch tự động
  - Xử lý transaction an toàn với rollback khi có lỗi

- **sp_transfer**: Thực hiện chuyển tiền giữa hai tài khoản với các tính năng:
  - Ngăn chặn chuyển tiền cho chính mình
  - Kiểm tra số dư đủ (duy trì tối thiểu 50)
  - Kiểm tra trạng thái cả hai tài khoản
  - Xử lý deadlock bằng cách khóa tài khoản theo thứ tự ID
  - Ghi log cho cả tài khoản gửi và nhận
  - Đảm bảo tính nguyên tử (atomicity) của giao dịch

### **Triggers (Kích hoạt tự động)**

#### Triggers trên bảng TransactionLog
- **trig_transaction_logs**: Trigger AFTER INSERT/UPDATE để:
  - Tự động cập nhật transactionTime thành thời gian hệ thống
  - Kiểm tra và từ chối các giao dịch có số tiền ≤ 0
  - Rollback transaction khi vi phạm quy tắc nghiệp vụ

#### Triggers trên bảng Accounts
- **trig_accounts_no_update_deleted**: Ngăn chặn cập nhật các tài khoản đã bị xóa (status = 'deleted')
- **tg_checkBalance**: Đảm bảo số dư tài khoản luôn > 50 khi insert hoặc update
- **tg_insertAccountHolder**: Tự động tạo tài khoản phụ (in_active, balance 100) khi tạo tài khoản mới
- **tg_deleteAccount**: INSTEAD OF DELETE trigger - thay vì xóa tài khoản, chỉ đánh dấu status = 'deleted'
- **tg_updateBalance**: Tự động ghi log vào TransactionLog khi số dư tài khoản thay đổi, phân biệt rút tiền (type 1) và nạp tiền (type 2)

### **Transaction Management (Quản lý giao dịch)**
- Sử dụng BEGIN TRANSACTION, COMMIT, ROLLBACK
- Xử lý lỗi với TRY-CATCH blocks
- Sử dụng WITH MARK để đánh dấu transaction quan trọng
- Kiểm tra transaction log với fn_dblog
- Xử lý deadlock và race conditions
- Đảm bảo tính ACID (Atomicity, Consistency, Isolation, Durability)

---

## 🍃 No_SQL - MongoDB

### **CRUD Cơ bản (basics/)**
- **Tạo collection**: Sử dụng createCollection()
- **Insert documents**: 
  - insertOne() - chèn một document
  - insertMany() - chèn nhiều documents
  - insert() - chèn document với _id tự định nghĩa
- **Tìm kiếm documents**:
  - find() - tìm nhiều documents
  - findOne() - tìm một document
- **Cập nhật documents**: updateOne(), updateMany()
- **Xóa documents**: deleteOne(), deleteMany()

### **Query Operators (operators/)**

#### Comparison Operators (Toán tử so sánh)
- **$lt**: Nhỏ hơn (<)
- **$gt**: Lớn hơn (>)
- **$eq**: Bằng nhau (=)
- **$ne**: Không bằng (≠)
- **$gte**: Lớn hơn hoặc bằng (≥)
- **$lte**: Nhỏ hơn hoặc bằng (≤)
- **$in**: Thuộc danh sách
- **$nin**: Không thuộc danh sách

#### Logical Operators (Toán tử logic)
- **$and**: Điều kiện VÀ
- **$or**: Điều kiện HOẶC
- **$not**: Phủ định
- **$expr**: Biểu thức để so sánh các trường trong cùng một document

### **Projection (projection/)**
- Chọn các trường cụ thể để hiển thị trong kết quả
- Sử dụng **$exists** để kiểm tra sự tồn tại của trường
- Sử dụng **$elemMatch** để tìm kiếm trong mảng với nhiều điều kiện

### **Aggregation Pipeline (aggregation/)**
- **$match**: Lọc documents theo điều kiện (tương tự WHERE trong SQL)
  - Lọc theo năm thành lập (founded_year) với các toán tử $gte, $lte, $in
  - Lọc các nhóm có số lượng trùng lặp (count > 1) sau khi group
  - Kết hợp với các comparison operators để tạo điều kiện phức tạp
  
- **$group**: Nhóm documents theo một hoặc nhiều trường và thực hiện các phép tính tổng hợp
  - Tính trung bình ($avg), tổng ($sum), đếm ($sum: 1)
  - Gom các giá trị vào mảng ($push)
  - Nhóm theo category_code, name, hoặc các trường khác
  
- **$project**: Chọn và định hình lại các trường trong kết quả
  - Chọn các trường cụ thể để hiển thị (1 = include, 0 = exclude)
  - Tạo trường mới từ các trường hiện có
  - Ẩn trường _id nếu không cần thiết
  
- **$sort**: Sắp xếp kết quả theo trường tăng dần (1) hoặc giảm dần (-1)

- **Ví dụ sử dụng kết hợp**:
  - Pipeline: $match → $group → $match → $sort: Lọc documents, nhóm lại, lọc kết quả nhóm, sắp xếp
  - Pipeline: $match → $project: Lọc documents và chỉ hiển thị các trường cần thiết
  - Tìm và xóa documents trùng lặp: $group → $match → xóa các documents trùng

### **Dữ liệu mẫu**
Project bao gồm các file JSON mẫu:
- companies.json - Dữ liệu công ty
- grades.json - Dữ liệu điểm số
- inspections.json - Dữ liệu kiểm tra
- posts.json - Dữ liệu bài viết
- routes.json - Dữ liệu tuyến đường
- trips.json - Dữ liệu chuyến đi
- zips.json - Dữ liệu mã bưu điện

---

## 🎯 Mục tiêu học tập đạt được

### SQL Server
- ✅ Tạo và sử dụng Functions (Scalar và Table-Valued)
- ✅ Tạo và sử dụng Stored Procedures với tham số
- ✅ Quản lý Transactions với ACID properties
- ✅ Tạo và sử dụng Triggers (AFTER và INSTEAD OF)
- ✅ Xử lý lỗi với TRY-CATCH
- ✅ Xử lý deadlock và race conditions
- ✅ Sử dụng locking mechanisms (UPDLOCK, ROWLOCK)

### MongoDB
- ✅ Thực hiện các thao tác CRUD cơ bản
- ✅ Sử dụng các query operators để lọc dữ liệu
- ✅ Sử dụng projection để chọn trường hiển thị
- ✅ Sử dụng aggregation pipeline với các stages: $match, $group, $project, $sort
- ✅ Kết hợp nhiều stages trong aggregation pipeline để xử lý dữ liệu phức tạp
- ✅ Tìm và xóa documents trùng lặp bằng aggregation
- ✅ Làm việc với nested documents và arrays

---

## 💡 Ứng dụng thực tế

### Hệ thống Ngân hàng (Bank_DB)
- Quản lý chủ tài khoản (AccountHolders)
- Quản lý tài khoản ngân hàng (Accounts)
- Ghi nhận lịch sử giao dịch (TransactionLog)
- Tự động hóa các quy trình nghiệp vụ với Triggers
- Đảm bảo tính toàn vẹn dữ liệu với Transactions

### MongoDB Collections
- Quản lý dữ liệu công ty và nhân viên
- Xử lý dữ liệu điểm số và đánh giá
- Quản lý tuyến đường và chuyến đi
- Phân tích dữ liệu với aggregation pipeline

---

## 📝 Lưu ý

- Tất cả các chức năng đã được thực hiện và test trong môi trường học tập
- Code được tổ chức theo từng chức năng riêng biệt để dễ theo dõi và học tập
- Các stored procedures và functions đều có xử lý lỗi và validation đầu vào
- Triggers được thiết kế để đảm bảo tính nhất quán dữ liệu và tự động hóa nghiệp vụ

