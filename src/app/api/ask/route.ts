
import { NextRequest, NextResponse } from 'next/server'
import { getAnswer } from '../services/ask.service'
 
export async function POST(req:NextRequest) {
  const { messages, question } = await req.json()
 const answer = await getAnswer(question ?? '', messages );
  return NextResponse.json({answer})
}