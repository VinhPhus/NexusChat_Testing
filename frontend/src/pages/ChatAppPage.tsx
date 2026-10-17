import ChatWindowLayout from "@/components/chat/ChatWindowLayout";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { MobileInbox } from "@/components/sidebar/MobileInbox";
import { SidebarProvider } from "@/components/ui/sidebar";
import IncomingCallModal from "@/components/call/IncomingCallModal";
import CallRoomModal from "@/components/call/CallRoomModal";
import AccountInfoModal from "@/components/profile/AccountInfoModal";
import ChannelPreviewModal from "@/components/chat/ChannelPreviewModal";
import { useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import { useFriendStore } from "@/stores/useFriendStore";
import { useChatStore } from "@/stores/useChatStore";
import MediaViewerModal from "@/components/chat/MediaViewerModal";
import ScheduleMessageModal from "@/components/chat/ScheduleMessageModal";
import { cn } from "@/lib/utils";

const ChatAppPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [previewChannelId, setPreviewChannelId] = useState<string | null>(() => searchParams.get("join"));
  const { getFriends, getAllFriendRequests } = useFriendStore();
  const { activeConversationId, conversations } = useChatStore();

  useEffect(() => {
    getFriends();
    getAllFriendRequests();
  }, [getFriends, getAllFriendRequests]);

  useEffect(() => {
    const joinId = searchParams.get("join");
    if (joinId && joinId !== previewChannelId) {
      setPreviewChannelId(joinId);
    }
  }, [searchParams, previewChannelId]);

  const handleClosePreview = () => {
    setPreviewChannelId(null);
    if (searchParams.has("join")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("join");
      setSearchParams(newParams);
    }
  };

  const hasActiveChat = Boolean(
    activeConversationId && conversations.some((c) => c._id === activeConversationId)
  );

  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex h-[100dvh] w-full p-0 md:p-2 relative overflow-hidden bg-background">
        <div className={cn("w-full h-full flex flex-col md:hidden", hasActiveChat ? "hidden" : "flex")}>
          <MobileInbox />
        </div>

        <div className={cn("w-full h-full flex-1 min-w-0 relative", hasActiveChat ? "flex" : "hidden md:flex")}>
          <ChatWindowLayout />
        </div>
      </main>

      <IncomingCallModal />
      <CallRoomModal />
      <AccountInfoModal />
      <MediaViewerModal />
      <ScheduleMessageModal />

      <ChannelPreviewModal 
        isOpen={!!previewChannelId} 
        onOpenChange={(open) => !open && handleClosePreview()} 
        channelId={previewChannelId} 
      />
    </SidebarProvider>
  );
};

export default ChatAppPage;
