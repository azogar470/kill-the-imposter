import { RoomStorage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial state immediately
      const currentRoom = await RoomStorage.getRoom(code);
      if (currentRoom) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(currentRoom)}\n\n`)
        );
      }

      // Subscribe to room changes
      const unsubscribe = RoomStorage.subscribe(code, (room) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(room)}\n\n`)
          );
        } catch {
          // Stream closed
          unsubscribe();
        }
      });

      // Keepalive heartbeat
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(interval);
          unsubscribe();
        }
      }, 15000);

      // Clean up when client disconnects
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Content-Encoding': 'none'
    }
  });
}
