"use client";
import { createContext, useContext } from "react";

export const PreviewModeContext = createContext(false);
export const usePreviewMode = () => useContext(PreviewModeContext);
