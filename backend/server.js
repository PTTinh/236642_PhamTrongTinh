const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();
const cors = require('cors');
const Food = require('./models/Food');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Đã kết nối MongoDB Atlas thành công!'))
  .catch((err) => console.log('Lỗi kết nối MongoDB:', err));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// ==========================================
// CÁC API QUẢN LÝ MÓN ĂN
// ==========================================

// 1. Lấy danh sách & Tìm kiếm món ăn
// GET /api/foods hoặc /api/foods?search=pho
// 1. Lấy danh sách & Tìm kiếm món ăn
app.get('/api/foods', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      // MẸO XỬ LÝ TIẾNG VIỆT: Biến đổi từ khóa (ví dụ "pho" thành regex tìm được cả "phở", "phố"...)
      const regexPattern = search
        .replace(/[aàáảãạăằắẳẵặâầấẩẫậ]/gi, '[aàáảãạăằắẳẵặâầấẩẫậ]')
        .replace(/[eèéẻẽẹêềếểễệ]/gi, '[eèéẻẽẹêềếểễệ]')
        .replace(/[iìíỉĩị]/gi, '[iìíỉĩị]')
        .replace(/[oòóỏõọôồốổỗộơờớởỡợ]/gi, '[oòóỏõọôồốổỗộơờớởỡợ]')
        .replace(/[uùúủũụưừứửữự]/gi, '[uùúủũụưừứửữự]')
        .replace(/[yỳýỷỹỵ]/gi, '[yỳýỷỹỵ]')
        .replace(/[dđ]/gi, '[dđ]');
        
      const regex = new RegExp(regexPattern, 'i');
      
      query = {
        $or: [
          { name: regex },
          { category: regex },
          { cuisine: regex }
        ]
      };
    }
    
    const foods = await Food.find(query).sort({ createdAt: -1 });
    res.status(200).json(foods);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách', details: err.message });
  }
});

// 2. Xem thông tin một món ăn (theo ObjectId _id của MongoDB)
// GET /api/foods/:id
app.get('/api/foods/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ error: 'Không tìm thấy món ăn' });
    }
    res.status(200).json(food);
  } catch (err) {
    res.status(400).json({ error: 'ID không hợp lệ', details: err.message });
  }
});

// 3. Thêm món ăn mới
// POST /api/foods
app.post('/api/foods', async (req, res) => {
  try {
    const { foodId, name, price } = req.body;
    
    // Kiểm tra dữ liệu đầu vào bắt buộc
    if (!foodId || !name || price === undefined) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (foodId, name, price)' });
    }

    // Kiểm tra trùng lặp foodId
    const existingFood = await Food.findOne({ foodId });
    if (existingFood) {
      return res.status(400).json({ error: `Mã món ăn ${foodId} đã tồn tại trong hệ thống` });
    }

    const newFood = new Food(req.body);
    await newFood.save();
    res.status(201).json({ message: 'Thêm món ăn thành công', data: newFood });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi thêm món ăn', details: err.message });
  }
});

// 4. Cập nhật thông tin món ăn
// PUT /api/foods/:id
app.put('/api/foods/:id', async (req, res) => {
  try {
    const { name, price, foodId } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Tên và Giá là bắt buộc' });
    }

    // Nếu có gửi lên foodId mới, kiểm tra xem nó có bị trùng với món khác không
    if (foodId) {
      const existingFood = await Food.findOne({ foodId, _id: { $ne: req.params.id } });
      if (existingFood) {
        return res.status(400).json({ error: 'Mã foodId này đã được sử dụng cho món khác' });
      }
    }

    const updatedFood = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFood) {
      return res.status(404).json({ error: 'Không tìm thấy món ăn để cập nhật' });
    }
    res.status(200).json({ message: 'Cập nhật thành công', data: updatedFood });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi cập nhật món ăn', details: err.message });
  }
});

// 5. Xóa món ăn
// DELETE /api/foods/:id
app.delete('/api/foods/:id', async (req, res) => {
  try {
    const deletedFood = await Food.findByIdAndDelete(req.params.id);
    if (!deletedFood) {
      return res.status(404).json({ error: 'Không tìm thấy món ăn để xóa' });
    }
    res.status(200).json({ message: 'Đã xóa món ăn thành công' });
  } catch (err) {
    res.status(400).json({ error: 'ID không hợp lệ', details: err.message });
  }
});

// Lắng nghe cổng
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Backend đang chạy trên port ${PORT}`));