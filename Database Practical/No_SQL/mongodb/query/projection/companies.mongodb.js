// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// Chọn database để sử dụng
use("AIO_Demo");

// Aggregation pipeline: Tìm các công ty được thành lập từ năm 2005 đến 2010 (dùng $gte và $lte)
db.companies.aggregate(
    [
        {
            // Stage $match: Lọc documents theo điều kiện
            $match: {
              "founded_year":{$gte:2005, $lte:2010}  // founded_year >= 2005 và <= 2010
            }
        }
    ]
)

// Aggregation pipeline: Tìm các công ty được thành lập trong các năm cụ thể (dùng $in)
db.companies.aggregate(
    [
        {
            // Stage $match: Lọc documents theo điều kiện
            $match: {
              "founded_year":{$in:[2005, 2006, 2007, 2008, 2009, 2010]}  // founded_year nằm trong danh sách
            }
        }
    ]
)

// $gte/$lte: Nhanh hơn nếu có index trên founded_year (do dùng scan theo range - quét theo khoảng)
// $in: Có thể kém hơn nếu danh sách $in dài, vì MongoDB phải so sánh từng giá trị

// Aggregation pipeline: Lọc và chỉ hiển thị một số trường cụ thể (projection)
db.companies.aggregate(
    [
        {
            // Stage $match: Lọc documents theo năm thành lập
            $match: {
              "founded_year":{$gte:2005, $lte: 2010}  // Năm từ 2005 đến 2010
            }
        },
        {
            // Stage $project: Chọn các trường muốn hiển thị
            $project: {
              "founded_year": 1,      // Hiển thị trường founded_year (1 = include)
              "category_code":1,       // Hiển thị trường category_code
              "_id": 0                 // Ẩn trường _id (0 = exclude)
            }
        }
    ]
)

// Tạo cột mới no_employees từ copy field number_of_employees
db.companies.aggregate(
    [
        {
            // Stage $match: Lọc documents theo năm thành lập
            $match: {
              "founded_year":{$gte:2005, $lte: 2010}  // Năm từ 2005 đến 2010
            }
        },
        {
            // Stage $project: Tạo trường mới và chọn trường hiển thị
            $project: {
                "number_of_employees":1,              // Hiển thị trường gốc
              "founded_year": 1,                      // Hiển thị năm thành lập
              "category_code":1,                      // Hiển thị mã danh mục
              "no_employees": "$number_of_employees"  // Tạo trường mới no_employees từ number_of_employees
            }
        }
    ]
)

// Chuyển sang database admin (có thể là lỗi, nên giữ nguyên database AIO_Demo)
use("admin");

// Aggregation pipeline: Nhóm theo category_code và tính trung bình số nhân viên
db.companies.aggregate(
    [
        {
            // Stage $group: Nhóm documents theo category_code
            $group: {
              _id: "$category_code",                          // Nhóm theo category_code
                "avg_employees":{$avg:"$number_of_employees"}  // Tính trung bình số nhân viên
              }
            }
        ,
        {
            // Stage $sort: Sắp xếp kết quả theo avg_employees tăng dần
            $sort:{
                "avg_employees":1  // 1 = tăng dần, -1 = giảm dần
            }
        }
    ]
)

// Tìm các documents có trường number_of_employees là kiểu string (kiểm tra kiểu dữ liệu)
db.companies.find({ number_of_employees: { $type: "string" } })
