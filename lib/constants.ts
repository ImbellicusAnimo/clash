/** Geographic center of Berlin, used as the default map view. */
export const BERLIN_CENTER = { lat: 52.52, lng: 13.405 } as const;

/** Default city-level zoom for the map. */
export const DEFAULT_ZOOM = 12;

export const PARTICIPATION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export type ParticipationStatus =
  (typeof PARTICIPATION_STATUS)[keyof typeof PARTICIPATION_STATUS];

export const NOTIFICATION_TYPE = {
  JOIN: "join",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  VENUE_CLASH: "venue_clash",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
