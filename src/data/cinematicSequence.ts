import cinemaScene1Img from '../assets/images/cinema_scene1_workspace_1795543170244.jpg';
import cinemaScene2Img from '../assets/images/cinema_scene2_headphones_1795543170285.jpg';

export interface CinematicSceneClip {
  id: string;
  sceneNumber: string;
  title: string;
  subtitle: string;
  startSec: number;
  endSec: number;
  /**
   * Optional real video asset path (e.g. `${import.meta.env.BASE_URL}media/scene-1-workspace.mp4`).
   * Leave undefined until real .mp4/.webm clips are supplied in public/media/.
   */
  videoSrc?: string;
  /**
   * High-resolution storyboard reference frame shown when a real video clip is not mounted.
   */
  storyboardImage?: string;
  storyboardAlt?: string;
  /**
   * Explicit placeholder identifier when video assets are unavailable.
   */
  replaceableSlotLabel?: string;
  renderer: 'video-or-storyboard' | 'webgl-3d' | 'transition';
}

export const TOTAL_INTRO_DURATION_SEC = 22.5;

export const CINEMATIC_SEQUENCE: CinematicSceneClip[] = [
  {
    id: 'workspace',
    sceneNumber: '01',
    title: 'The Workspace',
    subtitle: 'Architectural stillness before the session begins.',
    startSec: 0,
    endSec: 3.6,
    videoSrc: undefined,
    storyboardImage: cinemaScene1Img,
    storyboardAlt:
      'Adult man entering a dark modern architectural studio workspace illuminated by warm indirect lighting at night',
    replaceableSlotLabel:
      'Replaceable Video Clip Slot 01 · public/media/scene-1-workspace.mp4',
    renderer: 'video-or-storyboard',
  },
  {
    id: 'headphones',
    sceneNumber: '02',
    title: 'The Headphones',
    subtitle: 'Focus settles in as the workstation awakens.',
    startSec: 3.6,
    endSec: 7.2,
    videoSrc: undefined,
    storyboardImage: cinemaScene2Img,
    storyboardAlt:
      'Close-up of matte obsidian and brushed champagne-brass over-ear headphones beside an illuminating monitor',
    replaceableSlotLabel:
      'Replaceable Video Clip Slot 02 · public/media/scene-2-headphones.mp4',
    renderer: 'video-or-storyboard',
  },
  {
    id: 'digital-world',
    sceneNumber: '03',
    title: 'Enter the Digital World',
    subtitle: 'Stepping beyond glass into structured data space.',
    startSec: 7.2,
    endSec: 10.6,
    videoSrc: undefined,
    renderer: 'webgl-3d',
  },
  {
    id: 'the-threat',
    sceneNumber: '04',
    title: 'The Threat',
    subtitle: 'Fragmented untrusted input approaches the boundary.',
    startSec: 10.6,
    endSec: 14.0,
    videoSrc: undefined,
    renderer: 'webgl-3d',
  },
  {
    id: 'the-defence',
    sceneNumber: '05',
    title: 'The Defence',
    subtitle: 'Intercepted at the glass perimeter. Neutralized on contact.',
    startSec: 14.0,
    endSec: 17.6,
    videoSrc: undefined,
    renderer: 'webgl-3d',
  },
  {
    id: 'brand-reveal',
    sceneNumber: '06',
    title: 'XSS Guard',
    subtitle: 'The art of digital defence.',
    startSec: 17.6,
    endSec: 20.6,
    videoSrc: undefined,
    renderer: 'webgl-3d',
  },
  {
    id: 'homepage-transition',
    sceneNumber: '07',
    title: 'Every input deserves protection.',
    subtitle: 'Entering interactive laboratory.',
    startSec: 20.6,
    endSec: TOTAL_INTRO_DURATION_SEC,
    renderer: 'transition',
  },
];

export function getSceneAtTime(timeSec: number): CinematicSceneClip {
  return (
    CINEMATIC_SEQUENCE.find(
      (scene) => timeSec >= scene.startSec && timeSec < scene.endSec
    ) ?? CINEMATIC_SEQUENCE[CINEMATIC_SEQUENCE.length - 1]
  );
}
