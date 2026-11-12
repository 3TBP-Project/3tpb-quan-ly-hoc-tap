import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';

const InputField = forwardRef(({ label, error, ...rest }, ref) => (
    <Form.Group className="mb-3" controlId={rest.name}>
        <Form.Label>{label}</Form.Label>
        <Form.Control ref={ref} isInvalid={!!error} {...rest} />
        <Form.Control.Feedback type="invalid">{error?.message}</Form.Control.Feedback>
    </Form.Group>
));

InputField.displayName = 'InputField';

export default InputField;