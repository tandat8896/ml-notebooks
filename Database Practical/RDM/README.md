# SQL Learning Project: Views, Procedures, Transactions, Functions & Triggers

## Mục tiêu học tập

Dự án này nhằm mục đích học tập và thực hành các khái niệm SQL Server cơ bản:

### 1. **Functions (Hàm)**
- Tạo và sử dụng Scalar Functions (hàm trả về giá trị đơn)
- Tạo và sử dụng Table-Valued Functions (hàm trả về bảng)
- Áp dụng functions trong các truy vấn thực tế

### 2. **Stored Procedures (Thủ tục lưu trữ)**
- Tạo stored procedures với tham số đầu vào
- Xử lý logic nghiệp vụ phức tạp trong procedures
- Sử dụng stored procedures để thực hiện các thao tác CRUD

### 3. **Transactions (Giao dịch)**
- Hiểu và áp dụng ACID properties
- Quản lý transactions với BEGIN TRANSACTION, COMMIT, ROLLBACK
- Xử lý lỗi trong transactions với TRY-CATCH
- Tránh deadlock và race conditions

### 4. **Triggers**
- Tạo AFTER triggers và INSTEAD OF triggers
- Sử dụng triggers để ràng buộc dữ liệu và tự động hóa nghiệp vụ
- Xử lý inserted và deleted tables trong triggers

### 5. **Views**
- Tạo views để đơn giản hóa truy vấn phức tạp
- Sử dụng views như một lớp abstraction cho dữ liệu

## Lĩnh vực áp dụng

Tất cả các khái niệm trên sẽ được thực hành trong ngữ cảnh của một hệ thống ngân hàng đơn giản (Bank_DB), bao gồm:
- Quản lý chủ tài khoản (AccountHolders)
- Quản lý tài khoản ngân hàng (Accounts)
- Ghi nhận lịch sử giao dịch (TransactionLog)

## Kết quả mong đợi

Sau khi hoàn thành dự án, bạn sẽ có thể:
- Tạo và sử dụng functions, procedures, triggers trong SQL Server
- Quản lý transactions một cách an toàn và hiệu quả
- Áp dụng các best practices trong việc xử lý dữ liệu và nghiệp vụ
- Hiểu rõ cách SQL Server xử lý các thao tác đồng thời và đảm bảo tính nhất quán dữ liệu

