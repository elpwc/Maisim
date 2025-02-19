import { NoteType } from './types/noteType';
import { SlideTrackJudgementParams } from './slideTrackJudgementParams';
import { SpecFrame } from '../spectator/specFrame';

/*
  注释不使用「时间」，而分别使用「时刻」和「时长」
 */

/** 一拍（可能是空白的，代表空拍） */
export interface Beat {
  // notes: Note[];
  /** 这一拍的节拍 */
  notevalue: number;
  /** 这一拍的BPM */
  bpm: number;
  /** 触发时刻 */
  time: number;

  /** 包含的全部notes的索引 */
  noteIndexes: number[];

  /** touch group */
  touchGroupStatus?: number[];
  /** touch group内已触发数量 */
  touchGroupTouched?: number;
}

/** (人体蜈蚣中的)一段Slide轨迹 */
export interface SlideLine {
  /** '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V' */
  slideType?: string; //'-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
  /** 开始位置 '1'-'8' */
  pos?: string;
  /** 适用于V, 转向位置 '1'-'8' */
  turnPos?: string;
  /** 结束位置 '1'-'8' */
  endPos?: string;

  /**  持续时长/ms*/
  remainTime?: number;
  /** 开始时的时刻，是相对于人体蜈蚣而言的，第一段的beginTime总是从0开始 */
  beginTime?: number;

  /** 分段信息 */
  sections?: SectionInfo[] | SectionInfo[][];

  /** 是否对这个Note启用观赏谱判定 （因为一些观赏谱Note完全不能适用于现有的判定）
   * 对于人体蜈蚣SLIDE，需要对每一条SLIDELINE单独判断
   */
  doSpecJudge?: boolean;
}

/** Slide轨迹 */
export interface SlideTrack {
  /** '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V' */
  slideType?: string; //'-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
  /** 结束位置 '1'-'8' */
  endPos?: string;
  /** 适用于V, 转向位置 '1'-'8' */
  turnPos?: string;

  // HOLD延时的节拍 ([]里的内容) 只是谱面分析时用来算出remainTime用的
  /** HOLD演示节拍[]里内容的前一个数字 */
  notevalue?: number;
  /** HOLD演示节拍[]里内容的後一个数字 */
  notenumber?: number;

  /** 分段信息 */
  sections?: SectionInfo[] | SectionInfo[][];

  /**  持续时长/ms*/
  remainTime?: number;
  /**  ため时长 */
  stopTime?: number;
  /** 是否是SLIDE CHAIN（人体蜈蚣） */
  isChain?: boolean;
  /** (人体蜈蚣)包含的子轨迹 */
  slideLines?: SlideLine[];
}

/** 分段信息 */
export interface SectionInfo {
  /** 开始位置与总长的比值 */
  start: number;
  /** 这一段的判定区 */
  areas: string[];
}

/** 一个Note */
export interface Note {
  /** 顺序 (实际好像没用过？) */
  index: number;

  /** 唯一标识符（因为数组在排序後会乱掉 */
  serial: number;

  /** 是否是绝赞 */
  isBreak?: boolean;
  /** 是否有保护套 */
  isEx?: boolean;
  /** 有没有带着烟花特效 */
  hasFirework?: boolean;

  /** 位置 / 头位置 / # @ 也在这里 */
  pos: string;

  /** Note类型 */
  type: NoteType;

  /** 是否是疑似EACH https://w.atwiki.jp/simai/pages/25.html#id_62a860a2 */
  isNiseEach?: boolean;

  // 适用于SLIDE
  /** 适用于SLIDE, 这个SLIDE後面的所有TRACKS */
  slideTracks?: SlideTrack[];

  // 适用于HOLD,TOUCH HOLD, SLIDE不适用
  /** 适用于HOLD,TOUCH HOLD, 是否是TAP型HOLD */
  isShortHold?: boolean;

  // HOLD延时的节拍 ([]里的内容) 只是谱面分析时用来算出remainTime用的
  /** HOLD演示节拍[]里内容的前一个数字 */
  notevalue?: number;
  /** HOLD演示节拍[]里内容的後一个数字 */
  notenumber?: number;

  /** 此Note的持续时长/ms（对于HOLD：HOLD头开始到HOLD尾出现的时间）*/
  remainTime?: number;

