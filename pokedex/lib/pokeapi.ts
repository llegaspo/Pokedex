const POKEAPI_BASE_URL =
  process.env.POKEAPI_BASE_URL || "https://pokeapi.co/api/v2";
const POKEMON_IMAGE_BASE_URL =
  process.env.POKEMON_IMAGE_BASE_URL ||
  "https://assets.pokemon.com/assets/cms2/img/pokedex/full";
const POKEAPI_REVALIDATE_SECONDS = 60 * 60;

type NamedResource = {
  name: string;
  url: string;
};

type PokemonListResponse = {
  count: number;
  results: NamedResource[];
};

type TypeListResponse = {
  results: NamedResource[];
};

type TypeResponse = {
  name: string;
  pokemon: Array<{
    pokemon: {
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

type PokemonDetailResponse = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  abilities: Array<{
    ability: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
};

export type PokemonDetails = {
  id: number;
  name: string;
  image: string;
  height: number;
  weight: number;
  baseExperience: number;
  abilities: string[];
  stats: Array<{
    name: string;
    value: number;
  }>;
};

async function fetchFromPokeApi<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: {
      revalidate: POKEAPI_REVALIDATE_SECONDS,
    },
  });

  if (!response.ok) {
    throw new Error(`PokeAPI request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function getPokemonIdFromUrl(url: string) {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}

function getPokemonImage(id: number) {
  return `${POKEMON_IMAGE_BASE_URL}/${String(id).padStart(3, "0")}.png`;
}

export async function getPokemonCards(): Promise<PokemonCardsResponse> {
  const pokemonList = await fetchFromPokeApi<PokemonListResponse>(
    `${POKEAPI_BASE_URL}/pokemon?limit=100000&offset=0`
  );

  const pokemonByName: Record<string, PokemonCard> = {};

  for (const item of pokemonList.results) {
    const id = getPokemonIdFromUrl(item.url);

    pokemonByName[item.name] = {
      id,
      name: item.name,
      types: [],
      image: getPokemonImage(id),
    };
  }

  const typeList = await fetchFromPokeApi<TypeListResponse>(
    `${POKEAPI_BASE_URL}/type`
  );

  const typeResponses = await Promise.all(
    typeList.results.map((type) => fetchFromPokeApi<TypeResponse>(type.url))
  );

  for (const typeData of typeResponses) {
    for (const item of typeData.pokemon) {
      const pokemon = pokemonByName[item.pokemon.name];

      if (pokemon) {
        pokemon.types.push(typeData.name);
      }
    }
  }

  return {
    count: pokemonList.count,
    pokemon: Object.values(pokemonByName),
  };
}

export async function getPokemonDetails(
  pokemonName: string
): Promise<PokemonDetails> {
  const details = await fetchFromPokeApi<PokemonDetailResponse>(
    `${POKEAPI_BASE_URL}/pokemon/${pokemonName.toLowerCase()}`
  );

  return {
    id: details.id,
    name: details.name,
    image: getPokemonImage(details.id),
    height: details.height,
    weight: details.weight,
    baseExperience: details.base_experience,
    abilities: details.abilities.map((item) => item.ability.name),
    stats: details.stats.map((item) => ({
      name: item.stat.name,
      value: item.base_stat,
    })),
  };
}
