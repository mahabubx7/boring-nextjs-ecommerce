"use client";

import { GameAPI } from "@/helpers/apis/game";
import { getAxiosInstance } from "@/lib/axios";
import {
  computeScore,
  GuessBlock,
  guessBlocks,
  GuessGameMetadata,
} from "@/lib/game/guess";
import { useAuthStore } from "@/store/useAuthStore";
import { API_ROUTES } from "@/utils/api";
import { useRouter } from "next/navigation";
import { FormEvent, RefObject, useEffect, useRef, useState } from "react";

function Timer({
  timeLeft,
  signal,
}: {
  timeLeft: number;
  signal: RefObject<boolean | null>;
}) {
  if (timeLeft > 0) {
    return <span>{timeLeft}s</span>;
  } else if (signal.current) {
    return <span className="text-red-500">Time's Up!</span>;
  }

  return "";
}

export default function GuessGamePage() {
  const { user, getUser } = useAuthStore((state) => state);
  const [season, setSeason] = useState<string | null>(null);
  const [usrScore, setUsrScore] = useState<number>(0);
  const [blocks, setBlocks] = useState<number[]>([]);
  const [guess, setGuess] = useState<number | null>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [btnText, setBtnText] = useState<string>("Submit");
  const [locked, setLocked] = useState<boolean>(false);
  const [play, setPlay] = useState<boolean>(false);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const signal = useRef<boolean | null>(null);
  const [game, setGame] = useState<GuessGameMetadata>({
    block: "2",
    maxAttempts: 1,
    maxTime: 30,
    score: 0,
  });

  const router = useRouter();
  const ax = getAxiosInstance(API_ROUTES.GAME);
  const gameApi = new GameAPI(ax);

  const startGame = () => {
    const now = Date.now();
    const endTime = now + game.maxTime * 1000;

    setBlocks(makeBlocks(game.block));

    setEndsAt(endTime);
    setPlay(true);
    signal.current = true;
    setLocked(true);
  };

  const makeBlocks = (block: GuessBlock = "2") => {
    const blocks = new Set<number>();
    const genRandomNum = () => Math.floor(Math.random() * 10);

    while (blocks.size < Number(block)) {
      blocks.add(genRandomNum());
    }

    return Array.from(blocks);
  };

  const submitGameAndCheck = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnText("Checking...");
    setChecking(true);
    await gameApi.guessChecker(blocks, +Number(guess)).then(async (res) => {
      if (res && res.success) {
        setUsrScore((prev) => prev + game.score);
        setBtnText("Correct!");

        /// Add Game Coin
        await gameApi
          .addGameCoin(computeScore(game.block).toString())
          .then((res) => {
            if (res && res.status) {
              setLocked(false);
            } else {
              setBtnText("Incorrect!");
            }
          })
          .catch((err) => {
            console.error(err);
            setLocked(false);
            signal.current = false;
            setPlay(false);
          });
      } else {
        setBtnText("Incorrect!");
      }

      setTimeout(() => {
        setBtnText("Submit");
        setChecking(false);
        setPlay(false);
        signal.current = false;
        setLocked(false);
        setGuess(null);
        setBlocks([]);
        setEndsAt(null);
        setTimeLeft(0);
        setGame({ ...game, block: "2", maxAttempts: 1, maxTime: 30, score: 0 });
      }, 5 * 1000);
    });

    // refresh the page
    await getUser();
    router.prefetch("/game/guess-the-number");
  };

  useEffect(() => {
    async function callApis() {
      const resUsrScore = await gameApi.getUserGameScore().catch(() => null);
      if (resUsrScore && "score" in resUsrScore) setUsrScore(resUsrScore.score);

      const resSeason = await gameApi.fetchSeasonCode().catch(() => null);
      if (resSeason && "season" in resSeason) setSeason(resSeason.season);
    }

    callApis().catch((err) => {
      console.error(err);
    });
  }, [user, router]);

  useEffect(() => {
    if (!play || !endsAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setPlay(false);
        setLocked(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [play, endsAt]);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-center mb-4">
          Guess the Number
        </h1>

        <p>Your GameScore: {usrScore}</p>
        <p>Current Season: {season}</p>
        <hr />

        <strong>Guess Block Size:</strong>
        <p className="flex gap-2 flex-wrap my-2">
          {guessBlocks.map((gb) => (
            <button
              key={gb}
              className={`border border-foreground/25 rounded-md w-8 h-8 text-center hover:bg-foreground hover:text-background transition-all cursor-pointer ${
                gb === game.block ? "bg-foreground text-background" : ""
              }`}
              onClick={() => {
                setGame({ ...game, block: gb });
              }}
              disabled={locked}
            >
              {gb}
            </button>
          ))}
        </p>

        <div className="mt-4 mb-2 flex gap-2 flex-col">
          <button
            className={`p-2.5 px-5 uppercase text-white rounded-md transition-colors ${
              play ? "bg-emerald-500" : "bg-sky-600 hover:bg-sky-700"
            } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={startGame}
            disabled={locked}
          >
            Play
          </button>

          {play || timeLeft > 0 ? (
            <p>
              Timer: <Timer timeLeft={timeLeft} signal={signal} />
            </p>
          ) : null}

          {blocks.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {blocks.map((block, index) => (
                <button
                  key={index}
                  className={`border border-foreground/25 rounded-md w-16 h-16 text-center flex items-center justify-center ${
                    checking ? "bg-emerald-500" : ""
                  }`}
                  onClick={() => setGuess(block)}
                >
                  {block}
                </button>
              ))}
            </div>
          )}

          {signal.current && guess !== null && (
            <form onSubmit={submitGameAndCheck} className="flex flex-col gap-2">
              <p>Your Guess is</p>
              <p className="p-1.5 w-16 h-16 inline-flex justify-center items-center rounded-md bg-emerald-500 text-white text-lg">
                {guess}
              </p>

              <button
                type="submit"
                className={`p-2.5 px-5 uppercase rounded-md transition-colors ${
                  btnText === "Checking..."
                    ? "cursor-not-allowed bg-sky-200 text-sky-500"
                    : btnText === "Correct!"
                    ? "bg-emerald-500 text-white"
                    : btnText === "Incorrect!"
                    ? "bg-red-100 text-red-500"
                    : "bg-sky-200 text-sky-500"
                }`}
              >
                <strong>{btnText}</strong>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
