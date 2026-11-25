import { NextResponse } from 'next/server';
import { diagnoseDbError } from '@/lib/db';

export function apiErrorResponse(error: unknown, fallbackMessage = 'Internal request error') {
  const err = error as { code?: string; message?: string } | null;

  if (err?.code === 'ER_DUP_ENTRY') {
    return NextResponse.json({ error: 'Duplicate record or URL slug already exists.' }, { status: 409 });
  }

  if (err?.code) {
    const diag = diagnoseDbError(error);
    if (diag.status === 503) {
      return NextResponse.json({ error: diag.message, code: diag.code }, { status: 503 });
    }
  }

  console.error('[API Error]', error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
