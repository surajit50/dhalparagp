import { type Message } from "@/types/message";

interface MessageListProps {
  message: Message;
}

export default function MessageList({ message }: MessageListProps) {
  return (
    <div className="bg-muted/50 p-4 rounded-lg mb-4">
      <p className="text-sm text-muted-foreground">{message.content}</p>
    </div>
  );
}
