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
        <h1 className="p-6 text-center text-4xl font-bold tracking-wide sm:text-5xl">
          POKEDEX
        </h1>
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
      <h1 className="p-6 text-center text-4xl font-bold tracking-wide sm:text-5xl">
        POKEDEX
      </h1>
      <form className="sticky top-0 z-40 flex flex-wrap gap-2 p-4">
        <input
          type="text"
          name="search"
          placeholder="Search by name"
          defaultValue={search}
          className="rounded-md border border-black bg-white px-3 py-2 text-black outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
        />
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-md border border-black bg-white px-3 py-2 text-black outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
        >
          <option value="id">Sort by ID</option>
          <option value="name">Sort by Name</option>
        </select>
        <button
          type="submit"
          className="rounded-md border border-black bg-white px-3 py-2 text-black outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
        >
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
