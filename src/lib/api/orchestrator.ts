
/**
 * Toxi AI Orchestrator Service
 * Inspired by Claude's reasoning and DeepSeek's efficiency.
 * This service manages connectivity between various system modules.
 */

export type ToxiEvent = {
  id: string;
  source: 'CRM' | 'Academic' | 'Finance' | 'IoT' | 'App';
  type: string;
  payload: any;
  timestamp: Date;
};

export type ToxiAction = {
  id: string;
  target: string;
  action: string;
  params: any;
  reasoning: string[];
};

class ToxiOrchestrator {
  private static instance: ToxiOrchestrator;
  private eventHistory: ToxiEvent[] = [];

  private constructor() {}

  public static getInstance(): ToxiOrchestrator {
    if (!ToxiOrchestrator.instance) {
      ToxiOrchestrator.instance = new ToxiOrchestrator();
    }
    return ToxiOrchestrator.instance;
  }

  /**
   * Process an event and determine the next logical action using "Reasoning"
   */
  public async dispatchEvent(event: ToxiEvent): Promise<ToxiAction[]> {
    console.log(`[Orchestrator] Processing event: ${event.type} from ${event.source}`);
    this.eventHistory.push(event);

    // AI Reasoning Simulation (DeepSeek-style Chain of Thought)
    const reasoning = [
      `1. Nhận tín hiệu từ nguồn: ${event.source}`,
      `2. Phân tích loại sự kiện: ${event.type}`,
      `3. Truy vấn cơ sở dữ liệu vạn vật (Toxi Knowledge Graph)...`,
      `4. Đánh giá mức độ ưu tiên: ${this.calculatePriority(event)}`,
    ];

    const actions: ToxiAction[] = [];

    // Logic for "Everything Connected"
    if (event.source === 'CRM' && event.type === 'NEW_LEAD') {
      reasoning.push('5. Phát hiện Lead mới. Kích hoạt quy trình Omni-channel.');
      actions.push({
        id: Math.random().toString(36).substr(2, 9),
        target: 'Marketing',
        action: 'SEND_WELCOME_EMAIL',
        params: { email: event.payload.email },
        reasoning: [...reasoning, 'Thực hiện gửi email chào mừng tự động.']
      });
      actions.push({
        id: Math.random().toString(36).substr(2, 9),
        target: 'Staff_Notification',
        action: 'PUSH_TO_MOBILE',
        params: { role: 'sales_manager', message: `Lead mới: ${event.payload.name}` },
        reasoning: [...reasoning, 'Thông báo ngay cho quản lý để tăng tỷ lệ chốt.']
      });
    }

    if (event.source === 'Finance' && event.type === 'PAYMENT_RECEIVED') {
      reasoning.push('5. Thanh toán thành công. Kích hoạt quy trình học tập.');
      actions.push({
        id: Math.random().toString(36).substr(2, 9),
        target: 'Academic',
        action: 'AUTO_ENROLL',
        params: { studentId: event.payload.studentId, classId: event.payload.classId },
        reasoning: [...reasoning, 'Tự động ghi danh vào lớp học tương ứng.']
      });
    }

    return actions;
  }

  private calculatePriority(event: ToxiEvent): string {
    if (event.type.includes('URGENT') || event.source === 'Finance') return 'HIGH';
    return 'NORMAL';
  }

  public getHistory() {
    return this.eventHistory;
  }
}

export const orchestrator = ToxiOrchestrator.getInstance();
