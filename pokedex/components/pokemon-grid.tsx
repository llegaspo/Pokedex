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
  const pokemonById = [...pokemon].sort((a, b) => a.id - b.id);
  const selectedPokemonIndex = pokemonById.findIndex(
    (item) => item.name === selectedPokemonName
  );
  const previousPokemon = selectedPokemonIndex > 0
    ? pokemonById[selectedPokemonIndex - 1]
    : null;
  const nextPokemon =
    selectedPokemonIndex >= 0 && selectedPokemonIndex < pokemonById.length - 1
      ? pokemonById[selectedPokemonIndex + 1]
      : null;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border-2 border-black bg-white p-6 shadow-lg sm:p-8">
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                className="rounded-md border px-3 py-1"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoadingDetails ? <p>Loading pokemon details...</p> : null}
              {detailsError ? <p>{detailsError}</p> : null}
              {selectedPokemon ? (
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="flex justify-center sm:w-56 sm:flex-none">
                    <img
                      src={selectedPokemon.image}
                      alt={selectedPokemon.name}
                      width="220"
                      height="220"
                    />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-semibold capitalize">
                      {selectedPokemon.name}
                    </h2>
                    <p>ID No.: {selectedPokemon.id}</p>
                    <p>Type: {selectedPokemon.types.join(", ") || "Unknown"}</p>
                    <p>
                      Weaknesses:{" "}
                      {selectedPokemon.weaknesses.join(", ") || "None"}
                    </p>
                    <p>Height: {selectedPokemon.height}</p>
                    <p>Weight: {selectedPokemon.weight}</p>
                    <p>Base Experience: {selectedPokemon.baseExperience}</p>
                    <p>
                      Abilities:{" "}
                      {selectedPokemon.abilities.join(", ") || "Unknown"}
                    </p>
                    <p>
                      Stats:{" "}
                      {selectedPokemon.stats
                        .map((item) => `${item.name}: ${item.value}`)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="mt-6 flex justify-center gap-3 border-t pt-5">
              <button
                type="button"
                className="rounded-md border px-4 py-2 disabled:opacity-50"
                onClick={() => previousPokemon && handleCardClick(previousPokemon.name)}
                disabled={!previousPokemon || isLoadingDetails}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-md border px-4 py-2 disabled:opacity-50"
                onClick={() => nextPokemon && handleCardClick(nextPokemon.name)}
                disabled={!nextPokemon || isLoadingDetails}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {visibleCount < pokemon.length ? (
        <div ref={loadMoreRef} className="h-10" />
      ) : null}
    </>
  );
}
