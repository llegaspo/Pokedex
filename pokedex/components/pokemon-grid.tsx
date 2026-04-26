"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { PokemonCard, PokemonDetails } from "@/lib/pokeapi";

const BATCH_SIZE = 10;
const DEFAULT_CARD_COLOR = "#f5f5f5";
const TYPE_COLORS: Record<string, string> = {
  bug: "#d5ef8b",
  dark: "#c7beb2",
  dragon: "#cbb8ff",
  electric: "#ffe66d",
  fairy: "#ffd6ea",
  fighting: "#f3b38f",
  fire: "#ffb3a7",
  flying: "#d6e7ff",
  ghost: "#cfc2f2",
  grass: "#bfe8b8",
  ground: "#d9c08f",
  ice: "#bfefff",
  normal: "#d3d3d3",
  poison: "#d9b3ff",
  psychic: "#ffb8cf",
  rock: "#c8b08a",
  steel: "#c7d1db",
  water: "#9fd3ff",
};

type PokemonGridProps = {
  pokemon: PokemonCard[];
};

export function PokemonGrid({ pokemon }: PokemonGridProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(
    null
  );
  const [selectedPokemonName, setSelectedPokemonName] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];

      if (entry?.isIntersecting) {
        setVisibleCount((current) =>
          Math.min(current + BATCH_SIZE, pokemon.length)
        );
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [pokemon.length]);

  async function handleCardClick(pokemonName: string) {
    setSelectedPokemon(null);
    setSelectedPokemonName(pokemonName);
    setDetailsError("");
    setIsLoadingDetails(true);

    try {
      const response = await fetch(
        `/api/pokemons/${encodeURIComponent(pokemonName)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Pokemon details.");
      }

      const details = (await response.json()) as PokemonDetails;
      setSelectedPokemon(details);
    } catch (error) {
      console.error("Failed to load Pokemon details.", error);
      setDetailsError("Failed to load Pokemon details.");
    } finally {
      setIsLoadingDetails(false);
    }
  }

  function closeModal() {
    setSelectedPokemon(null);
    setSelectedPokemonName("");
    setDetailsError("");
    setIsLoadingDetails(false);
  }

  const visiblePokemon = pokemon.slice(0, visibleCount);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {visiblePokemon.map((item) => {
          const firstType = item.types[0] || "";
          const secondType = item.types[1] || "";
          const mainType =
            firstType === "flying" && secondType ? secondType : firstType;
          const cardColor = TYPE_COLORS[mainType] || DEFAULT_CARD_COLOR;

          return (
            <article
              key={item.name}
              className="h-full rounded-xl border-2 border-black bg-[#dce85c] p-2"
            >
              <button
                type="button"
                className="block h-full w-full text-left"
                onClick={() => handleCardClick(item.name)}
              >
                <div
                  className="flex h-full flex-col items-center rounded-lg p-3 text-center"
                  style={{ backgroundColor: cardColor }}
                >
                  <img src={item.image} alt={item.name} width="120" height="120" />
                  <p>ID No.: {item.id}</p>
                  <p>Name: {item.name}</p>
                  <p>Type: {item.types.join(", ") || "Unknown"}</p>
                </div>
              </button>
            </article>
          );
        })}
      </div>
      {(isLoadingDetails || selectedPokemon || detailsError) &&
      selectedPokemonName ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-lg border-2 border-black bg-white p-4">
            <button type="button" className="mb-4 border px-3 py-1" onClick={closeModal}>
              Close
            </button>
            {isLoadingDetails ? <p>Loading pokemon details...</p> : null}
            {detailsError ? <p>{detailsError}</p> : null}
            {selectedPokemon ? (
              <div>
                <h2>{selectedPokemon.name}</h2>
                <img
                  src={selectedPokemon.image}
                  alt={selectedPokemon.name}
                  width="180"
                  height="180"
                />
                <p>ID No.: {selectedPokemon.id}</p>
                <p>Height: {selectedPokemon.height}</p>
                <p>Weight: {selectedPokemon.weight}</p>
                <p>Base Experience: {selectedPokemon.baseExperience}</p>
                <p>Abilities: {selectedPokemon.abilities.join(", ") || "Unknown"}</p>
                <p>
                  Stats:{" "}
                  {selectedPokemon.stats
                    .map((item) => `${item.name}: ${item.value}`)
                    .join(", ")}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {visibleCount < pokemon.length ? (
        <div ref={loadMoreRef} className="h-10" />
      ) : null}
    </>
  );
}
