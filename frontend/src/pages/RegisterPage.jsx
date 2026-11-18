// AI-assisted [AI-07]
import { useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
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
        <Card className="mx-auto" style={{ maxWidth: 420 }}>
            <Card.Body>
                <h1 className="h4 mb-3">Đăng ký tài khoản</h1>
                {formError && <Alert variant="danger">{formError}</Alert>}
                <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                    <InputField label="Họ và tên" type="text" autoComplete="name"
                        error={errors.name} {...register('name')} />
                    <InputField label="Email" type="email" autoComplete="email"
                        error={errors.email} {...register('email')} />
                    <InputField label="Mật khẩu" type="password" autoComplete="new-password"
                        error={errors.password} {...register('password')} />
                    <InputField label="Xác nhận mật khẩu" type="password" autoComplete="new-password"
                        error={errors.confirmPassword} {...register('confirmPassword')} />
                    <Button type="submit" className="w-100" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                    </Button>
                </Form>
                <p className="mt-3 mb-0 text-center">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
            </Card.Body>
        </Card>
    );
}

export default RegisterPage;
