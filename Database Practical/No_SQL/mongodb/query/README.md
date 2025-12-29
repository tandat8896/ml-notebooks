# MongoDB Query Examples - Cấu trúc thư mục

Các file query MongoDB được tổ chức theo chức năng và ngữ cảnh sử dụng:

## 📁 Cấu trúc thư mục

### `basics/` - CRUD cơ bản
Các file về thao tác CRUD cơ bản: insert, find, delete, update
- `playground-1.mongodb.js` - CRUD cơ bản, insert documents, find, delete
- `playground-2.mongodb.js` - findOne đơn giản
- `student1.mongodb.js` - insertMany, insertOne, find, findOne cơ bản

### `operators/` - Query Operators
Các file về query operators: comparison, logical, expression operators
- `students.mongodb.js` - Comparison operators ($lt, $gt, $eq, $in, $ne, $gte, $lte, $nin) và Logical operators ($and, $or)
- `routes.mongodb.js` - Expression operators ($expr)
- `strips.mongodb.js` - Logical operators ($and, $or, $not, $expr, $ne)

### `projection/` - Projection và Advanced Queries
Các file về projection và truy vấn nâng cao
- `grades.mongodb.js` - Projection, $elemMatch
- `companies.mongodb.js` - $exists operator, projection

### `aggregation/` - Aggregation Pipeline
Các file về aggregation pipeline và các stage
- `companies-aggregation.mongodb.js` - $group, $sort trong aggregation pipeline

## 📚 Mục đích học tập

- **basics**: Học các thao tác CRUD cơ bản trong MongoDB
- **operators**: Học cách sử dụng các query operators để lọc và tìm kiếm dữ liệu
- **projection**: Học cách chọn và hiển thị các trường cụ thể từ documents
- **aggregation**: Học cách sử dụng aggregation pipeline để xử lý và phân tích dữ liệu phức tạp