  // 以下2个属性（还有下面的guideStarEmergeTime）在生成後由speed之类的决定
  /**
   * Note开始浮现的时刻/ms
   *  对于TRACK: 是TRACK的浮现时间（其实就是SLIDE TAP的movetime喵）
   * ⚠注意⚠：
   * 所有Note的emergeTime在maireader中均未被定义
   * 是在读取谱面数据後根据速度设定计算的
   * */
  emergeTime?: number;
  /**
   * Note开始移动的时刻/ms
   *  对于TRACK: GUIDE STAR开始移动的时间
   */
  moveTime?: number;

  /** 是否是EACH */
  isEach?: boolean;

  /** 在beats中的索引 */
  beatIndex: number;

  /** 这一段的节拍 */
  partnotevalue: number;
  /** 这一段的BPM */
  bpm: number;
  /** 这个Note应当被判定的时刻 */
  time: number;

  ///////////////////////// 以下仅适用于SlideTrack///////////////
  /** '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V' */
  slideType?: string; //'-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
  /** 结束位置 '1'-'8' */
  endPos?: string;
  /** 适用于V, 转向位置 '1'-'8' */
  turnPos?: string;
  /**  ため時間 */
  stopTime?: number;

  /** 是否是SLIDE CHAIN（人体蜈蚣） */
  isChain?: boolean;
  /**这段人体蜈蚣里的所有TRACK */
  slideLines?: SlideLine[];

  /** 对应的星星头的标识符 */
  slideTapSerial?: number;

  // 以下在生成後由speed之类的决定
  /** GUIDE STAR开始浮现的时间 */
  guideStarEmergeTime?: number;

  /** 分段信息 */
  sections?: SectionInfo[] | /* WIFI */ SectionInfo[][];
  /** SLIDE TRACK 分段的长度 */
  sectionCount?: number;

  /** ? （无头SLIDE TRACK）https://w.atwiki.jp/simai/pages/25.html#id_25968468  */
  isNoTapSlide?: boolean;
  /** ! （无头无GUIDE STARhangup SLIDE TRACK）https://w.atwiki.jp/simai/pages/25.html#id_25968468 */
  isNoTapNoTameTimeSlide?: boolean;

  /** 仅用于谱面读取时 */
  isSlideTrackBreak?: boolean;
  /** 仅用于谱面读取时 观赏谱 */
  isSlideTrackEx?: boolean;
  isSlideTrackInvisible?: boolean;
  isSlideTrackGhost?: boolean;
  /** 是否是观赏谱中的自定义前後位置的TRACK */
  isSpectatorSpecialRouteTrack?: boolean;

  /** 最後SlideLine的角度，用来确定判定图像的角度 */
  slideLineDirectionParams?: SlideTrackJudgementParams;
  //////////////////////////////////////////////////////////////////

  /** 伪SLIDE TAP(TAP、BREAKを強制的に☆型にする) */
  isStarTap?: boolean;
  /** 伪SLIDE TAP是否旋转 */
  starTapRotate?: boolean;

  /** 伪TAP(SLIDE時にTAP、BREAKを強制的に○型にする) */
  isTapStar?: boolean;

  /** 是否是「EACH对」的头部，用来画EACH对的黄线 */
  isEachPairFirst?: boolean;
  /** 「EACH对」长度，用来画EACH对的黄线 */
  eachPairDistance?: number;

  /** 重叠TOUCH白框内层的颜色 0: 不存在，1：蓝色，2：黄色，根据谱面流速在开始游戏後算出 */
  innerTouchOverlap?: number;
  /** 重叠TOUCH白框外层的颜色 0: 不存在，1：蓝色，2：黄色，根据谱面流速在开始游戏後算出 */
  outerTouchOverlap?: number;

  /** 适用于TOUCH，此TOUCH是否在一个touch group中 */
  inTouchGroup?: boolean;

  /** 是否是全隐形note */
  isInvisible?: boolean;

  /// 观赏谱相关
  /** 速度 */
  speed?: number;
  /** 是否是陷阱 */
  isTrap?: boolean;
  /** 是否是幽灵note（只有浮现和判定会显示） */
  isGhost?: boolean;
  /** 浮现时关键帧 */
  specFramesEmerge?: SpecFrame[];
  /** 移动时关键帧 */
  specFramesMove?: SpecFrame[];

  /** 是否对这个Note启用观赏谱判定 （因为一些观赏谱Note完全不能适用于现有的判定） */
  doSpecJudge?: boolean;

  /** 是否是反转note */
  reverse?: boolean;
  /** 图像缩放 */
  zoom?: number;
  /** 透明度 */
  transparency?: number;

  /** 红色偏移 */
  rShift?: number;
  /** 绿色偏移 */
  gShift?: number;
  /** 蓝色偏移 */
  bShift?: number;
}
