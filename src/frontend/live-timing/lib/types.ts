export interface RaceData {
  num: number;
  time: number;
  laptime: number;
  bestlap: number;
  laps: number;
  has_fastest_lap: boolean;
}

export interface PodiumData {
  id: string;
  num: number;
  bestlap: number;
  time: number;
  laps: number;
  has_fastest_lap: boolean;
  raceId: string | null;
}
