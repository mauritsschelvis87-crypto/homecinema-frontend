import { Injectable } from '@angular/core';
import { Film } from './film.service';
import { normalizeFilmData } from '../utils/film-normalization';
import { FilmRegionValue, getFilmRegion } from '../utils/film-search';

export interface FilmRecommendation {
  film: Film;
  reason: string;
}

interface RecommendationProfile {
  typeFrequency: Map<string, number>;
  countryFrequency: Map<string, number>;
  directorFrequency: Map<string, number>;
  supportedRegions: Set<FilmRegionValue>;
}

@Injectable({
  providedIn: 'root',
})
export class RecommendationService {
  private static readonly targetRecommendationCount = 5;
  private static readonly stepOneMinimumRating = 3.5;

  generateRecommendations(collection: Film[], allFilms: Film[]): FilmRecommendation[] {
    const normalizedCollection = collection.map((film) => normalizeFilmData(film));
    const normalizedCatalog = allFilms.map((film) => normalizeFilmData(film));
    const ownedIds = new Set(normalizedCollection.map((film) => film.id));
    const profile = this.buildProfile(normalizedCollection);
    const strictPool = normalizedCatalog.filter(
      (film) => !ownedIds.has(film.id) && this.matchesProfileConstraints(film, profile)
    );
    const relaxedPool = normalizedCatalog.filter((film) => !ownedIds.has(film.id));
    const results: FilmRecommendation[] = [];
    const usedIds = new Set<number>();

    this.addStepOneRecommendations(results, usedIds, normalizedCollection, strictPool, relaxedPool, profile);
    this.addDirectorRecommendation(results, usedIds, normalizedCollection, strictPool, relaxedPool, profile);
    this.addCommunityRecommendation(results, usedIds, strictPool, relaxedPool, profile);
    this.addCountryFillers(results, usedIds, normalizedCollection, strictPool, relaxedPool, profile);
    this.addFallbacks(results, usedIds, normalizedCollection, strictPool, relaxedPool, profile);

    return results.slice(0, RecommendationService.targetRecommendationCount);
  }

  private addStepOneRecommendations(
    results: FilmRecommendation[],
    usedIds: Set<number>,
    collection: Film[],
    strictPool: Film[],
    relaxedPool: Film[],
    profile: RecommendationProfile
  ): void {
    const highestRatedSeeds = this.shuffle(
      [...collection]
        .filter((film) => (film.userRating ?? 0) >= RecommendationService.stepOneMinimumRating)
        .sort((left, right) => (right.userRating ?? 0) - (left.userRating ?? 0))
        .slice(0, 3)
    );

    for (const seed of highestRatedSeeds) {
      if (results.length >= 2) {
        return;
      }

      const recommendation =
        this.findSeedRecommendation(seed, strictPool, usedIds, profile) ??
        this.findSeedRecommendation(seed, relaxedPool, usedIds, profile);

      if (!recommendation) {
        continue;
      }

      this.pushRecommendation(
        results,
        usedIds,
        recommendation,
        `Based on your ${this.formatRating(seed.userRating)} rating for ${seed.title}.`
      );
    }
  }

  private addDirectorRecommendation(
    results: FilmRecommendation[],
    usedIds: Set<number>,
    collection: Film[],
    strictPool: Film[],
    relaxedPool: Film[],
    profile: RecommendationProfile
  ): void {
    if (results.length >= RecommendationService.targetRecommendationCount) {
      return;
    }

    const groupedByDirector = new Map<string, Film[]>();

    for (const film of collection) {
      if (!film.director) {
        continue;
      }

      const bucket = groupedByDirector.get(film.director) ?? [];
      bucket.push(film);
      groupedByDirector.set(film.director, bucket);
    }

    const consistentDirectors = [...groupedByDirector.entries()]
      .map(([director, films]) => ({
        director,
        films,
        averageRating: films.reduce((sum, film) => sum + (film.userRating ?? 0), 0) / films.length,
      }))
      .filter((entry) => entry.films.length >= 2 && entry.averageRating >= 3)
      .sort((left, right) => right.averageRating - left.averageRating || right.films.length - left.films.length);

    const fallbackSeed = [...collection]
      .filter((film) => (film.userRating ?? 0) >= 4)
      .sort((left, right) => (right.userRating ?? 0) - (left.userRating ?? 0))[0];

    const directorSource = consistentDirectors[0];
    const referenceFilm =
      directorSource?.films
        ?.slice()
        .sort((left, right) => (right.userRating ?? 0) - (left.userRating ?? 0) || right.year - left.year)[0] ??
      fallbackSeed;

    if (!referenceFilm?.director) {
      return;
    }

    const recommendation =
      this.findDirectorRecommendation(referenceFilm, strictPool, usedIds, profile) ??
      this.findDirectorRecommendation(referenceFilm, relaxedPool, usedIds, profile);

    if (!recommendation) {
      return;
    }

    this.pushRecommendation(
      results,
      usedIds,
      recommendation,
      `Based on your interest in ${referenceFilm.director}.`
    );
  }

