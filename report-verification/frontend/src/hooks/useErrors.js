import { useState, useCallback } from "react";

const useErrors = () => {
  const [errors, setErrors] = useState({});

  const resetErrors = useCallback(() => setErrors({}), []);

  const validateForm = useCallback(async (schema, data) => {
    try {
      await schema.validate(data, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErr) {
      const fieldErrors = {};
      validationErr.inner.forEach((err) => {
        if (!fieldErrors[err.path]) {
          fieldErrors[err.path] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
  }, []);

  const clearFieldError = useCallback((field) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const setFieldError = useCallback((field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  return { errors, resetErrors, validateForm, clearFieldError, setFieldError };
};

export default useErrors;
