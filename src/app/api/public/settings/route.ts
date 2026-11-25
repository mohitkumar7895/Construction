import { NextResponse } from 'next/server';
import { getSiteBundle } from '@/services/site-data';

export async function GET() {
  const bundle = await getSiteBundle();
  return NextResponse.json(bundle);
}
