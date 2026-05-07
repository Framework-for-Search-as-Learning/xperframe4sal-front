/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

export const normalizeLlmProviders = (providers = []) =>
  providers
    .filter((provider) => provider?.value)
    .map((provider) => ({
      value: provider.value,
      label: provider.label || provider.value,
      defaultModel: provider.defaultModel || '',
      suggestedModels: Array.isArray(provider.suggestedModels) ? provider.suggestedModels : [],
    }));

export const normalizeLlmModelsResponse = (payload = {}) => ({
  provider: payload?.provider || '',
  defaultModel: payload?.defaultModel || '',
  suggestedModels: Array.isArray(payload?.suggestedModels) ? payload.suggestedModels : [],
});

export const getProviderByValue = (providers, providerValue) =>
  providers.find((item) => item.value === providerValue);

export const getFirstProviderValue = (providers) => providers[0]?.value || '';

export const getDefaultModel = (providers, providerValue) => {
  const provider = providers.find((item) => item.value === providerValue);
  return provider?.defaultModel || provider?.suggestedModels?.[0] || '';
};
