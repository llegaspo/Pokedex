import { NextResponse } from "next/server";
import { getPokemonDetails } from "@/lib/pokeapi";

type RouteContext = {
  params: Promise<{
    name: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { name } = await params;
    const payload = await getPokemonDetails(name);

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch Pokemon details.",
      },
      {
        status: 500,
      }
    );
  }
}
