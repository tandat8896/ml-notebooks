// Chọn database để sử dụng
use("AIO_Demo");

// Chèn nhiều documents vào collection students cùng lúc (insertMany)
db.students.insertMany([
  { name: "Bob",     age: 21, mark: 7.8, phone: "0987654321",  like: "football" },    // Document 1
  { name: "Charlie", age: 19, mark: 9.1, phone: "0112233445",  like: "chess" },        // Document 2
  { name: "Daisy",   age: 22, mark: 6.9, phone: "0223344556",  like: "traveling" },   // Document 3
  { name: "Ethan",   age: 20, mark: 8.0, phone: "0334455667",  like: "gaming" },     // Document 4
  { name: "Fiona",   age: 23, mark: 7.5, phone: "0445566778",  like: "reading" },     // Document 5
  { name: "George",  age: 21, mark: 6.8, phone: "0556677889",  like: "cycling" },      // Document 6
  { name: "Hannah",  age: 19, mark: 9.3, phone: "0667788990",  like: "dancing" },      // Document 7
  { name: "Ivan",    age: 22, mark: 7.2, phone: "0778899001",  like: "coding" },      // Document 8
  { name: "Jenny",   age: 20, mark: 8.7, phone: "0889900112",  like: "art" }          // Document 9
]);

// Chèn một document vào collection students (insertOne)
db.students.insertOne(
    {
        name:"Alice",         // Tên
        age: 20,              // Tuổi
        mark: 8.5,            // Điểm
        phone:"0123456789",   // Số điện thoại
        like: "music"         // Sở thích
    }
)

// Tìm tất cả documents trong collection students
db.students.find()

// Sử dụng find và findOne (query, Projection)
// findOne: Trả về document đầu tiên (hoặc null nếu không tìm thấy)
db.students.findOne()

// Tìm document có name = "Alice"
db.students.findOne({
    name:"Alice"  // Điều kiện tìm kiếm
})

// Tìm document có name = "Alice" VÀ age = 20 (phải thỏa mãn cả 2 điều kiện)
db.students.findOne({
    name:"Alice",  // Điều kiện 1
    age:20        // Điều kiện 2
})

// Tìm tất cả documents
db.students.find()

// Comparison Operators - Cập nhật salary cho từng student
// updateOne: Cập nhật document đầu tiên thỏa mãn điều kiện
db.students.updateOne({ name: "Bob" },     { $set: { salary: 48000 } });  // Cập nhật salary = 48000
db.students.updateOne({ name: "Charlie" }, { $set: { salary: 50000 } });  // Cập nhật salary = 50000
db.students.updateOne({ name: "Daisy" },   { $set: { salary: 47000 } });  // Cập nhật salary = 47000
db.students.updateOne({ name: "Ethan" },   { $set: { salary: 52000 } });  // Cập nhật salary = 52000
db.students.updateOne({ name: "Fiona" },   { $set: { salary: 55000 } });  // Cập nhật salary = 55000
db.students.updateOne({ name: "George" },  { $set: { salary: 43000 } });  // Cập nhật salary = 43000
db.students.updateOne({ name: "Hannah" },  { $set: { salary: 51000 } });  // Cập nhật salary = 51000
db.students.updateOne({ name: "Ivan" },    { $set: { salary: 49000 } });  // Cập nhật salary = 49000
db.students.updateOne({ name: "Jenny" },   { $set: { salary: 60000 } });  // Cập nhật salary = 60000

// Tìm tất cả documents sau khi cập nhật
db.students.find()

// Aggregation pipeline: Tìm và xóa các documents trùng lặp theo tên
db.students.aggregate(
    [
        { 
            // Stage $group: Nhóm các bản ghi theo "name"
            $group:{
                _id: "$name",              // Dùng giá trị của name làm khóa nhóm
                ids: {
                    $push: "$_id"          // Gom tất cả _id của nhóm này vào mảng ids
                },
                count:{$sum:1}              // Đếm số bản ghi của mỗi nhóm
            }
        },
        { 
            // Stage $match: Lọc ra chỉ những nhóm có nhiều hơn 1 bản ghi (tức là bị trùng)
            $match:{count:{$gt:1}}         // count > 1
        }
    ]
).forEach(doc => {
    // Giữ lại 1 _id đầu tiên, xóa các cái còn lại
    // Bằng cách bỏ _id đầu tiên trong mảng (không xóa)
    doc.ids.shift();                       // Bỏ _id đầu (giữ lại)
    
    // Xóa tất cả các bản ghi còn lại có _id nằm trong mảng "ids" còn lại
    db.students.deleteMany({
        _id:{$in:doc.ids}                   // _id nằm trong mảng ids
    })
    
});

