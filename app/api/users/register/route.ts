import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database/config';
import User from '@/models/User';
import { Account } from '@/models/Accounts';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const data = await req.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ phone: data.phone });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this phone number already exists' },
        { status: 400 }
      );
    }
    
    // Check if Aadhaar is already registered
    const existingAadhaar = await User.findOne({ aadhaarNumber: data.aadhaarNumber });
    if (existingAadhaar) {
      return NextResponse.json(
        { message: 'This Aadhaar number is already registered' },
        { status: 400 }
      );
    }
    
    // Create user first
    const user = await User.create({
      name: data.name,
      phone: data.phone,
      village: data.village,
      district: data.district,
      state: data.state,
      pincode: data.pincode,
      aadhaarNumber: data.aadhaarNumber,
      preferredLanguage: data.preferredLanguage
    });

    // Create account
    const accountData = {
      userId: user._id,
      name: user.name,
      balance: 0,
      currency: 'INR',
      lastUpdated: new Date()
    };

    const account = new Account(accountData);
    await account.save();
    
    console.log('User registered successfully:', {
      id: user._id,
      phone: user.phone,
      walletAddress: account.walletAddress
    });
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Registration failed';
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        errorMessage = 'This phone number or Aadhaar is already registered';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}