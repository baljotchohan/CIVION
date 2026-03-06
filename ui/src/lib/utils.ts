import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const API_BASE_URL = "http://localhost:8000";

export async function fetcher(endpoint: string, options?: RequestInit) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, options);
    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
}
