const { z } = require('zod')

/**
 * Custom password validation function
 */
const passwordValidation = password => {
  // At least 8 characters
  if (password.length < 8) return false

  // At least 1 lowercase letter
  if (!/[a-z]/.test(password)) return false

  // At least 1 uppercase letter
  if (!/[A-Z]/.test(password)) return false

  // At least 1 number
  if (!/\d/.test(password)) return false

  // At least 1 symbol
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return false

  return true
}

/**
 * Schema for user registration
 */
const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters')
      .refine(passwordValidation, {
        message:
          'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol',
      }),
  }),
})

/**
 * Schema for user login
 */
const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    isRemember: z.boolean().optional(),
  }),
})

/**
 * Schema for password change
 */
const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(100, 'New password must be less than 100 characters')
      .refine(passwordValidation, {
        message:
          'New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol',
      }),
  }),
})

/**
 * Schema for profile update
 */
const updateInfoSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .optional(),
    avatar: z.string().url('Invalid avatar URL').optional(),
  }),
})

/**
 * Schema for Google OAuth login
 */
const googleLoginSchema = z.object({
  body: z.object({
    access_token: z.string().min(1, 'Access token is required'),
    isRemember: z.boolean().optional(),
  }),
})

/**
 * Schema for email verification
 */
const verifySchema = z.object({
  query: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
})

/**
 * Schema for forgot password request
 */
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
})

/**
 * Schema for password reset
 */
const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(100, 'New password must be less than 100 characters')
      .refine(passwordValidation, {
        message:
          'New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol',
      }),
  }),
})

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateInfoSchema,
  googleLoginSchema,
  verifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
}
