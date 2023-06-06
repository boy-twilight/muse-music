declare module 'video.js' {
  type VideoJsComponentOptions = {};

  interface VideoJsPlayerOptions {
    [key: string]: any;
  }

  class VideoJsPlayer {
    constructor(idOrNode: string | HTMLElement, options?: VideoJsPlayerOptions);

    aspectRatio(): string;
    autoplay(): boolean;
    buffered(): TimeRanges;
    controls(): boolean;
    currentSource(): Object;
    currentSrc(): string;
    currentTime(): number;
    dispose(): void;
    duration(): number;
    el(): HTMLElement;
    error(): MediaError | null;
    fluid(): boolean;
    height(): number;
    language(): string;
    muted(): boolean;
    networkState(): number;
    options(): any;
    paused(): boolean;
    playbackRate(): number;
    poster(): string;
    ready(callback: () => void): void;
    seekable(): TimeRanges;
    seeking(): boolean;
    src(newSource: string | videojs.Tech.SourceObject[]): void;
    textTracks(): TextTrackList;
    videoHeight(): number;
    videoWidth(): number;
    volume(): number;
    width(): number;
    on(key: string, callback: Function): any;

    // 这里可以添加您需要的方法和属性
  }
  function videojs(
    idOrEl: string | HTMLElement,
    options?: VideoJsPlayerOptions,
    callback: any
  ): VideoPlayer;

  export { VideoJsPlayer, VideoJsPlayerOptions };
  export default videojs;
}
