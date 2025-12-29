/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Chọn database để sử dụng
use("AIO_Demo")

// Tạo collection mới tên 'aio_test'
db.createCollection('aio_test')

// Chèn một document vào collection aio_test với name và age
db.aio_test.insertOne({name:"Đạt",
    age:30
})

// Hiển thị danh sách tất cả các database
show dbs;

// Chèn document vào collection aio_test trong database AIO_Demo với _id tự định nghĩa
db.aio_test.insertOne({
    _id:"Tan_Dat",  // Tự định nghĩa _id thay vì để MongoDB tự sinh
    name:"Dat",     // Tên
    age:30          // Tuổi
})

// Kiểm tra trùng lặp: Tìm document có _id = "Đạt" (không tìm thấy vì _id là "Tan_Dat")
db.aio_test.find({_id:"Đạt"})

// Kiểm tra trùng lặp: Tìm document có _id = "Tan_Dat" (sẽ tìm thấy)
db.aio_test.find({_id:"Tan_Dat"})

// Chèn document với mảng likes chứa các string
db.aio_test.insert(
    {
        "name": "Anh",              // Tên
        "likes":["sport","music"]   // Mảng các sở thích (toàn string)
    }
)

//{
//   "acknowledged": true, xác nhận thành công 
//   "insertedIds": { danh sách id gán cho document 
//     "0": { id 1 tự gán 
//       "$oid": "686a740e65237254a4183b98" object tự sinh
//      }
//    }
//  }

// Chèn document với nested object (object lồng nhau)
db.aio_test.insert(
  {
    "name": "Anh",              // Tên
    "address":                 // Địa chỉ là một object
    {
      "city":"Ha Noi",        // Thành phố
      "code": 100              // Mã
    }
  }
)

// Không nên dùng cách này vì sau này tìm kiếm trong object chỉ tìm được 
// best:sport 
// Mảng chứa được nhiều kiểu dữ liệu

// Chèn document với mảng likes chứa cả object và string (không đồng nhất)
db.aio_test.insertOne(
  {
    "name": "Anh",            // Tên
    "likes":                  // Mảng sở thích
    [
      {
        "best":"sport"        // Phần tử là object
      },
      "music"                 // Phần tử là string
    ]
  }
)

// Đó là lý do người ta khuyên nên dùng kiểu đồng nhất trong mảng: 
// toàn object hoặc toàn string → dễ truy vấn, dễ bảo trì

// Tìm document có likes.best = "sport" (truy cập field trong object của mảng)
db.aio_test.find({"likes.best":"sport"})

// Xóa một document dựa trên _id (sử dụng ObjectId - cần import hoặc dùng string nếu _id là string)
// Lưu ý: Nếu _id là string thì không cần ObjectId()
db.aio_test.deleteOne({ _id: "686a76f9090a1e63f9826866" })  // Sửa: bỏ ObjectId() vì _id có thể là string

// Chèn document với _id tự định nghĩa là "Anh_02"
db.aio_test.insertOne(
  { 
    "_id":"Anh_02",           // _id tự định nghĩa
    "name": "Anh",            // Tên
    "likes":                  // Mảng sở thích
    [
      {
        "best":"sport"        // Object trong mảng
      },
      "music"                 // String trong mảng
    ]
  }
)

// Xóa document có _id = "Anh_02" từ collection aio_test (sửa: đổi từ db.student sang db.aio_test)
db.aio_test.deleteOne({ _id: "Anh_02" })

// Chèn document vào collection aio_test (sửa: đổi từ db.student sang db.aio_test)
db.aio_test.insert({
  _id: "Anh_02",              // _id tự định nghĩa
  name: "Anh",                // Tên
  likes: [                    // Mảng sở thích
    { best: "sport" },        // Object
    "music"                   // String
  ]
})

// Khai báo biến newDoc chứa document mới cần chèn
const newDoc = {
  _id: "Anh_02",              // _id
  name: "Anh",                // Tên
  likes: [                    // Mảng sở thích
    { best: "sport" },        // Object
    "music"                   // String
  ]
};

// Kiểm tra xem document có _id này đã tồn tại chưa (sửa: đổi từ db.student sang db.aio_test)
const existing = db.aio_test.findOne({ _id: newDoc._id });

// Nếu chưa tồn tại thì chèn vào
if (!existing) {
  // Chèn document mới (sửa: đổi từ db.student sang db.aio_test)
  db.aio_test.insertOne(newDoc);
  // In thông báo thành công
  print("Đã insert.");
} else {
  // Nếu đã tồn tại thì không chèn
  print("Trùng _id, không insert.");
}

// Khai báo biến newDoc2 chứa document mới (sửa tên biến để tránh trùng với biến trên)
const newDoc2 = {
  name: "Anh",                // Tên (không có _id, MongoDB sẽ tự sinh)
  likes: [                    // Mảng sở thích
    { best: "sport" },        // Object
    "music"                   // String
  ]
};

// Kiểm tra xem document có tên này đã tồn tại chưa (sửa: đổi từ db.student sang db.aio_test)
const exists = db.aio_test.findOne({ name: newDoc2.name });

// Nếu chưa tồn tại thì chèn vào
if (!exists) {
  // Chèn document mới (sửa: đổi từ db.student sang db.aio_test)
  db.aio_test.insertOne(newDoc2);
  // In thông báo thành công
  print("Đã insert.");
} else {
  // Nếu đã tồn tại thì không chèn
  print("Trùng tên, không insert.");
}

// Tìm tất cả documents trong collection companies (dòng này không liên quan đến context, có thể xóa hoặc giữ lại)
// db.companies.find();
