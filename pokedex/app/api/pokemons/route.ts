import { NextResponse } from "next/server";
import { getPokemonList } from "@/lib/pokeapi";

export async function GET() {
  try {
    const payload = await getPokemonList();

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch Pokemon list.",
      },
      {
        status: 500,
      }
    );
  }
}
