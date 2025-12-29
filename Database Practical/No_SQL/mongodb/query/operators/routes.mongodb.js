// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// Chọn database để sử dụng
use("AIO_Demo");

// Tìm một document trong collection companies
db.getCollection("companies").findOne({

});

// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// Chọn database để sử dụng
use("AIO_Demo");

// Tìm một document trong collection routes
db.getCollection("routes").findOne({

});

// Tìm tất cả documents trong collection routes
db.routes.find()

// Sử dụng $expr (expression operator) để so sánh 2 trường trong cùng một document
// $expr cho phép sử dụng aggregation expressions trong query
db.routes.find(
    {
        // $expr: Cho phép so sánh các trường với nhau hoặc sử dụng aggregation expressions
        $expr:
        {
            // $eq: So sánh bằng nhau
            // So sánh giá trị của trường src_airport với giá trị của trường dst_airport
            $eq:["$src_airport","$dst_airport"]  // src_airport == dst_airport (sân bay đi = sân bay đến)
            
        }
    }
);
// Kết quả: Tìm các routes có sân bay đi và sân bay đến giống nhau (có thể là lỗi dữ liệu)
