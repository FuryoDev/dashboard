const STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau",
  READY: "Prêt",
  ERROR: "Erreur",
  WARNING: "Avertissement",
  PARTIALLY_PUBLISHED: "Partiellement publié",
  PUBLISHED: "Publié",
};

const SUCCESS_KEYWORDS = [
  "OK",
  "TERMINE",
  "TERMINÉ",
  "ACCOMPLI",
  "PUBLIE",
  "PUBLIÉ",
  "SUCCESS",
  "READY",
  "DONE",
  "EXPORT_TERMINE",
  "FASTCATCH_TERMINEE",
  "TRANSCODAGE_TERMINE",
];

const WARNING_KEYWORDS = ["ATTENTE", "EN_COURS", "PREVU", "ANNULE", "ANNULÉ", "WARNING", "PENDING"];

const ERROR_KEYWORDS = ["ECHEC", "ÉCHEC", "ERREUR", "ERROR", "FAIL", "BLOQUE", "BLOQUÉ", "KO"];

export function getStatusLabel(status?: string): string {
  if (!status) return "";
  return STATUS_LABELS[status] ?? status;
}

export type StatusTone = "success" | "warning" | "danger" | "neutral";

export function getStatusTone(value?: string): StatusTone {
  if (!value) return "neutral";
  const normalized = value.toUpperCase();

  if (SUCCESS_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "success";
  if (ERROR_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "danger";
  if (WARNING_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "warning";
  return "neutral";
}

export function getStatusClass(value?: string): string {
  return `status-pill status-pill--${getStatusTone(value)}`;
}
