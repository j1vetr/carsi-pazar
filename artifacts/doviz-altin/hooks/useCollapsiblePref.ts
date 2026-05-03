import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX = "pref:collapsible:";

/**
 * Bir bölümün açık/kapalı tercihini cihazda hatırlar. `id` verilmezse sadece
 * oturum-içi state olarak çalışır. AsyncStorage hatalarını sessizce yutar
 * çünkü tercih kaybı uygulamayı bozmaz.
 */
export function useCollapsiblePref(
  id: string | undefined,
  defaultOpen: boolean,
): { open: boolean; toggle: () => void; setOpen: (v: boolean) => void } {
  const [open, setOpenState] = useState<boolean>(defaultOpen);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    AsyncStorage.getItem(KEY_PREFIX + id)
      .then((v) => {
        if (!alive) return;
        if (v === "1") setOpenState(true);
        else if (v === "0") setOpenState(false);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id]);

  const setOpen = useCallback(
    (v: boolean) => {
      setOpenState(v);
      if (id) AsyncStorage.setItem(KEY_PREFIX + id, v ? "1" : "0").catch(() => {});
    },
    [id],
  );

  const toggle = useCallback(() => {
    setOpenState((cur) => {
      const next = !cur;
      if (id) AsyncStorage.setItem(KEY_PREFIX + id, next ? "1" : "0").catch(() => {});
      return next;
    });
  }, [id]);

  return { open, toggle, setOpen };
}
