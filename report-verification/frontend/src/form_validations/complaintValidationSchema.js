import * as Yup from "yup";

const requiredMessage = "This field is required.";
const maxLengthMessage = (max) =>
  `Maximum character length for this field is ${max}.`;

export const complaintValidationSchema = Yup.object().shape({
  title: Yup.string().required(requiredMessage).max(500, maxLengthMessage(500)),

  incidentDate: Yup.string().required(requiredMessage),

  description: Yup.string()
    .required(requiredMessage)
    .min(20, "Description must be at least 20 characters.")
    .max(2000, maxLengthMessage(2000)),

  // tagIds: Yup.array().min(1, "Please select at least one category."),

  victimFirstName: Yup.string().when("isVictim", {
    is: false,
    then: (schema) =>
      schema.required(requiredMessage).max(40, maxLengthMessage(40)),
    otherwise: (schema) => schema,
  }),

  victimLastName: Yup.string().when("isVictim", {
    is: false,
    then: (schema) =>
      schema.required(requiredMessage).max(40, maxLengthMessage(40)),
    otherwise: (schema) => schema,
  }),

  victimPhone: Yup.string().when("isVictim", {
    is: false,
    then: (schema) =>
      schema
        .required(requiredMessage)
        .matches(/^[0-9]{10}$/, "Phone number must be 10 digits."),
    otherwise: (schema) => schema,
  }),

  suspectName: Yup.string().max(255, maxLengthMessage(255)),

  relationToVictim: Yup.string().when("isVictim", {
    is: false,
    then: (schema) =>
      schema.required(requiredMessage).max(100, maxLengthMessage(100)),
    otherwise: (schema) => schema,
  }),

  suspectProfileUrl: Yup.string()
    .max(500, maxLengthMessage(500))
    .test("valid-url", "Please enter a valid URL.", (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }),

  confirmAccurate: Yup.boolean().oneOf(
    [true],
    "You must confirm the information is accurate.",
  ),
});
