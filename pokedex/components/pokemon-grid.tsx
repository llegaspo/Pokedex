"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { PokemonCard } from "@/lib/pokeapi";

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
              <div
                className="flex h-full flex-col items-center rounded-lg p-3 text-center"
                style={{ backgroundColor: cardColor }}
              >
                <img src={item.image} alt={item.name} width="120" height="120" />
                <p>ID No.: {item.id}</p>
                <p>Name: {item.name}</p>
                <p>Type: {item.types.join(", ") || "Unknown"}</p>
              </div>
            </article>
          );
        })}
      </div>
      {visibleCount < pokemon.length ? (
        <div ref={loadMoreRef} className="h-10" />
      ) : null}
    </>
  );
}
