USE Bank_DB;


create function f_countAccount(@accountHolderID INT)
RETURNS INT
AS 
	BEGIN 
		DECLARE @Ketqua INT
		SELECT @Ketqua = COUNT(AccountHolderId) 
		FROM Banking.Accounts
		WHERE AccountHolderId= @accountHolderID
		RETURN @Ketqua;
	END


-- 1. Đếm số tài khoản của người có ID = 1
SELECT dbo.f_countAccount(1) AS [SoLuongTaiKhoan_ID1];


create function f_sumAccount(@accountHolderId INT)
RETURNS DECIMAL(10,2)
AS 
	BEGIN 
		DECLARE @Ketqua DECIMAL(10,2)
		SELECT @Ketqua = SUM(Balance)
		FROM Banking.Accounts
		WHERE AccountHolderId = @accountHolderID
		RETURN @Ketqua 
	END

-- 2. Tính tổng tiền của người có ID = 1
SELECT dbo.f_sumAccount(1) AS [TongTien_ID1];

create function f_taxCode(@accountHolderId INT)
RETURNS NVARCHAR(30)
AS
	BEGIN 
		DECLARE @Ketqua NVARCHAR(30)
		SELECT @Ketqua= TaxCode
		FROM Core.AccountHolders
		WHERE Id = @accountHolderId
		RETURN @Ketqua
	END

-- 3. Lấy MST của tài khoản số 1
SELECT dbo.f_taxCode(1) AS [MST_TaiKhoan1];


create function f_balance(@accountId INT)
RETURNS Decimal(18,2)
AS
	BEGIN 
		DECLARE @Ketqua DECIMAL(18,2)
		SELECT @Ketqua= Balance
		FROM Banking.Accounts
		WHERE Id = @accountId
		RETURN @Ketqua
	END

-- 4. Lấy số dư hiện tại của tài khoản số 1
SELECT dbo.f_balance(1) AS [SoDu_TaiKhoan1];


create function f_transaction1(@accountId INT, @typeTransaction INT) --@amount INT
RETURNS Decimal(18,2)
AS
	BEGIN 
		DECLARE @Ketqua DECIMAL(18,2)
		SELECT @Ketqua= SUM(amount)
		FROM Banking.TransactionLog
		WHERE account_id = @accountId -- Sửa Id thành account_id
		AND typeTransaction = @typeTransaction;
		RETURN ISNULL(@Ketqua, 0)
	END

-- 5. Tính tổng tiền đã RÚT (Type = 1) của tài khoản số 1
SELECT dbo.f_transaction1(1, 1) AS [TongTienRut_TaiKhoan1];

create  OR ALTER FUNCTION dbo.f_countInactiveAccount()
RETURNS INT
AS 
BEGIN 
	DECLARE @Ketqua INT;

	SELECT @Ketqua = COUNT(Id)
	FROM Banking.Accounts
	WHERE Status = 'inActive'; -- Lọc theo trạng thái inactive

	-- Nếu không tìm thấy dòng nào thì trả về 0
	RETURN ISNULL(@Ketqua, 0);
END;
GO

SELECT dbo.f_countInactiveAccount() AS [TongTaiKhoanKhoa];


--Tạo hàm nhận 1 tham số là @accountHolderId, hàm trả về giá trị Bảng là thông tin tất cả các tài khoản mà chủ sỡ hữu đã mở ở trạng thái đang hoạt động, gồm các cột: accountID, status, balance.	

create function f_getActiveAccounts(@accountHolderID INT)
RETURNS @KetQua TABLE(
		AccountHolderId INT, status NVARCHAR(20) , Balance Decimal(16,2))
AS
BEGIN
	INSERT INTO @KetQua
	SELECT AccountHolderId, status, Balance
	from Banking.Accounts
	where AccountHolderId= @accountHolderID and status = 'Active'
	RETURN ; 
END

--Tạo hàm nhận 1 tham số là @taxcode, hàm trả về giá trị Bảng là thông tin tất cả các giao dịch mà chủ sỡ hữu có mã số thuế taxcode= , gồm các cột: accountID, transactionTime, contentTransaction, amount.
create function f_getTaxiCode(@taxcode INT)
returns @KetQua TABLE 
(
    AccountID INT, 
    TransactionTime DATETIME2,
    ContentTransaction NVARCHAR(50),
    Amount DECIMAL(18, 2)
)
BEGIN
    INSERT INTO @KetQua
    SELECT 
        T.account_id,
        T.transactionTime,
        T.contentTransaction,
        T.amount
    FROM Banking.TransactionLog AS T
    -- Bước 1: Từ Giao dịch nối sang Tài khoản (Cây cầu nối)
    JOIN Banking.Accounts AS Acc ON T.account_id = Acc.Id
    -- Bước 2: Từ Tài khoản nối sang Chủ tài khoản (Con người)
    JOIN Core.AccountHolders AS H ON Acc.AccountHolderId = H.Id
    -- Bước 3: Lọc theo TaxCode
    WHERE H.TaxCode = @taxcode;

    RETURN;
END;


--5
-- 1. Khai báo biến @maxBalance (Kiểu dữ liệu phải khớp với cột Balance)
DECLARE @maxBalance DECIMAL(18, 2);

-- 2. Gán giá trị số dư lớn nhất (MAX) vào biến
SELECT @maxBalance = MAX(Balance)
FROM Banking.Accounts;

-- (Bước phụ: In ra màn hình Message để kiểm tra - Tùy chọn)
PRINT N'Số dư lớn nhất tìm được là: ' + CAST(@maxBalance AS NVARCHAR(50));

-- 3. Hiển thị thông tin các tài khoản có số dư bằng @maxBalance
SELECT *
FROM Banking.Accounts
WHERE Balance = @maxBalance;
GO

