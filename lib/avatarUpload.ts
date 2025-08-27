"use server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const avatarSchema = z.object({
    clerkId: z.string().min(1),
    avatar: z.instanceof(File, {message: "Avatar file is required"})
        .refine(file => file.size > 0, "Avatar file is required")
        .refine(file => file.type.startsWith("image/"), "File must be an image")
        .refine(file => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
})

export async function updateUserAvatar(prevState: unknown, formData: FormData) {
    const result = avatarSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!result.success) {
        return result.error.formErrors.fieldErrors;
    }

    const data = result.data;

    try {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { clerkId: data.clerkId }
        });

        if (!user) {
            return { error: ["User not found"] };
        }

        // Upload image to Cloudinary
        const imageBuffer = Buffer.from(await data.avatar.arrayBuffer()).toString("base64");
        
        const imageUpload = await cloudinary.uploader.upload(
            `data:${data.avatar.type};base64,${imageBuffer}`,
            {
                resource_type: "image",
                folder: "avatars",
                transformation: [
                    { width: 400, height: 400, crop: "fill" },
                    { quality: "auto" }
                ]
            }
        );

        // Update user avatar in database
        await prisma.user.update({
            where: { clerkId: data.clerkId },
            data: { avatar: imageUpload.secure_url }
        });

        revalidatePath("/profile");
        return { success: true, avatarUrl: imageUpload.secure_url };

    } catch (error) {
        console.error("Error updating avatar:", error);
        return { error: ["Failed to update avatar"] };
    }
}