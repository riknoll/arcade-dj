//% block="DJ Arcade"
//% color="#6fa5c7"
namespace dj {
    export enum Track {
        //% block="track 1"
        One,
        //% block="track 2"
        Two,
        //% block="track 3"
        Three,
        //% block="track 4"
        Four,
        //% block="track 5"
        Five,
        //% block="track 6"
        Six,
        //% block="track 7"
        Seven,
        //% block="track 8"
        Eight
    }


    export enum TrackEvent {
        //% block="note start"
        NoteStart,
        //% block="note end"
        NoteEnd,
        //% block="loop end"
        LoopEnd,
        //% block="sequence end"
        SequenceLoop,
    }

    export enum BeatFraction {
        //% block="1/32 note"
        ThirtySecond = 1,
        //% block="1/16 note"
        Sixteenth = 2,
        //% block="1/8 note"
        Eighth = 4,
        //% block="1/4 note"
        Quarter = 8,
        //% block="1/2 note"
        Half = 16,
        //% block="1 note"
        Measure = 32
    }

    export enum NoteEventProperty {
        //% block="note"
        Note,
        //% block="start tick"
        StartTick,
        //% block="end tick"
        EndTick,
        //% block="duration in ticks"
        Duration,
        //% block="instrument index"
        Instrument
    }

    //% group=Play
    //% blockId=dj_setLoop
    //% block="set loop $kind to $loop"
    //% kind.shadow=loopkind
    //% loop.shadow=music_song_field_editor
    //% weight=100
    export function defineLoop(kind: number, loop: music.Playable) {
        if (!(loop instanceof music.sequencer.Song)) {
            throw "This only works with songs";
        }

        _state().setLoop(kind, loop.buf);
    }

    //% group=Play
    //% blockId=dj_playSequence
    //% block="$track play sequence $sequence"
    //% track.shadow=dj__track
    //% sequence.shadow=dj_createSequence
    //% weight=90
    //% blockGap=8
    export function playSequence(track: number, sequence: number[]) {
        _state().playSequence(track, sequence);
    }

    //% group=Play
    //% blockId=dj_enqueueSequence
    //% block="$track enqueue sequence $sequence"
    //% track.shadow=dj__track
    //% sequence.shadow=dj_createSequence
    //% weight=80
    export function enqueueSequence(track: number, sequence: number[]) {
        _state().enqueueSequence(track, sequence);
    }

    //% group=Play
    //% blockId=dj_stopTrack
    //% block="stop $track"
    //% track.shadow=dj__track
    //% weight=70
    export function stopTrack(track: number) {
        _state().stop(track);
    }

    //% group=Play
    //% blockId=dj_setTrackVolume
    //% block="$track set volume $volume"
    //% track.shadow=dj__track
    //% volume.defl=1024
    //% volume.min=0
    //% volume.max=1024
    //% weight=60
    //% blockGap=8
    export function setTrackVolume(track: number, volume: number) {
        _state().setVolume(track, volume);
    }

    //% group=Play
    //% blockId=dj_setTrackTranspose
    //% block="$track set transpose $transposeAmount"
    //% track.shadow=dj__track
    //% transposeAmount.defl=12
    //% volume.min=-24
    //% volume.max=24
    //% weight=50
    export function setTrackTranspose(track: number, transposeAmount: number) {
        _state().setTranspose(track, transposeAmount);
    }

