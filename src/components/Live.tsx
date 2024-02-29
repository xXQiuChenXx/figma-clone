"use client";
import { PointerEvent, useCallback, useEffect, useState } from "react";
import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "../../liveblocks.config";
import LiveCursors from "./cursor/LiveCursors";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import CursorChat from "./cursor/CursorChat";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";

const Live = () => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;
  const [cursorState, setcursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  const [reactions, setReactions] = useState<Reaction[]>([]);

  const broadcast = useBroadcastEvent();

  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReactions((r) =>
        r.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ])
      );

      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;

    setReactions((r) =>
      r.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value  ,
          timestamp: Date.now(),
        },
      ])
    );
  });

  const handlePointerMove = useCallback((event: PointerEvent) => {
    event.preventDefault();

    if (!cursor || cursorState.mode !== CursorMode.ReactionSelector) {
      const boundingClient = event.currentTarget.getBoundingClientRect();

      const x = event.clientX - boundingClient.x;
      const y = event.clientY - boundingClient.y;
      updateMyPresence({ cursor: { x, y } });
    }
  }, []);

  const handlePointerLeave = useCallback((event: PointerEvent) => {
    setcursorState({ mode: CursorMode.Hidden });

    const boundingClient = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - boundingClient.x;
    const y = event.clientY - boundingClient.y;

    updateMyPresence({ cursor: null, message: null });
  }, []);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      const boundingClient = event.currentTarget.getBoundingClientRect();

      const x = event.clientX - boundingClient.x;
      const y = event.clientY - boundingClient.y;

      updateMyPresence({ cursor: { x, y } });

      setcursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [cursorState.mode, setcursorState]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      setcursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [cursorState.mode, setcursorState]
  );

  useEffect(() => {
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "/") {
        setcursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (event.key === "Escape") {
        updateMyPresence({ message: "" });

        setcursorState({ mode: CursorMode.Hidden });
      } else if (event.key === "e") {
        setcursorState({
          mode: CursorMode.ReactionSelector,
        });
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [updateMyPresence]);

  const setReaction = useCallback((reaction: string) => {
    setcursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className="h-[100vh] w-full items-center justify-center text-center flex"
    >
      <h1 className="text-2xl text-white">Liveblocks Figma Clone</h1>

      {reactions.map((reaction) => (
        <FlyingReaction
          key={reaction.timestamp.toString()}
          x={reaction.point.x}
          y={reaction.point.y}
          timestamp={reaction.timestamp}
          value={reaction.value}
        />
      ))}

      {cursor && (
        <CursorChat
          cursor={cursor}
          cursorState={cursorState}
          setCursorState={setcursorState}
          updateMyPresence={updateMyPresence}
        />
      )}

      {cursorState.mode === CursorMode.ReactionSelector && (
        <ReactionSelector setReaction={setReaction} />
      )}

      <LiveCursors others={others} />
    </div>
  );
};

export default Live;
