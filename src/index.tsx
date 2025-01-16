import TestPage from './testPage';
import { SheetSecondaryProps } from './utils/sheet';
import { BackgroundType } from './utils/types/backgroundType';
import { GameRecord } from './utils/types/gameRecord';
import React from 'react';
import ReactDOM from 'react-dom/client';

export interface CurrentNotes {
  sheet: string;
  sheetProps: SheetSecondaryProps;
  track: string;
  backgroundType: BackgroundType;
  backgroundImage: string;
  backgroundAnime: string;
}
export interface MaisimInfo {
  currentNotes: CurrentNotes;
  gameRecord: GameRecord | null;
  progress: number;
  duration: number;
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<TestPage />);
