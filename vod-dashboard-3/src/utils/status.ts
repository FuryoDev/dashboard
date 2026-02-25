const STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau",
  READY: "Prêt",
  ERROR: "Erreur",
  WARNING: "Avertissement",
  PARTIALLY_PUBLISHED: "Partiellement publié",
  PUBLISHED: "Publié",
};

export function getStatusLabel(status?: string): string {
  if (!status) return "";
  return STATUS_LABELS[status] ?? status;
}