// Aggregation pipeline đơn giản: Nhóm theo name và đếm số lượng
db.students.aggregate([
    { 
        // Stage $group: Nhóm theo name
        $group: { 
            _id: "$name",                   // Nhóm theo name
            count: { $sum: 1 }              // Đếm số documents trong mỗi nhóm
        } 
    },
    { 
        // Stage $match: Chỉ lấy các nhóm có count > 1 (trùng lặp)
        $match: { count: { $gt: 1 } }     // count > 1
    }
])

// Đếm tổng số documents trong collection students
db.students.countDocuments()

// Tìm tất cả documents
db.students.find()

// $ có 2 công dụng: 
// 1. Lấy giá trị trong document (như "$name", "$age")
// 2. Thao tác điều kiện nhóm, tính toán (như trong aggregation)

// ========== COMPARISON OPERATORS ==========

// $lt (less than): Tìm salary < 50000
db.students.find(
    {
        "salary":{$lt: 50000}  // salary nhỏ hơn 50000
    }
)

// $gt (greater than): Tìm salary > 50000
db.students.find(
    {
        "salary":{
            $gt: 50000          // salary lớn hơn 50000
        }
    }
)

// $eq (equal): Tìm salary = 52000
db.students.find(
    {
        "salary":{
            $eq: 52000          // salary bằng 52000
        }
    }
)

// $in: Tìm salary nằm trong danh sách [50000, 52000]
db.students.find(
    {
        "salary":
        {
            $in : [50000,52000]  // salary = 50000 HOẶC salary = 52000
        }
    }
)

// $ne (not equal): Tìm salary != 52000
db.students.find(
    {
        "salary":
        {
            $ne:52000            // salary không bằng 52000
        }
    }
)

// $gte (greater than or equal): Tìm salary >= 47000
db.students.find(
    {
        "salary":
        {
            $gte: 47000          // salary lớn hơn hoặc bằng 47000
        }
    }
)

// $lte (less than or equal): Tìm salary <= 52000
db.students.find(
    {
        "salary":
        {
            $lte: 52000          // salary nhỏ hơn hoặc bằng 52000
        }
    }
)

// $nin (not in): Tìm salary không nằm trong [40000, 47000]
db.students.find(
    {
        "salary":
        {
            $nin:[40000,47000]   // salary không bằng 40000 VÀ không bằng 47000
        }
    }
)

// ========== LOGICAL OPERATORS ==========

// $and: Trả về tất cả các document thỏa mãn TẤT CẢ điều kiện
// Tương đương với BETWEEN trong SQL (nhưng AND khác BETWEEN)
db.students.find(
    {
        $and:[
            {"age": 20},              // Điều kiện 1: age = 20
            {"mark":{$gte:8.5}}       // Điều kiện 2: mark >= 8.5
        ]
    }
)
// Trong SQL Server, AND khác BETWEEN — nhưng BETWEEN thực chất là cách viết ngắn của AND với điều kiện khoảng.

// $or: Trả về document thỏa mãn 1 trong các điều kiện
// $nor: Kết quả trả về không thỏa mãn bất kỳ điều kiện nào
// $not: Phủ định lại tất cả điều kiện

// ========== LƯU Ý VỀ CÚ PHÁP ==========

// $and: [] là toán tử logic, cần mảng điều kiện
// CÚ PHÁP SAI: Không thể dùng $or trực tiếp với giá trị đơn
db.students.find(
    {
        like:{
            $or:["music","football"]  // ❌ SAI: $or cần mảng các điều kiện, không phải mảng giá trị
        }
    }
)

// Cái này không chạy được vì $or cần biểu thức điều kiện, ở trên chỉ là 1 giá trị đơn

// CÚ PHÁP ĐÚNG: Sửa lại với $or ở cấp độ top-level
db.students.find(
    {
        $or:[
            {like:"music"},        // Điều kiện 1: like = "music"
            {like:"football"}      // Điều kiện 2: like = "football"
        ]
    }
)
