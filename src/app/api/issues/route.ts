import { NextResponse } from 'next/server';
import { getIssues, createIssue } from '@/lib/storage';

export async function GET() {
  try {
    const issues = await getIssues();
    return NextResponse.json({ success: true, data: issues });
  } catch (error: any) {
    console.error('Failed to fetch issues:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      severity,
      platform,
      machine_info,
      author_name,
      author_email,
      author_room,
      screenshots,
      video_url,
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Un titre clair d\'au moins 3 caractères est requis.' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Une description détaillée d\'au moins 5 caractères est requise.' },
        { status: 400 }
      );
    }

    if (!author_email || typeof author_email !== 'string' || !author_email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Une adresse e-mail valide est obligatoire pour suivre le statut de votre signalement.' },
        { status: 400 }
      );
    }

    const created = await createIssue({
      title: title.trim(),
      description: description.trim(),
      category: category || 'Machine Malfunction',
      severity: severity || 'medium',
      platform: {
        device: platform?.device || 'Other',
        browser: platform?.browser || 'Other',
        osVersion: platform?.osVersion || '',
        browserVersion: platform?.browserVersion || '',
        screenResolution: platform?.screenResolution || '',
        customDetails: platform?.customDetails || '',
      },
      machine_info: machine_info ? {
        room: machine_info.room || '',
        machineNumber: machine_info.machineNumber || '',
      } : undefined,
      author_name: author_name ? author_name.trim() : '',
      author_email: author_email.trim().toLowerCase(),
      author_room: author_room ? author_room.trim() : '',
      screenshots: Array.isArray(screenshots) ? screenshots : [],
      video_url: video_url && typeof video_url === 'string' && video_url.trim().length > 0 ? video_url.trim() : null,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to submit issue:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'enregistrement du signalement' },
      { status: 500 }
    );
  }
}
