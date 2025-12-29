--Viết thủ tục sp_account_statement nhận 3 tham số là @accountID,
--@startDate, @startDate. Thủ tục hiển thị tất cả các giao dịch của tài khoản có
--id = @accountID.


USE Bank_DB

GO
Create procedure sp_account_statement(
 @accountID INT,
 @startDate DATETIME2,
 @endDate DATETIME2
 )
AS
BEGIN
 SELECT * 
 FROM Bank_DB.Banking.TransactionLog
 WHERE account_id = @accountID
 AND transactionTime Between @startDate and @endDate
END;
GO


DECLARE @accountID INT = 1;
DECLARE @startDate DATETIME2 = '2025-12-01';
DECLARE @endDate DATETIME2 = '2025-12-03';

		EXEC sp_account_statement @accountID, @startDate, @endDate;


--1b
GO
create procedure sp_insert_AccountHolder(
@FirstName NVARCHAR(20),
@LastName NVARCHAR(20),
@TaxCode NVARCHAR(5)
)
AS
BEGIN
	IF NOT EXISTS (SELECT 1 FROM Core.AccountHolders)
	BEGIN 
		RAISERROR( 'khong có transaction(dòng) thằng nào trong table AccountHolder', 30, 1);
		RETURN;
	END
INSERT INTO Core.AccountHolders (FirstName, LastName, TaxCode)
VALUES (@FirstName, @LastName, @TaxCode);
PRINT 'Insert successful!';
END
GO


DECLARE @accountID INT = 1;
DECLARE @startDate DATETIME2 = '2025-12-01';
DECLARE @endDate DATETIME2 = '2025-12-03';

EXEC sp_account_statement @accountID, @startDate, @endDate;


--2a"Số tiền muốn rút (@amount) phải nhỏ hơn hoặc bằng Tổng tiền hiện có cộng thấu chi (@currentBalance + 50)
-- case1
	--Tình huống: Giả sử tài khoản có 100 đồng (@currentBalance = 100) ngay lúc chạy lệnh này có 1 người khác chuyển thêm 50 nên khi chạy luôn xóa mất tiêu số tiền vừa chuyển ,  nên k được set SET Balance = @currentBalance - @amount mà thay  SET Balance = Balance - @amount
--case2
	--"Hacker thích số âm"
--case3
	--"Giao dịch ma" (Atomicity) k được ghi log lại

