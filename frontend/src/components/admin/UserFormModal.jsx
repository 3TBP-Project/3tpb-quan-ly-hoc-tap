// AI-assisted [AI-15]
import { useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import InputField from '../auth/InputField';
import { userFormSchema } from '../../schemas/userSchema';
import { createUser, updateUser } from '../../services/userService';
import { parseApiError } from '../../utils/apiError';

/**
 * Modal thêm / sửa người dùng. user = null → thêm mới.
 * Component được mount lại mỗi lần mở (key ở trang cha) nên defaultValues luôn đúng.
 */
function UserFormModal({ user, onClose, onSaved }) {
  const isEdit = Boolean(user);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(userFormSchema(isEdit)),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'student',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setFormError('');
    try {
      const res = isEdit ? await updateUser(user.id, values) : await createUser(values);
      onSaved(res.data, isEdit);
    } catch (error) {
      setFormError(parseApiError(error).message);
    }
  };

  return (
    <Modal show onHide={onClose} centered>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5">
            {isEdit ? 'Sửa người dùng' : 'Thêm người dùng'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <InputField label="Họ và tên" type="text" autoComplete="off"
            error={errors.name} {...register('name')} />
          <InputField label="Email" type="email" autoComplete="off"
            error={errors.email} {...register('email')} />
          <Form.Group className="mb-3" controlId="role">
            <Form.Label>Vai trò</Form.Label>
            <Form.Select isInvalid={!!errors.role} {...register('role')}>
              <option value="teacher">Giảng viên</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.role?.message}</Form.Control.Feedback>
          </Form.Group>
          <InputField
            label={isEdit ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
            type="password"
            autoComplete="new-password"
            error={errors.password}
            {...register('password')}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm người dùng'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default UserFormModal;
