/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useEffect, useRef } from 'react';

const DRAFT_VERSION = 1;
const AUTOSAVE_DEBOUNCE_MS = 800;

const storageKey = (userId) => `experiment_draft_${userId}`;

export const loadExperimentDraft = (userId) => {
  if (!userId) return null;
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.version === DRAFT_VERSION ? parsed : null;
  } catch (error) {
    console.error('Erro ao carregar rascunho do experimento:', error);
    return null;
  }
};

export const clearExperimentDraft = (userId) => {
  if (!userId) return;
  window.localStorage.removeItem(storageKey(userId));
};

export const isExperimentDraftMeaningful = (draft) => {
  if (!draft) return false;
  const plainDescription = (draft.ExperimentDesc || '').replace(/<[^>]*>/g, '').trim();
  return Boolean(
    draft.ExperimentTitle?.trim() ||
      plainDescription ||
      draft.ExperimentTasks?.length ||
      draft.ExperimentSurveys?.length ||
      draft.step > 0,
  );
};

// Persists `values` to localStorage (debounced) so an in-progress experiment
// survives backend failures, refreshes or crashes before the final submit.
export const useExperimentDraftAutosave = (userId, values, { enabled }) => {
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef(null);

  useEffect(() => {
    if (!enabled || !userId) return undefined;

    const serialized = JSON.stringify(values);
    if (serialized === lastSavedRef.current) return undefined;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(
          storageKey(userId),
          JSON.stringify({
            ...values,
            version: DRAFT_VERSION,
            savedAt: new Date().toISOString(),
          }),
        );
        lastSavedRef.current = serialized;
      } catch (error) {
        console.error('Erro ao salvar rascunho do experimento:', error);
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [userId, values, enabled]);
};
