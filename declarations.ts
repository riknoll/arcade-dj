namespace music.advanced {
    //% promise
    //% shim=music::_createSequencer
    export declare function createSequencer(): number

    //% shim=music::_sequencerState
    export declare function sequencerState(id: number): string;

    //% shim=music::_sequencerCurrentTick
    export declare function sequencerCurrentTick(id: number): number;

    //% shim=music::_sequencerPlaySong
    export declare function sequencerPlaySong(id: number, song: Buffer, loop: boolean): void;

    //% shim=music::_sequencerStop
    export declare function sequencerStop(id: number): void;

    //% shim=music::_sequencerSetVolume
    export declare function sequencerSetVolume(id: number, volume: number): void;

    //% shim=music::_sequencerSetVolumeForAll
    export declare function sequencerSetVolumeForAll(volume: number): void;

    //% shim=music::_sequencerSetTrackVolume
    export declare function sequencerSetTrackVolume(id: number, trackIndex: number, volume: number): void;

    //% shim=music::_sequencerSetDrumTrackVolume
    export declare function sequencerSetDrumTrackVolume(id: number, trackIndex: number, drumIndex: number, volume: number): void;

    //% shim=music::_sequencerDispose
    export declare function sequencerDispose(id: number): void;
}