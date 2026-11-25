// AI-assisted [AI-07] [AI-18]
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout, { AuthAlert } from '../components/auth/AuthLayout';
import InputField from '../components/auth/InputField';
import { registerSchema } from '../schemas/authSchema';
import { register as registerAccount } from '../services/authService';
import { parseApiError } from '../utils/apiError';

function RegisterPage() {
    const navigate = useNavigate();
    const [formError, setFormError] = useState('');

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: yupResolver(registerSchema) });

    const onSubmit = async ({ name, email, password }) => {
        setFormError('');
        try {
            await registerAccount({ name, email, password });
            navigate('/login', { state: { registered: true } });
        } catch (error) {
            const { message, fieldErrors } = parseApiError(error);
            setFormError(message);
            Object.entries(fieldErrors).forEach(([field, msg]) =>
                setError(field, { type: 'server', message: msg }),
            );
        }
    };

    return (
        <AuthLayout>
            <h1 className="ht-h1">Tạo tài khoản</h1>
            <Link to="/login" className="ht-auth__switch">
                Đã có tài khoản? Đăng nhập
            </Link>

            {formError && (
                <AuthAlert tone="error" title="Chưa tạo được tài khoản">
                    {formError}
                </AuthAlert>
            )}

            <form noValidate onSubmit={handleSubmit(onSubmit)} className="ht-auth__form">
                <InputField label="Họ và tên" type="text" autoComplete="name"
                    placeholder="Nhập họ và tên" hint="Tên hiển thị trên hồ sơ của bạn"
                    error={errors.name} {...register('name')} />
                <InputField label="Email" type="email" autoComplete="email"
                    placeholder="Nhập email của bạn" hint="Dùng email bạn đã đăng ký tài khoản"
                    error={errors.email} {...register('email')} />
                <InputField label="Mật khẩu" type="password" autoComplete="new-password"
                    placeholder="Nhập mật khẩu" hint="Ít nhất 8 ký tự"
                    error={errors.password} {...register('password')} />
                <InputField label="Xác nhận mật khẩu" type="password" autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu" hint="Phải trùng với mật khẩu ở trên"
                    error={errors.confirmPassword} {...register('confirmPassword')} />
                <p className="ht-caption ht-auth__note">
                    Tài khoản mới là tài khoản Học viên. Tài khoản Giảng viên do quản trị viên cấp.
                </p>
                <button type="submit" className="ht-btn ht-btn--primary w-100" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
                </button>
            </form>
        </AuthLayout>
    );
}

export default RegisterPage;
