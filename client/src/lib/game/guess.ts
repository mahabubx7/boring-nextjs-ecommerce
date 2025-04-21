export const guessBlocks = ['2', '3', '4', '5', '6'] as const;
export type GuessBlock = typeof guessBlocks[number];
export type GuessGameMetadata = {
    block: GuessBlock
    maxAttempts: number
    maxTime: number
    score: number
}

export const computeScore = (block: GuessBlock = "2") => {
    /*
    |================================================
    | Compute score based on the block value
    | => 2: 10
    | => 3: 8
    | => 4: 7
    | => 5: 6
    | => 6: 5
    |================================================
    */

    const blockValue = parseInt(block);
    const score = (100 - (blockValue - 1) * 10) / 10;
    if (blockValue === 2) {
        return 10;
    }
    return score;
}


export const composeGameMetadata = (
    block: GuessBlock = "2",
    maxAttempts: number = 1,
    maxTime: number = 30,
    score: number = 0
): GuessGameMetadata => {
    const game = {
        block,
        maxAttempts,
        maxTime,
        score,
    } satisfies GuessGameMetadata;

    return game;
}