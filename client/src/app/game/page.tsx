"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GameAPI } from "@/helpers/apis/game";
import { getAxiosInstance } from "@/lib/axios";
import { API_ROUTES } from "@/utils/api";
import { games } from "@/utils/config";
import Link from "next/link";
import { useEffect, useState } from "react";

type LeaderboardApiReturn = {
  payload: {
    user: {
      name: string;
      email: string;
      gameCoin: number;
    };
  }[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
} | null;

export default function GameIndexPage() {
  const ax = getAxiosInstance(API_ROUTES.GAME);
  const [season, setSeason] = useState<string | null>(null);
  const [leaderboard, setLeaderBoard] = useState<LeaderboardApiReturn>(null);
  const [page, setPage] = useState<number>(1);
  const [usrRank, setUsrRank] = useState<number>(-1);

  const gameApi = new GameAPI(ax);

  useEffect(() => {
    async function callApis() {
      const resSeason = await gameApi.fetchSeasonCode();
      if ("season" in resSeason) setSeason(resSeason.season);

      const usrRank = await gameApi.getUserRank(season!);
      if ("rank" in usrRank) setUsrRank(usrRank.rank);
    }
    callApis().catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!season) return;
      const resldboard = await gameApi.getLeaderboard(season, page);
      if (resldboard && "payload" in resldboard) setLeaderBoard(resldboard);
    }
    fetchLeaderboard().catch(console.error);
  }, [season, page]);

  return (
    <div className="">
      <h2 className="text-3xl text-center mb-4 font-semibold text-gray-600">
        Welcome to Game Zone!
      </h2>

      <div className="md:relative flex justify-start flex-col md:justify-between md:items-baseline md:flex-row-reverse">
        {/* Game Links */}
        <div className="flex flex-col gap-2 p-2.5 md:w-1/3 md:sticky">
          <div className="grid grid-cols-1">
            {Object.keys(games).map((g) => {
              const game = games[g as keyof typeof games];
              return (
                <Link
                  key={game.id}
                  href={`/game/${game.link}`}
                  className="p-1.5 pl-2.5 rounded-sm bg-foreground text-background"
                >
                  {game.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="mt-2 p-2.5 md:w-2/3 flex flex-col">
          <div>
            <h3 className="text-2xl font-bold">Leaderboard</h3>
            <p className="my-2">
              <b>Season: </b>{" "}
              <span>
                <code>{season}</code>
              </span>
            </p>
          </div>

          {leaderboard?.payload.map((it: any, i: number) => {
            const globalRank =
              (leaderboard.pagination.page - 1) * leaderboard.pagination.limit +
              i +
              1;

            let bg = "bg-background";
            let text = "text-foreground";
            let shadow = "";
            let medal = "";

            if (globalRank === 1) {
              bg = "bg-yellow-100";
              text = "text-yellow-900";
              shadow = "shadow-lg ring-2 ring-yellow-400";
              medal = "🥇";
            } else if (globalRank === 2) {
              bg = "bg-gray-100";
              text = "text-gray-800";
              shadow = "shadow-md ring-2 ring-gray-400";
              medal = "🥈";
            } else if (globalRank === 3) {
              bg = "bg-orange-100";
              text = "text-orange-900";
              shadow = "shadow-md ring-2 ring-orange-400";
              medal = "🥉";
            } else {
              shadow = "hover:shadow-sm transition";
            }

            return (
              <Card
                key={i}
                className={`mt-3 transition-all duration-300 transform hover:scale-[1.01] ${bg} ${text} ${shadow} ${
                  usrRank === globalRank && usrRank > 3
                    ? "ring-2 ring-sky-500"
                    : ""
                }`}
              >
                <CardContent className="py-4 px-5 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-xl text-muted-foreground">
                      {medal || `${globalRank}`}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {it.user.name || it.user.email}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Coins: {it.user.gameCoin}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200 p-1.5 px-2.5`}
                  >
                    #
                    <span className="text-base font-semibold">
                      {globalRank}
                    </span>
                  </span>
                </CardContent>
              </Card>
            );
          })}

          {/* User Rank highlight */}
          {usrRank > 0 && (
            <div className="mt-4 p-2.5 bg-blue-100 text-blue-900 rounded-md">
              <p className="text-sm">
                Your current rank is{" "}
                <span className="font-semibold text-lg">{usrRank}</span>
              </p>
              {usrRank <= 5 && (
                <p className="text-sm">
                  You can get <span className="font-semibold text-lg">50%</span>{" "}
                  discount! Use this code{" "}
                  <span className="font-semibold text-lg">
                    <code className="tracking-wider">TOP5HACKER</code>
                  </span>
                </p>
              )}

              {usrRank > 5 && usrRank <= 10 && (
                <p className="text-sm">
                  You can get <span className="font-semibold text-lg">15%</span>{" "}
                  discount! Use this code{" "}
                  <span className="font-semibold text-lg">
                    <code className="tracking-wider">TOP10HACKER</code>
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm font-medium">
              Page {leaderboard?.pagination.page} of{" "}
              {leaderboard?.pagination.totalPages}
            </span>

            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(p + 1, leaderboard?.pagination.totalPages || p + 1)
                )
              }
              disabled={page === leaderboard?.pagination.totalPages}
              className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
