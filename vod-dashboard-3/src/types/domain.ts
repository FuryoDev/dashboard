export type RecordStatusUseCase =
  | "CHECK"
  | "TOCHECK"
  | "EXPORT"
  | "TOEXPORT"
  | "RETRY"
  | "ERROR"
  | "OK"
  | string;

export interface RecordStatusItem {
  useCase?: RecordStatusUseCase;
  caseComment?: string;
  creationTimestamp?: string;
}

export interface PlatformOffer {
  offerName?: string;
  recordvodxmlid?: string | number;
  offers?: Array<{ oid?: string | number; name?: string }>;
  [key: string]: unknown;
}

export interface Emission {
  idRecord?: string | number;
  title?: string;
  vodType?: string;
  statusEmission?: string;
  globalPubStatusName?: string;
  plannedDateTime?: string;
  dateHeureDebutVisibilite?: string;
  dateHeureDiffusion?: string;
  sourceClip?: {
    lastStatus?: string;
    [key: string]: unknown;
  };
  recordStatusTraitementItem?: RecordStatusItem;
  recordStatusTranscodageItem?: RecordStatusItem;
  recordStatusPublicationItem?: RecordStatusItem;
  plateformOffers?: PlatformOffer[];
  [key: string]: unknown;
}

export interface SegmentItem {
  traficId?: string;
  number?: string | number;
  [key: string]: unknown;
}

export interface PlaylistItem {
  title: string;
  fileName: string;
  broadcastDateFull: string;
  broadcastDate: string;
  heure: string;
  durationLabel: string;
  traficId: string;
  live: boolean;
  segment: string | number;
}

export interface SearchCriteria {
  date: Date | string;
  chaine: string;
  data: PlaylistItem[];
}

export interface GeneratedXml {
  data: string;
  success: boolean;
}
