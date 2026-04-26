import { getPokemonCards } from "@/lib/pokeapi";

export const dynamic = "force-dynamic";

export default async function Home() {
  const payload = await getPokemonCards().catch(() => null);

  if (!payload) {
    return (
      <main>
        <h1>Pokemons</h1>
        <p>Failed to load pokemon data from PokeAPI.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Pokemons</h1>
      <p>Total: {payload.count}</p>
      <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {payload.pokemon.map((pokemon) => (
          <article key={pokemon.name} className="border p-3">
            <p>ID No.: {pokemon.id}</p>
            <p>Name: {pokemon.name}</p>
            <p>Type: {pokemon.types.join(", ") || "Unknown"}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
