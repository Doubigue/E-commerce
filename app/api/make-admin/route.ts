import { NextResponse } from "next/server";
import { grantAdminRole, adminApp } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "loubikoadoubigue93@gmail.com";

  try {
    const auth = getAuth(adminApp);
    const user = await auth.getUserByEmail(email);

    await grantAdminRole(user.uid);

    return NextResponse.json({
      success: true,
      message: `Rôle admin attribué avec succès à ${email}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
