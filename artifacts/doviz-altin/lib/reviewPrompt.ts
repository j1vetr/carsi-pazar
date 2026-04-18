import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { Platform } from "react-native";

const KEY_FIRST_OPEN = "review_first_open_at";
const KEY_PROMPTED = "review_prompted_at";

const DELAY_MS = 60_000;

let scheduled = false;

/**
 * Native yorum/oylama dialog'unu programlanmış şekilde tetikler.
 *
 * Davranış:
 * - Web'de hiç çalışmaz.
 * - Kullanıcı uygulamayı ilk açtıktan en az 60 saniye sonra çağrılır.
 * - Bir kez başarıyla tetiklendiğinde (StoreReview.requestReview çağrısı yapıldığında)
 *   bir daha hiç tetiklenmez.
 * - Aynı oturum içinde birden fazla çağrılırsa yalnızca ilki çalışır.
 */
export async function scheduleReviewPrompt(): Promise<void> {
  if (scheduled) return;
  if (Platform.OS === "web") return;

  scheduled = true;

  try {
    const alreadyPrompted = await AsyncStorage.getItem(KEY_PROMPTED);
    if (alreadyPrompted) return;

    const now = Date.now();
    const firstOpenStr = await AsyncStorage.getItem(KEY_FIRST_OPEN);
    let firstOpen: number;
    if (!firstOpenStr) {
      firstOpen = now;
      await AsyncStorage.setItem(KEY_FIRST_OPEN, String(firstOpen));
    } else {
      firstOpen = parseInt(firstOpenStr, 10);
      if (!Number.isFinite(firstOpen)) firstOpen = now;
    }

    const elapsed = now - firstOpen;
    const wait = Math.max(0, DELAY_MS - elapsed);

    setTimeout(() => {
      void tryShowReview();
    }, wait);
  } catch {
    // Sessizce sus; oylama isteği kritik bir özellik değil.
  }
}

async function tryShowReview(): Promise<void> {
  try {
    const alreadyPrompted = await AsyncStorage.getItem(KEY_PROMPTED);
    if (alreadyPrompted) return;

    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;

    const hasAction = await StoreReview.hasAction();
    if (!hasAction) return;

    await StoreReview.requestReview();

    // Tetiklendiyse bir daha gösterme.
    await AsyncStorage.setItem(KEY_PROMPTED, String(Date.now()));
  } catch {
    // Bir sonraki oturumda tekrar denenir; flag set edilmediği için.
  }
}
