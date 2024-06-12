music.advanced.sequencerDispose(music.advanced.createSequencer());

namespace dj {
    class Loop {
        constructor(public kind: number, public buf: Buffer) {
        }
    }

    class TrackEventHandler {
        constructor(public event: TrackEvent, public handler: (track: number) => void) {}
    }

    class TickEventHandler {
        constructor(public ticks: number, public handler: (track: number) => void) {}
    }

    export class NoteEvent {
        constructor(public instrument: number, public note: number, public startTick: number, public endTick: number) {
        }
    }

    class MusicState {
        loops: Loop[];
        tracks: LoopSequencer[];
        volumes: number[];
        transposes: number[];
        eventHandlers: TrackEventHandler[];
        tickHandlers: TickEventHandler[];

        constructor() {
            this.loops = [];
            this.tracks = [];
            this.volumes = [];
            this.eventHandlers = [];
            this.tickHandlers = [];
            this.transposes = [];

            for (let i = 0; i < 8; i++) {
                this.tracks.push(null);
                this.volumes.push(1024);
                this.transposes.push(0)
            }
        }

        setLoop(kind: number, buf: Buffer) {
            for (const loop of this.loops) {
                if (loop.kind === kind) {
                    loop.buf = buf;
                    return;
                }
            }

            const loop = new Loop(kind, buf);
            this.loops.push(loop);
        }

        getLoop(kind: number) {
            for (const loop of this.loops) {
                if (loop.kind === kind) {
                    return loop.buf;
                }
            }
            return undefined;
        }

        playSequence(track: number, sequence: number[]) {
            track |= 0;
            if (this.tracks[track]) {
                this.tracks[track].stop();
            }

            this.tracks[track] = new LoopSequencer(sequence);
            this.tracks[track].start(this.volumes[track]);
        }

        enqueueSequence(track: number, sequence: number[]) {
            track |= 0;
            if (!this.tracks[track]) {
                this.playSequence(track, sequence);
                return
            }

            this.tracks[track].enqueue(sequence);
        }

        stop(track: number) {
            track |= 0;

            if (this.tracks[track]) {
                this.tracks[track].stop();
                this.tracks[track] = null;
            }
        }

        setVolume(track: number, volume: number) {
            this.volumes[track] = volume;

            if (this.tracks[track]) {
                this.tracks[track].setVolume(volume);
            }
        }

        setTranspose(track: number, transposeAmount: number) {
            this.transposes[track] = transposeAmount;

            if (this.tracks[track]) {
                this.tracks[track].setTranspose(transposeAmount);
            }
        }

        addTrackEventHandler(event: TrackEvent, handler: (track: number) => void) {
            this.eventHandlers.push(new TrackEventHandler(event, handler));
        }

        fireTrackEvent(event: TrackEvent, seq: LoopSequencer) {
            const track = this.tracks.indexOf(seq)
            for (const handler of this.eventHandlers) {
                if (event === handler.event) {
                    handler.handler(track);
                }
            }
        }

        addTickEventHandler(ticks: number, handler: (track: number) => void) {
            this.tickHandlers.push(new TickEventHandler(ticks, handler));
        }

        fireTickEvent(tick: number, seq: LoopSequencer) {
            const track = this.tracks.indexOf(seq)
            for (const handler of this.tickHandlers) {
                if (tick % handler.ticks === 0) {
                    handler.handler(track);
                }
            }
        }

        getTrackTick(track: number) {
            const seq = this.tracks[track];

            if (seq) {
                return seq.currentTick();
            }
            return 0;
        }

        getNextTickWithNote(track: number, startTick: number) {
            const seq = this.tracks[track];

            if (seq) {
                return seq.getNextTickWithNote(startTick)
            }
            return -1;
        }

        getLoopEndTick(track: number) {
            const seq = this.tracks[track];

            if (seq) {
                return seq.getLoopEndTick();
            }
            return -1;
        }

        getNoteEventsAtTime(track: number, tick: number) {
            const seq = this.tracks[track];
            if (seq) {
                return seq.getNoteEventsAtTime(tick);
            }

            return [];
        }
    }

