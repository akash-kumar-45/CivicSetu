import { NextRequest, NextResponse } from "next/server";
import { authService } from "@coop/backend/server/services/auth.service";
import { RegisterInputSchema } from "@coop/backend/server/validators/auth.schema";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = RegisterInputSchema.parse(body);

    const safeUser = await authService.register(validatedData);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (error?.message?.includes("already exists")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
