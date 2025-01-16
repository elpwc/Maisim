export interface MaisimControls {
  start: () => void;
  play: () => void;
  pause: () => void;
  finish: () => void;
  seek: (time: number) => void;
}
