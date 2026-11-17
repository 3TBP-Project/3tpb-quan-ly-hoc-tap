// AI-assisted [AI-07]
import { useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import InputField from '../components/auth/InputField';
import { useAuth } from '../context/useAuth';
import { loginSchema } from '../schemas/authSchema';
import { parseApiError } from '../utils/apiError';
import { HOME_BY_ROLE } from '../utils/roles';

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [formError, setFormError] = useState('');

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: yupResolver(loginSchema) });

    const onSubmit = async (data) => {
        setFormError('');
        try {
            const user = await login(data);
            const from = location.state?.from?.pathname;
            navigate(from ?? HOME_BY_ROLE[user.role] ?? '/', { replace: true });
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
                <h1 className="h4 mb-3">Đăng nhập</h1>
                {location.state?.registered && (
                    <Alert variant="success">Đăng ký thành công. Vui lòng đăng nhập.</Alert>
                )}
                {formError && <Alert variant="danger">{formError}</Alert>}
                <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                    <InputField label="Email" type="email" autoComplete="email"
                        error={errors.email} {...register('email')} />
                    <InputField label="Mật khẩu" type="password" autoComplete="current-password"
                        error={errors.password} {...register('password')} />
                    <Button type="submit" className="w-100" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                </Form>
                <p className="mt-3 mb-0 text-center">
                    Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                </p>
            </Card.Body>
        </Card>
    );
}

export default LoginPage;