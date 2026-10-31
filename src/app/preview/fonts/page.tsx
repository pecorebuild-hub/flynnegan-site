import { redirect } from "next/navigation";
import { DEFAULT_FONT_VARIANT } from "@/lib/fonts";

export default function FontPreviewIndex() {
  redirect(`/preview/fonts/${DEFAULT_FONT_VARIANT}`);
}
