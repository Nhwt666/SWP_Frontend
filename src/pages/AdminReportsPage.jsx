import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import AdminLayout from '../components/AdminLayout';
import '../styles/AdminReportsPage.css';

const AdminReportsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [ratingDistribution, setRatingDistribution] = useState({
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError('');
            

            let response = await fetch('/admin/reviews', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });


            if (!response.ok && response.status === 404) {
                console.log('Endpoint /admin/reviews không tồn tại, sử dụng /admin/tickets...');
                response = await fetch('/admin/tickets', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const tickets = await response.json();

                    const reviewsWithFeedback = tickets.filter(ticket => 
                        ticket.feedback && (ticket.rating || ticket.feedback)
                    ).map(ticket => ({
                        id: ticket.id,
                        rating: ticket.rating,
                        feedback: ticket.feedback,
                        feedbackDate: ticket.feedbackDate,
                        customerName: ticket.customer?.fullName || 'Khách hàng',
                        ticketId: ticket.id,
                        createdAt: ticket.createdAt
                    }));
                    
                    setReviews(reviewsWithFeedback);
                    calculateStats(reviewsWithFeedback);
                    return;
                }
            }

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Bạn không có quyền truy cập trang này');
                } else if (response.status === 401) {
                    throw new Error('Phiên đăng nhập đã hết hạn');
                } else if (response.status === 404) {
                    throw new Error('Endpoint không tồn tại. Vui lòng liên hệ admin.');
                } else {
                    throw new Error('Không thể tải dữ liệu đánh giá');
                }
            }

            const data = await response.json();
            setReviews(data);
            calculateStats(data);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (reviewsData) => {
        if (reviewsData.length === 0) {
            setAverageRating(0);
            setTotalReviews(0);
            setRatingDistribution({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
            return;
        }

        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
        const average = (sum / total).toFixed(1);
        
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach(review => {
            distribution[review.rating]++;
        });

        setAverageRating(parseFloat(average));
        setTotalReviews(total);
        setRatingDistribution(distribution);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (rating) => {
        return (
            <span className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= rating ? 'star filled' : 'star'}>
                        ★
                    </span>
                ))}
            </span>
        );
    };

    const getRatingColor = (rating) => {
        if (rating >= 4) return '#4caf50';
        if (rating >= 3) return '#ff9800';
        return '#f44336';
    };

    if (loading) {
        return (
            <>
                <Header />
                <AdminLayout>
                    <div className="loading">Đang tải dữ liệu...</div>
                </AdminLayout>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <AdminLayout>
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <div className="error-message">{error}</div>
                        <button 
                            onClick={fetchReviews}
                            className="retry-button"
                        >
                            Thử lại
                        </button>
                    </div>
                </AdminLayout>
            </>
        );
    }

    return (
        <>
            <Header />
            <AdminLayout>
                <div className="reports-container">
                    <div className="reports-header">
                        <h1>Báo Cáo Đánh Giá</h1>
                        <p>Quản lý và theo dõi đánh giá từ khách hàng</p>
                        <div style={{
                            background: '#e3f2fd',
                            padding: '12px',
                            borderRadius: '8px',
                            marginTop: '12px',
                            border: '1px solid #2196f3',
                            fontSize: '15px',
                            color: '#222',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: 700, color: '#fbc02d', fontSize: 20, marginRight: 8 }}>💡</span>
                            <span>
                                <span style={{ fontWeight: 700, color: '#1976d2' }}>Hướng dẫn:</span>
                                <span style={{ marginLeft: 4 }}>
                                    Đánh giá sẽ xuất hiện khi khách hàng hoàn thành xét nghiệm và gửi phản hồi. Nếu chưa có đánh giá nào, hãy khuyến khích khách hàng sử dụng tính năng feedback sau khi hoàn thành xét nghiệm.
                                </span>
                            </span>
                        </div>
                    </div>


                    <div className="stats-overview">
                        <div className="stat-card">
                            <div className="stat-icon">⭐</div>
                            <div className="stat-content">
                                <h3>Điểm trung bình</h3>
                                <div className="stat-value" style={{ color: getRatingColor(averageRating) }}>
                                    {averageRating}/5.0
                                </div>
                                <div className="stat-stars">
                                    {renderStars(Math.round(averageRating))}
                                </div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-content">
                                <h3>Tổng số đánh giá</h3>
                                <div className="stat-value">{totalReviews}</div>
                                <div className="stat-subtitle">đánh giá</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">📈</div>
                            <div className="stat-content">
                                <h3>Tỷ lệ hài lòng</h3>
                                <div className="stat-value">
                                    {totalReviews > 0 ? Math.round(((ratingDistribution[5] + ratingDistribution[4]) / totalReviews) * 100) : 0}%
                                </div>
                                <div className="stat-subtitle">4-5 sao</div>
                            </div>
                        </div>
                    </div>


                    <div className="rating-distribution">
                        <h3>Phân Bố Đánh Giá</h3>
                        <div className="distribution-bars">
                            {[5, 4, 3, 2, 1].map(rating => (
                                <div key={rating} className="distribution-row">
                                    <div className="rating-label">
                                        <span className="rating-number">{rating}</span>
                                        <span className="rating-star">★</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ 
                                                width: `${totalReviews > 0 ? (ratingDistribution[rating] / totalReviews) * 100 : 0}%`,
                                                backgroundColor: getRatingColor(rating)
                                            }}
                                        ></div>
                                    </div>
                                    <div className="rating-count">
                                        {ratingDistribution[rating]} ({totalReviews > 0 ? Math.round((ratingDistribution[rating] / totalReviews) * 100) : 0}%)
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="reviews-section">
                        <h3>Danh Sách Đánh Giá ({totalReviews})</h3>
                        
                        {reviews.length === 0 ? (
                            <div className="no-reviews">
                                <div className="no-reviews-icon">📝</div>
                                <p>Chưa có đánh giá nào từ khách hàng.</p>
                                <small>Đánh giá sẽ xuất hiện khi khách hàng hoàn thành xét nghiệm và gửi phản hồi.</small>
                            </div>
                        ) : (
                            <div className="reviews-list">
                                {reviews.map((review, index) => (
                                    <div key={review.id || index} className="review-card">
                                        <div className="review-header">
                                            <div className="review-info">
                                                <div className="customer-name">
                                                    {review.customerName || 'Khách hàng'}
                                                </div>
                                                <div className="review-date">
                                                    {formatDate(review.createdAt)}
                                                </div>
                                            </div>
                                            <div className="review-rating">
                                                {renderStars(review.rating)}
                                                <span className="rating-number-display">
                                                    {review.rating}/5
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {review.feedback && (
                                            <div className="review-comment">
                                                <p>"{review.feedback}"</p>
                                            </div>
                                        )}
                                        
                                        <div className="review-ticket-info">
                                            <span className="ticket-id">
                                                Mã yêu cầu: {review.ticketId}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AdminLayout>
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

export default AdminReportsPage; 