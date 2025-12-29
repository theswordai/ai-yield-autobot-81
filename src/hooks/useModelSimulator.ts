import { useEffect, useState, useRef } from 'react';
import { modelSimulator, AllModelsState } from '@/lib/models';
import { PriceTick } from '@/lib/prices';

export function useModelSimulator(priceTicks?: Record<string, PriceTick>) {
  const [state, setState] = useState<AllModelsState>(modelSimulator.getState());
  const hasStartedRef = useRef(false);

  // Feed price updates to simulator
  useEffect(() => {
    if (priceTicks) {
      Object.values(priceTicks).forEach(tick => {
        modelSimulator.updatePrice(tick);
      });
    }
  }, [priceTicks]);

  useEffect(() => {
    // Start simulator only once
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      modelSimulator.start();
    }

    // Subscribe to updates
    const unsubscribe = modelSimulator.subscribe(setState);

    return () => {
      unsubscribe();
    };
  }, []);

  const resetModel = (id: string) => {
    modelSimulator.resetModel(id);
  };

  return {
    ...state,
    resetModel,
  };
}
