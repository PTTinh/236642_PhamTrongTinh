Xây dựng ứng dụng quản lý món ăn gồm frontend, backend API và cơ sở dữ liệu MongoDB Atlas; quản lý mã nguồn bằng GitHub; đóng gói ứng dụng bằng Docker, đẩy image lên Docker Hub và triển khai hệ thống trên Render.

## Câu 5: Hướng dẫn chạy Backend bằng Docker
**Kéo image từ Docker Hub:**
`docker pull phamtrongtinh/backend`

**Chạy container:**
`docker run -d -p 5000:5000 -e MONGO_URI="<Chuỗi_kết_nối_MongoDB_của_bạn>" phamtrongtinh/backend`

## Câu 6: Hướng dẫn chạy Frontend bằng Docker
```bash
docker pull phamtrongtinh/frontend
docker run -d -p 80:80 phamtrongtinh/frontend