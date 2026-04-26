const POKEAPI_BASE_URL =
  process.env.POKEAPI_BASE_URL || "https://pokeapi.co/api/v2";
const POKEMON_IMAGE_BASE_URL =
  process.env.POKEMON_IMAGE_BASE_URL ||
  "https://assets.pokemon.com/assets/cms2/img/pokedex/full";

type PokemonListResponse = {
  count: number;
  results: Array<{
    name: string;
    url: string;
  }>;
};

type PokemonDetailResponse = {
  id: number;
  name: string;
  types: Array<{
    type: {
      name: string;
    };
  }>;
};

export type PokemonCard = {
  id: number;
  name: string;
  types: string[];
  image: string;
};

export type PokemonCardsResponse = {
  count: number;
  pokemon: PokemonCard[];
};

async function fetchFromPokeApi<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PokeAPI request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getPokemonCards(): Promise<PokemonCardsResponse> {
  const pokemonList = await fetchFromPokeApi<PokemonListResponse>(
    `${POKEAPI_BASE_URL}/pokemon?limit=100000&offset=0`
  );

  const pokemon = await Promise.all(
    pokemonList.results.map(async (item) => {
      const details = await fetchFromPokeApi<PokemonDetailResponse>(item.url);

      return {
        id: details.id,
        name: details.name,
        types: details.types.map((entry) => entry.type.name),
        image: `${POKEMON_IMAGE_BASE_URL}/${String(details.id).padStart(3, "0")}.png`,
      };
    })
  );

  return {
    count: pokemonList.count,
    pokemon,
  };
}
