// Kênh truyền tin và đồng bộ trạng thái giữa màn hình Trình Chiếu (Stage) và Điều Khiển (Admin)
// Sử dụng BroadcastChannel API + localStorage dự phòng, hoàn toàn offline

const CHANNEL_NAME = "HAIHA_GAMESHOW_CHANNEL";
const STORAGE_KEY = "HAIHA_GAMESHOW_STATE";

class GameSync {
  constructor(isHost = false) {
    this.isHost = isHost;
    this.channel = null;
    this.listeners = [];

    // Khởi tạo BroadcastChannel nếu trình duyệt hỗ trợ
    if (typeof BroadcastChannel !== "undefined") {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    }

    // Dự phòng qua localStorage storage event
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          this.notifyListeners({ type: "STATE_UPDATE", payload: parsed });
        } catch (e) {
          console.error("Lỗi đọc state từ localStorage:", e);
        }
      }
    });
  }

  // Khởi tạo trạng thái mặc định ban đầu
  getInitialState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Lỗi đọc state cũ, tạo mới state mặc định.");
      }
    }

    return {
      selectedRow: null,
      openedRows: [], // Mảng id các hàng đã mở
      openedKeyLetters: [], // Mảng id các chữ khóa đã sáng
      isVerticalRevealed: false, // Đã giải mã từ khóa dọc hay chưa
      alignmentMode: "column", // 'column' (thẳng hàng) hoặc 'center' (căn giữa)
      
      timer: {
        duration: 15,
        remaining: 15,
        isRunning: false
      },

      teams: (window.GAME_DATA ? window.GAME_DATA.teams : []).map(t => ({
        ...t,
        score: 0,
        isFrozen: false,
        frozenRoundsLeft: 0,
        hasGuessedVertical: false
      })),

      activeBuzzer: null, // { teamId, teamName, color, timestamp }
      activeHint: null,   // { title, content, type, imageUrl }
      activeStory: null,  // { rowId, answer, content }
      soundRequest: null  // { sound: 'correct' | 'wrong' | ... }
    };
  }

  // Lưu trạng thái và phát tín hiệu cho mọi tab
  saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    this.sendMessage({ type: "STATE_UPDATE", payload: state });
  }

  // Gửi lệnh hoặc thông điệp
  sendMessage(msg) {
    if (this.channel) {
      this.channel.postMessage(msg);
    }
  }

  // Nhận thông điệp
  handleMessage(msg) {
    this.notifyListeners(msg);
  }

  // Đăng ký lắng nghe
  onMessage(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(msg) {
    this.listeners.forEach(cb => {
      try {
        cb(msg);
      } catch (err) {
        console.error("Lỗi callback listener:", err);
      }
    });
  }

  // Khởi động lại toàn bộ game
  resetGame() {
    localStorage.removeItem(STORAGE_KEY);
    const freshState = this.getInitialState();
    this.saveState(freshState);
    this.sendMessage({ type: "RESET_GAME", payload: freshState });
    return freshState;
  }
}

window.GameSync = GameSync;
