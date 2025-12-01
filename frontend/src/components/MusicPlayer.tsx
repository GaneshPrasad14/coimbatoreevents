import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Music as MusicIcon } from 'lucide-react';

const PLAYLIST = [
    {
        title: "Party Background",
        url: "/party-background-music-347352.mp3",
        artist: "Local Music"
    },
    {
        title: "Dance Club",
        url: "/party-party-dance-club-music-277016.mp3",
        artist: "Local Music"
    },
    {
        title: "Festival Dance",
        url: "/party-party-festival-dance-music-254140.mp3",
        artist: "Local Music"
    },
    {
        title: "Tribal House",
        url: "/party-party-tribal-house-suno-music-show-259243.mp3",
        artist: "Local Music"
    },
    {
        title: "Sweet Life Chill",
        url: "/sweet-life-luxury-chill-438146.mp3",
        artist: "Local Music"
    }
];

export function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isExpanded, setIsExpanded] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const hasPlayedRef = useRef(false); // Track if we've successfully played at least once

    // Combined effect for autoplay and interaction listeners
    useEffect(() => {
        const handleInteraction = async () => {
            if (!hasPlayedRef.current && audioRef.current) {
                try {
                    await audioRef.current.play();
                    setIsPlaying(true);
                    hasPlayedRef.current = true;
                    cleanupListeners();
                } catch (error) {
                    console.log("Play failed on interaction:", error);
                }
            }
        };

        const cleanupListeners = () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };

        const attemptAutoplay = async () => {
            if (audioRef.current) {
                try {
                    audioRef.current.volume = volume;
                    await audioRef.current.play();
                    setIsPlaying(true);
                    hasPlayedRef.current = true;
                } catch (error) {
                    console.log("Autoplay prevented. Waiting for interaction.");
                    setIsPlaying(false);
                    // Add listeners only if autoplay failed AND we haven't played yet
                    if (!hasPlayedRef.current) {
                        window.addEventListener('click', handleInteraction, { once: true });
                        window.addEventListener('keydown', handleInteraction, { once: true });
                        window.addEventListener('touchstart', handleInteraction, { once: true });
                    }
                }
            }
        };

        attemptAutoplay();

        return () => {
            cleanupListeners();
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []); // Run only once on mount

    // Handle play/pause state changes from user interaction (buttons)
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        if (e.name !== 'AbortError') console.log("Play failed:", e);
                    });
                }
                // If user manually plays, we consider it "played" and should ensure listeners are gone
                // (Though the listeners are self-cleaning via {once:true} or the first effect, 
                // this is just a state sync)
                hasPlayedRef.current = true;
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
            if (audioRef.current) audioRef.current.muted = false;
        }
    };

    const nextTrack = () => {
        setCurrentTrack((prev) => (prev + 1) % PLAYLIST.length);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setCurrentTrack((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
        setIsPlaying(true);
    };

    return (
        <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isExpanded ? 'w-96' : 'w-16'}`}>
            <div className={`bg-black/80 backdrop-blur-md rounded-full shadow-2xl border border-white/10 overflow-hidden transition-all duration-300 ${isExpanded ? 'p-3' : 'p-2'}`}>
                <audio
                    ref={audioRef}
                    src={PLAYLIST[currentTrack].url}
                    onEnded={nextTrack}
                />

                <div className="flex items-center justify-between">
                    {/* Collapsed / Expand Button with Waveform */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`relative flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg flex-shrink-0 transition-all duration-300 ${isExpanded ? 'w-12 h-12' : 'w-12 h-12'}`}
                    >
                        {isPlaying ? (
                            <div className="flex items-center justify-center gap-[2px] h-6">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-[3px] bg-white rounded-full animate-wave"
                                        style={{
                                            animationDelay: `${i * 0.1}s`,
                                            height: '40%'
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <MusicIcon className="w-5 h-5" />
                        )}
                    </button>

                    {/* Expanded Controls */}
                    {isExpanded && (
                        <div className="flex-1 flex items-center gap-4 ml-4 overflow-hidden animate-in slide-in-from-right duration-300">
                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {/* Mini Waveform Visualizer */}
                                    {isPlaying && (
                                        <div className="flex items-end gap-[2px] h-3">
                                            {[...Array(8)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-[2px] bg-gradient-to-t from-purple-500 to-pink-500 rounded-full animate-wave"
                                                    style={{
                                                        animationDelay: `${Math.random() * 0.5}s`,
                                                        height: '100%'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs font-bold text-white truncate">{PLAYLIST[currentTrack].title}</p>
                                </div>
                                <p className="text-[10px] text-gray-400 truncate">{PLAYLIST[currentTrack].artist}</p>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-3">
                                <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors">
                                    <SkipBack className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                                >
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                </button>

                                <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors">
                                    <SkipForward className="w-4 h-4" />
                                </button>

                                {/* Volume Control */}
                                <div className="group relative flex items-center">
                                    <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                                        {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                    </button>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block">
                                        <div className="bg-black/90 p-3 rounded-xl border border-white/10 shadow-xl">
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={isMuted ? 0 : volume}
                                                onChange={handleVolumeChange}
                                                className="h-24 -rotate-90 w-2 accent-pink-500 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
