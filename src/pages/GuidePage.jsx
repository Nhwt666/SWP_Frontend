import React from 'react';
import '../styles/GuidePage.css';
import Header from '../components/Header';

const GuidePage = () => {
    return (
        <>
            <Header />
            <div className="guide-container">
                <h1>Hướng dẫn chi tiết cách lấy mẫu xét nghiệm ADN tại nhà</h1>
                <p>
                    Thông thường, để tiến hành lấy mẫu xét nghiệm ADN tại nhà, bạn cần chuẩn bị đầy đủ dụng cụ và thực hiện theo hướng dẫn dưới đây:
                </p>
                <h2>1. Cách lấy mẫu niêm mạc miệng</h2>


                <div style={{ textAlign: 'center' }}>
                    <img
                        src={process.env.PUBLIC_URL + "/niemmacmieng.jpg"}
                        alt="Lấy mẫu niêm mạc miệng"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    <p style={{ fontSize: '0.8em', color: '#555', marginTop: '4px' }}>
                        Lấy từ 5 – 10 mẫu niêm mạc miệng.
                    </p>
                </div>

                <h4>Chuẩn bị:</h4>
                <ul>
                    <li>Tăm bông sạch 5 – 10 cái</li>
                    <li>Phong bì đựng mẫu</li>
                    <li>1 tờ giấy sạch</li>
                </ul>
                <h4>Hướng dẫn thực hiện:</h4>
                <ul>
                    <li>Người thu mẫu khử trùng tay, đeo bao tay cẩn thận.</li>
                    <li>Người được thu mẫu nên súc miệng sạch sẽ.</li>
                    <li>Dùng tăm bông áp vào thành má, quệt nhiều lần.</li>
                    <li>Lặp lại với 3 – 5 tăm bông khác nhau.</li>
                    <li>Cho tăm bông vào giấy sạch, bỏ vào phong bì và ghi thông tin đầy đủ.</li>
                </ul>

                <h2>2. Hướng dẫn lẫy mẫu máu để xét nghiệm ADN</h2>


                <div style={{ textAlign: 'center' }}>
                    <img
                        src={process.env.PUBLIC_URL + "/maukho.jpg"}
                        alt="Lấy mẫu máu"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    <p style={{ fontSize: '0.8em', color: '#555', marginTop: '4px' }}>
                        Có thể lấy mẫu máu khô hoặc mẫu máu tươi để xét nghiệm ADN.
                    </p>
                </div>

                <h4>Chuẩn bị:</h4>
                <ul>
                    <li>Ống tiêm</li>
                    <li>Ống nghiệm đựng máu</li>
                    <li>Tăm bông sạch.</li>
                    <li>Bông y tế, cồn.</li>
                    <li>Phong bì đựng mẫu.</li>
                </ul>
                <h4>Hướng dẫn thực hiện:</h4>
                <ul>
                    <li>Người thu mẫu khử trùng tay sạch sẽ, đeo bao tay cẩn thận.</li>
                    <li>Sau đó bôi cồn vào vùng da sẽ lấy máu để sát khuẩn kỹ lưỡng. Tiếp đến dùng ống tiêm rút khoảng 5 – 10ml máu của người cần giám định ADN, cho vào ống nghiệm. Hoặc bạn cũng có thể chích máu ở đầu ngón tay, sau đó dùng tăm bông thấm máu.</li>
                    <li>Sau khi lấy máu xong thì cho mẫu máu vào phong bì, ghi đầy đủ thông tin người cần xét nghiệm ADN và niêm phong.</li>
                </ul>

                <h2>3. Cách thu mẫu móng tay, móng chân xét nghiệm ADN</h2>


                <div style={{ textAlign: 'center' }}>
                    <img
                        src={process.env.PUBLIC_URL + "/mongtay.jpg"}
                        alt="Lấy mẫu móng tay"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    <p style={{ fontSize: '0.8em', color: '#555', marginTop: '4px' }}>
                        Phải vệ sinh móng tay sạch sẽ trước khi lấy móng.
                    </p>
                </div>

                <h4>Chuẩn bị:</h4>
                <ul>
                    <li>Kéo hoặc kìm cắt móng.</li>
                    <li>Cồn sát khuẩn</li>
                    <li>Phong bì đựng mẫu</li>
                    <li>1 tờ giấy sạch</li>
                </ul>
                <h4>Hướng dẫn thực hiện:</h4>
                <ul>
                    <li>Người thu mẫu phải khử trùng tay sạch sẽ và đeo bao tay y tế khi thu mẫu. Người được thu mẫu cũng cần vệ sinh móng tay, móng chân với cồn trước khi lấy mẫu.</li>
                    <li>Tiếp đến, Người thu mẫu tiến hành cắt khoảng 5 – 10 mẫu móng chân và móng tay của người cần giám định ADN, cho vào tờ giấy sạch rồi bỏ vào phong bì, ghi đầy đủ thông tin, dán lại.</li>
                </ul>

                <h2>4. Cách lấy mẫu tóc để xét nghiệm ADN</h2>


                <div style={{ textAlign: 'center' }}>
                    <img
                        src={process.env.PUBLIC_URL + "/toc.jpg"}
                        alt="Lấy mẫu tóc"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    <p style={{ fontSize: '0.8em', color: '#555', marginTop: '4px' }}>
                        Cần chuẩn bị khoảng 4 – 5 mẫu tóc có chân khi làm xét nghiệm ADN.
                    </p>
                </div>

                <h4>Chuẩn bị:</h4>
                <ul>
                    <li>Giấy trắng sạch.</li>
                    <li>Phong bì đựng mẫu</li>
                    <li>Nhíp.</li>
                    <li>1 tờ giấy sạch</li>
                </ul>
                <h4>Hướng dẫn thực hiện:</h4>
                <ul>
                    <li>Khi thu mẫu Người thu mẫu phải vệ sinh tay sạch sẽ, rồi dùng nhíp nhổ từng sợi tóc 1, lưu ý là sợi tóc phải có cả chân tóc. Chỉ cần nhổ khoảng 4 – 5 sợi là được.</li>
                    <li>Sau khi nhổ xong, cho mẫu tóc vào 1 tờ giấy sạch, bỏ vào phong bì, ghi thông tin</li>
                </ul>

                <h2>5. Cách thu mẫu nước súc miệng xét nghiệm ADN</h2>


                <div style={{ textAlign: 'center' }}>
                    <img
                        src={process.env.PUBLIC_URL + "/sucmieng.jpg"}
                        alt="Lấy mẫu súc miệng"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    <p style={{ fontSize: '0.8em', color: '#555', marginTop: '4px' }}>
                        Các lọ đựng mấu nước súc miệng phải ghi tên rõ ràng
                    </p>
                </div>

                <h4>Chuẩn bị:</h4>
                <ul>
                    <li>Lọ đựng nước</li>
                    <li>Phong bì đựng mẫu</li>
                </ul>
                <h4>Hướng dẫn thực hiện:</h4>
                <ul>
                    <li>Bước 1: Buổi tối trước khi đi ngủ, bạn hãy vệ sinh răng miệng bằng các đánh răng thật sạch</li>
                    <li>Bước 2: Chuẩn bị một lọ để đựng mẫu nước súc miệng, trên lọ nhớ ghi tên của từng người rõ ràng.</li>
                    <li>Bước 3: Sáng thức dậy, hãy súc miệng kỹ lần lượt bằng 2 ngụm nước lọc, sau đó cho lọ đựng có gi tên của mình</li>
                </ul>

                <h2>6. Mẫu khác</h2>
                <ul>
                    <li>Đối với những mẫu đặc biệt khác như mẫu bàn chải đánh răng, mẫu bao cao su, mẫu kẹo cao su thì việc thu mẫu vẫn cần tiến hành như khi thu các mẫu khác.</li>
                    <li>Việc thu mẫu cần có chuyên viên y tế có kinh nghiệm thực hiện mới đảm bảo mẫu chất lượng và không ảnh hưởng nhiều đến kết quả xét nghiệm.</li>
                </ul>

                <h1>Lưu ý khi áp dụng cách xét nghiệm ADN tại nhà</h1>
                <p>
                    Cách xét nghiệm ADN tại nhà mang lại rất nhiều tiện ích, tuy nhiên để đảm bảo kết quả chính xác, thì khi thực hiện giám định huyết thống tại nhà, bạn cần lưu ý một số vấn đề sau:
                </p>
                <div style={{ textAlign: 'center' }}>
                    <img
                        src={process.env.PUBLIC_URL + "/adn.png"}
                        alt="Lấy mẫu súc miệng"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    <p style={{ fontSize: '0.8em', color: '#555', marginTop: '4px' }}>
                        Cách xét nghiệm ADN tại nhà sẽ mất khoảng 3 – 7 ngày.
                    </p>
                </div>
                    <h2>1. Đối tượng có thể thực hiện xét nghiệm ADN tại nhà</h2>
                    <h4>Tất cả mọi người ở mọi lứa tuổi đều có thể thực hiện xét nghiệm ADN tại nhà, đặc biệt, nếu bạn:</h4>
                    <ul>
                        <li>Muốn tiết kiệm thời gian.</li>
                        <li>Không thể di chuyển đến trung tâm xét nghiệm.</li>
                        <li>Gặp khó khăn trong việc đi lại.</li>
                        <li>Quá bận rộn, không có thời gian đi xét nghiệm ADN.</li>
                    </ul>
                    <h4>Thì đều có thể sử dụng dịch vụ xét nghiệm ADN tại nhà.</h4>

                    <h2>2. Thời gian xét nghiệm ADN tại nhà</h2>
                    <h4>Thời gian xét nghiệm ADN tại nhà rất nhanh chóng, kể cả thời gian lấy mẫu cho đến khi trả kết quả sẽ mất khoảng từ 3 – 7 ngày.</h4>

                    <h2>3. Một số lưu ý khác</h2>
                    <ul>
                        <li>Không giống với xét nghiệm máu, khi lấy mẫu xét nghiệm ADN bạn không cần phải nhịn ăn hay nhịn uống.</li>
                        <li>Tất cả các mẫu dùng để xét nghiệm ADN như mẫu máu, mẫu tóc, mẫu móng chân, móng tay, mẫu niêm mạc miệng,… đều cho kết quả chính xác giống nhau.</li>
                        <li>Bạn chỉ cần sử dụng một mẫu xét nghiệm nhưng phải đảm bảo tất cả những người cần làm giám định ADN đều phải có mẫu.</li>
                        <li>Việc xét nghiệm ADN tại nhà không làm ảnh hưởng đến kết quả xét nghiệm nếu đảm bảo quy trình thu mẫu đúng với quy định.</li>
                        <li>Nếu bạn thường xuyên phải truyền máu liên tục thì phải thông báo với chuyên viên khi thực hiện lấy mẫu xét nghiệm ADN.</li>
                        <li>Đối với những trẻ dưới 8 tháng tuổi thì không áp dụng lấy mẫu chân tóc bởi tóc trẻ lúc này mảnh và không đảm bảo kết quả xét nghiệm.</li>
                        <li>Thời gian bảo quản mẫu xét nghiệm có thể lên tới vài tháng hoặc vài năm tùy vào điều kiện bảo quản.</li>
                        <li>Bạn phải chuẩn bị mẫu xét nghiệm ADN của bên thứ 2 hoặc thứ 3 nếu trường hợp người đó không thuộc diện lấy mẫu ADN tại nhà.</li>
                    </ul>


            </div>
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

export default GuidePage;
