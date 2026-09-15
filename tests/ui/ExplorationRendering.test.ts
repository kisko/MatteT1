import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExplorationStation } from '../../src/ui/views/lab/ExplorationStation.js';
import { ExplorationSession } from '../../src/domain/model/exploration/ExplorationSession.js';
import { ExplorationCatalog } from '../../src/domain/curriculum/exploration/ExplorationCatalog.js';
import { ExplorationLab } from '../../src/domain/model/exploration/ExplorationLab.js';

/**
 * Render-røyktest for utforskningene.
 *
 * Glidebryterne kan settes i hvilken som helst kombinasjon, og det er
 * ytterpunktene som knekker en graf: en flat kurve, en divisjon på null, en
 * skala uten spenn. Her tegnes hver utforskning i alle hjørner av
 * parameterrommet, pluss et jevnt utvalg innimellom.
 */

const unwrap = <T,>(result: { isSuccess: boolean; value?: T; error?: { message: string } }): T => {
  if (!result.isSuccess) {
    throw new Error(`Forventet suksess, men fikk: ${result.error?.message}`);
  }
  return result.value as T;
};

const renderStation = (session: ExplorationSession): string =>
  renderToStaticMarkup(
    React.createElement(ExplorationStation, {
      session,
      onSessionChange: () => undefined,
      onExit: () => undefined,
      isAnimating: false,
      onToggleAnimation: () => undefined,
    })
  );

const assertClean = (markup: string, label: string): void => {
  expect(markup.length, `${label}: tom markup`).toBeGreaterThan(500);
  expect(markup, `${label}: NaN i markup`).not.toContain('NaN');
  expect(markup, `${label}: Infinity i markup`).not.toContain('Infinity');
  expect(markup, `${label}: udefinert attributt`).not.toContain('="undefined"');
  expect(markup, `${label}: tomt koordinatattributt`).not.toMatch(/\s(cx|cy|x1|y1|x2|y2|d)=""/);
};

/** Min, midt og max for hver parameter, i alle kombinasjoner. */
const cornerCombinations = (lab: ExplorationLab): Array<Record<string, number>> => {
  const perParameter = lab.parameters.map((parameter) => {
    const values = parameter.allValues;
    const middle = values[Math.floor(values.length / 2)];
    return [values[0], middle, values[values.length - 1]];
  });

  let combinations: Array<Record<string, number>> = [{}];
  lab.parameters.forEach((parameter, position) => {
    const next: Array<Record<string, number>> = [];
    for (const partial of combinations) {
      for (const value of perParameter[position]) {
        next.push({ ...partial, [parameter.id]: value });
      }
    }
    combinations = next;
  });

  return combinations;
};

const labs = ExplorationCatalog.all();

describe.each(labs.map((lab) => [lab.id, lab] as const))('ExplorationStation %s', (_id, lab) => {
  it('tegner startverdiene', () => {
    assertClean(renderStation(ExplorationSession.start(lab)), `${lab.id}/start`);
  });

  it('tegner alle ytterpunkter av parameterrommet', () => {
    const combinations = cornerCombinations(lab);
    expect(combinations.length).toBeGreaterThanOrEqual(3);

    for (const values of combinations) {
      const session = unwrap(ExplorationSession.start(lab).setValues(values));
      assertClean(renderStation(session), `${lab.id}/${JSON.stringify(values)}`);
    }
  });

  it('tegner tilstanden etter at oppdrag og påstander er besvart', () => {
    let session = ExplorationSession.start(lab);
    for (const claim of lab.claims) {
      session = unwrap(session.answerClaim(claim.id, claim.isTrue));
    }
    for (const mission of lab.missions) {
      session = unwrap(session.revealHint(mission.id));
    }

    assertClean(renderStation(session), `${lab.id}/besvart`);
  });
});

describe('ExplorationStation – innhold', () => {
  const lab = ExplorationCatalog.byId('E-FUN-01')!;

  it('viser spørsmålet, oppdragene og tallene', () => {
    const markup = renderStation(ExplorationSession.start(lab));

    expect(markup).toContain('Andregradsfunksjonen');
    expect(markup).toContain('Oppdrag');
    expect(markup).toContain('Tallene akkurat nå');
    expect(markup).toContain('Vurder påstandene');
    expect(markup).toContain('Diskriminant');
    expect(markup).toContain('Nullstill');
    // Denne utforskningen animerer c.
    expect(markup).toContain('Animer');
  });

  it('viser glidebryter for hver parameter', () => {
    const markup = renderStation(ExplorationSession.start(lab));
    const sliderCount = (markup.match(/type="range"/g) ?? []).length;

    expect(sliderCount).toBe(lab.parameters.length);
  });

  it('markerer et løst oppdrag med bekreftelsen sin', () => {
    const session = unwrap(ExplorationSession.start(lab).setParameter('a', 0));
    const markup = renderStation(session);

    expect(session.isMissionCompleted('make-linear')).toBe(true);
    expect(markup).toContain('ikke lenger en andregradsfunksjon');
  });

  it('viser innsikten når alt er gjennomført', () => {
    let session = unwrap(ExplorationSession.start(lab).setValues({ a: 1, b: 4, c: 4 }));
    session = unwrap(session.setParameter('a', 0));
    session = unwrap(session.setValues({ a: 1, b: 0, c: 1 }));
    for (const claim of lab.claims) {
      session = unwrap(session.answerClaim(claim.id, claim.isTrue));
    }

    expect(session.progress.isComplete).toBe(true);
    const markup = renderStation(session);
    expect(markup).toContain('Utforskningen er gjennomført');
    expect(markup).toContain('Diskriminanten teller nullpunktene');
  });
});
