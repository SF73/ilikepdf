import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'ilikepdf.saveOptions.v1';

export function useSaveOptions() {
  const [saveOptions, setSaveOptions] = useState<Record<string, any>>(() => {
    try {
      if (typeof window === 'undefined') return {};
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  // persist changes to localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveOptions || {}));
    } catch (e) {
      // ignore storage errors
    }
  }, [saveOptions]);

  const updateOption = useCallback((key: string, value: any) => {
    setSaveOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSaveOptions = useCallback(() => {
    try {
      if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setSaveOptions({});
  }, []);

  return {
    saveOptions,
    setSaveOptions,
    updateOption,
    resetSaveOptions,
  };
}

export default useSaveOptions;
