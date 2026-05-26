export const MAX_SHOT_SCORE = 10.9;
export const MAX_SHOTS_PER_SERIES = 10;

export const sumSeriesShots = (shots = []) => {
  const total = shots.reduce((acc, sh) => acc + (Number(sh.value) || 0), 0);
  return Number(total.toFixed(2));
};

export const sumSessionSeries = (series = []) => {
  const total = series.reduce((acc, s) => acc + sumSeriesShots(s.shots), 0);
  return Number(total.toFixed(2));
};

export const seriesShotCountLabel = (shots = []) => `${shots.length}/${MAX_SHOTS_PER_SERIES} shots`;

export const formatShotList = (shots) =>
  shots?.length ? shots.map((sh) => sh.value).join(', ') : '—';
