"use client";

import { useState } from "react";
import { addTask } from "@/lib/db/tasks";

type TaskInputProps = {
  date: string | null;
  placeholder?: string;
};

export function TaskInput({ date, placeholder = "+ Görev ekle" }: TaskInputProps) {
  const [value, setValue] = useState("");

  async function submit() {
    if (!value.trim()) return;
    await addTask(value, date);
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
      placeholder={placeholder}
      className="w-full rounded-xl bg-transparent px-3 py-2 text-center text-xs placeholder:text-muted outline-none transition-colors hover:bg-surface/60 focus:bg-surface focus:text-left"
    />
  );
}
