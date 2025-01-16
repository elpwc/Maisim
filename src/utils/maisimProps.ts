import { GameState } from './types/gamestate';
import { AutoType } from './types/autoType';
import { BackgroundType } from './types/backgroundType';
import { FlipMode } from './types/flipMode';
import { ScoreCalculationType } from './types/judgeStatus';
import { TapStyles, RegularStyles, SlideColor } from './types/noteStyles';
import { SheetSecondaryProps } from './sheet';
import { GameRecord } from './types/gameRecord';

export interface MaisimProps {
  /** 唯一标识，当有多个Maisim时，请为每个Maisim分配不同的id */
  id: string;
  /** maisim框体宽度 */
  width: number;
  /** maisim框体高度 */
  height: number;

  style?: React.CSSProperties | undefined;

  tapStyle?: TapStyles;
  holdStyle?: RegularStyles;
  slideStyle?: RegularStyles;
  slideColor?: SlideColor;

  /** 镜像 */
  flipMode?: FlipMode;

  /** 显示特效 */
  doShowEffect?: boolean;
  /** 显示判定 */
  doShowJudgement?: boolean;
  /** 外围颜色 */
  outerColor: string;
  /** 自动 */
  isAuto: boolean;
  /** 自动的模式 */
  autoType?: AutoType;
  /** 外键 */
  doShowKeys?: boolean;
  /** 中央显示 */
  centerText?: number;

  /** 谱 */
  sheet: string;
  /** 谱面属性 */
  sheetProps?: SheetSecondaryProps;
  /** 曲 */
  track?: string;
  /** 谱面偏移 ms */
  offset?: number;

  /** 背景显示方式 */
  backgroundType?: BackgroundType;
  /** 在背景显示为Video时是否在播放前显示背景图 */
  doShowBGImageBeforePlay?: boolean;
  /** 背景图 */
  backgroundImage?: string;
  /** BGA */
  backgroundAnime?: string;
  /** 背景色 */
  backgroundColor?: string;
  /** 背景亮度 0~1 */
  backgroundLightness?: number;

  /**
   * 游戏状态改变後的回调
   * @param gameState 改变後的游戏状态
   * @returns
   */
  onGameStateChange?: (gameState: GameState) => void;
  /**
   * 一个谱面开始播放时的回调
   * @param duration 谱面长度
   * @returns
   */
  onPlayStart?: (duration: number) => void;
  /**
   * maisim分数记录改变时的回调
   * @param gameRecord 分数记录
   * @returns
   */
  onGameRecordChange?: (gameRecord: GameRecord) => void;
  /**
   * 一个谱面播放结束时的回调
   * @returns
   */
  onPlayFinish?: () => void;
  /**
   * 谱面暂停时的回调
   * @param time 当前暂停时刻
   * @returns
   */
  onPlayPause?: (time: number) => void;
  /**
   * 谱面继续播放时的回调
   * @param time 当前继续播放时刻
   * @returns
   */
  onPlayResume?: (time: number) => void;
  /**
   * 播放进度改变时的回调
   * @param progress 播放进度
   * @returns
   */
  onProgress?: (progress: number) => void;

  /** 是否显示UI遮盖层 */
  doShowUIContent?: boolean;
  /** UI遮盖层 */
  uiContent?: JSX.Element;

  // 屏幕/按钮点击事件
  /** 屏幕/按钮按下 */
  onScreenPressDown?: (key: string) => void;
  /** 屏幕/按钮抬起 */
  onScreenPressUp?: (key: string) => void;

  /** 按钮灯光控制 */
  lightStatus?: string[];

  /** 是否启用键盘打歌，启用的话，内屏NOTE(Touch之类的)都会AUTO */
  doEnableKeyboard?: boolean;
  /** TAP速度 */
  speedTap?: number;
  /** Touch速度 */
  speedTouch?: number;
  /** 计分方式 旧框/DX */
  scoreCalculationType?: ScoreCalculationType;
  /** Slide偏移 */
  slideTrackOffset?: number;
  /** 播放倍速 */
  playSpeedFactor?: number;
  /** 调试mode */
  isInDev?: boolean;

  // wavesurfer相关
  /** 是否显示控制面板 */
  showControlPanel?: boolean;
  /** 控制面板style */
  controlPanelStyle?: React.CSSProperties;
  /** 控制面板音轨初始缩放 0 - 1000 */
  controlPanelTrackInitialZoom?: number;
}
