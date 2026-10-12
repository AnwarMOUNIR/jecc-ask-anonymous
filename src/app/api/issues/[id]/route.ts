import { NextResponse } from 'next/server';
import { updateIssueStatus, deleteIssue, getIssueById } from '@/lib/storage';
import { verifyAdminSession } from '@/lib/auth';
import { sendIssueStatusUpdateEmail } from '@/lib/mailer';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await verifyAdminSession(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé. Connexion administrateur requise.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, admin_notes, resolved_by } = body;

    const current = await getIssueById(id);
    if (!current) {
      return NextResponse.json(
        { success: false, error: 'Signalement introuvable.' },
        { status: 404 }
      );
    }

    const updated = await updateIssueStatus(id, {
      status: status || current.status,
      adminNotes: admin_notes !== undefined ? admin_notes : current.admin_notes,
      resolvedBy: resolved_by || 'Pôle Technique Centrale Tech',
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Impossible de mettre à jour le signalement.' },
        { status: 500 }
      );
    }

    // Send email notification to the reporter
    if (updated.author_email) {
      sendIssueStatusUpdateEmail({
        issue: updated,
        adminNotes: admin_notes,
        responderName: resolved_by,
      }).catch((err) => {
        console.error('Failed to dispatch background email:', err);
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating issue:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du signalement' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await verifyAdminSession(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé. Connexion administrateur requise.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const deleted = await deleteIssue(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Signalement introuvable ou déjà supprimé.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Signalement supprimé avec succès.' });
  } catch (error: any) {
    console.error('Error deleting issue:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du signalement' },
      { status: 500 }
    );
  }
}
