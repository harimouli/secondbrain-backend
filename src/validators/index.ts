import z, { email } from "zod";

// signup schema for for user signup validation

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .trim(),
  password: z
    .string("password is must aleast 8 characters long")
    .min(8)
    .max(32)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/,
    )
    .trim(),
});

export type SignupInput = z.infer<typeof signupSchema>;
