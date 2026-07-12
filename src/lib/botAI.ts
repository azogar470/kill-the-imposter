import { CanvasStroke, Player, RoomState, StrokePoint } from './types';

// AI Bot helper to simulate plausible drawing and voting
export class BotAI {
  public static generateBotStroke(room: RoomState, botPlayer: Player): CanvasStroke {
    const isImposter = botPlayer.role === 'IMPOSTER';
    const canvasWidth = 800;
    const canvasHeight = 500;

    // Pick a random starting point around the center or near existing strokes
    let startX = 200 + Math.random() * 400;
    let startY = 150 + Math.random() * 200;

    if (room.strokes.length > 0 && Math.random() > 0.3) {
      const lastStroke = room.strokes[room.strokes.length - 1];
      if (lastStroke.points.length > 0) {
        const lastPt = lastStroke.points[lastStroke.points.length - 1];
        startX = Math.max(50, Math.min(canvasWidth - 50, lastPt.x + (Math.random() - 0.5) * 120));
        startY = Math.max(50, Math.min(canvasHeight - 50, lastPt.y + (Math.random() - 0.5) * 120));
      }
    }

    const points: StrokePoint[] = [];
    let curX = startX;
    let curY = startY;

    // Generate 12 to 25 points representing a stroke curve
    const numPoints = 15 + Math.floor(Math.random() * 12);
    const angleBase = Math.random() * Math.PI * 2;

    for (let i = 0; i < numPoints; i++) {
      points.push({ x: Math.round(curX), y: Math.round(curY) });
      const angle = angleBase + (i * 0.15) * (isImposter ? 1.5 : 0.8);
      curX += Math.cos(angle) * (10 + Math.random() * 10);
      curY += Math.sin(angle) * (10 + Math.random() * 10);

      // Keep inside bounds
      curX = Math.max(30, Math.min(canvasWidth - 30, curX));
      curY = Math.max(30, Math.min(canvasHeight - 30, curY));
    }

    const botColors = ['#00f0ff', '#ff0055', '#ffaa00', '#00e676', '#9d4edd', '#ffffff'];
    const color = botColors[Math.floor(Math.random() * botColors.length)];

    return {
      id: `bot-stroke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: botPlayer.id,
      playerName: botPlayer.name,
      color,
      size: 6,
      points
    };
  }

  public static pickBotVote(room: RoomState, botPlayerId: string): string {
    const otherPlayers = room.players.filter(p => p.id !== botPlayerId);
    if (otherPlayers.length === 0) return botPlayerId;

    // Randomly pick a suspect (or slightly bias towards players who drew unusual strokes)
    const randomSuspect = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
    return randomSuspect.id;
  }
}
