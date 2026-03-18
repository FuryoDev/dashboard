const STATUS_LABELS: Record<string, string> = {
    PARTIALLY_PUBLISHED: "Partiellement publié",
    PUBLISHED: "Publié",
};

const SUCCESS_KEYWORDS = [
    "ACCOMPLI",
    "TERMINE",
    "TERMINÉ",
    "PUBLIE",
    "PUBLIÉ",
    "PUBLI",
    "REVOKE",
    "EXPORT_TERMINE",
    "FASTCATCH_TERMINEE",
    "TRANSCODAGE_TERMINE",
    "OK",
];

const IN_PROGRESS_KEYWORDS = ["EN_COURS", "EN COURS"];

const WARNING_KEYWORDS = [
    "ATTENTE",
    "PREVU",
    "PRÉVU",
    "ANNULE",
    "ANNULÉ",
    "DEMANDE",
    "DEMANDÉ",
    "FORCE_LINEAIRE",
    "FORCE_LINEAIRE_PREVU",
    "USER_FORCE_LINEAIRE",
    "TRAITEMENT_MANUEL",
    "EMPÊCHÉE",
    "EMPECHEE",
    "XML INVALIDE",
];

const ERROR_KEYWORDS = ["ECHEC", "ÉCHEC", "ERREUR", "FAIL", "BLOQUE", "BLOQUÉ", "KO"];

export function getStatusLabel(status?: string): string {
    if (!status) return "";
    return STATUS_LABELS[status] ?? status;
}

export type StatusTone = "success" | "warning" | "in-progress" | "danger" | "neutral";

export function getStatusTone(value?: string): StatusTone {
    if (!value) return "neutral";
    const normalized = value.toUpperCase();

    if (SUCCESS_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "success";
    if (ERROR_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "danger";
    if (IN_PROGRESS_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "in-progress";
    if (WARNING_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "warning";
    return "neutral";
}

export function getStatusClass(value?: string): string {
    return `status-pill status-pill--${getStatusTone(value)}`;
}
