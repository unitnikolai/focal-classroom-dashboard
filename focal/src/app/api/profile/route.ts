import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profile
 * Fetch authenticated user's profile information
 */
export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Example response structure - replace with actual call to Lambda/backend
    const profileData = {
      success: true,
      data: {
        id: 'user-123',
        personalInfo: {
          givenName: 'Musharof',
          lastName: 'Chowdhury',
          email: 'randomuser@pimjo.com',
          organizationName: 'Focal Inc.',
          avatarUrl: '/images/user/owner.jpg',
        },
        socialLinks: {
          facebook: 'https://www.facebook.com/PimjoHQ',
          twitter: 'https://twitter.com/PimjoHQ',
          linkedin: 'https://linkedin.com/company/pimjo',
          instagram: 'https://instagram.com/pimjohq',
        },
        stats: {
          totalSessions: 142,
          activeDevices: 3,
          organizationsManaged: 5,
          joinDate: '2023-01-15',
          lastActive: new Date().toISOString(),
        },
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update user's profile information
 */
export async function PUT(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updatedData = await req.json();

    // Call your backend Lambda/API to update profile
    // const response = await fetch(`${LAMBDA_URL}/user/profile`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${accessToken}`,
    //   },
    //   body: JSON.stringify(updatedData),
    // });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedData,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
