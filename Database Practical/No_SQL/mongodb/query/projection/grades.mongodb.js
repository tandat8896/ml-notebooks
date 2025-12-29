// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// Chọn database để sử dụng
use("AIO_Demo");

// Tìm một document trong collection grades
db.getCollection("grades").findOne({

});

// Tìm tất cả documents trong collection grades
db.grades.find()

// Projection: Chỉ hiển thị các trường student_id và class_id (bao gồm cả _id)
db.grades.find({},
    {"student_id":1,"class_id":1}  // 1 = include, _id mặc định được include
)

// Projection: Chỉ hiển thị các trường student_id và class_id (loại bỏ _id)
db.grades.find({},
    {"student_id":1,"class_id":1,"_id":0}  // 0 = exclude _id
)

// Đếm số documents sau khi projection (sử dụng .size())
db.grades.find({},
    {"student_id":1,"class_id":1,"_id":0}
).size()

// Tìm documents có scores chứa phần tử thỏa mãn điều kiện (sử dụng $elemMatch)
db.grades.find(
    {
        "scores":  // Tìm trong mảng scores
        {
            // $elemMatch: Tìm phần tử trong mảng thỏa mãn TẤT CẢ điều kiện
            $elemMatch:{"type":"exam","score":{$gt:80}}  // type = "exam" VÀ score > 80
        }
    }
)

// Tạo compound index (chỉ mục kết hợp) trên 2 trường student_id và class_id
db.grades.createIndex(
    {
        "student_id":1,  // Sắp xếp tăng dần (1 = ascending)
        "class_id":1     // Sắp xếp tăng dần
    }
)

// Tìm documents với student_id = 1 và class_id = 329, sau đó giải thích execution stats
db.grades.find(
    {
        "student_id":1,   // Điều kiện tìm kiếm
        "class_id":329    // Điều kiện tìm kiếm
    }
).explain("executionStats")  // Xem thống kê thực thi query (số documents scanned, thời gian, index được dùng)

// Tìm documents với student_id = 1 và class_id = 329, sau đó giải thích tất cả execution plans
db.grades.find(
    {
        "student_id":1,   // Điều kiện tìm kiếm
        "class_id":329    // Điều kiện tìm kiếm
    }
).explain("allPlansExecution")  // Xem tất cả các execution plans được MongoDB xem xét

// Tạo partial index (chỉ mục một phần) - chỉ index các documents thỏa mãn điều kiện
db.trips.createIndex(
    {
        "tripduration":1  // Tạo chỉ mục tăng dần trên trường tripduration
    },
    {
        // partialFilterExpression: Chỉ index các documents có tripduration > 100
        partialFilterExpression:{"tripduration":{$gt:100}}
    }
)

// Tìm documents có tripduration < 100, sau đó giải thích execution stats
// Lưu ý: Query này có thể không sử dụng partial index vì điều kiện < 100 không nằm trong filter của index
db.trips.find(
    {
        "tripduration":{$lt:100}  // Tìm tripduration < 100
    }
).explain("executionStats")  // Xem thống kê thực thi để kiểm tra index có được sử dụng không
