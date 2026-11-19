// AI-assisted [AI-15]
import * as yup from 'yup';

// Form thêm / sửa người dùng (HT-14). Khi sửa, để trống mật khẩu = giữ mật khẩu cũ.
export const userFormSchema = (isEdit) =>
  yup.object({
    name: yup
      .string()
      .trim()
      .required('Vui lòng nhập họ và tên')
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(255, 'Họ và tên quá dài'),
    email: yup
      .string()
      .trim()
      .required('Vui lòng nhập email')
      .email('Email không đúng định dạng (vd: a@gmail.com)'),
    role: yup.string().oneOf(['student', 'teacher'], 'Vai trò không hợp lệ').required(),
    password: isEdit
      ? yup
          .string()
          .test('min-if-filled', 'Mật khẩu phải có ít nhất 6 ký tự', (v) => !v || v.length >= 6)
      : yup.string().required('Vui lòng nhập mật khẩu').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  });
