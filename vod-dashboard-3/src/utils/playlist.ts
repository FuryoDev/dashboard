import type { PlaylistItem } from "@/types/domain";

export function createPlaylistItem(item: Record<string, unknown>): PlaylistItem {
  const broadcastDate = String(item.broadcastDate ?? "");
  const splitIndex = broadcastDate.indexOf("T");

  return {
    title: String(item.title ?? ""),
    fileName: String(item.fileName ?? ""),
    broadcastDateFull: broadcastDate,
    broadcastDate: splitIndex >= 0 ? broadcastDate.slice(0, splitIndex) : broadcastDate,
    heure: splitIndex >= 0 ? broadcastDate.slice(splitIndex + 1) : "",
    durationLabel: String(item.durationLabel ?? ""),
    traficId: String(item.traficId ?? ""),
    live: Boolean(item.live),
    segment: (item.segment as string | number | undefined) ?? "",
  };
}
