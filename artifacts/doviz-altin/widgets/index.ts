import { registerWidgetTaskHandler } from "react-native-android-widget";
import { widgetTaskHandler } from "./widget-task";

registerWidgetTaskHandler(widgetTaskHandler);
console.log("[CARSI-WIDGET] handler registered at bundle boot");
