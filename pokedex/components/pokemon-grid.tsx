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

function formatPokemonId(id: number) {
  return `#${id.toString().padStart(3, "0")}`;
}

function formatPokemonText(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function getTypeColor(type: string) {
  return TYPE_COLORS[type.toLowerCase()] || DEFAULT_CARD_COLOR;
}

function getCardColor(types: string[]) {
  const firstType = types[0] || "";
  const secondType = types[1] || "";
  const mainType =
    firstType === "flying" && secondType ? secondType : firstType;

  return getTypeColor(mainType);
}

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
          const cardColor = getCardColor(item.types);

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
                  className="flex h-full flex-col rounded-lg p-3"
                  style={{ backgroundColor: cardColor }}
                >
                  <p className="text-left text-sm font-medium tracking-[0.2em] text-neutral-700">
                    {formatPokemonId(item.id)}
                  </p>
                  <div className="flex flex-1 flex-col items-center justify-center py-2 text-center">
                    <img src={item.image} alt={item.name} width="120" height="120" />
                    <p className="mt-2 text-center text-lg font-bold capitalize">
                      {item.name}
                    </p>
                  </div>
                  <div className="mt-auto flex justify-end">
                    <div className="flex flex-wrap justify-end gap-2">
                      {item.types.length ? (
                        item.types.map((type) => (
                          <span
                            key={type}
                            className="rounded-full px-2.5 py-1 text-xs font-medium text-neutral-900"
                            style={{
                              backgroundColor: getTypeColor(type),
                              filter: "saturate(1.1) brightness(0.92)",
                            }}
                          >
                            {formatPokemonText(type)}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-neutral-700">Unknown</span>
                      )}
                    </div>
                  </div>
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
                <div className="space-y-6">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-sm font-medium tracking-[0.2em] text-neutral-600">
                      {formatPokemonId(selectedPokemon.id)}
                    </p>
                    <h2 className="text-3xl font-semibold capitalize">
                      {selectedPokemon.name}
                    </h2>
                  </div>
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <div className="space-y-4 sm:w-60 sm:flex-none">
                      <div className="flex justify-center rounded-2xl bg-neutral-100 p-4">
                        <img
                          src={selectedPokemon.image}
                          alt={selectedPokemon.name}
                          width="220"
                          height="220"
                        />
                      </div>
                      <div className="space-y-3 rounded-2xl border border-black/10 bg-neutral-50 p-4">
                        <p>
                          <span className="font-semibold">Weight:</span>{" "}
                          {selectedPokemon.weight}
                        </p>
                        <p>
                          <span className="font-semibold">Height:</span>{" "}
                          {selectedPokemon.height}
                        </p>
                        <div className="space-y-2">
                          <p className="font-semibold">Type</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedPokemon.types.length ? (
                              selectedPokemon.types.map((type) => (
                                <span
                                  key={type}
                                  className="rounded-full px-3 py-1 text-sm font-medium text-neutral-900"
                                  style={{
                                    backgroundColor: getTypeColor(type),
                                  }}
                                >
                                  {formatPokemonText(type)}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-neutral-600">
                                Unknown
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <p className="font-semibold">Weaknesses</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedPokemon.weaknesses.length ? (
                            selectedPokemon.weaknesses.map((weakness) => (
                              <span
                                key={weakness}
                                className="rounded-full px-3 py-1 text-sm font-medium text-neutral-900"
                                style={{
                                  backgroundColor: getTypeColor(weakness),
                                }}
                              >
                                {weakness}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-neutral-600">None</span>
                          )}
                        </div>
                      </div>
                      <p>
                        <span className="font-semibold">Base Experience:</span>{" "}
                        {selectedPokemon.baseExperience}
                      </p>
                      <p>
                        <span className="font-semibold">Abilities:</span>{" "}
                        {selectedPokemon.abilities.join(", ") || "Unknown"}
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Stats</p>
                        <div className="space-y-1">
                          {selectedPokemon.stats.map((item) => (
                            <p key={item.name}>
                              {formatPokemonText(item.name)}: {item.value}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
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