    class LoopSequencer {
        protected currentSequencer: number;
        protected currentIndex = 0
        protected isPlaying = false;
        protected sequenceQueue: number[][];
        protected volume: number;
        protected transposeAmount = 0;

        protected currentlyPlaying: Buffer;
        protected currentlyPlayingOriginal: Buffer;

        protected globalTick: number;
        protected loopTickStart: number;

        constructor(public sequence: number[]) {
            this.sequenceQueue = [];
        }

        start(volume: number) {
            this.volume = volume;
            this.currentIndex = 0;
            this.globalTick = 0;
            if (this.sequence.length) {
                this.startNextSequencer();
            }
        }

        stop() {
            if (!this.isPlaying) return;
            this.isPlaying = false;
            this.onSequencerFinish();
        }

        currentTick() {
            return this.globalTick;
        }

        enqueue(sequence: number[]) {
            this.sequenceQueue.push(sequence);
        }

        startNextSequencer() {
            this.isPlaying = true;
            this.currentSequencer = music.advanced.createSequencer();

            this.setVolumeCore(this.volume);
            this.currentlyPlayingOriginal = _state().getLoop(this.sequence[this.currentIndex]);
            this.currentlyPlaying = control.createBuffer(this.currentlyPlayingOriginal.length);
            this.currentlyPlaying.write(0, this.currentlyPlayingOriginal);
            this.loopTickStart = this.globalTick;

            if (this.transposeAmount) {
                transposeBuffer(this.currentlyPlaying, this.transposeAmount, false);
            }

            music.advanced.sequencerPlaySong(this.currentSequencer, this.currentlyPlaying, false);

            const song = new music.sequencer.Song(this.currentlyPlaying);
            this.fireTickEvents(song, 0);

            control.onEvent(3243, this.currentSequencer, () => {
                this.onSequencerFinish();
            })

            control.onEvent(3244, this.currentSequencer, () => {
                this.globalTick++;
                _state().fireTickEvent(this.globalTick, this);
                const currentTick = music.advanced.sequencerCurrentTick(this.currentSequencer)
                this.fireTickEvents(song, currentTick);
            })
        }

        fireTickEvents(song: music.sequencer.Song, currentTick: number) {
            for (const track of song.tracks) {
                track.currentNoteEvent = new music.sequencer.NoteEvent(track.buf, track.noteEventStart + 2);

                while (true) {
                    if (track.currentNoteEvent.startTick === currentTick) {
                        _state().fireTrackEvent(TrackEvent.NoteStart, this);
                        break;
                    }
                    else if (track.currentNoteEvent.endTick === currentTick) {
                        _state().fireTrackEvent(TrackEvent.NoteEnd, this);

                        track.advanceNoteEvent();

                        if (track.currentNoteEvent.offset === track.noteEventStart + 2) {
                            break;
                        }
                    }
                    else if (track.currentNoteEvent.endTick < currentTick) {
                        track.advanceNoteEvent();

                        if (track.currentNoteEvent.offset === track.noteEventStart + 2) {
                            break;
                        }
                    }
                    else if (track.currentNoteEvent.startTick > currentTick) {
                        break;
                    }
                    else {
                        break;
                    }
                }
            }
        }

        onSequencerFinish() {
            _state().fireTrackEvent(TrackEvent.LoopEnd, this);
            music.advanced.sequencerDispose(this.currentSequencer);
            this.currentIndex++;

            if (this.currentIndex >= this.sequence.length) {
                _state().fireTrackEvent(TrackEvent.SequenceLoop, this);
                this.currentIndex = 0;

                if (this.sequenceQueue.length) {
                    this.sequence = this.sequenceQueue.shift();
                }
            }

            if (this.isPlaying) {
                this.startNextSequencer();
            }
        }

        setVolume(volume: number) {
            this.volume = volume;
            this.setVolumeCore(volume);
        }

        setTranspose(transpose: number) {
            if (this.transposeAmount === transpose) return;
            this.transposeAmount = transpose;

            this.currentlyPlaying.write(0, this.currentlyPlayingOriginal);
            transposeBuffer(this.currentlyPlaying, this.transposeAmount, false);
        }

