import Image from 'next/image';
import Slider from 'rc-slider';
import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    setPlayingState,
    hasPrevious,
    hasNext,
    isLooping,
    toogleLoop,
    isShuffling,
    toggleShuffle,
    clearPlayerState
  } = usePlayer();
  const episode = episodeList[currentEpisodeIndex];

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();

    }
  }, [isPlaying])

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    })
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext()
    } else {
      clearPlayerState();
    }
  }

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora {episode?.title}</strong>
      </header>

      {episode ? (<div className={styles.currentEpisode}>
        <Image width={592} height={592} src={episode.thumbnail} alt={episode.title} objectFit="cover" />
        <strong>{episode.title}</strong>
        <span>{episode.members}</span>
      </div>) : (<div className={styles.emptyPlayer}>
        <strong>Selecione um podcast para ouvir</strong>
      </div>)
      }

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (<Slider max={episode.duration} onChange={handleSeek} value={progress} trackStyle={{ backgroundColor: '#84d361' }} railStyle={{ backgroundColor: '#9f75ff' }} handleStyle={{ backgroundColor: '#84d361', borderWidth: 4 }} />) : (<div className={styles.emptySlider} />)}
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio src={episode.url}
            autoPlay
            loop={isLooping}
            ref={audioRef}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState}
            onEnded={() => handleEpisodeEnded()}
            onLoadedMetadata={() => setupProgressListener()}
          />

        )}

        <div className={styles.buttons}>
          <button type="button" disabled={!episode || episodeList.length === 1} onClick={toggleShuffle} className={isShuffling && episodeList.length !== 1 ? styles.isActive : ""}>
            <img src="/shuffle.svg" alt="Embaralhar" />
          </button>
          <button type="button" disabled={!episode || !hasPrevious} onClick={() => playPrevious()}>
            <img src="/play-previous.svg" alt="Voltar anterior" />
          </button>
          <button type="button" className={styles.playButton} disabled={!episode} onClick={() => togglePlay()}>
            {isPlaying ? (<img src="/pause.svg" alt="Tocar" />) : (<img src="/play.svg" alt="Tocar" />)}
          </button>
          <button type="button" disabled={!episode || !hasNext} onClick={() => playNext()}>
            <img src="/play-next.svg" alt="Tocar próxima" />
          </button>
          <button type="button" disabled={!episode} onClick={toogleLoop} className={isLooping ? styles.isActive : ""}>
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div >
  )
}