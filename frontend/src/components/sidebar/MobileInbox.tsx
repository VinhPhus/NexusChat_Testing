import { Link } from "react-router";
import CreateNewChat from "../chat/CreateNewChat";
import StoryTray from "../chat/StoryTray";
import ConversationList from "../chat/ConversationList";
import { useAuthStore } from "@/stores/useAuthStore";
import ConversationSkeleton from "../skeleton/ConversationSkeleton";
import { useChatStore } from "@/stores/useChatStore";
import { NavUser } from "./nav-user";

export function MobileInbox() {
  const { user } = useAuthStore();
  const { convoLoading } = useChatStore();

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden select-none">
      {/* Mobile Top Header */}
      <header className="px-3.5 py-2.5 bg-gradient-primary flex items-center justify-between shrink-0 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.svg" alt="NexusChat" className="w-7 h-7 drop-shadow-sm" />
          <h1 className="text-lg font-bold text-white tracking-wide">NexusChat</h1>
        </Link>
      </header>

      {/* Search & Quick Actions */}
      <div className="p-2 pb-1 shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <CreateNewChat />
      </div>

      {/* Story & Status Tray */}
      <div className="px-2 py-0 shrink-0 border-b border-border/50 bg-background">
        <StoryTray />
      </div>

      {/* Filter Tabs & Scrollable Conversation List */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {convoLoading ? <ConversationSkeleton /> : <ConversationList />}
      </div>

      {/* Mobile Bottom Footer with User Profile */}
      {user && (
        <div className="p-2 border-t border-border/50 bg-background/95 backdrop-blur-sm shrink-0">
          <NavUser user={user} />
        </div>
      )}
    </div>
  );
}

export default MobileInbox;