        getNoteEventsAtTime(tick: number) {
            if (!this.currentlyPlaying) {
                return [];
            }
            return getNoteEventsAtTime(this.currentlyPlaying, tick - this.getCurrentLoopStartTick());
        }

        getNextTickWithNote(startTick: number) {
            if (!this.currentlyPlaying) {
                return -1;
            }
            return getNextTickWithNote(this.currentlyPlaying, startTick - this.getCurrentLoopStartTick());
        }

        getLoopEndTick() {
            if (!this.currentlyPlaying) {
                return -1;
            }

            return this.getCurrentLoopStartTick() + this.getCurrentLoopLength();
        }

        protected getCurrentLoopStartTick() {
            if (!this.currentlyPlaying) {
                return 0;
            }
            return this.globalTick - music.advanced.sequencerCurrentTick(this.currentSequencer);
        }

        protected getCurrentLoopLength() {
            if (!this.currentlyPlaying) {
                return 0;
            }

            const song = new music.sequencer.Song(this.currentlyPlaying);
            return song.measures * song.beatsPerMeasure * song.ticksPerBeat;
        }

        protected setVolumeCore(volume: number) {
            volume = Math.constrain(volume, 0, 1024);

            if (this.currentSequencer) {
                music.advanced.sequencerSetVolume(
                    this.currentSequencer,
                    (volume / 1024) * music.volume()
                );
            }
        }
    }

    function _stateFactory() {
        return new MusicState();
    }

    export function _state() {
        return __util.getState(_stateFactory);
    }

    export function transposeBuffer(song: Buffer, transposeAmount: number, allocateNew: boolean) {
        const toTranspose = new music.sequencer.Song(song);
        return transposeSong(toTranspose, transposeAmount, allocateNew).buf
    }

    export function transposeSong(song: music.sequencer.Song, transposeAmount: number, allocateNew: boolean) {
        const resultBuffer = allocateNew ? control.createBuffer(song.buf.length) : song.buf;
        resultBuffer.write(0, song.buf);

        const result = new music.sequencer.Song(resultBuffer);

        for (const track of result.tracks) {
            do {
                for (let i = 0; i < track.currentNoteEvent.polyphony; i++) {
                    const currentValue = track.buf[track.currentNoteEvent.offset + i + 5] & 0x3f;

                    track.buf[track.currentNoteEvent.offset + i + 5] = (currentValue + transposeAmount) & 0x3f
                }

                track.advanceNoteEvent();
            } while (track.currentNoteEvent.offset !== track.noteEventStart + 2)
        }

        return result;
    }

    function getNextTickWithNote(buf: Buffer, tick: number) {
        const song = new music.sequencer.Song(buf);
        let minTick;

        for (const track of song.tracks) {
            do {
                if (track.currentNoteEvent.startTick >= tick) {
                    if (minTick === undefined) {
                        minTick = track.currentNoteEvent.startTick;
                    }
                    else {
                        minTick = Math.min(track.currentNoteEvent.startTick, minTick)
                    }
                    break;
                }
            } while (track.currentNoteEvent.offset !== track.noteEventStart + 2)
        }

        if (minTick !== undefined) {
            return minTick;
        }

        return -1;
    }

    function getNoteEventsAtTime(buf: Buffer, tick: number) {
        const result: NoteEvent[] = [];

        const song = new music.sequencer.Song(buf);

        for (const track of song.tracks) {
            do {
                if (track.currentNoteEvent.startTick > tick) {
                    break;
                }
                else if (track.currentNoteEvent.endTick <= tick) {
                    track.advanceNoteEvent();
                }
                else {
                    for (let i = 0; i < track.currentNoteEvent.polyphony; i++) {
                        result.push(new NoteEvent(
                            track.id,
                            track.currentNoteEvent.getNote(i),
                            track.currentNoteEvent.startTick,
                            track.currentNoteEvent.endTick
                        ));
                    }
                    break;
                }
            } while (track.currentNoteEvent.offset !== track.noteEventStart + 2)
        }

        return result;
    }
}
