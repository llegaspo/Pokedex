import { getPokemonList } from "@/lib/pokeapi";

export const dynamic = "force-dynamic";

export default async function PokemonsPage() {
  const payload = await getPokemonList().catch(() => null);

  if (!payload) {
    return (
      <main>
        <h1>Pokemons</h1>
        <p>Failed to load pokemon list from PokeAPI.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Pokemons</h1>
      <p>Total: {payload.count}</p>
      <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {payload.results.map((pokemon) => (
          <article key={pokemon.name} className="border p-3">
            <p>{pokemon.name}</p>
            <p>{pokemon.url}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
