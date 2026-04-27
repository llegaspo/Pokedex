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
  damage_relations: {
    double_damage_from: NamedResource[];
    half_damage_from: NamedResource[];
    no_damage_from: NamedResource[];
  };
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
  weaknesses: string[];
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
  types: Array<{
    type: {
      name: string;
    };
  }>;
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
  types: string[];
  weaknesses: string[];
  height: number;
  weight: number;
  baseExperience: number;
  abilities: string[];
  stats: Array<{
    name: string;
    value: number;
  }>;
};

const STANDARD_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

const GO_SUPER_EFFECTIVE_MULTIPLIER = 1.6;
const GO_RESISTED_MULTIPLIER = 0.625;
const GO_IMMUNE_MULTIPLIER = GO_RESISTED_MULTIPLIER * GO_RESISTED_MULTIPLIER;

type TypeDefenseChart = Record<
  string,
  {
    doubleDamageFrom: string[];
    halfDamageFrom: string[];
    noDamageFrom: string[];
  }
>;

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

function formatTypeName(type: string) {
  return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

function buildTypeDefenseChart(typeResponses: TypeResponse[]) {
  const chart: TypeDefenseChart = {};

  for (const typeData of typeResponses) {
    chart[typeData.name] = {
      doubleDamageFrom: typeData.damage_relations.double_damage_from.map(
        (item) => item.name
      ),
      halfDamageFrom: typeData.damage_relations.half_damage_from.map(
        (item) => item.name
      ),
      noDamageFrom: typeData.damage_relations.no_damage_from.map(
        (item) => item.name
      ),
    };
  }

  return chart;
}

async function getTypeResponses() {
  const typeList = await fetchFromPokeApi<TypeListResponse>(
    `${POKEAPI_BASE_URL}/type`
  );

  const standardTypes = typeList.results.filter((type) =>
    STANDARD_TYPES.includes(type.name)
  );

  return Promise.all(
    standardTypes.map((type) => fetchFromPokeApi<TypeResponse>(type.url))
  );
}

function getPokemonWeaknesses(types: string[], typeDefenseChart: TypeDefenseChart) {
  const weaknesses: Array<{ type: string; multiplier: number }> = [];

  for (const attackingType of STANDARD_TYPES) {
    let multiplier = 1;

    for (const defendingType of types) {
      const typeData = typeDefenseChart[defendingType];

      if (!typeData) {
        continue;
      }

      if (typeData.noDamageFrom.includes(attackingType)) {
        multiplier *= GO_IMMUNE_MULTIPLIER;
        continue;
      }

      if (typeData.doubleDamageFrom.includes(attackingType)) {
        multiplier *= GO_SUPER_EFFECTIVE_MULTIPLIER;
      }

      if (typeData.halfDamageFrom.includes(attackingType)) {
        multiplier *= GO_RESISTED_MULTIPLIER;
      }
    }

    if (multiplier > 1) {
      weaknesses.push({
        type: attackingType,
        multiplier,
      });
    }
  }

  return weaknesses
    .sort(
      (left, right) =>
        right.multiplier - left.multiplier || left.type.localeCompare(right.type)
    )
    .map(({ type }) => formatTypeName(type));
}

export async function getPokemonCards(): Promise<PokemonCardsResponse> {
  const pokemonList = await fetchFromPokeApi<PokemonListResponse>(
    `${POKEAPI_BASE_URL}/pokemon?limit=100000&offset=0`
  );
  const typeResponses = await getTypeResponses();
  const typeDefenseChart = buildTypeDefenseChart(typeResponses);

  const pokemonByName: Record<string, PokemonCard> = {};

  for (const item of pokemonList.results) {
    const id = getPokemonIdFromUrl(item.url);

    pokemonByName[item.name] = {
      id,
      name: item.name,
      types: [],
      weaknesses: [],
      image: getPokemonImage(id),
    };
  }

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
    pokemon: Object.values(pokemonByName).map((pokemon) => ({
      ...pokemon,
      weaknesses: getPokemonWeaknesses(pokemon.types, typeDefenseChart),
    })),
  };
}

export async function getPokemonDetails(
  pokemonName: string
): Promise<PokemonDetails> {
  const details = await fetchFromPokeApi<PokemonDetailResponse>(
    `${POKEAPI_BASE_URL}/pokemon/${pokemonName.toLowerCase()}`
  );
  const typeResponses = await getTypeResponses();
  const typeDefenseChart = buildTypeDefenseChart(typeResponses);
  const types = details.types.map((item) => item.type.name);

  return {
    id: details.id,
    name: details.name,
    image: getPokemonImage(details.id),
    types,
    weaknesses: getPokemonWeaknesses(types, typeDefenseChart),
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
