import { NextResponse } from 'next/server';
import { answerQuestion, deleteQuestion } from '@/lib/storage';
import { verifyAdminSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await verifyAdminSession(request);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { answer, answered_by } = body;

    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Answer cannot be empty' }, { status: 400 });
    }

    const updated = await answerQuestion(id, answer, answered_by || 'JECC Team');
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await verifyAdminSession(request);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteQuestion(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete question' }, { status: 500 });
  }
}