  private addCommunityRecommendation(
    results: FilmRecommendation[],
    usedIds: Set<number>,
    strictPool: Film[],
    relaxedPool: Film[],
    profile: RecommendationProfile
  ): void {
    if (results.length >= RecommendationService.targetRecommendationCount) {
      return;
    }

    const recommendation =
      this.findCommunityRecommendation(strictPool, usedIds, profile) ??
      this.findCommunityRecommendation(relaxedPool, usedIds, profile);

    if (!recommendation) {
      return;
    }

    this.pushRecommendation(results, usedIds, recommendation, 'Popular with the community right now.');
  }

  private addCountryFillers(
    results: FilmRecommendation[],
    usedIds: Set<number>,
    collection: Film[],
    strictPool: Film[],
    relaxedPool: Film[],
    profile: RecommendationProfile
  ): void {
    while (results.length < RecommendationService.targetRecommendationCount) {
      const countryAnchor = this.findCountryAnchor(collection);

      const recommendation = countryAnchor
        ? this.findCountryRecommendation(countryAnchor.country, countryAnchor.averageYear, strictPool, usedIds, profile) ??
          this.findCountryRecommendation(countryAnchor.country, countryAnchor.averageYear, relaxedPool, usedIds, profile)
        : null;

      if (!recommendation) {
        return;
      }

      const reason = countryAnchor
        ? `Based on your collection's focus on films from ${countryAnchor.country}.`
        : 'Recommended because it fits your collection profile.';

      this.pushRecommendation(results, usedIds, recommendation, reason);
    }
  }

  private addFallbacks(
    results: FilmRecommendation[],
    usedIds: Set<number>,
    collection: Film[],
    strictPool: Film[],
    relaxedPool: Film[],
    profile: RecommendationProfile
  ): void {
    while (results.length < RecommendationService.targetRecommendationCount) {
      const recommendation =
        this.findFallbackRecommendation(collection, strictPool, usedIds, profile) ??
        this.findFallbackRecommendation(collection, relaxedPool, usedIds, profile);

      if (!recommendation) {
        return;
      }

      this.pushRecommendation(results, usedIds, recommendation, 'Recommended because it matches your collection profile.');
    }
  }

  private buildProfile(collection: Film[]): RecommendationProfile {
    const typeFrequency = new Map<string, number>();
    const countryFrequency = new Map<string, number>();
    const directorFrequency = new Map<string, number>();
    const supportedRegions = new Set<FilmRegionValue>();

    for (const film of collection) {
      this.increment(typeFrequency, film.type);
      this.increment(countryFrequency, film.country);
      this.increment(directorFrequency, film.director);

      const region = getFilmRegion(film);
      if (region) {
        supportedRegions.add(region);
      }
    }

    return {
      typeFrequency,
      countryFrequency,
      directorFrequency,
      supportedRegions,
    };
  }

  private matchesProfileConstraints(film: Film, profile: RecommendationProfile): boolean {
    const hasTypeConstraint = profile.typeFrequency.size > 0;
    const hasRegionConstraint = profile.supportedRegions.size > 0;
    const filmRegion = getFilmRegion(film);

    const matchesType = !hasTypeConstraint || profile.typeFrequency.has(film.type);
    const matchesRegion = !hasRegionConstraint || !filmRegion || profile.supportedRegions.has(filmRegion);

    return matchesType && matchesRegion;
  }

  private findSeedRecommendation(
    seed: Film,
    pool: Film[],
    usedIds: Set<number>,
    profile: RecommendationProfile
  ): Film | null {
    const candidates = pool.filter((film) => film.id !== seed.id && !usedIds.has(film.id));
    return this.pickBestCandidate(candidates, seed.year, (film) => {
      let score = this.getProfileScore(film, profile) + this.getCommunityScore(film);

      if (film.director === seed.director) {
        score += 150;
      }

      if (film.genre === seed.genre) {
        score += 45;
      }

      if (film.country === seed.country) {
        score += 20;
      }

      return score;
    });
  }

  private findDirectorRecommendation(
    referenceFilm: Film,
    pool: Film[],
    usedIds: Set<number>,
    profile: RecommendationProfile
  ): Film | null {
    const candidates = pool.filter(
      (film) => film.director === referenceFilm.director && film.id !== referenceFilm.id && !usedIds.has(film.id)
    );

    return this.pickBestCandidate(candidates, referenceFilm.year, (film) => this.getProfileScore(film, profile) + this.getCommunityScore(film) + 200);
  }

