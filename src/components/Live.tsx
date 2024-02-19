"use client";
import { PointerEvent, useCallback, useState } from "react";
import { useMyPresence, useOthers } from "../../liveblocks.config";
import LiveCursors from "./cursor/LiveCursors";
import { CursorMode } from "@/types/type";
import CursorChat from "./cursor/CursorChat";

const Live = () => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;
  const [cursorState, setcursorState] = useState({ mode: CursorMode.Hidden });

  const handlePointerMove = useCallback((event: PointerEvent) => {
    event.preventDefault();

    const boundingClient = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - boundingClient.x;
    const y = event.clientY - boundingClient.y;

    updateMyPresence({ cursor: { x, y } });
  }, []);

  const handlePointerLeave = useCallback((event: PointerEvent) => {
    setcursorState({ mode: CursorMode.Hidden });

    const boundingClient = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - boundingClient.x;
    const y = event.clientY - boundingClient.y;

    updateMyPresence({ cursor: null, message: null });
  }, []);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    const boundingClient = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - boundingClient.x;
    const y = event.clientY - boundingClient.y;

    updateMyPresence({ cursor: { x, y } });
  }, []);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      className="h-[100vh] w-full items-center justify-center text-center flex"
    >
      <h1 className="text-2xl text-white">Liveblocks Figma Clone</h1>

      {cursor && (
        <CursorChat
          cursor={cursor}
          cursorState={cursorState}
          setCursorState={setcursorState}
          updateMyPresence={updateMyPresence}
        />
      )}
      <LiveCursors others={others} />
    </div>
  );
};

export default Live;
