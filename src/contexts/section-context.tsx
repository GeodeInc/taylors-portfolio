"use client";
import { createContext, useContext } from "react";

export type SectionId = "home" | "about" | "skills" | "projects" | "contact";
export const SECTIONS: SectionId[] = ["home", "about", "skills", "projects", "contact"];

type SectionContextType = {
  activeSection: SectionId;
  goTo: (id: SectionId) => void;
};

export const SectionContext = createContext<SectionContextType>({
  activeSection: "home",
  goTo: () => {},
});

export const useSectionContext = () => useContext(SectionContext);
