import { NextResponse } from 'next/server';
import { uploadMediaFile } from '@/lib/storage';

export const runtime = 'nodejs';

// Max file size: 50MB (handles screenshots and video reproduction clips)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in form data' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    const mime = file.type;
    const isImage = mime.startsWith('image/');
    const isVideo = mime.startsWith('video/');

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only image and video files are supported.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadMediaFile(buffer, file.name, mime);

    if (!result.success || !result.url) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to upload media to storage bucket' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: file.name,
      fileType: isVideo ? 'video' : 'image',
      size: file.size,
    });
  } catch (error: any) {
    console.error('Upload endpoint error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error while processing upload' },
      { status: 500 }
    );
  }
}
