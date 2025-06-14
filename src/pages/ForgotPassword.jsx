import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/auth/forgot-password", null, {
                params: { email }
            });
            setMessage("Đã gửi email đặt lại mật khẩu (nếu tồn tại).");
        } catch (err) {
            setMessage("Có lỗi xảy ra.");
        }
    };

    return (
        <div>
            <h2>Quên mật khẩu</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Nhập email đã đăng ký"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Gửi liên kết</button>
            </form>
            <p>{message}</p>
        </div>
    );
};

export default ForgotPassword;
