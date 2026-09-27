import { NextResponse } from 'next/server';
import { answerQuestion, deleteQuestion, getQuestionById } from '@/lib/storage';
import { verifyAdminSession } from '@/lib/auth';
import { sendAnswerNotificationEmail } from '@/lib/mailer';

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

    // Retrieve previous question details to get author_email
    const existing = await getQuestionById(id);

    const responder = answered_by || 'JECC Team';
    const updated = await answerQuestion(id, answer, responder);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    // Trigger email notification asynchronously if the question has an author email
    const targetEmail = updated.author_email || existing?.author_email;
    if (targetEmail) {
      sendAnswerNotificationEmail({
        recipientEmail: targetEmail,
        recipientName: updated.author_name || existing?.author_name,
        questionText: updated.question,
        answerText: answer,
        answeredBy: responder,
      }).catch((err) => {
        console.error('Failed to send answer notification email in background:', err);
      });
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
