import type { ComponentType } from "react";
import type { CategoryId } from "@/data/categories";
import { ToolSticker } from "@/components/tool-sticker";

type IconProps = { className?: string; "aria-hidden"?: boolean };

const cache = new Map<string, ComponentType<IconProps>>();

/** Unique Freela sticker for a tool. Category is unused; kept so existing call sites stay stable. */
export function iconForTool(id: string, _category: CategoryId): ComponentType<IconProps> {
  const cached = cache.get(id);
  if (cached) return cached;
  function Mark(props: IconProps) {
    return <ToolSticker id={id} className={props.className} />;
  }
  Mark.displayName = `Sticker(${id})`;
  cache.set(id, Mark);
  return Mark;
}
