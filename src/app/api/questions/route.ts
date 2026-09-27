import { NextResponse } from 'next/server';
import { getQuestions, createQuestion } from '@/lib/storage';

export async function GET() {
  try {
    const questions = await getQuestions();
    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, category, author_name, author_email } = body;

    if (!question || typeof question !== 'string' || question.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Question must be at least 5 characters long' },
        { status: 400 }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Question is too long (maximum 500 characters)' },
        { status: 400 }
      );
    }

    if (!author_email || typeof author_email !== 'string' || !author_email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required so we can notify you when answered.' },
        { status: 400 }
      );
    }

    const created = await createQuestion({
      questionText: question,
      category: category || 'General',
      authorName: author_name || '',
      authorEmail: author_email,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to submit question' },
      { status: 500 }
    );
  }
}
