namespace dj {
    /**
     * Gets the "kind" of sprite
     */
    //% group=Play
    //% weight=0
    //% shim=KIND_GET
    //% blockId=loopkind block="$kind"
    //% kindNamespace=LoopKind kindMemberName=kind kindPromptHint="e.g. Loop1, Loop2..."
    export function _loopKind(kind: number): number {
        return kind;
    }
}

namespace LoopKind {
    let nextKind: number;

    export function create() {
        if (nextKind === undefined) nextKind = 1000;
        return nextKind++;
    }

    //% isKind
    export const Loop1 = create();
}