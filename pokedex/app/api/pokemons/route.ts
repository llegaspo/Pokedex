import { NextResponse } from "next/server";
import { getPokemonCards } from "@/lib/pokeapi";

export async function GET() {
  try {
    const payload = await getPokemonCards();

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch Pokemon data.",
      },
      {
        status: 500,
      }
    );
  }
}
