import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminBlogPage.css';
import Header from '../components/Header';

const AdminBlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewBlog, setPreviewBlog] = useState(null);
    const [editingBlog, setEditingBlog] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        author: '',
        image: '',
        imageFile: null,
        status: 'draft'
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchBlogs();
        
        // Cleanup function để revoke URL objects khi component unmount
        return () => {
            if (formData.image && formData.image.startsWith('blob:')) {
                URL.revokeObjectURL(formData.image);
            }
        };
    }, []);

    // Debug effect để theo dõi thay đổi của blogs
    useEffect(() => {
        console.log('Blogs state updated:', blogs);
    }, [blogs]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            
            // Thử lấy blogs từ localStorage trước
            const savedBlogs = localStorage.getItem('adminBlogs');
            if (savedBlogs) {
                const parsedBlogs = JSON.parse(savedBlogs);
                setBlogs(parsedBlogs);
                setLoading(false);
                return;
            }
            
            // Nếu không có trong localStorage, sử dụng mock data
            const mockBlogs = [
                {
                    id: 10,
                    title: 'Quy trình xét nghiệm ADN dân sự bằng cách tự gửi mẫu',
                    author: 'Dr. Nguyễn Văn A',
                    status: 'published',
                    createdAt: '2024-01-15',
                    image: '/blog1.jpg',
                    content: 'Quản lý quá trình thực hiện xét nghiệm bằng cách tự gửi mẫu (chỉ áp dụng cho các dịch vụ xét nghiệm ADN dân sự).\n\nQuy trình thực hiện:\n\n1. Đăng ký đặt hẹn dịch vụ xét nghiệm\n• Khách hàng đăng ký trực tuyến hoặc qua điện thoại\n• Chọn loại xét nghiệm ADN dân sự phù hợp\n• Cung cấp thông tin cá nhân và lý do xét nghiệm\n• Thanh toán phí dịch vụ\n\n2. Nhận bộ kit xét nghiệm\n• Bộ kit được gửi đến địa chỉ khách hàng\n• Bao gồm: que tăm bông, túi đựng mẫu, hướng dẫn chi tiết\n• Kit được đóng gói an toàn, đảm bảo vệ sinh\n\n3. Thu thập mẫu xét nghiệm\n• Thực hiện theo hướng dẫn trong bộ kit\n• Sử dụng que tăm bông để lấy mẫu niêm mạc miệng\n• Đảm bảo mẫu được thu thập đúng cách\n• Ghi chép thông tin người cung cấp mẫu\n\n4. Chuyển mẫu đến cơ sở y tế\n• Đóng gói mẫu theo hướng dẫn\n• Gửi mẫu về trung tâm xét nghiệm\n• Có thể sử dụng dịch vụ chuyển phát nhanh\n• Mẫu được bảo quản trong điều kiện phù hợp\n\n5. Thực hiện xét nghiệm tại cơ sở y tế và ghi nhận kết quả\n• Mẫu được kiểm tra chất lượng\n• Thực hiện phân tích ADN bằng công nghệ hiện đại\n• Quá trình được giám sát nghiêm ngặt\n• Kết quả được ghi nhận chi tiết\n\n6. Trả kết quả xét nghiệm\n• Kết quả được gửi qua email hoặc bưu điện\n• Báo cáo chi tiết với độ chính xác cao\n• Tư vấn kết quả nếu cần thiết\n• Bảo mật thông tin tuyệt đối\n\nLưu ý quan trọng:\n• Chỉ áp dụng cho xét nghiệm ADN dân sự\n• Đảm bảo tuân thủ hướng dẫn thu thập mẫu\n• Thời gian xử lý: 3-5 ngày làm việc\n• Độ chính xác: 99.99%\n• Bảo mật thông tin theo quy định pháp luật'
                },
                {
                    id: 1,
                    title: 'Tại sao xét nghiệm ADN lại quan trọng?',
                    author: 'Dr. Nguyễn Văn A',
                    status: 'published',
                    createdAt: '2024-05-01',
                    image: '/blog1.jpg',
                    content: 'Xét nghiệm ADN là một phương pháp khoa học hiện đại giúp xác định mối quan hệ huyết thống giữa các cá nhân. Phương pháp này sử dụng công nghệ phân tích gen tiên tiến để so sánh các đoạn ADN đặc trưng.\n\nCác ứng dụng chính của xét nghiệm ADN bao gồm:\n• Xác minh quan hệ cha-con, mẹ-con\n• Xác định huyết thống trong các vụ kiện tụng\n• Nghiên cứu di truyền học\n• Phát hiện các bệnh di truyền\n\nQuy trình xét nghiệm ADN bao gồm các bước: thu thập mẫu, chiết tách ADN, khuếch đại gen, phân tích và đọc kết quả. Độ chính xác của phương pháp này lên đến 99.99%.'
                },
                {
                    id: 2,
                    title: 'Quy trình xét nghiệm ADN diễn ra như thế nào?',
                    author: 'Dr. Trần Thị B',
                    status: 'published',
                    createdAt: '2024-05-03',
                    image: '/blog2.jpg',
                    content: 'Xét nghiệm ADN tại nhà là dịch vụ tiện lợi cho những người không có thời gian đến trung tâm xét nghiệm. Quy trình này đảm bảo tính bảo mật và chính xác cao.\n\nCác bước thực hiện:\n1. Đặt lịch hẹn với nhân viên y tế\n2. Nhân viên đến tận nhà thu thập mẫu\n3. Mẫu được bảo quản và vận chuyển an toàn\n4. Phân tích tại phòng thí nghiệm\n5. Trả kết quả qua email hoặc bưu điện\n\nƯu điểm của xét nghiệm tại nhà:\n• Tiết kiệm thời gian di chuyển\n• Bảo mật thông tin cá nhân\n• Thủ tục đơn giản, nhanh chóng\n• Kết quả chính xác như xét nghiệm tại trung tâm'
                },
                {
                    id: 3,
                    title: 'Những lầm tưởng phổ biến về xét nghiệm ADN',
                    author: 'Dr. Lê Văn C',
                    status: 'published',
                    createdAt: '2024-05-05',
                    image: '/blog3.jpg',
                    content: 'Xét nghiệm ADN đóng vai trò quan trọng trong lĩnh vực y học hiện đại, không chỉ giúp xác định huyết thống mà còn hỗ trợ chẩn đoán và điều trị bệnh.\n\nCác ứng dụng y học của xét nghiệm ADN:\n\n1. Chẩn đoán bệnh di truyền:\n• Phát hiện sớm các bệnh di truyền\n• Đánh giá nguy cơ mắc bệnh\n• Tư vấn di truyền cho gia đình\n\n2. Y học cá thể hóa:\n• Xác định thuốc phù hợp với từng cá nhân\n• Giảm tác dụng phụ của thuốc\n• Tối ưu hóa liều lượng điều trị\n\n3. Nghiên cứu y học:\n• Phát triển thuốc mới\n• Nghiên cứu cơ chế bệnh\n• Cải thiện phương pháp điều trị'
                },
                {
                    id: 4,
                    title: 'Xét nghiệm ADN cho trẻ sơ sinh: Khi nào cần thiết?',
                    author: 'Dr. Phạm Thị D',
                    status: 'published',
                    createdAt: '2024-05-07',
                    image: '/blog4.jpg',
                    content: 'Xét nghiệm ADN cho trẻ sơ sinh là một thủ tục y khoa hiện đại đang ngày càng được quan tâm tại Việt Nam cũng như trên thế giới. Việc phân tích ADN từ khi bé mới chào đời có thể giúp phát hiện sớm các vấn đề di truyền hoặc xác minh huyết thống khi cần thiết.\n\nCác trường hợp cần thiết:\n1. Xác minh quan hệ huyết thống (cha – con, mẹ – con)\n2. Phát hiện sớm bệnh lý di truyền bẩm sinh\n3. Sàng lọc sơ sinh mở rộng\n4. Hỗ trợ pháp lý (nhận con, tranh chấp nuôi con, xuất nhập cảnh)\n5. Trường hợp đặc biệt: Nhầm con trong bệnh viện\n\nPhương pháp lấy mẫu cho trẻ sơ sinh:\n• Mẫu phổ biến: Niêm mạc miệng, mẫu máu gót chân, cuống rốn, tóc có chân tóc\n• Không gây đau hoặc ảnh hưởng đến sức khỏe nếu lấy mẫu đúng quy chuẩn'
                },
                {
                    id: 5,
                    title: 'Bảo mật thông tin trong xét nghiệm ADN',
                    author: 'Dr. Nguyễn Văn E',
                    status: 'published',
                    createdAt: '2024-05-10',
                    image: '/blog5.jpg',
                    content: 'Xét nghiệm ADN không chỉ là một thủ tục y khoa thông thường mà còn là một hành động liên quan trực tiếp đến thông tin di truyền, danh tính, quan hệ huyết thống và sức khỏe cá nhân. Chính vì vậy, bảo mật thông tin trong xét nghiệm ADN là yếu tố then chốt để bảo vệ quyền riêng tư và tránh các rủi ro về pháp lý, đạo đức.\n\nTại sao bảo mật thông tin ADN lại quan trọng?\n• ADN là dữ liệu định danh sinh học duy nhất, không thể thay đổi\n• Xâm phạm dữ liệu ADN có thể dẫn đến lộ quan hệ huyết thống bí mật\n• Phân biệt đối xử trong bảo hiểm, việc làm do tiền sử di truyền\n• Lạm dụng thông tin cho mục đích hình sự, thương mại hóa\n\nBiện pháp bảo mật tại các trung tâm xét nghiệm uy tín:\n• Mã hóa thông tin khách hàng bằng mã số thay vì tên thật\n• Chỉ trả kết quả cho người đăng ký, yêu cầu CMND/CCCD đối chiếu\n• Không lưu mẫu sinh phẩm và kết quả quá thời gian quy định\n• Hệ thống bảo mật đạt tiêu chuẩn ISO 27001'
                },
                {
                    id: 6,
                    title: 'So sánh các phương pháp xét nghiệm ADN hiện nay',
                    author: 'Dr. Lê Thị F',
                    status: 'published',
                    createdAt: '2024-05-15',
                    image: '/blog6.jpg',
                    content: 'Xét nghiệm ADN là công nghệ phân tích thông tin di truyền nhằm phục vụ nhiều mục đích: xác minh huyết thống, phát hiện bệnh lý di truyền, định danh cá thể hay nghiên cứu y học. Hiện nay, có nhiều phương pháp xét nghiệm ADN khác nhau, mỗi phương pháp phù hợp với mục đích và điều kiện sử dụng riêng.\n\nCác phương pháp chính:\n\n1. Xét nghiệm ADN bằng STR (Short Tandem Repeats):\n• Ứng dụng: Xét nghiệm huyết thống cha – con, mẹ – con; giám định pháp y\n• Độ chính xác: 99,9999%\n• Chi phí: 2 – 5 triệu VNĐ\n• Thời gian: 1 – 3 ngày\n\n2. Xét nghiệm ADN bằng SNP (Single Nucleotide Polymorphism):\n• Ứng dụng: Sàng lọc nguy cơ bệnh di truyền, phân tích tổ tiên\n• Độ chính xác: Cao\n• Chi phí: 3 – 10 triệu VNĐ\n• Thời gian: 7 – 14 ngày\n\n3. Giải trình tự toàn bộ gen (Whole Genome Sequencing):\n• Ứng dụng: Nghiên cứu chuyên sâu, phát hiện đột biến hiếm\n• Độ chính xác: Rất cao\n• Chi phí: 15 – 30 triệu VNĐ\n• Thời gian: 14 – 30 ngày\n\nViệc chọn loại xét nghiệm ADN phù hợp phụ thuộc vào mục đích sử dụng, chi phí, và mức độ chính xác mong muốn.'
                },
                {
                    id: 7,
                    title: 'Xét nghiệm ADN và những điều cần biết',
                    author: 'Dr. Nguyễn Văn A',
                    status: 'published',
                    createdAt: '2024-01-15',
                    image: '/blog1.jpg',
                    content: 'Xét nghiệm ADN là một phương pháp khoa học hiện đại giúp xác định mối quan hệ huyết thống giữa các cá nhân. Phương pháp này sử dụng công nghệ phân tích gen tiên tiến để so sánh các đoạn ADN đặc trưng.\n\nCác ứng dụng chính của xét nghiệm ADN bao gồm:\n• Xác minh quan hệ cha-con, mẹ-con\n• Xác định huyết thống trong các vụ kiện tụng\n• Nghiên cứu di truyền học\n• Phát hiện các bệnh di truyền\n\nQuy trình xét nghiệm ADN bao gồm các bước: thu thập mẫu, chiết tách ADN, khuếch đại gen, phân tích và đọc kết quả. Độ chính xác của phương pháp này lên đến 99.99%.'
                },
                {
                    id: 8,
                    title: 'Quy trình xét nghiệm ADN tại nhà',
                    author: 'Dr. Trần Thị B',
                    status: 'published',
                    createdAt: '2024-01-10',
                    image: '/blog2.jpg',
                    content: 'Xét nghiệm ADN tại nhà là dịch vụ tiện lợi cho những người không có thời gian đến trung tâm xét nghiệm. Quy trình này đảm bảo tính bảo mật và chính xác cao.\n\nCác bước thực hiện:\n1. Đặt lịch hẹn với nhân viên y tế\n2. Nhân viên đến tận nhà thu thập mẫu\n3. Mẫu được bảo quản và vận chuyển an toàn\n4. Phân tích tại phòng thí nghiệm\n5. Trả kết quả qua email hoặc bưu điện\n\nƯu điểm của xét nghiệm tại nhà:\n• Tiết kiệm thời gian di chuyển\n• Bảo mật thông tin cá nhân\n• Thủ tục đơn giản, nhanh chóng\n• Kết quả chính xác như xét nghiệm tại trung tâm'
                },
                {
                    id: 9,
                    title: 'Tầm quan trọng của xét nghiệm ADN trong y học',
                    author: 'Dr. Lê Văn C',
                    status: 'draft',
                    createdAt: '2024-01-08',
                    image: '/blog3.jpg',
                    content: 'Xét nghiệm ADN đóng vai trò quan trọng trong lĩnh vực y học hiện đại, không chỉ giúp xác định huyết thống mà còn hỗ trợ chẩn đoán và điều trị bệnh.\n\nCác ứng dụng y học của xét nghiệm ADN:\n\n1. Chẩn đoán bệnh di truyền:\n• Phát hiện sớm các bệnh di truyền\n• Đánh giá nguy cơ mắc bệnh\n• Tư vấn di truyền cho gia đình\n\n2. Y học cá thể hóa:\n• Xác định thuốc phù hợp với từng cá nhân\n• Giảm tác dụng phụ của thuốc\n• Tối ưu hóa liều lượng điều trị\n\n3. Nghiên cứu y học:\n• Phát triển thuốc mới\n• Nghiên cứu cơ chế bệnh\n• Cải thiện phương pháp điều trị'
                }
            ];
            
            // Lưu mock data vào localStorage
            localStorage.setItem('adminBlogs', JSON.stringify(mockBlogs));
            
            setTimeout(() => {
                setBlogs(mockBlogs);
                setLoading(false);
            }, 500);
        } catch (err) {
            setError('Không thể tải danh sách blog');
            setLoading(false);
        }
    };

    const handleCreateBlog = () => {
        setFormData({
            title: '',
            content: '',
            author: '',
            image: '',
            imageFile: null,
            status: 'draft'
        });
        setShowCreateModal(true);
    };

    const handleEditBlog = (blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            content: blog.content || '',
            author: blog.author,
            image: blog.image,
            imageFile: null,
            status: blog.status
        });
        setShowEditModal(true);
    };

    const handlePreviewBlog = (blog) => {
        setPreviewBlog(blog);
        setShowPreviewModal(true);
    };

    const handleDeleteBlog = async (blogId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa blog này?')) {
            try {
                setBlogs(prevBlogs => {
                    const updatedBlogs = prevBlogs.filter(blog => blog.id !== blogId);
                    
                    // Lưu vào localStorage
                    localStorage.setItem('adminBlogs', JSON.stringify(updatedBlogs));
                    
                    return updatedBlogs;
                });
                alert('Đã xóa blog thành công!');
            } catch (err) {
                alert('Không thể xóa blog');
            }
        }
    };

    const handleResetData = () => {
        if (window.confirm('Bạn có chắc chắn muốn reset dữ liệu về trạng thái ban đầu? Tất cả blog đã tạo sẽ bị mất.')) {
            localStorage.removeItem('adminBlogs');
            fetchBlogs();
            alert('Đã reset dữ liệu thành công!');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('Form data:', formData); // Debug log
        
        // Validation
        if (!formData.title.trim()) {
            alert('Vui lòng nhập tiêu đề bài viết!');
            return;
        }
        
        if (!formData.author.trim()) {
            alert('Vui lòng nhập tên tác giả!');
            return;
        }

        try {
            let finalImageUrl = formData.image;
            
            // Nếu có file upload, xử lý file trước
            if (formData.imageFile) {
                // Trong thực tế, bạn sẽ upload file lên server ở đây
                // Ví dụ: const uploadedUrl = await uploadImageToServer(formData.imageFile);
                // finalImageUrl = uploadedUrl;
                
                // Hiện tại giả lập bằng cách tạo URL từ file
                finalImageUrl = URL.createObjectURL(formData.imageFile);
            }

            if (showCreateModal) {
                const newBlog = {
                    id: Date.now(),
                    title: formData.title.trim(),
                    content: formData.content.trim(),
                    author: formData.author.trim(),
                    image: finalImageUrl,
                    status: formData.status,
                    createdAt: new Date().toISOString().split('T')[0]
                };
                
                console.log('New blog to be created:', newBlog); // Debug log
                
                // Thêm blog mới vào đầu danh sách
                setBlogs(prevBlogs => {
                    const updatedBlogs = [newBlog, ...prevBlogs];
                    console.log('Updated blogs list:', updatedBlogs); // Debug log
                    
                    // Lưu vào localStorage
                    localStorage.setItem('adminBlogs', JSON.stringify(updatedBlogs));
                    
                    return updatedBlogs;
                });
                
                const statusText = formData.status === 'published' ? 'Đã xuất bản' : 'Bản nháp';
                alert(`✅ Đã tạo blog thành công!\n\nTiêu đề: ${newBlog.title}\nTác giả: ${newBlog.author}\nTrạng thái: ${statusText}`);
            } else {
                // Cập nhật blog hiện có
                setBlogs(prevBlogs => {
                    const updatedBlogs = prevBlogs.map(blog => 
                        blog.id === editingBlog.id 
                            ? { 
                                ...blog, 
                                title: formData.title.trim(),
                                content: formData.content.trim(),
                                author: formData.author.trim(),
                                image: finalImageUrl,
                                status: formData.status
                              }
                            : blog
                    );
                    
                    // Lưu vào localStorage
                    localStorage.setItem('adminBlogs', JSON.stringify(updatedBlogs));
                    
                    return updatedBlogs;
                });
                alert('Đã cập nhật blog thành công!');
            }
            
            // Đóng modal và reset form
            setShowCreateModal(false);
            setShowEditModal(false);
            setFormData({
                title: '',
                content: '',
                author: '',
                image: '',
                imageFile: null,
                status: 'draft'
            });
        } catch (err) {
            console.error('Lỗi khi lưu blog:', err);
            alert('Có lỗi xảy ra khi lưu blog!');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra loại file
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file hình ảnh!');
                return;
            }
            
            // Kiểm tra kích thước file (giới hạn 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File hình ảnh không được lớn hơn 5MB!');
                return;
            }

            // Tạo URL preview cho hình ảnh
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                imageFile: file,
                image: imageUrl
            }));
        }
    };

    const handleImageUrlChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            image: value,
            imageFile: null // Reset file khi nhập URL
        }));
    };

    const getStatusDisplay = (status) => {
        return status === 'published' ? 'Đã xuất bản' : 'Bản nháp';
    };

    const getStatusClass = (status) => {
        return status === 'published' ? 'status-published' : 'status-draft';
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="admin-blog-container">
                    <aside className="sidebar">
                        <nav>
                            <ul>
                                <li>ADN ADMIN</li>
                                <li onClick={() => navigate('/admin/dashboard')} style={{ cursor: 'pointer' }}>
                                    Bảng điều khiển
                                </li>
                                <li onClick={() => navigate('/admin/tickets')} style={{ cursor: 'pointer' }}>
                                    Xét nghiệm ADN
                                </li>
                                <li onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
                                    Người dùng
                                </li>
                                <li onClick={() => navigate('/admin/blog')} style={{ cursor: 'pointer' }}>
                                    Quản lý blog
                                </li>
                                <li onClick={() => navigate('/admin/settings')} style={{ cursor: 'pointer' }}>
                                    Cài đặt
                                </li>
                            </ul>
                        </nav>
                    </aside>
                    <main className="dashboard-content">
                        <div className="loading">Đang tải...</div>
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="admin-blog-container">
                <aside className="sidebar">
                    <nav>
                        <ul>
                            <li>ADN ADMIN</li>
                            <li onClick={() => navigate('/admin/dashboard')} style={{ cursor: 'pointer' }}>
                                Bảng điều khiển
                            </li>
                            <li onClick={() => navigate('/admin/tickets')} style={{ cursor: 'pointer' }}>
                                Xét nghiệm ADN
                            </li>
                            <li onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
                                Người dùng
                            </li>
                            <li onClick={() => navigate('/admin/blog')} style={{ cursor: 'pointer' }}>
                                Quản lý blog
                            </li>
                            <li onClick={() => navigate('/admin/settings')} style={{ cursor: 'pointer' }}>
                                Cài đặt
                            </li>
                        </ul>
                    </nav>
                </aside>

                <main className="dashboard-content">
                    <header className="dashboard-header">
                        <h2>Quản lý Blog</h2>
                        <div className="admin-badge">Quản trị viên</div>
                    </header>

                    {error && <p className="error">{error}</p>}

                    <div className="blog-actions">
                        <button className="add-blog-btn" onClick={handleCreateBlog}>
                            ✨ Tạo bài viết mới
                        </button>
                        <button className="reset-data-btn" onClick={handleResetData}>
                            Reset dữ liệu
                        </button>
                    </div>

                    <div className="blog-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Hình ảnh</th>
                                    <th>Tiêu đề</th>
                                    <th>Tác giả</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="no-blogs">
                                            Chưa có bài viết nào
                                        </td>
                                    </tr>
                                ) : (
                                    blogs.map(blog => (
                                        <tr key={blog.id}>
                                            <td>
                                                <img 
                                                    src={blog.image} 
                                                    alt={blog.title}
                                                    className="blog-image"
                                                    onError={(e) => {
                                                        e.target.src = '/logo.png';
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <span 
                                                    className="blog-title-link"
                                                    onClick={() => handlePreviewBlog(blog)}
                                                >
                                                    {blog.title}
                                                </span>
                                            </td>
                                            <td>{blog.author}</td>
                                            <td>
                                                <span className={`blog-status ${getStatusClass(blog.status)}`}>
                                                    {getStatusDisplay(blog.status)}
                                                </span>
                                            </td>
                                            <td>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td className="blog-actions-cell">
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEditBlog(blog)}
                                                >
                                                    ✏️ Sửa
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteBlog(blog.id)}
                                                >
                                                    🗑️ Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="blog-modal">
                    <div className="blog-modal-content">
                        <div className="blog-modal-header">
                            <h3>{showCreateModal ? 'Tạo bài viết mới' : 'Chỉnh sửa bài viết'}</h3>
                            <button 
                                className="blog-modal-close"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setShowEditModal(false);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="blog-form">
                            <div className="blog-form-group">
                                <label htmlFor="title">Tiêu đề bài viết</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Nhập tiêu đề bài viết..."
                                />
                            </div>
                            <div className="blog-form-group">
                                <label htmlFor="author">Tác giả</label>
                                <input
                                    type="text"
                                    id="author"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Nhập tên tác giả..."
                                />
                            </div>
                            <div className="blog-form-group">
                                <label htmlFor="image">Hình ảnh bài viết</label>
                                <div className="image-upload-section">
                                    <div className="image-preview">
                                        {formData.image && (
                                            <img 
                                                src={formData.image} 
                                                alt="Preview" 
                                                className="image-preview-img"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="image-inputs">
                                        <div className="file-upload">
                                            <label htmlFor="imageFile" className="file-upload-label">
                                                📁 Chọn file hình ảnh
                                            </label>
                                            <input
                                                type="file"
                                                id="imageFile"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                            />
                                            <small className="file-info">
                                                Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
                                            </small>
                                        </div>
                                        <div className="url-input">
                                            <label htmlFor="imageUrl">Hoặc nhập URL hình ảnh:</label>
                                            <input
                                                type="text"
                                                id="imageUrl"
                                                name="image"
                                                value={formData.image}
                                                onChange={handleImageUrlChange}
                                                placeholder="Nhập URL hình ảnh..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="blog-form-group">
                                <label htmlFor="content">Nội dung bài viết</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="Nhập nội dung bài viết... (Không bắt buộc)"
                                    rows="8"
                                />
                                <small className="form-help-text">
                                    Nội dung bài viết không bắt buộc. Bạn có thể để trống và cập nhật sau.
                                </small>
                            </div>
                            <div className="blog-form-group">
                                <label htmlFor="status">Trạng thái</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="draft">Bản nháp</option>
                                    <option value="published">Xuất bản</option>
                                </select>
                            </div>
                            <div className="blog-form-actions">
                                <button 
                                    type="button" 
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setShowEditModal(false);
                                    }}
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="save-btn">
                                    {showCreateModal ? 'Tạo bài viết' : 'Cập nhật'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && previewBlog && (
                <div className="blog-modal">
                    <div className="blog-modal-content blog-preview-content">
                        <div className="blog-modal-header">
                            <h3>Xem trước bài viết</h3>
                            <button 
                                className="blog-modal-close"
                                onClick={() => setShowPreviewModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="blog-preview">
                            <div className="blog-preview-header">
                                <h2 className="blog-preview-title">{previewBlog.title}</h2>
                                <div className="blog-preview-meta">
                                    <span className="blog-preview-author">Tác giả: {previewBlog.author}</span>
                                    <span className="blog-preview-date">
                                        Ngày tạo: {new Date(previewBlog.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span className={`blog-preview-status ${getStatusClass(previewBlog.status)}`}>
                                        {getStatusDisplay(previewBlog.status)}
                                    </span>
                                </div>
                            </div>
                            
                            {previewBlog.image && (
                                <div className="blog-preview-image">
                                    <img 
                                        src={previewBlog.image} 
                                        alt={previewBlog.title}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            
                            <div className="blog-preview-content-text">
                                {previewBlog.content ? (
                                    <div className="blog-content">
                                        {previewBlog.content}
                                    </div>
                                ) : (
                                    <div className="blog-content-placeholder">
                                        <p>Chưa có nội dung bài viết</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="blog-preview-actions">
                            <button 
                                className="edit-btn"
                                onClick={() => {
                                    setShowPreviewModal(false);
                                    handleEditBlog(previewBlog);
                                }}
                            >
                                ✏️ Chỉnh sửa bài viết
                            </button>
                            <button 
                                className="cancel-btn"
                                onClick={() => setShowPreviewModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="member-footer">
                <div className="member-footer-content">
                    <div className="member-footer-info">
                        <div><strong>Số Hotline:</strong> 1800.9999</div>
                        <div><strong>Email:</strong> trungtamxetnghiem@gmail.com</div>
                        <div><strong>Địa chỉ:</strong> 643 Điện Biên Phủ, Phường 1, Quận 3, TPHCM</div>
                    </div>
                    <div className="member-footer-map">
                        <iframe
                            title="Bản đồ Trung tâm xét nghiệm ADN"
                            src="https://www.google.com/maps?q=643+Điện+Biên+Phủ,+Phường+1,+Quận+3,+TPHCM&output=embed"
                            width="250"
                            height="140"
                            style={{ border: 0, borderRadius: 10 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default AdminBlogPage; 