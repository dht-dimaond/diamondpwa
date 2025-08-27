'use server';

import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';

interface FormState {
  success?: boolean;
  error?: string[];
}

// Configure Cloudinary once
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function submitSupportComplaint(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  try {
    console.log('Form submission started');
    
    // Get the Clerk ID
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      console.log('No clerk ID found');
      return { error: ['Unauthorized access'], success: false };
    }

    // Find user in your DB
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkId },
    });

    if (!dbUser) {
      console.log('User not found in database');
      return { error: ['User not found'], success: false };
    }

    // Extract form fields
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string;
    const description = formData.get('description') as string;
    const attachmentFile = formData.get('attachment') as File | null;

    console.log('Form data extracted:', {
      name,
      email,
      subject,
      category,
      priority,
      description,
      hasAttachment: !!attachmentFile,
      attachmentName: attachmentFile?.name,
      attachmentSize: attachmentFile?.size,
      attachmentType: attachmentFile?.type
    });

    // Validate required fields
    if (!subject || !category || !description) {
      console.log('Missing required fields');
      return { error: ['Please fill in all required fields'], success: false };
    }

    let attachmentUrl: string | null = null;

    // Handle file upload
    if (attachmentFile && attachmentFile instanceof File && attachmentFile.size > 0) {
      console.log('Processing file upload:', {
        name: attachmentFile.name,
        size: attachmentFile.size,
        type: attachmentFile.type
      });

      // Validate file size (5MB limit)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (attachmentFile.size > MAX_FILE_SIZE) {
        console.log('File too large:', attachmentFile.size);
        return { error: ['File size must be less than 5MB'], success: false };
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(attachmentFile.type)) {
        console.log('Invalid file type:', attachmentFile.type);
        return { error: ['Please upload a valid file type (images, PDF, Word, or text files)'], success: false };
      }

      try {
        // Convert file to buffer
        const arrayBuffer = await attachmentFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = `data:${attachmentFile.type};base64,${buffer.toString('base64')}`;
        
        console.log('Uploading to Cloudinary...');
        
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: 'support_attachments',
          resource_type: 'auto',
          public_id: `${Date.now()}_${attachmentFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`,
          use_filename: true,
          unique_filename: false,
        });
        
        attachmentUrl = uploadResult.secure_url;
        console.log('Upload successful:', uploadResult.secure_url);
        
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return { 
          error: ['File upload failed. Please try again or contact support.'], 
          success: false 
        };
      }
    } else {
      console.log('No file to upload or file is empty');
    }

    // Create database record
    console.log('Creating database record...');
    const supportComplaint = await prisma.support_complaints.create({
      data: {
        user_id: dbUser.id,
        name: name || '',
        email: email || '',
        subject,
        category,
        priority: priority || 'Medium',
        description,
        attachment: attachmentUrl,
        status: 'Open',
      },
    });

    console.log('Database record created successfully:', supportComplaint.id);
    return { success: true };

  } catch (error) {
    console.error('Support complaint submission error:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('Prisma')) {
        return { error: ['Database error. Please try again.'], success: false };
      }
      if (error.message.includes('Cloudinary')) {
        return { error: ['File upload service error. Please try again.'], success: false };
      }
    }
    
    return { 
      error: ['An unexpected error occurred. Please try again.'], 
      success: false 
    };
  }
}