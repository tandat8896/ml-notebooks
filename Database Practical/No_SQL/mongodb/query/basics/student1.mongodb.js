// Chọn database để sử dụng
use("AIO_Demo");

// Chèn nhiều documents vào collection students cùng lúc (insertMany)
// insertMany cho phép chèn nhiều documents trong một lần gọi, hiệu quả hơn insertOne nhiều lần
db.students.insertMany([
  { name: "Bob",     age: 21, mark: 7.8, phone: "0987654321",  like: "football" },    // Document 1: Bob
  { name: "Charlie", age: 19, mark: 9.1, phone: "0112233445",  like: "chess" },        // Document 2: Charlie
  { name: "Daisy",   age: 22, mark: 6.9, phone: "0223344556",  like: "traveling" },   // Document 3: Daisy
  { name: "Ethan",   age: 20, mark: 8.0, phone: "0334455667",  like: "gaming" },     // Document 4: Ethan
  { name: "Fiona",   age: 23, mark: 7.5, phone: "0445566778",  like: "reading" },     // Document 5: Fiona
  { name: "George",  age: 21, mark: 6.8, phone: "0556677889",  like: "cycling" },      // Document 6: George
  { name: "Hannah",  age: 19, mark: 9.3, phone: "0667788990",  like: "dancing" },      // Document 7: Hannah
  { name: "Ivan",    age: 22, mark: 7.2, phone: "0778899001",  like: "coding" },      // Document 8: Ivan
  { name: "Jenny",   age: 20, mark: 8.7, phone: "0889900112",  like: "art" }          // Document 9: Jenny
]);

// Chèn một document vào collection students (insertOne)
// insertOne chèn một document duy nhất vào collection
db.students.insertOne(
    {
        name:"Alice",         // Tên sinh viên
        age: 20,              // Tuổi
        mark: 8.5,            // Điểm số
        phone:"0123456789",   // Số điện thoại
        like: "music"         // Sở thích
    }
)

// Tìm tất cả documents trong collection students
// find() trả về cursor (con trỏ) chứa tất cả documents thỏa mãn điều kiện
db.students.find()

// Sử dụng find và findOne (query, Projection)
// findOne(): Trả về document đầu tiên (hoặc null nếu không tìm thấy)
// Không có điều kiện = trả về document đầu tiên trong collection
db.students.findOne()

// Tìm document có name = "Alice"
// findOne() trả về document đầu tiên thỏa mãn điều kiện
db.students.findOne({
    name:"Alice"  // Điều kiện tìm kiếm: name phải bằng "Alice"
})

// Tìm document có name = "Alice" VÀ age = 20
// Khi có nhiều điều kiện, tất cả phải thỏa mãn (AND logic)
db.students.findOne({
    name:"Alice",  // Điều kiện 1: name = "Alice"
    age:20        // Điều kiện 2: age = 20
})

// Tìm tất cả documents
db.students.find()

// Comparison Operators - Cập nhật salary cho từng student
// updateOne(): Cập nhật document đầu tiên thỏa mãn điều kiện
// $set: Toán tử để set giá trị cho trường (nếu trường chưa tồn tại sẽ tạo mới)
db.students.updateOne({ name: "Bob" },     { $set: { salary: 48000 } });  // Cập nhật salary = 48000 cho Bob
db.students.updateOne({ name: "Charlie" }, { $set: { salary: 50000 } });  // Cập nhật salary = 50000 cho Charlie
db.students.updateOne({ name: "Daisy" },   { $set: { salary: 47000 } });  // Cập nhật salary = 47000 cho Daisy
db.students.updateOne({ name: "Ethan" },   { $set: { salary: 52000 } });  // Cập nhật salary = 52000 cho Ethan
db.students.updateOne({ name: "Fiona" },   { $set: { salary: 55000 } });  // Cập nhật salary = 55000 cho Fiona
db.students.updateOne({ name: "George" },  { $set: { salary: 43000 } });  // Cập nhật salary = 43000 cho George
db.students.updateOne({ name: "Hannah" },  { $set: { salary: 51000 } });  // Cập nhật salary = 51000 cho Hannah
db.students.updateOne({ name: "Ivan" },    { $set: { salary: 49000 } });  // Cập nhật salary = 49000 cho Ivan
db.students.updateOne({ name: "Jenny" },   { $set: { salary: 60000 } });  // Cập nhật salary = 60000 cho Jenny

// Tìm tất cả documents sau khi cập nhật salary
db.students.find()

// Aggregation pipeline: Tìm và xóa các documents trùng lặp theo tên
// Mục đích: Giữ lại 1 document đầu tiên, xóa các documents trùng tên còn lại
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
            $match:{count:{$gt:1}}         // count > 1 (có trùng lặp)
        }
    ]
).forEach(doc => {
    // Với mỗi nhóm trùng lặp:
    // Giữ lại 1 _id đầu tiên, xóa các cái còn lại
    // Bằng cách bỏ _id đầu tiên trong mảng (không xóa)
    doc.ids.shift();                       // Bỏ _id đầu tiên ra khỏi mảng (giữ lại document này)
    
    // Xóa tất cả các bản ghi còn lại có _id nằm trong mảng "ids" còn lại
    db.students.deleteMany({
        _id:{$in:doc.ids}                   // _id nằm trong mảng ids (các _id cần xóa)
    })
    
});

// Aggregation pipeline đơn giản: Nhóm theo name và đếm số lượng
// Chỉ để xem kết quả, không xóa documents
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
// countDocuments() hiệu quả hơn .count() vì không load documents vào memory
db.students.countDocuments()

// Tìm tất cả documents
db.students.find()

// $ có 2 công dụng: 
// 1. Lấy giá trị trong document (như "$name", "$age") - dùng trong aggregation
// 2. Thao tác điều kiện nhóm, tính toán (như trong aggregation pipeline)

// ========== COMPARISON OPERATORS ==========
// Các toán tử so sánh trong MongoDB

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
// Tương đương với: salary = 50000 OR salary = 52000
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
// Tương đương với: salary != 40000 AND salary != 47000
db.students.find(
    {
        "salary":
        {
            $nin:[40000,47000]   // salary không bằng 40000 VÀ không bằng 47000
        }
    }
)

// ========== LOGICAL OPERATORS ==========
// Các toán tử logic trong MongoDB

// $and: Trả về tất cả các document thỏa mãn TẤT CẢ điều kiện
// Tương đương với AND trong SQL
db.students.find(
    {
        $and:[
            {"age": 20},              // Điều kiện 1: age = 20
            {"mark":{$gte:8.5}}       // Điều kiện 2: mark >= 8.5
        ]
    }
)
// Trong SQL Server, AND khác BETWEEN — nhưng BETWEEN thực chất là cách viết ngắn của AND với điều kiện khoảng.

// Các logical operators khác:
// $or: Trả về document thỏa mãn 1 trong các điều kiện (OR logic)
// $nor: Kết quả trả về không thỏa mãn bất kỳ điều kiện nào (NOT OR)
// $not: Phủ định lại tất cả điều kiện (NOT)
