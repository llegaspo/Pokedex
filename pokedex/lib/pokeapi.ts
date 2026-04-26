const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

export type NamedApiResource = {
  name: string;
  url: string;
};

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
};

async function fetchFromPokeApi<T>(path: string): Promise<T> {
  const response = await fetch(`${POKEAPI_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PokeAPI request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getPokemonList(): Promise<PokemonListResponse> {
  return fetchFromPokeApi<PokemonListResponse>("/pokemon?limit=100000&offset=0");
}