    //% group=Play
    //% blockId=dj_createSequence
    //% block="$loop1||$loop2|$loop3|$loop4|$loop5|$loop6|$loop7|$loop8|$loop9|$loop10|$loop11|$loop12|$loop13|$loop14|$loop15|$loop16"
    //% loop1.shadow=loopkind
    //% loop2.shadow=loopkind
    //% loop3.shadow=loopkind
    //% loop4.shadow=loopkind
    //% loop5.shadow=loopkind
    //% loop6.shadow=loopkind
    //% loop7.shadow=loopkind
    //% loop8.shadow=loopkind
    //% loop9.shadow=loopkind
    //% loop10.shadow=loopkind
    //% loop11.shadow=loopkind
    //% loop12.shadow=loopkind
    //% loop13.shadow=loopkind
    //% loop14.shadow=loopkind
    //% loop15.shadow=loopkind
    //% loop16.shadow=loopkind
    //% blockHidden
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=3
    export function createSequence(
        loop1: number,
        loop2?: number,
        loop3?: number,
        loop4?: number,
        loop5?: number,
        loop6?: number,
        loop7?: number,
        loop8?: number,
        loop9?: number,
        loop10?: number,
        loop11?: number,
        loop12?: number,
        loop13?: number,
        loop14?: number,
        loop15?: number,
        loop16?: number,
    ): number[] {
        const result = [loop1];
        if (loop2 !== undefined) result.push(loop2)
        if (loop3 !== undefined) result.push(loop3)
        if (loop4 !== undefined) result.push(loop4)
        if (loop5 !== undefined) result.push(loop5)
        if (loop6 !== undefined) result.push(loop6)
        if (loop7 !== undefined) result.push(loop7)
        if (loop8 !== undefined) result.push(loop8)
        if (loop9 !== undefined) result.push(loop9)
        if (loop10 !== undefined) result.push(loop10)
        if (loop11 !== undefined) result.push(loop11)
        if (loop12 !== undefined) result.push(loop12)
        if (loop13 !== undefined) result.push(loop13)
        if (loop14 !== undefined) result.push(loop14)
        if (loop15 !== undefined) result.push(loop15)
        if (loop16 !== undefined) result.push(loop16)

        return result;
    }

    //% group=Timing
    //% blockId=dj_onTrackEvent
    //% block="on $event in $track"
    //% draggableParameters=reporter
    //% weight=100
    export function onTrackEvent(event: TrackEvent, handler: (track: number) => void) {
        _state().addTrackEventHandler(event, handler);
    }

    //% group=Timing
    //% blockId=dj_onTickEvent
    //% block="on every $event in $track"
    //% event.shadow=dj__tick
    //% draggableParameters=reporter
    //% weight=90
    export function onTickEvent(event: number, handler: (track: number) => void) {
        _state().addTickEventHandler(event, handler);
    }

    //% group=Timing
    //% blockId=dj_getTrackTick
    //% block="$track current tick"
    //% track.shadow=dj__track
    //% weight=80
    //% blockGap=8
    export function getTrackTick(track: number): number {
        return _state().getTrackTick(track);
    }

    //% group=Timing
    //% blockId=dj_getLoopEndTick
    //% block="$track tick at which current loop ends"
    //% track.shadow=dj__track
    //% weight=70
    //% blockGap=8
    export function getLoopEndTick(track: number): number {
        return _state().getLoopEndTick(track);
    }

    //% group=Timing
    //% blockId=dj_getNextNoteStartTick
    //% block="$track next note start tick after $afterTick"
    //% track.shadow=dj__track
    //% weight=60
    export function getNextNoteStartTick(track: number, afterTick: number): number {
        return _state().getNextTickWithNote(track, afterTick);
    }

    //% group=Notes
    //% blockId=dj_getNoteEventsAt
    //% block="$track get note events at tick $tick"
    //% track.shadow=dj__track
    //% weight=100
    //% blockGap=8
    export function getNoteEventsAt(track: number, tick: number): NoteEvent[] {
        return _state().getNoteEventsAtTime(track, tick);
    }

    //% group=Notes
    //% blockId=dj_getNoteEventProp
    //% block="$event $prop"
    //% event.shadow=variables_get
    //% event.defl=myNoteEvent
    //% weight=90
    export function getNoteEventProp(event: NoteEvent, prop: NoteEventProperty) {
        switch (prop) {
            case NoteEventProperty.Note:
                return event.note;
            case NoteEventProperty.StartTick:
                return event.startTick;
            case NoteEventProperty.EndTick:
                return event.endTick;
            case NoteEventProperty.Instrument:
                return event.instrument;
            case NoteEventProperty.Duration:
                return event.endTick - event.startTick;
        }
        return 0;
    }

    //% group=Play
    //% shim=TD_ID
    //% blockId=dj__track
    //% block="$track"
    //% weight=0
    export function _track(track: Track): number {
        return track;
    }

    //% group=Timing
    //% shim=TD_ID
    //% blockId=dj__tick
    //% block="$tick"
    //% weight=0
    export function _tick(tick: BeatFraction): number {
        return tick;
    }
}