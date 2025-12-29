--DATABASE Bank_DB
CREATE DATABASE Bank_DB;

USE Bank_DB;

-- Schema chứa dữ liệu chủ (Con người)
CREATE SCHEMA Core;
GO

-- Schema chứa dữ liệu nghiệp vụ (Ngân hàng)
CREATE SCHEMA Banking;
GO

---TABLE AccountHolders
CREATE TABLE Core.AccountHolders(
  Id INT IDENTITY PRIMARY KEY,
  FirstName NVARCHAR(50) NOT NULL,
  LastName  NVARCHAR(50) NOT NULL,
  TaxCode   NVARCHAR(30) NULL
);

---TABLE Accounts
CREATE TABLE Banking.Accounts(
  Id INT IDENTITY PRIMARY KEY,
  AccountHolderId INT NOT NULL FOREIGN KEY REFERENCES Core.AccountHolders(Id),
  Status NVARCHAR(20) NOT NULL DEFAULT('inActive'),
  Balance DECIMAL(18,2) NOT NULL DEFAULT(50)
);


--TABLE TransactionLog
CREATE TABLE Banking.TransactionLog(
  Id INT IDENTITY PRIMARY KEY,
  transactionTime DATETIME2 NOT NULL,
  account_id INT NOT NULL FOREIGN KEY REFERENCES Banking.Accounts(Id),
  typeTransaction INT NOT NULL,               -- 1: withdraw, 2: deposit
  contentTransaction NVARCHAR(50) NOT NULL,
  amount DECIMAL(18,2) NOT NULL               -- > 0
);


--Tạo trigger ràng buộc, khi thêm mới hoặc cập nhật bảng TransactionLog, transactionTime phải = ngày giờ hệ thống, amount phải >0.
Create Trigger trig_transaction_logs
ON Banking.TransactionLog
AFTER INSERT, UPDATE 
AS
BEGIN
	IF EXISTS (
	SELECT 1 from inserted where amount < 0
	)
	BEGIN 
		RAISERROR('Lỗi Nghiệp vụ : số tiền giao dịch phải > 0', 16 , 1);

		ROLLBACK TRANSACTION;

		RETURN;
	END 

	UPDATE Banking.TransactionLog
	SET transactionTime = GETDATE()
	FROM Banking.TransactionLog as tl
	INNER JOIN inserted i ON tl.Id = i.Id;
END
GO


-- Tạo AccountHolder
INSERT INTO Core.AccountHolders (FirstName, LastName, TaxCode)
VALUES ('Nguyen', 'Dat', '123456789');

-- Tạo Account liên kết
INSERT INTO Banking.Accounts (AccountHolderId, Status, Balance)
VALUES (1, 'Active', 1000);

INSERT INTO Banking.TransactionLog (transactionTime, account_id, typeTransaction, contentTransaction, amount)
VALUES (GETDATE(), 1, 1, 'Rut tien', -500);




UPDATE Banking.Accounts
SET Status = 'activate'
WHERE Id = 1;

-- Kiểm tra
SELECT * FROM Banking.Accounts;


