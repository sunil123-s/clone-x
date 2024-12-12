import z from 'zod';

const userNameSchema = z.string().min(6).max(40).transform((val) => val.trim());
const emailSchema = z.string().email("Invalid email address").transform((val) => val.trim().toLowerCase());
const passwordSchema =  z.string().min(8,"Password must be at least 8 characters long").max(20);

export const SingUpSchema = z.object({
    userName : userNameSchema,      
    fullName : z.string().min(2).max(20).transform((val) => val.trim()).optional(),
    email    : emailSchema,
    password : passwordSchema,
    bio: z.string().max(200 , { message: "Bio can't exceed 200 characters" }).optional().transform((val) => val?.trim()),
    coverImg :z.string().url().optional().transform((val) => val?.trim()),
    profileImg:z.string().url().optional().transform((val) => val?.trim()),
    link:z.string().url().optional().transform((val) => val?.trim() ),
})

export const loginSchema = z.object({
    identifier: z.string().min(1, "Identifier is required").refine((val) => {
        const isEmail = emailSchema.safeParse(val).success;
        const isUserName = userNameSchema.safeParse(val).success;
        return isEmail || isUserName;
    }, {
        message: "Must be a valid email or username (min 6 characters)",
    }),
    password: passwordSchema
});