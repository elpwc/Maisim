import React, { useEffect, useMemo, useRef, useState } from 'react';
import './testPage.css';
import { GameState } from './utils/types/gamestate';

import { RegularStyles, SlideColor, TapStyles } from './utils/types/noteStyles';
import { sheetdata } from './testTrack/1/sheet';
import testtrack from './testTrack/1/track.mp3';
import testbgi from './testTrack/1/bg.jpg';
import testbga from './testTrack/1/pv.mp4';
import { sheetdata2 } from './testTrack/2/sheet';
import testtrack2 from './testTrack/2/track.mp3';
import testbgi2 from './testTrack/2/bg.jpg';
import testbga2 from './testTrack/2/pv.mp4';
import { BackgroundType } from './utils/types/backgroundType';
import { AutoType } from './utils/types/autoType';
import { GameRecord } from './utils/types/gameRecord';
import { SheetSecondaryProps } from './utils/sheet';
import { Maisim } from './maisim';
import { MaisimControls } from './utils/maisimControls';

function TestPage() {
  const [gameState, setGameState] = useState(GameState.Begin);
  const [gameState2, setGameState2] = useState(GameState.Begin);
  const [gameState3, setGameState3] = useState(GameState.Begin);
  const [winWidth, setwinWidth] = useState(0);
  const [winHeight, setwinHeight] = useState(0);
  const [size, setSize] = useState(800);
  const [key, setkey]: [string, any] = useState('');
  const [showEditor, setshowEditor]: [boolean, any] = useState(false);
  const [maisimComponentKey, setMaisimComponentKey] = useState(1);
  const [testsheet, settestsheet]: [string, any] = useState('');
  const [textareacontent, settextareacontent]: [string, any] = useState('');

  interface MaisimInfo {
    currentNotes: CurrentNotes;
    gameRecord: GameRecord | null;
    progress: number;
    duration: number;
  }

  interface CurrentNotes {
    sheet: string;
    sheetProps: SheetSecondaryProps;
    track: string;
    backgroundType: BackgroundType;
    backgroundImage: string;
    backgroundAnime: string;
  }
  const [info, setInfo] = useState<MaisimInfo>({
    currentNotes: {
      sheet: sheetdata.notes,
      sheetProps: { wholeBPM: sheetdata2.wholebpm, first: sheetdata.first },
      track: testtrack,
      backgroundType: BackgroundType.Video,
      backgroundImage: testbgi,
      backgroundAnime: testbga,
    },
    gameRecord: null,
    progress: 0,
    duration: 0,
  });
  const maisimRef = useRef<MaisimControls>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: '' }}>
      <Maisim
        ref={maisimRef}
        id={'1'}
        key={String(maisimComponentKey)}
        style={{}}
        onGameStateChange={(e: any) => {
          setGameState(e);
        }}
        width={size}
        height={size}
        tapStyle={TapStyles.Classic}
        holdStyle={RegularStyles.Classic}
        slideStyle={RegularStyles.Classic}
        slideColor={SlideColor.Pink}
        doShowEffect={true}
        doShowJudgement={true}
        outerColor={'#000000'}
        isAuto={true}
        autoType={AutoType.Directly}
        doEnableKeyboard={true}
        doShowKeys={true}
        centerText={0}
        track={info.currentNotes.track}
        offset={0}
        backgroundType={info.currentNotes.backgroundType}
        backgroundImage={info.currentNotes.backgroundImage}
        backgroundAnime={info.currentNotes.backgroundAnime}
        backgroundColor={'#136594'}
        sheet={testsheet}
        sheetProps={info.currentNotes.sheetProps}
        onPlayStart={(duration: number) => {
          setInfo({ ...info, duration });
        }}
        onGameRecordChange={function (gameRecord: GameRecord): void {}}
        onPlayFinish={function (): void {}}
        onProgress={(progress: number) => {
          setInfo({ ...info, progress });
        }}
        uiContent={undefined}
        doShowUIContent={true}
        onScreenPressDown={function (key: string): void {
          setkey(key);
        }}
        onScreenPressUp={function (key: string): void {
          setkey('');
        }}
        lightStatus={[]}
        speedTap={9.5} //9.5
        speedTouch={9} //9
        slideTrackOffset={0}
        playSpeedFactor={1}
        showControlPanel={true}
        controlPanelStyle={{}}
        controlPanelTrackInitialZoom={80}
      />
      <div>
        <button
          onClick={() => {
            if (gameState === GameState.Begin) {
              maisimRef.current?.start();
            } else if (gameState === GameState.Pause) {
              maisimRef.current?.play();
            } else if (gameState === GameState.Play) {
              maisimRef.current?.pause();
            }
          }}
        >
          {gameState === GameState.Play ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => {
            settestsheet(textareacontent);
          }}
        >
          set sheet
        </button>
        <textarea
          style={{ width: '300px', height: '500px' }}
          value={textareacontent}
          onChange={e => {
            settextareacontent(e.target.value);
          }}
        />
      </div>
    </div>
  );
}

export default TestPage;
