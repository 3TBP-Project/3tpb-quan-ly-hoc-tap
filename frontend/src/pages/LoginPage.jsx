// AI-assisted [AI-07] [AI-18]
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout, { AuthAlert } from '../components/auth/AuthLayout';
import InputField from '../components/auth/InputField';
import { useAuth } from '../context/useAuth';
import { loginSchema } from '../schemas/authSchema';
import { parseApiError } from '../utils/apiError';
import { HOME_BY_ROLE } from '../utils/roles';

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    // { tone: 'error' | 'warning', title, message }
    const [formError, setFormError] = useState(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: yupResolver(loginSchema) });

    const onSubmit = async (data) => {
        setFormError(null);
        try {
            const user = await login(data);
            const from = location.state?.from?.pathname;
            navigate(from ?? HOME_BY_ROLE[user.role] ?? '/', { replace: true });
        } catch (error) {
            const { message, fieldErrors } = parseApiError(error);
            // Server trả 403 khi tài khoản bị khóa (HT-14) → hộp cảnh báo vàng như Figma
            const locked = error.response?.status === 403;
            setFormError({
                tone: locked ? 'warning' : 'error',
                title: locked ? 'Tài khoản bị khóa' : 'Đăng nhập không thành công',
                message,
            });
            Object.entries(fieldErrors).forEach(([field, msg]) =>
                setError(field, { type: 'server', message: msg }),
            );
        }
    };

    return (
        <AuthLayout>
            <h1 className="ht-h1">Đăng nhập</h1>
            <Link to="/register" className="ht-auth__switch">
                Chưa có tài khoản? Đăng ký ngay
            </Link>

            {location.state?.registered && (
                <AuthAlert tone="success" title="Đăng ký thành công">
                    Vui lòng đăng nhập bằng tài khoản vừa tạo.
                </AuthAlert>
            )}
            {formError && (
                <AuthAlert tone={formError.tone} title={formError.title}>
                    {formError.message}
                </AuthAlert>
            )}

            <form noValidate onSubmit={handleSubmit(onSubmit)} className="ht-auth__form">
                <InputField label="Email" type="email" autoComplete="email"
                    placeholder="Nhập email của bạn" hint="Dùng email bạn đã đăng ký tài khoản"
                    error={errors.email} {...register('email')} />
                <InputField label="Mật khẩu" type="password" autoComplete="current-password"
                    placeholder="Nhập mật khẩu" hint="Ít nhất 8 ký tự"
                    error={errors.password} {...register('password')} />
                <button type="submit" className="ht-btn ht-btn--primary w-100" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
                </button>
            </form>
        </AuthLayout>
    );
}

export default LoginPage;
