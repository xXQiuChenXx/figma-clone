import Live from "@/components/Live";
import { CollaborativeApp } from "../components/CollaborativeApp";

export default function Page() {
  return (
    <div className="h-[100vh] w-full items-center justify-center text-center flex">
      <h1 className="text-2xl text-white">Liveblocks Figma Clone</h1>

      <Live />
    </div>
  );

  // return <CollaborativeApp />;
}
