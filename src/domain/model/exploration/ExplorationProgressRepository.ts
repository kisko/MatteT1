/**
 * Kontrakt for å huske hvilke oppdrag eleven har løst i utforskningene.
 *
 * Dette holdes med vilje utenfor UserProgress. Mestringsprosenten der er et
 * mål på oppgaveløsing, og en utforskning er ikke en prøve – den er en
 * undersøkelse. Å blande dem ville gjort mestringstallet uærlig.
 */
export interface ExplorationProgressRepository {
  /** Nøkler på formen `labId:missionId`. */
  getCompletedMissionKeys(): Promise<ReadonlyArray<string>>;
  saveCompletedMissionKeys(keys: readonly string[]): Promise<void>;
}

export const missionKey = (labId: string, missionId: string): string => `${labId}:${missionId}`;

export const missionIdsForLab = (keys: readonly string[], labId: string): readonly string[] =>
  keys
    .filter((key) => key.startsWith(`${labId}:`))
    .map((key) => key.slice(labId.length + 1))
    .filter((id) => id.length > 0);
