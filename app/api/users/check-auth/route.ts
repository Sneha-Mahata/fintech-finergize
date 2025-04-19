import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in check-auth:", session); // Debug log

    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Not authenticated' 
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: session.user
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Authentication check failed' 
    }, { status: 500 });
  }
}