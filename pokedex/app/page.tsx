import { getPokemonCards } from "@/lib/pokeapi";
import { PokemonGrid } from "@/components/pokemon-grid";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams?: Promise<{
    search?: string;
    sort?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const payload = await getPokemonCards().catch((error) => {
    console.error("Failed to load Pokemon cards from PokeAPI.", error);
    return null;
  });

  const search = params?.search?.trim() || "";
  const sort = params?.sort === "name" ? "name" : "id";

  if (!payload) {
    return (
      <main>
        <h1>Pokemons</h1>
        <p>Failed to load pokemon data from PokeAPI.</p>
      </main>
    );
  }

  const filteredPokemon = payload.pokemon
    .filter((pokemon) =>
      pokemon.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }

      return a.id - b.id;
    });

  return (
    <main className="min-h-screen">
      <h1>Pokemons</h1>
      <p>Total: {payload.count}</p>
      <form className="p-4">
        <input
          type="text"
          name="search"
          placeholder="Search by name"
          defaultValue={search}
          className="rounded-md border p-2"
        />
        <select
          name="sort"
          defaultValue={sort}
          className="ml-2 rounded-md border p-2"
        >
          <option value="id">Sort by ID</option>
          <option value="name">Sort by Name</option>
        </select>
        <button type="submit" className="ml-2 rounded-md border px-3 py-2">
          Apply
        </button>
      </form>
      <PokemonGrid
        key={`${search}:${sort}:${filteredPokemon.length}`}
        pokemon={filteredPokemon}
      />
    </main>
  );
}
