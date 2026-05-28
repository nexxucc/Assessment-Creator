"use client";

import { create } from "zustand";
import { deleteAssignment, getAssignments } from "@/lib/api";
import type { Assignment } from "@/types";

type AssignmentStore = {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  fetchAssignments: () => Promise<void>;
  removeAssignment: (id: string) => Promise<void>;
};

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  loading: false,
  error: null,

  fetchAssignments: async () => {
    try {
      set({ loading: true, error: null });
      const assignments = (await getAssignments()) as Assignment[];
      set({ assignments, loading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch assignments";

      set({ error: message, loading: false });
    }
  },

  removeAssignment: async (id: string) => {
    await deleteAssignment(id);

    set({
      assignments: get().assignments.filter(item => item._id !== id)
    });
  }
}));
