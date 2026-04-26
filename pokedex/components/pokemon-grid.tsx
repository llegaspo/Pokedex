"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { PokemonCard } from "@/lib/pokeapi";

const BATCH_SIZE = 10;

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
        {visiblePokemon.map((item) => (
          <article key={item.name} className="border p-3">
            <img src={item.image} alt={item.name} width="120" height="120" />
            <p>ID No.: {item.id}</p>
            <p>Name: {item.name}</p>
            <p>Type: {item.types.join(", ") || "Unknown"}</p>
          </article>
        ))}
      </div>
      {visibleCount < pokemon.length ? (
        <div ref={loadMoreRef} className="h-10" />
      ) : null}
    </>
  );
}
