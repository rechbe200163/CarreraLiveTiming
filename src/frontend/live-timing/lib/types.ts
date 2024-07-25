import { nullable } from "zod";

export interface RaceData {
  num: number;
  time: number;
  laptime: number;
  bestlap: number;
  sector1: number;
  sector2: number;
  laps: number;
  fuel: number;
  pits: number;
  pit: boolean;
  has_fastest_lap: boolean;
}

export interface RaceDataStore {
  num: number | null;
  laptime: number;
  sector1: number;
  sector2: number;
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

export interface CompetitionData {
  id: string;
  created_at: string;
  title: string;
}
