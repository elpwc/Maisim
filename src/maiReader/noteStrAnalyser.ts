import { flipPos } from '../areas';
import { flipTrack } from '../slideTracks/_global';
import { FlipMode } from '../utils/types/flipMode';
import { Note, SlideTrack, SlideLine } from '../utils/note';
import { NoteType } from '../utils/types/noteType';
import { noteValue_and_noteNumber_analyser } from './noteValueAnalyser';
import { analyse_slide_line } from './slideLineAnalyser';
import { isANumber } from '../utils/math';
import { findAllStr, replaceAt } from '../utils/stringUtils';

/** 分析谱面中一个note的文本 */
export const analyse_note_original_data = (noteDataOri: string, index: number, currentBPM: number, flipMode: FlipMode): Note | null => {
  //console.log(noteDataOri, index);
  let noteRes: Note = {
    index,
    serial: -1,
    pos: '',
    slideTracks: [],
    type: NoteType.Undefined,
    beatIndex: 0,
    partnotevalue: 0,
    bpm: 0,
    time: 0,
  };
  let noteData = noteDataOri;

  if (noteData === '') {
    return null;
  }

  // 速度 缩放 透明度 Color
  if (noteData[0] === '<') {
    const specParamGroups = noteData.substring(1, noteData.indexOf('>')).split('|');

    specParamGroups.forEach((specParamGroup, groupIndex) => {
      if (specParamGroup !== '') {
        const specParams = specParamGroup.split(';');
        if (groupIndex === 0) {
          // speed zoom transparency
          specParams.forEach((specParam, i) => {
            if (i === 0) {
              //speed
              noteRes.speed = Number(specParam);
            } else if (i === 1) {
              //zoom
              noteRes.zoom = Number(specParam);
            } else if (i === 2) {
              //transparency
              noteRes.transparency = Number(specParam);
            }
          });
        } else if (groupIndex === 1) {
          // color
          specParams.forEach((specParam, i) => {
            if (i === 0) {
              //rShift
              noteRes.rShift = Number(specParam);
            } else if (i === 1) {
              //gShift
              noteRes.gShift = Number(specParam);
            } else if (i === 2) {
              //bShift
              noteRes.bShift = Number(specParam);
            }
          });
        }
      }
    });

    noteData = noteData.substring(noteData.indexOf('>') + 1, noteData.length);
  }
  // 逆转Note
  if (noteData[0] === '-') {
    noteRes.reverse = true;
    noteData = noteData.substring(1);
  }
  if (noteData[0] === '0') {
    // 匹配用 xx/0 表示伪EACH（黄色但只有一个）这样的地狱写法
    noteRes.type = NoteType.Empty;
    return noteRes;
  }

  if (noteData.indexOf('速') !== -1) {
    // 疑似EACH
    noteRes.isNiseEach = true;
    noteData = noteData.replaceAll('速', '');
  }

  if (noteData.indexOf('b') !== -1) {
    // BREAK
    // 如果是SLIDE
    if (noteData.includes('[') && !noteData.includes('h')) {
      if (noteData.split('b').length === 3) {
        noteRes.isBreak = true;
        noteRes.isSlideTrackBreak = true;
      } else if (noteData.split('b').length === 2) {
        if (noteData.substring(1, 2) === 'b') {
          noteRes.isBreak = true;
        } else {
          noteRes.isSlideTrackBreak = true;
        }
      }
    } else {
      // 通常Note
      noteRes.isBreak = true;
    }
    noteData = noteData.replaceAll('b', '');
  }
  if (noteData.indexOf('x') !== -1) {
    // EX
    // 如果是SLIDE
    if (noteData.includes('[') && !noteData.includes('h')) {
      if (noteData.split('x').length === 3) {
        noteRes.isEx = true;
        noteRes.isSlideTrackEx = true;
      } else if (noteData.split('x').length === 2) {
        if (noteData.substring(1, 2) === 'x') {
          noteRes.isEx = true;
        } else {
          noteRes.isSlideTrackEx = true;
        }
      }
    } else {
      // 通常Note
      noteRes.isEx = true;
    }
    noteData = noteData.replaceAll('x', '');
  }
  if (noteData.indexOf('f') !== -1) {
    // FIREWORK
    noteRes.hasFirework = true;
    noteData = noteData.replaceAll('f', '');
  }
  if (noteData.indexOf('m') !== -1) {
    // TRAP
    noteRes.isTrap = true;
    noteData = noteData.replaceAll('m', '');
  }
  if (noteData.indexOf('i') !== -1) {
    // 隐形note
    // 如果是SLIDE
    if (noteData.includes('[') && !noteData.includes('h')) {
      if (noteData.split('i').length === 3) {
        noteRes.isInvisible = true;
        noteRes.isSlideTrackInvisible = true;
      } else if (noteData.split('i').length === 2) {
        if (noteData.substring(1, 2) === 'i') {
          noteRes.isInvisible = true;
        } else {
          noteRes.isSlideTrackInvisible = true;
        }
      }
    } else {
      // 通常Note
      noteRes.isInvisible = true;
    }
    noteData = noteData.replaceAll('i', '');
  }
  if (noteData.indexOf('g') !== -1) {
    // 幽灵note
    // 如果是SLIDE
    if (noteData.includes('[') && !noteData.includes('h')) {
      if (noteData.split('g').length === 3) {
        noteRes.isGhost = true;
        noteRes.isSlideTrackGhost = true;
      } else if (noteData.split('g').length === 2) {
        if (noteData.substring(1, 2) === 'g') {
          noteRes.isGhost = true;
        } else {
          noteRes.isSlideTrackGhost = true;
        }
      }
    } else {
      // 通常Note
      noteRes.isGhost = true;
    }
    noteData = noteData.replaceAll('g', '');
  }

  // $ @ ? !
  if (noteData.indexOf('$') !== -1) {
    // TAP、BREAKを強制的に☆型にする
    noteRes.isStarTap = true;
    // 2つ並べて"$$"にすると、☆TAPが回転するようになる(回転速度は一定)
    if (noteData.substring(noteData.indexOf('$') + 1, noteData.indexOf('$') + 2) === '$') {
      noteRes.starTapRotate = true;
    } else {
      noteRes.starTapRotate = false;
    }
    noteData = noteData.replaceAll('$', '');
  }
  if (noteData.indexOf('@') > 0) {
    // SLIDE時にTAP、BREAKを強制的に○型にする
    noteRes.isTapStar = true;
    noteData = noteData.replaceAll('@', '');
  }
  if (noteData.indexOf('?') !== -1) {
    // "?"の場合は、タメ時間中にSLIDEをなぞる用の☆が表示される
    noteRes.isNoTapSlide = true;
    noteData = noteData.replaceAll('?', '');
  }
  if (noteData.indexOf('!') !== -1) {
    // "!"の場合は、SLIDEをなぞり始めるその瞬間にいきなり☆が表示される
    noteRes.isNoTapNoTameTimeSlide = true;
    noteData = noteData.replaceAll('!', '');
  }
  // 把观赏谱特殊位置内的负号-都变成_防止影响後面SLIDE TYPE解析
  if (noteData.indexOf('#(') !== -1) {
    const specPosPositions = findAllStr(noteData, '#(');
    specPosPositions.forEach(specPosPosition => {
      noteData = replaceAt(noteData, '-', '_', specPosPosition, noteData.indexOf(')', specPosPosition));
    });
  }
  noteData = noteData.replaceAll('极(', '@(');
  if (noteData.indexOf('@(') !== -1) {
    const specPosPositions = findAllStr(noteData, '@(');
    specPosPositions.forEach(specPosPosition => {
      noteData = replaceAt(noteData, '-', '_', specPosPosition, noteData.indexOf(')', specPosPosition));
    });
  }

  if (noteData.length === 1) {
    // C TOUCH, TAP
    if (noteData.toUpperCase() === 'C') {
      // C TOUCH
      noteRes.type = NoteType.Touch;
      noteRes.pos = 'C';
    } else {
      // TAP
      noteRes.type = NoteType.Tap;
      noteRes.pos = flipPos(noteData.toUpperCase(), flipMode);
    }
  }

  if (noteData.length === 2) {
    // TOUCH (except C)
    noteRes.type = NoteType.Touch;
    noteRes.pos = flipPos(noteData.toUpperCase(), flipMode);

    // C1 C2
    if (noteRes.pos === 'C1' || noteRes.pos === 'C2') {
      noteRes.pos = 'C';
    }
  }

  // spec pos
  if (noteData.substring(0, 1) === '#' || noteData.substring(0, 1) === '@') {
    const specPosEnd = noteData.indexOf(')');
    noteRes.type = NoteType.Touch;
    noteRes.pos = flipPos(noteData.substring(0, specPosEnd + 1).replaceAll('_', '-'), flipMode);
    // 对于这种位置随机的观赏谱Note开启观赏谱判定
    noteRes.doSpecJudge = true;
  }

  if (noteData.indexOf('[') !== -1) {
    // SLIDE,HOLD,TOUCH HOLD
    if (noteData.indexOf('h') !== -1) {
      // HOLD, TOUCH HOLD

      const noteValue_and_noteNumber_original_data = noteData.substring(noteData.indexOf('[') + 1, noteData.indexOf(']'));

      let noteValue_and_noteNumber: number[] = [];

      if (noteValue_and_noteNumber_original_data.substring(0, 1) === '#') {
        noteRes.remainTime = Number(noteValue_and_noteNumber_original_data.substring(1, noteValue_and_noteNumber_original_data.length)) * 1000;
      } else {
        noteValue_and_noteNumber = noteData
          .substring(noteData.indexOf('[') + 1, noteData.indexOf(']'))
          .split(':')
          .map(e => {
            return Number(e);
          });
        noteRes.notevalue = noteValue_and_noteNumber[0];
        noteRes.notenumber = noteValue_and_noteNumber[1];

        noteRes.remainTime = (240 * noteRes.notenumber * 1000) / (currentBPM * noteRes.notevalue);
      }

      noteData = noteData.substring(0, noteData.indexOf('['));

      //console.log(noteRes);
      const firstChar = noteData.substring(0, 1).toUpperCase();
      if (firstChar === 'C' || firstChar === 'A' || firstChar === 'B' || firstChar === 'D' || firstChar === 'E') {
        // TOUCH HOLD
        noteRes.type = NoteType.TouchHold;
        noteRes.isShortHold = false;
        if (firstChar === 'C') {
          noteRes.pos = 'C';
        } else {
          noteRes.pos = flipPos(noteData.substring(0, 2), flipMode);
        }
      } else {
        // HOLD
        noteRes.type = NoteType.Hold;
        noteRes.isShortHold = false;
        noteRes.pos = flipPos(noteData.substring(0, 1), flipMode);
      }
    } else {
      // SLIDE & (观赏谱) TOUCH SLIDE
      const first_char = noteData.substring(0, 1);
      if (isANumber(first_char)) {
        // 正常SLIDE
        noteRes.pos = flipPos(noteData.substring(0, 1), flipMode);
        noteRes.type = NoteType.Slide;
        noteData = noteData.substring(1, noteData.length);
      } else if (first_char === '#' || first_char === '@') {
        // 任意位置开头的TOUCH SLIDE
        noteRes.pos = flipPos(noteData.split(/-|\^|<|>|v|s|z|pp|qq|p|q|w|V/)[0].replaceAll('_', '-') /*noteData.substring(0, noteData.indexOf(')') + 1)*/, flipMode);
        noteRes.type = NoteType.Spec_TouchSlide;
        noteData = noteData.substring(noteRes.pos.length, noteData.length);
      } else {
        // ABCDE开头的TOUCH SLIDE
        noteRes.pos = flipPos(noteData.split(/-|\^|<|>|v|s|z|pp|qq|p|q|w|V/)[0], flipMode);
        noteRes.type = NoteType.Spec_TouchSlide;
        noteData = noteData.substring(noteRes.pos.length, noteData.length);
      }

      // SLIDE (TAP + SLIDES)
      // SLIDE TAP

      const slides = noteData.split('*');
      slides.forEach(slideOri => {
        // SLIDES
        let slide = slideOri;

        // 会有在*後仍然写上SLIDE TAP位置的写法 e.g. 1-5[]*1-8[]
        if (/^[0-9]$/.test(slide.substring(0, 1))) {
          slide = slide.substring(1, slide.length);
        }

        let currentSlideTrackRes: SlideTrack = {};

        // 判断是不是人体蜈蚣
        const slideLines: SlideLine[] = [];
        if (slide.split('[').length > 2) {
          // 1. simai型   -3[:]-5[:]
          currentSlideTrackRes.isChain = true;

          const temp_slideLinesOri: SlideTrack[] = [];
          slide.split(']').forEach((lineOriData, i) => {
            if (lineOriData !== '') {
              const analysedLine = analyse_slide_line(lineOriData + ']', i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos!, currentBPM, flipMode);
              temp_slideLinesOri.push(analysedLine);
            }
          });

          // 总remainTime
          let totalRemainTime = 0;
          temp_slideLinesOri.forEach((slideLineOri, i) => {
            if (i === 0) {
              currentSlideTrackRes.stopTime = slideLineOri.stopTime;
            }
            totalRemainTime += slideLineOri.remainTime ?? 0;
          });

          /** 开始时间 */
          let beginTime = 0;

          temp_slideLinesOri.forEach((slideLineOri, i) => {
            const currentSlideLinePos = i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos;
            // const sections =
            //   slideLineOri.slideType === 'w'
            //     ? section_wifi(i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos!, slideLineOri.endPos!)
            //     : section(slideLineOri.slideType, i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos!, slideLineOri.endPos!, slideLineOri.turnPos);
            slideLines.push({
              slideType: slideLineOri.slideType,
              endPos: slideLineOri.endPos,
              turnPos: slideLineOri.turnPos,
              pos: currentSlideLinePos,

              /**  持续时间占比 */
              remainTime: slideLineOri.remainTime,
              beginTime,
              //sections,
              doSpecJudge: !(isANumber(currentSlideLinePos) && isANumber(slideLineOri.endPos)),
            });
            beginTime += slideLineOri.remainTime ?? 0;
          });

          currentSlideTrackRes.remainTime = totalRemainTime;
          currentSlideTrackRes.slideLines = slideLines;
        } else if (slide.split(/-|\^|<|>|v|s|z|pp|qq|p|q|w|V/).length > 2) {
          // 2. majdata型   -3-5[:]
          currentSlideTrackRes.isChain = true;

          let temp_slideLinesOri: SlideLine[] = [];

          let positions = slide.split('[')[0];
          const noteValue_and_noteNumber_original_data = slide.substring(slide.indexOf('[') + 1, slide.indexOf(']'));

          const noteValueRes = noteValue_and_noteNumber_analyser(noteValue_and_noteNumber_original_data, currentBPM);
          currentSlideTrackRes.notevalue = noteValueRes.notevalue;
          currentSlideTrackRes.notenumber = noteValueRes.notenumber;
          currentSlideTrackRes.remainTime = noteValueRes.remainTime;
          currentSlideTrackRes.stopTime = noteValueRes.stopTime;

          //let i = 0;
          //开始处理左边这一长串  pp3w6V57-3-6qq3q4

          let poses: string[] = positions.split(/-|\^|<|>|v|s|z|pp|qq|p|q|w|V/);
          let types: string[] = [];

          poses.splice(0, 1);

          let turnPoses: string[] = [];
          let turnPosesIndex = -1;

          // 依次获得所有slide track的类型
          let j = 0;
          for (let i = 0; i < positions.length; i++) {
            const crtChar = positions.substring(i, i + 1);
            if (['-', '^', '<', '>', 'v', 's', 'z', 'V', 'p', 'q', 'w'].includes(crtChar)) {
              if (crtChar === 'q' || crtChar === 'p') {
                const crtAndNextChar = positions.substring(i, i + 2);
                if (crtAndNextChar === 'qq' || crtAndNextChar === 'pp') {
                  types.push(crtAndNextChar);
                  // 如果是qq pp这种两个字符的，解析完继续往後前进一个字符，否则会多读出一个p或者q
                  i++;
                } else {
                  types.push(crtChar);
                }
              } else if (crtChar === 'V') {
                turnPoses.push(poses[j].substring(1, 2));
                poses[j] = poses[j].substring(0, 1);
              } else {
                types.push(crtChar);
              }
              j++;
            }
          }
          temp_slideLinesOri = types.map((each_type, i) => {
            if (each_type === 'V') {
              turnPosesIndex++;
            }
            console.log(poses, noteRes, i, noteDataOri, types);
            const currentSlideLinePos = i === 0 ? noteRes.pos.replaceAll('_', '-') : poses[i - 1].replaceAll('_', '-'),
              currentSlideLineEndPos = flipPos(poses[i].replaceAll('_', '-'), flipMode);
            return {
              slideType: flipTrack(each_type, flipMode),
              turnPos: each_type === 'V' ? flipPos(turnPoses[turnPosesIndex], flipMode) : '',
              endPos: currentSlideLineEndPos,
              pos: currentSlideLinePos,

              /**  持续时间占比 */
              remainTime: 0,
              beginTime: 0,
              //sections: section(slideType, i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos!, endPos!),
              doSpecJudge: !(isANumber(currentSlideLinePos) && isANumber(currentSlideLineEndPos)),
            };
          });

          console.log(positions, poses, types, temp_slideLinesOri, turnPoses);

          // while (positions !== '') {
          //   if (positions.substring(0, 2) === 'pp' || positions.substring(0, 2) === 'qq') {
          //     // pp qq
          //     const slideType = flipTrack(positions.substring(0, 2), flipMode);
          //     const endPos = flipPos(positions.substring(2, 3), flipMode);
          //     const pos = i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos;
          //     temp_slideLinesOri.push({
          //       slideType,
          //       endPos,
          //       pos,

          //       /**  持续时间占比 */
          //       remainTime: 0,
          //       beginTime: 0,
          //       //sections: section(slideType, i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos!, endPos!),
          //     });
          //     positions = positions.substring(3, positions.length);
          //   } else if (positions.substring(0, 1) === 'V') {
          //     //V
          //     const slideType = flipTrack(positions.substring(0, 1), flipMode);
          //     const turnPos = flipPos(positions.substring(1, 2), flipMode);
          //     const endPos = flipPos(positions.substring(2, 3), flipMode);
          //     const pos = i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos;
          //     temp_slideLinesOri.push({
          //       slideType,
          //       turnPos,
          //       endPos,
          //       pos,

          //       /**  持续时间占比 */
          //       remainTime: 0,
          //       beginTime: 0,
          //       //sections: section(slideType, i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos!, endPos!),
          //     });
          //     positions = positions.substring(3, positions.length);
          //   } else {
          //     // normal
          //     const slideType = flipTrack(positions.substring(0, 1), flipMode);
          //     let crt = 1;
          //     while (!['-', '^', '<', '>', 'v', 's', 'z', 'V', 'p', 'q', 'w'].includes(positions.substring(crt, crt + 1))) {
          //       crt++;
          //       if (crt >= positions.length) {
          //         break;
          //       }
          //     }
          //     const endPos = flipPos(positions.substring(1, 1 + crt), flipMode); //TODO maisim型人体蜈蚣里   1-E2-B3这样的特殊位置的读取
          //     const pos = i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos;
          //     temp_slideLinesOri.push({
          //       slideType,
          //       endPos,
          //       pos,

          //       /**  持续时间占比 */
          //       remainTime: 0,
          //       beginTime: 0,
          //       // sections:
          //       //   positions.substring(0, 1) === 'w'
          //       //     ? section_wifi(i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos!, endPos!)
          //       //     : section(slideType, i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos!, endPos!),
          //     });
          //     positions = positions.substring(1 + crt, positions.length);
          //   }
          //   i++;
          // }

          // 设置时间
          for (let j = 0; j < temp_slideLinesOri.length; j++) {
            temp_slideLinesOri[j].beginTime = (j / temp_slideLinesOri.length) * currentSlideTrackRes.remainTime;
            temp_slideLinesOri[j].remainTime = (1 / temp_slideLinesOri.length) * currentSlideTrackRes.remainTime;
          }

          currentSlideTrackRes.slideLines = temp_slideLinesOri;
        } else {
          // 正常
          currentSlideTrackRes = analyse_slide_line(slide, noteRes.pos, currentBPM, flipMode);
        }

        noteData = noteData.substring(0, noteData.indexOf('['));

        noteRes.slideTracks?.push(currentSlideTrackRes);
      });
    }
  } else {
    if (noteData.indexOf('h') !== -1) {
      // SHORT HOLD, SHORT TOUCH HOLD
      const firstChar = noteData.substring(0, 1);
      if (firstChar === 'C' || firstChar === 'A' || firstChar === 'B' || firstChar === 'D' || firstChar === 'E') {
        // TOUCH HOLD
        noteRes.type = NoteType.TouchHold;
        if (firstChar === 'C') {
          noteRes.pos = 'C';
        } else {
          noteRes.pos = flipPos(noteData.substring(0, 2), flipMode);
        }
        noteRes.isShortHold = true;
      } else {
        // HOLD
        noteRes.type = NoteType.Hold;
        noteRes.pos = flipPos(noteData.substring(0, 1), flipMode);
        noteRes.isShortHold = true;
      }
    }
  }

  return noteRes;
};
