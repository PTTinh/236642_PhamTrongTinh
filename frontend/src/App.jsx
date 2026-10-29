import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Quản lý view: 'list', 'detail', 'form'
  const [view, setView] = useState('list');
  const [selectedFood, setSelectedFood] = useState(null);
  
  // Đã bổ sung quantity, ingredients, imageUrl
  const [formData, setFormData] = useState({ 
    foodId: '', name: '', price: '', category: '', cuisine: '', 
    description: '', quantity: '', ingredients: '', imageUrl: '' 
  });

  // 1 & 6. Lấy danh sách & Tìm kiếm
  const fetchFoods = async (searchTerm = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}?search=${searchTerm}`);
      setFoods(res.data);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu món ăn!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFoods(search);
  };

  // 5. Xóa món ăn
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa món này?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMessage('Xóa thành công!');
      fetchFoods();
    } catch (err) {
      setError('Lỗi khi xóa!');
    }
  };

  // 3 & 4. Xử lý Thêm / Cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Xử lý chuỗi ingredients thành mảng (Array) trước khi gửi
    const payload = {
      ...formData,
      ingredients: typeof formData.ingredients === 'string' 
        ? formData.ingredients.split(',').map(i => i.trim()).filter(i => i !== '') 
        : formData.ingredients
    };

    try {
      if (selectedFood) { // Update
        await axios.put(`${API_URL}/${selectedFood._id}`, payload);
        setMessage('Cập nhật thành công!');
      } else { // Create
        await axios.post(API_URL, payload);
        setMessage('Thêm món thành công!');
      }
      setView('list');
      fetchFoods();
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra!');
    }
    setLoading(false);
  };

  // Mở form Thêm hoặc Sửa
  const openForm = (food = null) => {
    setError('');
    setMessage('');
    setSelectedFood(food);
    if (food) {
      setFormData({ 
        foodId: food.foodId, 
        name: food.name, 
        price: food.price, 
        category: food.category || '', 
        cuisine: food.cuisine || '', 
        description: food.description || '',
        quantity: food.quantity || 0,
        ingredients: food.ingredients ? food.ingredients.join(', ') : '', // Ghép mảng thành chuỗi để sửa
        imageUrl: food.imageUrl || ''
      });
    } else {
      setFormData({ foodId: '', name: '', price: '', category: '', cuisine: '', description: '', quantity: '', ingredients: '', imageUrl: '' });
    }
    setView('form');
  };

  // 2. Xem chi tiết
  const viewDetail = (food) => {
    setSelectedFood(food);
    setView('detail');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Quản Lý Món Ăn</h1>
      
      {/* Thông báo */}
      {loading && <p style={{ color: 'blue' }}>Đang xử lý...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      {view === 'list' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <form onSubmit={handleSearch} style={{ display: 'inline-block', marginRight: '10px' }}>
              <input type="text" placeholder="Tìm tên, loại..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <button type="submit">Tìm kiếm</button>
            </form>
            <button onClick={() => fetchFoods('')}>Làm mới</button>
            <button onClick={() => openForm()} style={{ marginLeft: '20px', background: 'green', color: 'white' }}>+ Thêm Món Ăn</button>
          </div>

          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Mã</th><th>Tên món</th><th>Loại</th><th>Số lượng</th><th>Giá (VNĐ)</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {foods.map(f => (
                <tr key={f._id}>
                  <td>{f.foodId}</td>
                  <td>{f.name}</td>
                  <td>{f.category}</td>
                  <td>{f.quantity}</td>
                  <td>{f.price}</td>
                  <td>
                    <button onClick={() => viewDetail(f)}>Chi tiết</button>
                    <button onClick={() => openForm(f)} style={{ marginLeft: '5px' }}>Sửa</button>
                    <button onClick={() => handleDelete(f._id)} style={{ color: 'red', marginLeft: '5px' }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {view === 'form' && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '350px', gap: '10px' }}>
          <h2>{selectedFood ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}</h2>
          
          <label>Mã món ăn (Bắt buộc):</label>
          <input placeholder="VD: F004" value={formData.foodId} onChange={e => setFormData({...formData, foodId: e.target.value})} required disabled={!!selectedFood} />
          
          <label>Tên món (Bắt buộc):</label>
          <input placeholder="Tên món" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          
          <label>Giá bán (Bắt buộc):</label>
          <input type="number" placeholder="Giá" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
          
          <label>Số lượng:</label>
          <input type="number" placeholder="Số lượng" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          
          <label>Loại món ăn:</label>
          <input placeholder="VD: Món nước" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          
          <label>Ẩm thực / Vùng miền:</label>
          <input placeholder="VD: Miền Bắc" value={formData.cuisine} onChange={e => setFormData({...formData, cuisine: e.target.value})} />
          
          <label>Nguyên liệu (cách nhau bằng dấu phẩy):</label>
          <input placeholder="VD: Bánh phở, Thịt bò, Hành" value={formData.ingredients} onChange={e => setFormData({...formData, ingredients: e.target.value})} />
          
          <label>Link hình ảnh (URL):</label>
          <input placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
          
          <label>Mô tả:</label>
          <textarea placeholder="Mô tả chi tiết" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          
          <div style={{ marginTop: '10px' }}>
            <button type="submit" style={{ marginRight: '10px', background: 'blue', color: 'white' }}>{selectedFood ? 'Lưu thay đổi' : 'Thêm'}</button>
            <button type="button" onClick={() => setView('list')}>Hủy</button>
          </div>
        </form>
      )}

      {view === 'detail' && selectedFood && (
        <div style={{ maxWidth: '500px' }}>
          <h2>Chi tiết món ăn</h2>
          {selectedFood.imageUrl && (
            <img src={selectedFood.imageUrl} alt={selectedFood.name} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }} />
          )}
          <p><strong>Mã món:</strong> {selectedFood.foodId}</p>
          <p><strong>Tên món:</strong> {selectedFood.name}</p>
          <p><strong>Giá:</strong> {selectedFood.price} VNĐ</p>
          <p><strong>Số lượng hiện có:</strong> {selectedFood.quantity}</p>
          <p><strong>Loại:</strong> {selectedFood.category}</p>
          <p><strong>Vùng miền:</strong> {selectedFood.cuisine}</p>
          <p><strong>Nguyên liệu:</strong> {selectedFood.ingredients ? selectedFood.ingredients.join(', ') : 'Không có'}</p>
          <p><strong>Mô tả:</strong> {selectedFood.description}</p>
          <button onClick={() => setView('list')}>Quay lại danh sách</button>
        </div>
      )}
    </div>
  );
}

export default App;