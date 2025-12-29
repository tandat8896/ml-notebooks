// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// Chọn database để sử dụng
use("AIO_Demo");

// Tìm một document trong collection trips
db.getCollection("trips").findOne({

});

// Tìm tất cả documents trong collection trips
db.trips.find()

// Sử dụng $and operator: Tìm documents thỏa mãn TẤT CẢ các điều kiện
db.trips.find(
    {
        $and:[
            {"tripduration":{$gt:400}},      // Điều kiện 1: tripduration > 400
            {"birth year":{$gt:1988}}        // Điều kiện 2: birth year > 1988
        ]
    }
)

// Sử dụng $ne (not equal): Tìm documents có usertype != "Subscriber"
db.trips.find(
    {
        "usertype":
        {
            $ne:"Subscriber"                 // usertype không bằng "Subscriber"
        }
    }
)

// Sử dụng $not operator: Phủ định điều kiện
// Tương đương với $ne ở trên nhưng dùng $not
db.trips.find(
    {
        "usertype":
        {$not:{$eq:"Subscriber"}}            // NOT (usertype == "Subscriber")
    }
);

// Sử dụng $expr (expression operator) để so sánh trường với giá trị
// $expr cho phép sử dụng aggregation expressions trong query
db.trips.find(
    {
        $expr:
        {
            // $gt: So sánh lớn hơn
            // So sánh giá trị của trường tripduration với số 400
            $gt:["$tripduration",400]       // tripduration > 400
        }
    }
)

// Giải thích về $expr với $gt:
// So sánh $tripduration > 400
// $gt là toán tử lớn hơn
// ["$tripduration", 400] là mảng 2 phần tử:
//   - Phần tử 1: "$tripduration" = field trong document (dùng $ để tham chiếu)
//   - Phần tử 2: 400 = giá trị số để so sánh

// Tìm tất cả documents
db.trips.find()

// Sử dụng $or operator: Tìm documents thỏa mãn ÍT NHẤT 1 trong các điều kiện
db.trips.find(
    {
        $or:
        [
            {"start station name":{$type:10}},   // Điều kiện 1: start station name có type = 10 (null)
            {"end station name": {$type:10}}    // Điều kiện 2: end station name có type = 10 (null)
        ]
    }
)
// $type: 10 = null type trong BSON
// Tìm các trips có start station name hoặc end station name là null

// Cursor method: Đếm số documents (sử dụng .size())
db.trips.find().size()
// Lưu ý: .size() sẽ load tất cả documents vào memory, nên dùng .countDocuments() cho collection lớn
