// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// Chọn database để sử dụng
use("AIO_Demo");

// Tìm một document trong collection companies
db.getCollection("companies").findOne({

});

// Aggregation pipeline: Nhóm các công ty theo category_code và tính trung bình số nhân viên
db.companies.aggregate(
    [
        {
            // Stage $group: Nhóm documents theo category_code
            $group: {
              _id: "$category_code",                          // Nhóm theo category_code (mã danh mục)
                "avg_employees":{$avg:"$number_of_employees"}  // Tính trung bình số nhân viên trong mỗi nhóm
              }
            }
        ,
        {
            // Stage $sort: Sắp xếp kết quả theo avg_employees tăng dần
            $sort:{
                "avg_employees":1  // 1 = tăng dần (ascending), -1 = giảm dần (descending)
            }
        }
    ]
)
// Kết quả: Danh sách các category_code cùng với số nhân viên trung bình, được sắp xếp từ thấp đến cao
