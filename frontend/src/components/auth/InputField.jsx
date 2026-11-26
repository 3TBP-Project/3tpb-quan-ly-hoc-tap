// AI-assisted [AI-07] [AI-18]
import { forwardRef } from 'react';

/**
 * Ô nhập dùng cho form đăng nhập / đăng ký (Figma component "Input": Mặc định / Lỗi).
 * - hint: dòng gợi ý dưới ô (ẩn khi đang có lỗi)
 * - error: lỗi từ react-hook-form, hiện "✕ nội dung lỗi" màu đỏ
 */
const InputField = forwardRef(({ label, error, hint, ...rest }, ref) => {
  const id = rest.id ?? rest.name;
  const describedBy = error || hint ? `${id}-help` : undefined;

  return (
    <div className={`ht-input${error ? ' has-error' : ''}`}>
      <label htmlFor={id} className="ht-input__label">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className="ht-input__field"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {error ? (
        <p id={describedBy} className="ht-input__help ht-input__help--error">
          <span aria-hidden="true">✕</span> {error.message}
        </p>
      ) : (
        hint && (
          <p id={describedBy} className="ht-input__help">
            {hint}
          </p>
        )
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
