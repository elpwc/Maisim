import { sqrt } from '../utils/math';

/**
 * 画图
 * （至于为什么是Rotation，因为这个函数最早是用来绘制旋转了x度的图片的，结果逐渐变成绘制指定属性图片的函数了喵）
 * @param ctx
 * @param image
 * @param x
 * @param y
 * @param w
 * @param h
 * @param centerX 旋转中心x
 * @param centerY 旋转中心y
 * @param r 旋转角度
 * @param alpha 透明 0-1
 * @param sx 剪切x
 * @param sy 剪切y
 * @param sw 剪切宽度
 * @param sh 剪切高度
 * @param rShift 红色偏移
 * @param gShift 绿色偏移
 * @param bShift 蓝色偏移
 */
export const drawRotationImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  centerX?: number,
  centerY?: number,
  r?: number,
  alpha?: number,
  sx?: number,
  sy?: number,
  sw?: number,
  sh?: number,
  rShift?: number,
  gShift?: number,
  bShift?: number
) => {
  const TO_RADIANS = Math.PI / 180;
  if (ctx) {
    // 快速点击pause到play出现 TypeError: Illegal invocation at drawRotationImage (_base.ts:40:1)
    try {
      let imageToDraw = image;
      if ((rShift || gShift || bShift) && !(rShift === 0 && gShift === 0 && bShift === 0)) {
        const tempCanvas: HTMLCanvasElement = document.createElement('canvas');
        const tempCtx: CanvasRenderingContext2D = tempCanvas.getContext('2d')!;
        tempCanvas.width = imageToDraw.width;
        tempCanvas.height = imageToDraw.height;
        tempCtx.drawImage(imageToDraw, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, imageToDraw.width, imageToDraw.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, data[i] + (rShift ?? 0)));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + (gShift ?? 0)));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + (bShift ?? 0)));
        }
        tempCtx.putImageData(imageData, 0, 0);
        const newImage = new Image();
        newImage.src = tempCanvas.toDataURL();
        imageToDraw = newImage;
      }

      if (centerX && centerY && r) {
        ctx.save(); //保存状态
        ctx.translate(centerX, centerY); //设置画布上的(0,0)位置，也就是旋转的中心点
        ctx.rotate(r * TO_RADIANS);
        ctx.globalAlpha = alpha ?? 1;
        ctx.drawImage(imageToDraw, sx ?? 0, sy ?? 0, sw ?? imageToDraw.width, sh ?? imageToDraw.height, x - centerX, y - centerY, w, h);
        ctx.restore(); //恢复状态
      } else {
        ctx.globalAlpha = alpha ?? 1;
        ctx.drawImage(imageToDraw, sx ?? 0, sy ?? 0, sw ?? imageToDraw.width, sh ?? imageToDraw.height, x, y, w, h);
      }
    } catch (e) {
      console.log(e);
    }
  }
};

/**
 * 在canvas上擦除圆形区域
 * @param x 圆心x
 * @param y 圆心y
 * @param r 半径
 * @param cxt canvas
 */
export const clearArcFun = (x: number, y: number, r: number, cxt: CanvasRenderingContext2D) => {
  let stepClear = 1;
  const clearArc = (x: number, y: number, radius: number) => {
    const calcWidth = radius - stepClear;
    const calcHeight = Math.sqrt(radius * radius - calcWidth * calcWidth);
    const posX = x - calcWidth;
    const posY = y - calcHeight;

    const widthX = 2 * calcWidth;
    const heightY = 2 * calcHeight;

    if (stepClear <= radius) {
      cxt.clearRect(posX, posY, widthX, heightY);
      stepClear += 1;
      clearArc(x, y, radius);
    }
  };

  clearArc(x, y, r);
};

/** 点是否在线段围成的多边形内 */
export const isInner = (x: number, y: number, points: [number, number][]): boolean => {
  // 射线(?)最右x
  let rightMaxX: number = 0;
  points.forEach(p => {
    if (p[0] > rightMaxX) {
      rightMaxX = p[0];
    }
  });
  rightMaxX++;

  let crossNum: number = 0;
  for (let i = 0; i < points.length; i++) {
    const res = judgeIntersect(x, y, rightMaxX, y, points[i][0], points[i][1], points[i === points.length - 1 ? 0 : i + 1][0], points[i === points.length - 1 ? 0 : i + 1][1]);
    if (res) crossNum++;
  }

  return crossNum % 2 === 1;
};

/** 线段是否相交 */
export const judgeIntersect = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) => {
  if (!(Math.min(x1, x2) <= Math.max(x3, x4) && Math.min(y3, y4) <= Math.max(y1, y2) && Math.min(x3, x4) <= Math.max(x1, x2) && Math.min(y1, y2) <= Math.max(y3, y4))) return false;

  let u, v, w, z;
  u = (x3 - x1) * (y2 - y1) - (x2 - x1) * (y3 - y1);
  v = (x4 - x1) * (y2 - y1) - (x2 - x1) * (y4 - y1);
  w = (x1 - x3) * (y4 - y3) - (x4 - x3) * (y1 - y3);
  z = (x2 - x3) * (y4 - y3) - (x4 - x3) * (y2 - y3);
  return u * v <= 0.00000001 && w * z <= 0.00000001;
};

/** 两点间线段长度 */
export const lineLen = (x1: number, y1: number, x2: number, y2: number) => {
  return sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

/** 两点间线段长度 点 */
export const lineLenByPoint = (p1: [number, number], p2: [number, number]): number => {
  return sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
};

/**
 * 图像变色
 * @param image
 * @param rShift
 * @param gShift
 * @param bShift
 * @returns
 */
export const colorShiftImage = (image: HTMLImageElement, rShift: number, gShift: number, bShift: number) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] + rShift));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + gShift));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + bShift));
  }

  ctx.putImageData(imageData, 0, 0);

  const newImage = new Image();
  newImage.src = canvas.toDataURL();

  return newImage;
};
