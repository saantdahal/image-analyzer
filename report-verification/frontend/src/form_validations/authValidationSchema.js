import * as Yup from "yup";

const requiredMessage = "This field is required.";
const maxLengthMessage = (max) =>
  `Maximum character length for this field is ${max}.`;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordMessage =
  "Password must contain at least one uppercase, one lowercase, one number, and one special character (@$!%*?&).";

export const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required(requiredMessage)
    .email("Please enter a valid email address.")
    .max(50, maxLengthMessage(50)),

  password: Yup.string()
    .required(requiredMessage)
    // .min(8, "Minimum password length is 8 characters.")
    .max(50, maxLengthMessage(50)),
});

export const registerValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required(requiredMessage)
    .max(40, maxLengthMessage(40)),

  middleName: Yup.string().max(40, maxLengthMessage(40)),

  lastName: Yup.string()
    .required(requiredMessage)
    .max(40, maxLengthMessage(40)),

  gender: Yup.string().required(requiredMessage),

  permanentAddress:Yup.string().required(requiredMessage),

  email: Yup.string()
    .required(requiredMessage)
    .email("Please enter a valid email address.")
    .max(50, maxLengthMessage(50)),

  phone: Yup.string()
    .required(requiredMessage)
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits."),

  citizenshipNumber: Yup.string()
    .required(requiredMessage)
    .max(50, maxLengthMessage(50)),

  password: Yup.string()
    .required(requiredMessage)
    .min(8, "Minimum password length is 8 characters.")
    .max(50, maxLengthMessage(50))
    .matches(passwordRegex, passwordMessage), 
    
  confirmPassword: Yup.string()
    .required(requiredMessage)
    .oneOf([Yup.ref("password")], "Passwords do not match."),
});

export const changePasswordValidationSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required(requiredMessage),

  newPassword: Yup.string()
    .required(requiredMessage)
    .min(8, 'Minimum password length is 8 characters.')
    .max(50, maxLengthMessage(50))
    .matches(passwordRegex, passwordMessage)
    .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password.'),

  confirmPassword: Yup.string()
    .required(requiredMessage)
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match.'),
});