  private findCommunityRecommendation(
    pool: Film[],
    usedIds: Set<number>,
    profile: RecommendationProfile
  ): Film | null {
    const topCommunityCandidates = this.shuffle(
      pool
        .filter((film) => !usedIds.has(film.id) && (film.communityRatingCount ?? 0) > 0)
        .sort((left, right) => this.getCommunityScore(right) - this.getCommunityScore(left))
        .slice(0, 10)
    );

    if (topCommunityCandidates.length === 0) {
      return null;
    }

    const shortlistedCandidates = topCommunityCandidates
      .map((film) => ({
        film,
        score: this.getProfileScore(film, profile) + this.getCommunityScore(film),
      }))
      .sort((left, right) => right.score - left.score);

    const bestScore = shortlistedCandidates[0].score;
    const competitiveCandidates = shortlistedCandidates
      .filter((candidate) => bestScore - candidate.score <= 18)
      .slice(0, 5)
      .map((candidate) => candidate.film);

    return this.shuffle(competitiveCandidates)[0] ?? null;
  }

  private findCountryAnchor(collection: Film[]): { country: string; averageYear: number } | null {
    if (collection.length === 0) {
      return null;
    }

    const groupedByCountry = new Map<string, Film[]>();

    for (const film of collection) {
      if (!film.country) {
        continue;
      }

      const bucket = groupedByCountry.get(film.country) ?? [];
      bucket.push(film);
      groupedByCountry.set(film.country, bucket);
    }

    const countryEntry = [...groupedByCountry.entries()]
      .sort((left, right) => right[1].length - left[1].length || left[0].localeCompare(right[0]))[0];

    if (!countryEntry) {
      return null;
    }

    const [country, films] = countryEntry;
    const averageYear = films.reduce((sum, film) => sum + film.year, 0) / films.length;

    return { country, averageYear };
  }

  private findCountryRecommendation(
    country: string,
    averageYear: number,
    pool: Film[],
    usedIds: Set<number>,
    profile: RecommendationProfile
  ): Film | null {
    const candidates = pool.filter((film) => film.country === country && !usedIds.has(film.id));
    return this.pickBestCandidate(candidates, averageYear, (film) => this.getProfileScore(film, profile) + this.getCommunityScore(film) + 120);
  }

  private findFallbackRecommendation(
    collection: Film[],
    pool: Film[],
    usedIds: Set<number>,
    profile: RecommendationProfile
  ): Film | null {
    const averageYear = collection.length > 0
      ? collection.reduce((sum, film) => sum + film.year, 0) / collection.length
      : null;

    return this.pickBestCandidate(
      pool.filter((film) => !usedIds.has(film.id)),
      averageYear,
      (film) => this.getProfileScore(film, profile) + this.getCommunityScore(film)
    );
  }

  private pickBestCandidate(
    candidates: Film[],
    referenceYear: number | null,
    scoreSelector: (film: Film) => number
  ): Film | null {
    if (candidates.length === 0) {
      return null;
    }

    const rankedCandidates = this.shuffle([...candidates]).map((film) => ({
      film,
      score: scoreSelector(film),
      yearDistance: referenceYear == null ? 0 : Math.abs(film.year - referenceYear),
    })).sort((left, right) => {
      const scoreDifference = right.score - left.score;
      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      if (referenceYear == null) {
        return 0;
      }

      return left.yearDistance - right.yearDistance;
    });

    const bestCandidate = rankedCandidates[0];
    const competitiveCandidates = rankedCandidates.filter((candidate) => {
      const withinScoreMargin = bestCandidate.score - candidate.score <= 12;

      if (referenceYear == null) {
        return withinScoreMargin;
      }

      return withinScoreMargin && candidate.yearDistance <= bestCandidate.yearDistance + 4;
    }).slice(0, 5);

    return this.shuffle(competitiveCandidates.map((candidate) => candidate.film))[0] ?? null;
  }

  private getProfileScore(film: Film, profile: RecommendationProfile): number {
    const region = getFilmRegion(film);

    return (profile.typeFrequency.get(film.type) ?? 0) * 24
      + (profile.countryFrequency.get(film.country) ?? 0) * 9
      + (profile.directorFrequency.get(film.director) ?? 0) * 14
      + (region && profile.supportedRegions.has(region) ? 10 : 0);
  }

  private getCommunityScore(film: Film): number {
    return ((film.averageCommunityRating ?? 0) * 20) + Math.min(film.communityRatingCount ?? 0, 25);
  }

  private pushRecommendation(
    results: FilmRecommendation[],
    usedIds: Set<number>,
    film: Film,
    reason: string
  ): void {
    if (usedIds.has(film.id)) {
      return;
    }

    results.push({ film, reason });
    usedIds.add(film.id);
  }

  private increment(map: Map<string, number>, key: string | undefined | null): void {
    if (!key) {
      return;
    }

    map.set(key, (map.get(key) ?? 0) + 1);
  }

  private formatRating(rating?: number | null): string {
    return `${(rating ?? 0).toFixed(1)}-star`;
  }

  private shuffle<T>(items: T[]): T[] {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }

    return items;
  }
}
