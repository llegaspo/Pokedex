/* eslint-disable @next/next/no-img-element */
import { getPokemonCards } from "@/lib/pokeapi";

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
    <main>
      <h1>Pokemons</h1>
      <p>Total: {payload.count}</p>
      <form className="p-4">
        <input
          type="text"
          name="search"
          placeholder="Search by name"
          defaultValue={search}
          className="border p-2"
        />
        <select name="sort" defaultValue={sort} className="ml-2 border p-2">
          <option value="id">Sort by ID</option>
          <option value="name">Sort by Name</option>
        </select>
        <button type="submit" className="ml-2 border px-3 py-2">
          Apply
        </button>
      </form>
      <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredPokemon.map((pokemon) => (
          <article key={pokemon.name} className="border p-3">
            <img src={pokemon.image} alt={pokemon.name} width="120" height="120" />
            <p>ID No.: {pokemon.id}</p>
            <p>Name: {pokemon.name}</p>
            <p>Type: {pokemon.types.join(", ") || "Unknown"}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