--case4
	--Tài khoản có 100k.
	--Bạn (A) rút 100k ở cây ATM số 1.Luồng A: Chạy lệnh SELECT, thấy Balance = 100k. (Thỏa điều kiện). Balance còn 0. 
	--Vợ bạn (B) rút 100k ở cây ATM số 2.Luồng B: UPDATE trừ 100k. Balance còn -100k.
	--Hai người bấm nút cùng một thời điểm (cùng mili-giây
	--Ngân hàng bị lỗ vốn vì cả hai đều rút được tiền dù tài khoản chỉ đủ cho một người.
	--Để xử lý Case 4, chúng ta cần đảm bảo việc Kiểm tra và Trừ tiền phải xảy ra cùng một lúc (nguyên tử) hoặc dữ liệu phải bị khóa ngay từ lúc đọc.
--Case 5: "Tài khoản Ma" (Invalid Account).
	--Bước SELECT: SQL tìm ID 9999. Không thấy đâu cả. $\rightarrow$ Hai biến @currentBalance và @currentStatus sẽ nhận giá trị NULL (rỗng).
	--Bước IF: IF (NULL <= NULL + 50) .... Phép so sánh với NULL luôn trả về FALSE
create procedure sp_withdraw(
	@accountID INT,  -- mã tài khoản
	@amount  DECIMAL(18, 2) -- số tiền muốn rút
)
AS
BEGIN 
	DECLARE @currentBalance DECIMAL(18,2);
    DECLARE @currentStatus NVARCHAR(20);
	-- 1. BẮT ĐẦU LƯỚI AN TOÀN LỚN (Bao trùm tất cả)
	IF NOT EXISTS (SELECT 1 FROM Banking.Accounts WHERE Id = @accountID)
			BEGIN
				RAISERROR(N'Lỗi: Tài khoản không tồn tại!', 16, 1);
				RETURN; -- Lệnh này giúp thoát ngay lập tức, không chạy các dòng dưới nữa
			END
	BEGIN TRY
		BEGIN TRANSACTION
			-- Lấy dữ liệu và khóa dòng 
			SELECT @currentBalance = a.Balance,
			@currentStatus = a.Status
			FROM Banking.Accounts as a WITH (UPDLOCK, ROWLOCK) --(UPDLOCK, ROWLOCK) xử lý case 4 Race Condition
			--JOIN Banking.TransactionLog as tl On a.Id= tl.account_id không join vì nếu account mới mở thì @currentBalance = Null
			WHERE Id = @accountID;
			-- Kiểm tra điều kiện
			IF @amount <= @currentBalance +50 and @currentStatus = 'active' and @amount > 0 -- xử lý atomicity
				BEGIN 
					PRINT N'Rút tiền thành công'
					UPDATE Banking.Accounts 
					SET Balance = Balance - @amount
					WHERE Id= @accountID;
					INSERT INTO Banking.TransactionLog(transactionTime, typeTransaction, account_id, contentTransaction , amount)
					VALUES (GETDATE(), 1  ,@accountID, 'active', @amount)   -- 1: withdraw, 2: deposit
					COMMIT TRANSACTION;

				END
			ELSE
			BEGIN 
					ROLLBACK TRANSACTION
					RAISERROR ('Lỗi Giao Dich' , 16, 1)
			END 

	END TRY

 
		BEGIN CATCH
			-- 7. Xử lý lỗi hệ thống (Mất điện, lỗi SQL...)
			-- Nếu Transaction vẫn đang mở thì Rollback ngay
			IF @@TRANCOUNT > 0 
				ROLLBACK TRANSACTION;
        
			-- Báo lỗi chi tiết ra màn hình
			DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
			RAISERROR(@ErrorMessage, 16, 1);
		END CATCH
END


--2b

CREATE PROCEDURE sp_deposit
(
    @accountID INT,
    @amount DECIMAL(18,2)
)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Validate cơ bản (làm ngoài Transaction cho nhẹ)
    IF @amount <= 0
    BEGIN
        RAISERROR(N'Số tiền nộp phải lớn hơn 0', 16, 1);
        RETURN;
    END

    -- 2. Validate tồn tại (Tránh mở Transaction thừa)
    IF NOT EXISTS (SELECT 1 FROM Banking.Accounts WHERE Id = @accountID)
    BEGIN
        RAISERROR(N'Tài khoản không tồn tại', 16, 1);
        RETURN;
    END

    DECLARE @currentBalance DECIMAL(18,2);
    DECLARE @status NVARCHAR(20);

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 3. Khóa dòng và lấy trạng thái
        SELECT @currentBalance = Balance, 
               @status = Status
        FROM Banking.Accounts WITH (UPDLOCK, ROWLOCK)
        WHERE Id = @accountID;

        -- 4. Check trạng thái (Edge Case 1)
        IF @status <> 'active'
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Tài khoản đang bị khóa/đóng, không thể nộp tiền.', 16, 1);
            RETURN;
        END

        -- 5. Cộng tiền
        UPDATE Banking.Accounts
        SET Balance = Balance + @amount
        WHERE Id = @accountID;

        -- 6. Ghi log
        INSERT INTO Banking.TransactionLog(transactionTime, typeTransaction, account_id, contentTransaction, amount)
        VALUES (GETDATE(), 2, @accountID, N'Nộp tiền', @amount); -- Type 2: Deposit

        COMMIT TRANSACTION;
        PRINT N'Nộp tiền thành công';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END;
GO

--2c
--Case 1: "Nộp tiền vào tài khoản đã đóng" (Status Inactive)
--Case 2: "Chuyển tiền cho chính mình" (Self-Transfer)
--Case 3: "Kẹt xe ngõ cụt" (Deadlock)
CREATE OR ALTER PROCEDURE sp_transfer
(
    @id_account_send INT,
    @id_account_receive INT,
    @amount DECIMAL(18,2)
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Case 2: Chuyển cho chính mình
    IF @id_account_send = @id_account_receive
    BEGIN
        RAISERROR(N'Không thể chuyển tiền cho chính mình.', 16, 1);
        RETURN;
    END

    IF @amount <= 0
    BEGIN
        RAISERROR(N'Số tiền chuyển phải lớn hơn 0', 16, 1);
        RETURN;
    END

    -- Kiểm tra sơ bộ tồn tại (tùy chọn, để đỡ mở transaction)
    IF NOT EXISTS (SELECT 1 FROM Banking.Accounts WHERE Id = @id_account_send) OR 
       NOT EXISTS (SELECT 1 FROM Banking.Accounts WHERE Id = @id_account_receive)
    BEGIN
        RAISERROR(N'Tài khoản gửi hoặc nhận không tồn tại', 16, 1);
        RETURN;
    END

    DECLARE @balance_send DECIMAL(18,2);
    DECLARE @status_send NVARCHAR(20);
    DECLARE @status_receive NVARCHAR(20);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- === XỬ LÝ DEADLOCK (CASE 3) ===
        -- Nguyên tắc: Luôn khóa ID nhỏ trước, ID lớn sau
        
        IF @id_account_send < @id_account_receive
        BEGIN
            -- Khóa  Gửi trước, Nhận sau
            SELECT @balance_send = Balance, @status_send = Status
            FROM Banking.Accounts WITH (UPDLOCK, ROWLOCK) WHERE Id = @id_account_send;

            SELECT @status_receive = Status
            FROM Banking.Accounts WITH (UPDLOCK, ROWLOCK) WHERE Id = @id_account_receive;
        END
        ELSE
        BEGIN
            -- Khóa  Nhận trước, Gửi sau
            SELECT @status_receive = Status
            FROM Banking.Accounts WITH (UPDLOCK, ROWLOCK) WHERE Id = @id_account_receive;

            SELECT @balance_send = Balance, @status_send = Status
            FROM Banking.Accounts WITH (UPDLOCK, ROWLOCK) WHERE Id = @id_account_send;
        END

        -- === HẾT PHẦN KHÓA ===

        -- Kiểm tra Logic Nghiệp vụ
        IF @status_send <> 'active' OR @status_receive <> 'active'
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Giao dịch thất bại: Một trong hai tài khoản bị khóa.', 16, 1);
            RETURN;
        END

        -- Kiểm tra số dư (Quy định: Số dư sau khi chuyển phải >= 50)
        IF (@balance_send - @amount < 50)
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Số dư không đủ (phải duy trì tối thiểu 50).', 16, 1);
            RETURN;
        END

        -- Thực hiện Giao dịch (Atomic)
        -- 1. Trừ tiền người gửi
        UPDATE Banking.Accounts
        SET Balance = Balance - @amount
        WHERE Id = @id_account_send;

        -- 2. Cộng tiền người nhận
        UPDATE Banking.Accounts
        SET Balance = Balance + @amount
        WHERE Id = @id_account_receive;

        -- 3. Ghi log (Ghi 2 dòng hoặc 1 dòng tùy quy định ngân hàng, ở đây ghi 2)
        INSERT INTO Banking.TransactionLog(transactionTime, typeTransaction, account_id, contentTransaction, amount)
        VALUES (GETDATE(), 3, @id_account_send, N'Chuyển tiền đi', @amount); -- Type 3: Transfer Out

        INSERT INTO Banking.TransactionLog(transactionTime, typeTransaction, account_id, contentTransaction, amount)
        VALUES (GETDATE(), 4, @id_account_receive, N'Nhận tiền chuyển khoản', @amount); -- Type 4: Transfer In

        COMMIT TRANSACTION;
        PRINT N'Chuyển tiền thành công!';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END;
GO


-- 1. Tạo chủ tài khoản
INSERT INTO Core.AccountHolders (FirstName, LastName, TaxCode) VALUES (N'Nguyễn', N'Văn A', 'MST001');
INSERT INTO Core.AccountHolders (FirstName, LastName, TaxCode) VALUES (N'Trần', N'Thị B', 'MST002');

-- 2. Tạo 3 tài khoản với trạng thái khác nhau
-- Acc 1: Active, Dư 100 (Của ông A)
INSERT INTO Banking.Accounts (AccountHolderId, Status, Balance) VALUES (4, 'active', 100); 
-- Acc 2: Inactive, Dư 50 (Của bà B - Bị khóa)
INSERT INTO Banking.Accounts (AccountHolderId, Status, Balance) VALUES (5, 'inActive', 50); 
-- Acc 3: Active, Dư 200 (Của ông A - Để nhận tiền)
INSERT INTO Banking.Accounts (AccountHolderId, Status, Balance) VALUES (6, 'active', 200); 
GO

PRINT '=== TEST CASE 1: RÚT QUÁ TIỀN (SP_WITHDRAW) ===';

-- Giả sử ID = 1 (Balance = 100)
DECLARE @TestAccountID INT = 1; 
DECLARE @WithdrawAmount DECIMAL(18,2) = 200; -- Rút 200 (Vượt quá 100 + 50)

EXEC sp_withdraw 
    @accountID = @TestAccountID, 
    @amount = @WithdrawAmount;

SELECT * FROM Banking.Accounts WHERE Id = @TestAccountID;
SELECT * FROM Banking.TransactionLog WHERE account_id = @TestAccountID;


PRINT '=== TEST CASE 2: NỘP VÀO TÀI KHOẢN KHÓA (SP_DEPOSIT) ===';

-- Giả sử ID = 2 (Status = 'inActive')
DECLARE @LockedAccountID INT = 2; 
DECLARE @DepositAmount DECIMAL(18,2) = 500;

EXEC sp_deposit 
    @accountID = @LockedAccountID, 
    @amount = @DepositAmount;


SELECT * FROM Banking.Accounts WHERE Id = @LockedAccountID;


PRINT '=== TEST CASE 3: CHUYỂN TIỀN LỖI (SP_TRANSFER) ===';

DECLARE @SenderID INT = 1;   -- Có 100
DECLARE @ReceiverID INT = 3; -- Có 200
DECLARE @TransferAmount DECIMAL(18,2) = 1000; -- Chuyển 1000

EXEC sp_transfer 
    @id_account_send = @SenderID,
    @id_account_receive = @ReceiverID,
    @amount = @TransferAmount;


SELECT Id, Balance, Status FROM Banking.Accounts WHERE Id IN (@SenderID, @ReceiverID);


--Bai 4
DECLARE @i INT = 1;

-- Chạy vòng lặp từ 1 đến 10
WHILE @i <= 10
BEGIN
    INSERT INTO Core.AccountHolders (FirstName, LastName, TaxCode)
    VALUES (
        N'firstName ' + CAST(@i AS NVARCHAR(10)),  -- Tạo firstName 1, firstName 2...
        N'lastName' + CAST(@i AS NVARCHAR(10)),    -- Tạo lastName1, lastName2...
        -- Dùng hàm RIGHT để tạo số 0 ở đầu (độ dài 9 số giống trong ảnh)
        RIGHT('000000000' + CAST(@i AS NVARCHAR(10)), 9) 
    );

    -- Tăng biến đếm
    SET @i = @i + 1;
END;
GO

-- Kiểm tra kết quả sau khi chèn
SELECT * FROM Core.AccountHolders;
GO

--bai 5
CREATE OR ALTER PROCEDURE sp_Accounts
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        Id, 
        Status, 
        Balance,
        -- Phân loại Account
        CASE 
            WHEN Balance >= 10000 THEN 'Dimond' -- Ưu tiên check số to nhất trước
            WHEN Balance >= 5000  THEN 'Gold'
            WHEN Balance >= 3000  THEN 'Silver'
            ELSE 'Normal' -- Các trường hợp còn lại (< 3000)
        END AS typeAccount
    FROM Banking.Accounts;
END;
GO

EXEC sp_Accounts;
GO

IF NOT EXISTS (SELECT 1 FROM Core.AccountHolders)
    INSERT INTO Core.AccountHolders (FirstName, LastName, TaxCode) VALUES ('Test', 'User', '000');

DECLARE @HolderID INT = (SELECT TOP 1 Id FROM Core.AccountHolders);

INSERT INTO Banking.Accounts (AccountHolderId, Status, Balance) VALUES 
(@HolderID, 'active', 1000),   
(@HolderID, 'active', 4000),   
(@HolderID, 'active', 6000),   
(@HolderID, 'active', 15000);  
GO


PRINT '=== KẾT QUẢ PHÂN LOẠI ===';
EXEC Banking.sp_Accounts;
GO