CREATE TRIGGER trig_accounts_no_update_deleted
ON Banking.Accounts
AFTER UPDATE
AS
BEGIN
    -- Kiểm tra nếu có bản ghi nào vừa cập nhật có Status = 'deleted'
    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN deleted d ON i.Id = d.Id
        WHERE d.Status = 'deleted'
    )
    BEGIN
        RAISERROR('Lỗi nghiệp vụ: Không được cập nhật tài khoản đã bị xóa', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END
GO

SELECT * FROM Banking.Accounts WHERE Id = 1;

-- Thử update account đã deleted
UPDATE Banking.Accounts
SET Balance = 500
WHERE Id = 1;
-- → Trigger sẽ RAISERROR và rollback, không cho update





CREATE TRIGGER tg_checkBalance
ON Banking.Accounts
AFTER INSERT, UPDATE
AS
BEGIN
    -- Kiểm tra nếu có bản ghi vừa được insert/update có Balance <= 50
    IF EXISTS (
        SELECT 1
        FROM inserted
        WHERE Balance <= 50
    )
    BEGIN
        RAISERROR('Lỗi nghiệp vụ: Số dư tài khoản phải > 50', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END
GO

INSERT INTO Banking.Accounts (AccountHolderId, Status, Balance)
VALUES (1, 'Active', 50);    -- Trigger báo lỗi + rollback

UPDATE Banking.Accounts
SET Balance = 30
WHERE Id = 1;                 -- Trigger báo lỗi + rollback



--2a

Create trigger tg_insertAccountHolder
ON Banking.Accounts
AFTER INSERT  
AS
BEGIN
	IF  TRIGGER_NESTLEVEL()>1 -- Nếu đã có tài khoản rồi không tạo tài khoản phụ nữa --Balance)
		RETURN; 
	BEGIN
	INSERT INTO Accounts([AccountHolderId], Status, Balance)							
	SELECT 
		i.AccountHolderId,
		'in_active',
		100
		FROM inserted as i
	END
END;


--2b 

CREATE trigger tg_deleteAccount
ON Banking.Accounts
INSTEAD OF DELETE
AS
BEGIN
	UPDATE Banking.Accounts
	SET Status='deleted'
	From Banking.Accounts as a 
	JOIN deleted as d ON a.Id = d.Id
END;


DELETE FROM Banking.Accounts
WHERE Id = 1;

DELETE FROM Banking.Accounts WHERE Id = 1;
SELECT * FROM Banking.Accounts WHERE Id = 1;


------2c
CREATE trigger tg_updateBalance
ON Banking.Accounts
AFTER UPDATE 
AS
BEGIN 
	IF UPDATE(Balance)
		INSERT INTO Banking.TransactionLog( account_id, typeTransaction,contentTransaction, transactionTime, amount)
		SELECT i.Id,
			CASE 
				WHEN i.Balance <d.Balance then '1'
				else '2'
				end,
			CASE 
				WHEN i.Balance < d.Balance then 'withdraw'
				else 'deposit'
				end,
			GETDATE(),
			ABS(i.Balance - d.Balance)
		FROM inserted as i
		JOIN deleted as d ON i.Id = d.Id
END




--4


-- Thêm 2 AccountHolder mới
INSERT INTO Core.AccountHolders (FirstName, LastName, TaxCode)
VALUES ('Tran', 'An', '987654321'),
       ('Le', 'Binh', '112233445');

-- Thêm 2 tài khoản cho 2 AccountHolder mới
INSERT INTO Banking.Accounts (AccountHolderId, Status, Balance)
VALUES (2, 'Active', 2000),
       (3, 'Active', 1500);

-- Kiểm tra trạng thái các index trên Accounts
SELECT name, type_desc, is_disabled
FROM sys.indexes
WHERE object_id = OBJECT_ID('Banking.Accounts');


ALTER INDEX PK__Accounts__3214EC07057EB86A
ON Banking.Accounts
REBUILD;

BEGIN TRANSACTION UpdateAccount
WITH MARK 'UPDATE Account';
GO
UPDATE Banking.Accounts
SET Balance = Balance * 1.20 WHERE
AccountHolderId = 1;
COMMIT TRANSACTION UpdateAccount;


DBCC OPENTRAN;

SELECT
    [Current LSN],
    [Operation],
    [Transaction ID],
    [Transaction Name],
    [Description],
    [Begin Time],
    [Transaction SID]
FROM fn_dblog(NULL, NULL)
WHERE [Description] LIKE '%MARK%' 
   OR [Transaction Name] = 'UpdateAccount';




--5a
--Xung đột 2 trigger

-- Tạo người nhận mới
INSERT INTO Core.AccountHolders (FirstName, LastName, TaxCode)
VALUES ('Le', 'Lan', '987654321');


DELETE FROM Core.AccountHolders
WHERE Id IN (2);
DBCC CHECKIDENT ('Core.AccountHolders', RESEED, 1);

SELECT * FROM Core.AccountHolders
-- Tạo tài khoản cho người nhận
INSERT INTO Banking.Accounts (AccountHolderId, Status, Balance)
VALUES (2, 'Active', 100);  

SELECT * FROM Banking.Accounts


SELECT * FROM Banking.Accounts



BEGIN TRAN Transfer300;
BEGIN TRY
    -- Trừ và cộng tiền trực tiếp
    UPDATE Banking.Accounts
    SET Balance = CASE Id
                      WHEN 1 THEN Balance - 30
                      WHEN 2 THEN Balance + 30
                  END
    WHERE Id IN (1,2);

    -- Ghi log
    INSERT INTO Banking.TransactionLog(transactionTime, account_id, typeTransaction, contentTransaction, amount)
    VALUES 
        (SYSDATETIME(), 1, 1, N'transfer-out', 300),
        (SYSDATETIME(), 2, 2, N'transfer-in', 300);

    COMMIT TRAN Transfer300;
    PRINT N'Chuyển tiền thành công';
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRAN Transfer300;
    PRINT N'Chuyển tiền thất bại: ' + ERROR_MESSAGE();
END CATCH;

-- Kiểm tra
SELECT Id, Balance FROM Banking.Accounts WHERE Id IN (1,2);
SELECT TOP 10 * FROM Banking.TransactionLog ORDER BY Id DESC;
