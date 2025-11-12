
export enum AssetStatus {
  VULNERABLE = 'Vulnerable',
  IN_PROGRESS = 'In-Progress',
  PQC_READY = 'PQC-Ready',
  NOT_STARTED = 'Not-Started',
}

export interface CryptographicAsset {
  id: string;
  name: string;
  type: string;
  algorithm: string;
  status: AssetStatus;
  associatedSystems: string[];
  lastAuditDate: string;
  migrationPlanStatus: string;
}
