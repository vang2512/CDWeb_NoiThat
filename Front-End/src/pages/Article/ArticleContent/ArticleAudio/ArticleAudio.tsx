import "./ArticleAudio.css"
import React, { useState, useEffect, useRef } from "react";

interface Props {
    title: string;
    description: string;
    content: string;
}

function ArticleAudio({ title, description, content }: Props) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState("00:00");
    const [duration, setDuration] = useState("00:00");
    const [progress, setProgress] = useState(0);
    const [showVoices, setShowVoices] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState("Nam miền Bắc");

    const synth = window.speechSynthesis;
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const elapsedRef = useRef(0);
    const fullTextRef = useRef("");
    const totalSecondsRef = useRef(0);

    // Xử lý làm sạch nội dung (loại bỏ HTML)
    const getPlainText = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;

        const captionSelectors = [
            "figcaption",
            ".PhotoCaption",
            ".VideoCaption",
            ".cms-caption",
            ".image-caption",
            "em"
        ];

        captionSelectors.forEach(selector => {
            const captions = tmp.querySelectorAll(selector);
            captions.forEach(cap => cap.remove());
        });

        const blocks = tmp.querySelectorAll("p, div, br, li, h1, h2, h3, h4");
        blocks.forEach(block => {
            // Chèn thêm dấu chấm và khoảng trắng vào cuối mỗi khối để tạo khoảng nghỉ
            block.appendChild(document.createTextNode(". "));
        });

        return tmp.textContent || tmp.innerText || "";
    };

    useEffect(() => {
        const plainContent = getPlainText(content);
        fullTextRef.current = `${title}. ... ${description}. ... ${plainContent}`;

        const estimatedSeconds = Math.floor(fullTextRef.current.length * 0.08);
        totalSecondsRef.current = estimatedSeconds;
        setDuration(formatTime(estimatedSeconds));
    }, [title, description, content]);

    const readFromProgress = () => {
        synth.cancel();
        stopTimer();

        const fullText = fullTextRef.current;
        const startIndex = Math.floor((progress / 100) * fullText.length);
        const textToRead = fullText.substring(startIndex);

        if (textToRead.trim().length === 0) return;

        const utterance = new SpeechSynthesisUtterance(textToRead);

        // Cấu hình giọng đọc
        const voices = synth.getVoices();
        const viVoices = voices.filter(v => v.lang.includes("vi-VN"));
        if (viVoices.length > 0) {
            if (selectedVoice.includes("Nữ")) {
                utterance.voice = viVoices.find(v => v.name.includes("Google")) || viVoices[0];
                utterance.pitch = 1.2;
            } else {
                utterance.voice = viVoices[0];
                utterance.pitch = 0.8;
            }
        }
        utterance.lang = "vi-VN";
        utterance.rate = 0.9;

        utterance.onstart = () => {
            setIsPlaying(true);
            startTimer();
        };

        utterance.onend = () => {
            if (elapsedRef.current >= totalSecondsRef.current - 2) {
                handleReset();
            }
        };

        setTimeout(() => {
            synth.speak(utterance);
        }, 100);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            synth.pause();
            stopTimer();
            setIsPlaying(false);
        } else {
            if (synth.paused) {
                synth.resume();
                startTimer();
                setIsPlaying(true);
            } else {
                readFromProgress();
            }
        }
    };

    const startTimer = () => {
        stopTimer();
        timerRef.current = setInterval(() => {
            if (elapsedRef.current < totalSecondsRef.current) {
                elapsedRef.current += 1;
                const newProgress = (elapsedRef.current / totalSecondsRef.current) * 100;
                setProgress(newProgress);
                setCurrentTime(formatTime(elapsedRef.current));
            } else {
                handleReset();
            }
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleReset = () => {
        stopTimer();
        setIsPlaying(false);
        elapsedRef.current = 0;
        setProgress(0);
        setCurrentTime("00:00");
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newProgress = parseInt(e.target.value);
        setProgress(newProgress);

        const newSeconds = Math.floor((newProgress / 100) * totalSecondsRef.current);
        elapsedRef.current = newSeconds;
        setCurrentTime(formatTime(newSeconds));
    };

    const applySeek = () => {
        if (isPlaying) {
            readFromProgress();
        } else {
            synth.cancel();
        }
    };

    useEffect(() => {
        handleReset();
        synth.cancel();
        return () => {
            synth.cancel();
            stopTimer();
        };
    }, [selectedVoice]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest(".voice-speak")) setShowVoices(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest(".voice-speak")) {
                setShowVoices(false);
            }
        };

        if (showVoices) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showVoices]);

    return (
        <div id="article-audio">
            <div className="body">
                <div className="container">
                    {/* Nút phát */}
                    <button
                        className={`play-button ${isPlaying ? "playing" : ""}`}
                        onClick={handlePlayPause}
                        type="button"
                    >
                        <div className={isPlaying ? "icon-pause" : "icon"}></div>
                    </button>

                    {/* Thời gian và thanh chạy */}
                    <div className="time-line">
                        <div className="time">
                            <span>{currentTime}</span>
                            <span>/</span>
                            <span>{duration}</span>
                        </div>
                        <div className="line">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={handleSeek}
                                onMouseUp={applySeek}
                                onTouchEnd={applySeek}
                                className="seek-input"
                            />
                            <div
                                className="line-icon"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Tùy chỉnh giọng nói */}
                    <div className="voice-speak">
                        <button className="voice-button" aria-label="Giọng đọc" type="button" onClick={() => setShowVoices(!showVoices)}>
                            <div className="voice-icon"></div>
                            <div className="voice-type">{selectedVoice}</div>
                            <div className={`arrow-icon ${showVoices ? "up" : ""}`}></div>
                        </button>
                        <ul className="type" style={{ display: showVoices ? "block" : "none" }}>
                            <li onClick={() => {setSelectedVoice("Nam miền Bắc"); setShowVoices(false);}}>Nam miền Bắc</li>
                            <li onClick={() => {setSelectedVoice("Nữ miền Bắc"); setShowVoices(false);}}>Nữ miền Bắc</li>
                            <li onClick={() => {setSelectedVoice("Nữ miền Nam"); setShowVoices(false);}}>Nữ miền Nam</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ArticleAudio;