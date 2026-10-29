import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = "/api/foods";

function App() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Quản lý view: 'list', 'detail', 'form'
  const [view, setView] = useState('list');
  const [selectedFood, setSelectedFood] = useState(null);
  
  // Đầy đủ 9 trường dữ liệu theo đề bài
  const [formData, setFormData] = useState({ 
    foodId: '', name: '', price: '', category: '', cuisine: '', 
    description: '', quantity: '', ingredients: '', imageUrl: '' 
  });

  // 1 & 6. Lấy danh sách & Tìm kiếm (Xử lý an toàn dữ liệu trả về)
  const fetchFoods = async (searchTerm = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}?search=${searchTerm}`);
      
      // Kiểm tra ép dữ liệu về dạng mảng an toàn để tránh lỗi .map()
      if (Array.isArray(res.data)) {
        setFoods(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setFoods(res.data.data);
      } else {
        setFoods([]);
      }
    } catch (err) {
      setError('Lỗi khi tải dữ liệu món ăn! Hãy kiểm tra lại Backend API.');
      setFoods([]); // Reset mảng rỗng để không bị sập trang
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
      setError('Lỗi khi xóa món ăn!');
    }
  };

  // 3 & 4. Xử lý Thêm / Cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Chuyển chuỗi ingredients thành mảng (Array) để đúng Schema MongoDB
    const payload = {
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity || 0),
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
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi lưu món ăn!');
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
        foodId: food.foodId || '', 
        name: food.name || '', 
        price: food.price || '', 
        category: food.category || '', 
        cuisine: food.cuisine || '', 
        description: food.description || '',
        quantity: food.quantity || 0,
        ingredients: Array.isArray(food.ingredients) ? food.ingredients.join(', ') : (food.ingredients || ''),
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Quản Lý Món Ăn</h1>
      
      {/* Thông báo trạng thái */}
      {loading && <p style={{ color: 'blue', fontWeight: 'bold' }}>Đang xử lý...</p>}
      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>{error}</p>}
      {message && <p style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px' }}>{message}</p>}

      {view === 'list' && (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <form onSubmit={handleSearch} style={{ display: 'inline-block' }}>
              <input 
                type="text" 
                placeholder="Tìm tên, loại, vùng miền..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                style={{ padding: '8px', width: '250px' }}
              />
              <button type="submit" style={{ padding: '8px 12px', marginLeft: '5px' }}>Tìm kiếm</button>
            </form>
            <button onClick={() => fetchFoods('')} style={{ padding: '8px 12px' }}>Làm mới</button>
            <button onClick={() => openForm()} style={{ padding: '8px 12px', background: 'green', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              + Thêm Món Ăn
            </button>
          </div>

          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>Mã</th>
                <th>Tên món</th>
                <th>Loại</th>
                <th>Số lượng</th>
                <th>Giá (VNĐ)</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(foods) && foods.length > 0 ? (
                foods.map(f => (
                  <tr key={f._id || f.foodId}>
                    <td>{f.foodId}</td>
                    <td><strong>{f.name}</strong></td>
                    <td>{f.category}</td>
                    <td>{f.quantity}</td>
                    <td>{f.price?.toLocaleString()}</td>
                    <td>
                      <button onClick={() => viewDetail(f)}>Chi tiết</button>
                      <button onClick={() => openForm(f)} style={{ marginLeft: '5px' }}>Sửa</button>
                      <button onClick={() => handleDelete(f._id)} style={{ color: 'red', marginLeft: '5px' }}>Xóa</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#666' }}>
                    {loading ? 'Đang tải dữ liệu...' : 'Không có món ăn nào.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {view === 'form' && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '400px', gap: '10px' }}>
          <h2>{selectedFood ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}</h2>
          
          <label>Mã món ăn (foodId - Bắt buộc):</label>
          <input 
            placeholder="VD: F004" 
            value={formData.foodId} 
            onChange={e => setFormData({...formData, foodId: e.target.value})} 
            required 
            disabled={!!selectedFood} 
          />
          
          <label>Tên món (name - Bắt buộc):</label>
          <input 
            placeholder="Tên món ăn" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
          />
          
          <label>Giá bán (price - Bắt buộc):</label>
          <input 
            type="number" 
            placeholder="Giá bán" 
            value={formData.price} 
            onChange={e => setFormData({...formData, price: e.target.value})} 
            required 
          />
          
          <label>Số lượng (quantity):</label>
          <input 
            type="number" 
            placeholder="Số lượng hiện có" 
            value={formData.quantity} 
            onChange={e => setFormData({...formData, quantity: e.target.value})} 
          />
          
          <label>Loại món ăn (category):</label>
          <input 
            placeholder="VD: Món nước, Món xào" 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})} 
          />
          
          <label>Ẩm thực / Vùng miền (cuisine):</label>
          <input 
            placeholder="VD: Miền Bắc, Thái Lan" 
            value={formData.cuisine} 
            onChange={e => setFormData({...formData, cuisine: e.target.value})} 
          />
          
          <label>Nguyên liệu (ingredients - cách nhau bằng dấu phẩy):</label>
          <input 
            placeholder="VD: Bánh phở, Thịt bò, Hành" 
            value={formData.ingredients} 
            onChange={e => setFormData({...formData, ingredients: e.target.value})} 
          />
          
          <label>Đường dẫn hình ảnh (imageUrl):</label>
          <input 
            placeholder="https://..." 
            value={formData.imageUrl} 
            onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
          />
          
          <label>Mô tả (description):</label>
          <textarea 
            rows="3" 
            placeholder="Mô tả chi tiết" 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
          
          <div style={{ marginTop: '10px' }}>
            <button type="submit" style={{ marginRight: '10px', background: 'blue', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}>
              {selectedFood ? 'Lưu thay đổi' : 'Thêm món'}
            </button>
            <button type="button" onClick={() => setView('list')} style={{ padding: '8px 16px' }}>Hủy</button>
          </div>
        </form>
      )}

      {view === 'detail' && selectedFood && (
        <div style={{ maxWidth: '500px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h2>Chi tiết món ăn</h2>
          {selectedFood.imageUrl && (
            <img 
              src={selectedFood.imageUrl} 
              alt={selectedFood.name} 
              style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '6px', marginBottom: '15px' }} 
            />
          )}
          <p><strong>Mã món (foodId):</strong> {selectedFood.foodId}</p>
          <p><strong>Tên món (name):</strong> {selectedFood.name}</p>
          <p><strong>Giá (price):</strong> {selectedFood.price?.toLocaleString()} VNĐ</p>
          <p><strong>Số lượng (quantity):</strong> {selectedFood.quantity}</p>
          <p><strong>Loại (category):</strong> {selectedFood.category || 'Chưa cập nhật'}</p>
          <p><strong>Vùng miền (cuisine):</strong> {selectedFood.cuisine || 'Chưa cập nhật'}</p>
          <p><strong>Nguyên liệu (ingredients):</strong> {Array.isArray(selectedFood.ingredients) ? selectedFood.ingredients.join(', ') : (selectedFood.ingredients || 'Không có')}</p>
          <p><strong>Mô tả (description):</strong> {selectedFood.description || 'Không có mô tả'}</p>
          <button onClick={() => setView('list')} style={{ padding: '8px 16px', marginTop: '10px' }}>Quay lại danh sách</button>
        </div>
      )}
    </div>
  );
}

export default App;