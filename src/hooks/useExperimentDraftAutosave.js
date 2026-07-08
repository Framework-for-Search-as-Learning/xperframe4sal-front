/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useEffect, useRef } from 'react';
import { api } from '../config/axios';

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

// Mirrors the local draft to the backend so it survives a lost/cleared
// browser too, not just a crash. Best-effort: the local copy in
// localStorage remains the source of truth if this fails (offline backend).
export const saveExperimentDraftToServer = async (user, values) => {
  if (!user?.id) return;
  try {
    await api.put(
      `/experiment-draft/${user.id}`,
      { payload: values },
      { headers: { Authorization: `Bearer ${user.accessToken}` } },
    );
  } catch (error) {
    console.error('Erro ao salvar rascunho do experimento no servidor:', error);
  }
};

export const loadExperimentDraftFromServer = async (user) => {
  if (!user?.id) return null;
  try {
    const { data } = await api.get(`/experiment-draft/${user.id}`, {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    });
    if (!data?.payload) return null;
    return { ...data.payload, savedAt: data.lastChangeAt };
  } catch (error) {
    console.error('Erro ao carregar rascunho do experimento do servidor:', error);
    return null;
  }
};

export const clearExperimentDraftFromServer = async (user) => {
  if (!user?.id) return;
  try {
    await api.delete(`/experiment-draft/${user.id}`, {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    });
  } catch (error) {
    console.error('Erro ao limpar rascunho do experimento no servidor:', error);
  }
};

// Picks whichever of the two drafts was saved more recently, so a
// researcher who resumes on a different device (or after clearing
// localStorage) still gets their latest progress.
export const pickFreshestDraft = (localDraft, serverDraft) => {
  const hasLocal = isExperimentDraftMeaningful(localDraft);
  const hasServer = isExperimentDraftMeaningful(serverDraft);
  if (!hasLocal) return hasServer ? serverDraft : null;
  if (!hasServer) return localDraft;

  const localTime = new Date(localDraft.savedAt || 0).getTime();
  const serverTime = new Date(serverDraft.savedAt || 0).getTime();
  return serverTime > localTime ? serverDraft : localDraft;
};

// Persists `values` to localStorage (debounced) so an in-progress experiment
// survives backend failures, refreshes or crashes before the final submit.
// Also mirrors the same values to the backend when reachable.
export const useExperimentDraftAutosave = (user, values, { enabled }) => {
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef(null);
  const userId = user?.id;

  useEffect(() => {
    if (!enabled || !userId) return undefined;

    const serialized = JSON.stringify(values);
    if (serialized === lastSavedRef.current) return undefined;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const draftWithMeta = {
        ...values,
        version: DRAFT_VERSION,
        savedAt: new Date().toISOString(),
      };
      try {
        window.localStorage.setItem(storageKey(userId), JSON.stringify(draftWithMeta));
        lastSavedRef.current = serialized;
      } catch (error) {
        console.error('Erro ao salvar rascunho do experimento:', error);
      }
      saveExperimentDraftToServer(user, draftWithMeta);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [user, userId, values, enabled]);
};
