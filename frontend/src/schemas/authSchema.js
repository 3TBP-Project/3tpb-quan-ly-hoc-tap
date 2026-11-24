import * as yup from 'yup';

const email = yup
    .string()
    .required('Vui lòng nhập email')
    .email('Email không đúng định dạng (vd: a@gmail.com)');

export const loginSchema = yup.object({
    email,
    password: yup.string().required('Vui lòng nhập mật khẩu'),
});

export const registerSchema = yup.object({
    name: yup
        .string()
        .required('Vui lòng nhập họ và tên')
        .min(3, 'Họ và tên phải có ít nhất 3 ký tự')
        .max(50, 'Họ và tên không được vượt quá 50 ký tự'),
    email,
    password: yup
        .string()
        .required('Vui lòng nhập mật khẩu')
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .max(72, 'Mật khẩu không được vượt quá 72 ký tự'),
    confirmPassword: yup
        .string()
        .required('Vui lòng xác nhận lại mật khẩu')
        .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp'),
});