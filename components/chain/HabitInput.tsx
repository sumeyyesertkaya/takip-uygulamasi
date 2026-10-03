"use client";

import { useState } from "react";
import { addHabit } from "@/lib/db/habits";

export function HabitInput() {
  const [value, setValue] = useState("");

  async function submit() {
    if (!value.trim()) return;
    await addHabit(value);
    setValue("");
  }

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") submit();
        if (e.key === "Escape") setValue("");
      }}
      placeholder="+ Yeni zincir ekle (Enter)"
      className="w-full max-w-md rounded-full border border-line bg-card px-5 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-primary"
    />
  );
}
