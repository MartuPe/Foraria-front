export class RTCClient {
  private peers = new Map<number, RTCPeerConnection>();
  private remoteStreams = new Map<number, MediaStream>();
  private localStream: MediaStream | null = null;

  constructor(
    private sendOffer: (offer: any, toUserId: number) => void,
    private sendAnswer: (answer: any, toUserId: number) => void,
    private sendIce: (candidate: any, toUserId: number) => void
  ) {}

  private createPeer(userId: number): RTCPeerConnection {
    const existing = this.peers.get(userId);
    if (existing) return existing;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => pc.addTrack(t, this.localStream!));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendIce(event.candidate, userId);
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        this.remoteStreams.set(userId, stream);
      }
    };

    this.peers.set(userId, pc);
    return pc;
  }

  async setLocalStream(stream: MediaStream) {
    this.localStream = stream;

    this.peers.forEach((pc) => {
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    });
  }

  getRemoteStream(userId: number): MediaStream | null {
    return this.remoteStreams.get(userId) ?? null;
  }

  async createOffer(toUserId: number) {
    const pc = this.createPeer(toUserId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    this.sendOffer(offer, toUserId);
  }

  async receiveOffer(fromUserId: number, offer: any) {
    const pc = this.createPeer(fromUserId);

    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.sendAnswer(answer, fromUserId);
  }

  async receiveAnswer(fromUserId: number, answer: any) {
    const pc = this.peers.get(fromUserId);
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async receiveIceCandidate(fromUserId: number, candidate: any) {
    const pc = this.peers.get(fromUserId);
    if (!pc) return;

    try {
      await pc.addIceCandidate(candidate);
    } catch (e) {
      console.warn("Error agregando ICE:", e);
    }
  }

  closePeer(userId: number) {
    const pc = this.peers.get(userId);
    if (!pc) return;

    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.close();

    this.peers.delete(userId);
    this.remoteStreams.delete(userId);
  }

  closeAll() {
    this.peers.forEach((_, userId) => {
      this.closePeer(userId);
    });
  }
}
