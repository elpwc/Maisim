import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import './index.css';
import WavesurferPlayer, { useWavesurfer } from '@wavesurfer/react';
//@ts-ignore
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
//@ts-ignore
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js';
//@ts-ignore
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import WaveSurfer from 'wavesurfer.js';
import { TrackRegion } from '../utils/types/trackRegion';

interface P {
  track: string | undefined;
  playSpeedFactor: number;
  trackRegions?: TrackRegion[];
  zoom?: number;
  style?: React.CSSProperties;
  showButtons?: boolean;
  onReady?: (wavesurfer: WaveSurfer) => void;
  onFinish?: () => void;
  onSeeking?: (time: number) => void;
  onPlayPauseButtonClick?: (isPlayingNow: boolean) => void;
  onRewindButtonClick?: () => void;
}

export const ControlPanel = ({
  track = '',
  playSpeedFactor = 1.0,
  trackRegions = [],
  zoom = 100,
  style = {},
  showButtons = true,
  onReady,
  onFinish,
  onSeeking,
  onPlayPauseButtonClick,
  onRewindButtonClick,
}: P) => {
  const containerRef = useRef(null);

  const regions = useRef(RegionsPlugin.create());

  const clearRegions = () => {
    regions.current.clearRegions();
  };

  /**
   * 在wavesurfertrack上加一个点
   * @param time
   */
  const addPointToWavesurferTrack = (trackregion: TrackRegion) => {
    //console.log(regions.current, wavesurferProps.wavesurfer);
    regions.current.addRegion({
      start: trackregion.start,
      end: trackregion.end,
      resize: false,
      color: trackregion.color,
      drag: false,
    });
  };

  let wavesurferProps = useWavesurfer({
    container: containerRef,
    url: track,
    waveColor: 'rgb(89, 151, 243)',
    height: 100,
    progressColor: 'rgb(24, 71, 141)',
    autoScroll: true,
    autoCenter: true,
    minPxPerSec: zoom,
    audioRate: playSpeedFactor,
    plugins: useMemo(
      () => [
        Timeline.create(),
        Hover.create({
          lineColor: '#ff0000',
          lineWidth: 2,
          labelBackground: '#555',
          labelColor: '#fff',
          labelSize: '11px',
        }),
        regions.current,
      ],
      []
    ),
  });

  useEffect(() => {
    wavesurferProps.wavesurfer?.on('ready', () => {
      onReady?.(wavesurferProps.wavesurfer!);
    });
    wavesurferProps.wavesurfer?.on('finish', () => {
      onFinish?.();
    });
  }, [wavesurferProps]);

  useEffect(() => {
    wavesurferProps.wavesurfer?.on('seeking', currentTime => {
      if (currentTime !== 0) {
        console.log('seeking', currentTime * 1000);
        onSeeking?.(currentTime * 1000);
      }
    });
  }, [wavesurferProps]);

  useEffect(() => {
    clearRegions();
    trackRegions.forEach(trackRegion => {
      addPointToWavesurferTrack(trackRegion);
    });
  }, [trackRegions]);

  return (
    <div
      style={{
        ...style,
        display: '',
        position: 'relative',
        zIndex: 114514,
      }}
    >
      <div style={{ display: '' }} ref={containerRef} />
      {showButtons && (
        <div>
          <button
            id="rewindButton"
            onClick={() => {
              onRewindButtonClick?.();
            }}
          >
            Rewind
          </button>
          <button
            id="playPauseButton"
            onClick={() => {
              if (wavesurferProps.wavesurfer?.isPlaying()) {
                wavesurferProps.wavesurfer.pause();
                onPlayPauseButtonClick?.(true);
              } else {
                onPlayPauseButtonClick?.(false);
              }
            }}
          >
            {wavesurferProps.wavesurfer?.isPlaying() ? 'Pause' : 'Play'}
          </button>
        </div>
      )}
    </div>
  );
};
