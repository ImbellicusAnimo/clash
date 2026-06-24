"use server";

import { requireUser } from "@/lib/auth";
import { searchEverything, type SearchResults } from "@/lib/data/search";

export async function searchAction(query: string): Promise<SearchResults> {
  await requireUser();
  return searchEverything(query);
}
