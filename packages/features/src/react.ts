"use client";

import { createContext, createElement, type ReactNode, useContext } from "react";

import type { Features, FeatureValues } from "./registry";

const FeatureContext = createContext<Readonly<Record<string, boolean>> | null>(null);

export interface FeaturesProviderProps<Name extends string> {
  /** `featureSet.values` from the server. */
  readonly values: FeatureValues<Name>;
  readonly children?: ReactNode;
}

export interface FeatureProps<Name extends string> {
  readonly name: Name;
  /** Rendered when the feature is off. */
  readonly fallback?: ReactNode;
  readonly children?: ReactNode;
}

export interface FeatureComponents<Name extends string> {
  /** Hands the server's feature values to client components. Mount once, in the root layout. */
  FeaturesProvider(props: FeaturesProviderProps<Name>): ReactNode;
  /** Whether a feature is on. Known on first render: the value came with the page. */
  useFeature(name: Name): boolean;
  /** Renders its children when the feature is on. */
  Feature(props: FeatureProps<Name>): ReactNode;
}

/**
 * The client side of a registry. Values are evaluated on the server and
 * arrive with the page, so nothing flickers and the browser never asks
 * PostHog for a flag.
 */
export function createFeatureComponents<Name extends string>(_features: Features<Name>): FeatureComponents<Name> {
  function useFeature(name: Name): boolean {
    const values = useContext(FeatureContext);

    if (!values) throw new Error("useFeature needs a <FeaturesProvider> above it.");

    return values[name] ?? false;
  }

  return {
    FeaturesProvider: ({ values, children }) => createElement(FeatureContext.Provider, { value: values }, children),
    useFeature,
    Feature: ({ name, fallback = null, children }) => (useFeature(name) ? children : fallback),
  };
}
