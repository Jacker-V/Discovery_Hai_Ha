// Logic hiển thị Màn hình Trình Chiếu Sân Khấu (Stage Screen)
// Nhận sự kiện thời gian thực từ GameSync và cập nhật DOM mượt mà

document.addEventListener("DOMContentLoaded", () => {
  const sync = new GameSync(false);
  let state = sync.getInitialState();

  // DOM Elements
  const crosswordBoard = document.getElementById("crossword-board");
  const verticalBeacon = document.getElementById("vertical-beacon");
  const qContainer = document.getElementById("question-container");
  const qBadge = document.getElementById("q-badge");
  const qText = document.getElementById("q-text");
  const qSource = document.getElementById("q-source");
  const timerCircle = document.getElementById("timer-circle");
  const teamsBar = document.getElementById("teams-bar");
  const buzzerOverlay = document.getElementById("buzzer-overlay");
  const buzzerText = document.getElementById("buzzer-text");
  const hintModal = document.getElementById("hint-modal");
  const hintTitle = document.getElementById("hint-title");
  const hintBody = document.getElementById("hint-body");
  const storyModal = document.getElementById("story-modal");
  const storyTitle = document.getElementById("story-title");
  const storyBody = document.getElementById("story-body");
  const verticalBanner = document.getElementById("vertical-banner");

  // Kích thước ô chữ để tính căn cột thẳng hàng
  const TILE_WIDTH = 44;
  const TILE_GAP = 5;
  const MAX_KEY_INDEX = 6; // Hàng 9 (LUONGHAIHA) có keyIndex = 6

  // Khởi tạo bảng ô chữ ban đầu
  function initBoard() {
    crosswordBoard.innerHTML = "";
    if (!window.GAME_DATA) return;

    window.GAME_DATA.rows.forEach(row => {
      const rowEl = document.createElement("div");
      rowEl.className = "crossword-row";
      rowEl.id = `row-${row.id}`;

      // Huy hiệu số thứ tự hàng
      const numBadge = document.createElement("div");
      numBadge.className = "row-number";
      numBadge.textContent = row.id;
      rowEl.appendChild(numBadge);

      // Thùng chứa các ô chữ
      const cellsContainer = document.createElement("div");
      cellsContainer.className = "row-cells-container";

      // Căn thẳng hàng cột chữ khóa
      if (state.alignmentMode === "column") {
        const offsetCells = MAX_KEY_INDEX - row.keyIndex;
        cellsContainer.style.marginLeft = `${offsetCells * (TILE_WIDTH + TILE_GAP)}px`;
      } else {
        cellsContainer.style.marginLeft = "0px";
      }

      // Tạo từng ô ký tự
      for (let i = 0; i < row.length; i++) {
        const char = row.answer[i];
        const isKey = (i === row.keyIndex);

        const tile = document.createElement("div");
        tile.className = `tile ${isKey ? "is-key" : ""}`;
        tile.id = `tile-${row.id}-${i}`;

        tile.innerHTML = `
          <div class="tile-inner">
            <div class="tile-front"></div>
            <div class="tile-back">${char}</div>
          </div>
        `;
        cellsContainer.appendChild(tile);
      }

      rowEl.appendChild(cellsContainer);
      crosswordBoard.appendChild(rowEl);
    });

    // Căn vị trí đường hào quang cột dọc (Beacon line)
    updateBeaconPosition();
  }

  function updateBeaconPosition() {
    if (state.alignmentMode === "column") {
      const rowNumWidth = 32 + 6; // width + margin-right
      const beaconLeft = rowNumWidth + (MAX_KEY_INDEX * (TILE_WIDTH + TILE_GAP)) - 1;
      verticalBeacon.style.left = `${beaconLeft}px`;
      verticalBeacon.style.display = "block";
    } else {
      verticalBeacon.style.display = "none";
    }
  }

  // Render toàn bộ giao diện từ trạng thái
  function render(prevState) {
    if (!window.GAME_DATA) return;

    // 1. Cập nhật câu hỏi hiện tại
    if (state.selectedRow) {
      const rowData = window.GAME_DATA.rows.find(r => r.id === state.selectedRow);
      if (rowData) {
        qBadge.textContent = `HÀNG ${rowData.id} (${rowData.length} CHỮ)`;
        qText.textContent = rowData.question;

        // CHỈ HIỆN NGUỒN KHI ĐÁP ÁN CỦA HÀNG ĐÃ ĐƯỢC MỞ
        const isRowOpened = state.openedRows.includes(rowData.id);
        if (isRowOpened) {
          qSource.textContent = `Nguồn: ${rowData.source}`;
          qSource.style.display = "inline-block";
        } else {
          qSource.textContent = "";
          qSource.style.display = "none";
        }
        qContainer.classList.add("has-question");
      }
    } else {
      qBadge.textContent = "CHỜ MC";
      qText.textContent = "Chào mừng bạn đến với Ô Chữ 'Giải Mã Hải Hà' - LTT XXVIII";
      qSource.textContent = "";
      qSource.style.display = "none";
      qContainer.classList.remove("has-question");
    }

    // 2. Cập nhật trạng thái từng hàng và ô chữ
    window.GAME_DATA.rows.forEach(row => {
      const rowEl = document.getElementById(`row-${row.id}`);
      if (!rowEl) return;

      if (row.id === state.selectedRow) {
        rowEl.classList.add("selected");
      } else {
        rowEl.classList.remove("selected");
      }

      const isRowOpened = state.openedRows.includes(row.id);

      for (let i = 0; i < row.length; i++) {
        const tile = document.getElementById(`tile-${row.id}-${i}`);
        if (!tile) continue;

        const isKey = (i === row.keyIndex);
        const isKeyOpened = state.openedKeyLetters.includes(row.id) || state.isVerticalRevealed;

        if (isRowOpened || (isKey && isKeyOpened)) {
          if (!tile.classList.contains("flipped")) {
            // Lật ô với hiệu ứng trễ nhẹ
            setTimeout(() => {
              tile.classList.add("flipped");
              if (window.soundFX) window.soundFX.playFlip();
            }, i * 60);
          }
        } else {
          tile.classList.remove("flipped");
        }
      }
    });

    // 3. Cập nhật đồng hồ đếm ngược
    const rem = state.timer.remaining;
    timerCircle.textContent = rem;
    if (rem <= 5 && state.timer.isRunning) {
      timerCircle.classList.add("warning");
    } else {
      timerCircle.classList.remove("warning");
    }

    // 4. Cập nhật bảng điểm 4 quận
    teamsBar.innerHTML = "";
    state.teams.forEach(t => {
      const card = document.createElement("div");
      card.className = `team-card ${t.isFrozen ? "frozen" : ""}`;
      card.id = `stage-team-${t.id}`;
      card.style.borderLeftColor = t.color;

      // Kiểm tra nếu đội này đang bấm chuông
      if (state.activeBuzzer && state.activeBuzzer.teamId === t.id) {
        card.classList.add("buzzed");
      }

      card.innerHTML = `
        <div class="team-indicator" style="background: ${t.color}"></div>
        <div class="team-info">
          <div class="team-name">${t.name} ${t.isFrozen ? "❄️" : ""}</div>
          <div class="team-score">${t.score}</div>
        </div>
      `;
      teamsBar.appendChild(card);
    });

    // 5. Cập nhật Chuông bấm nổi bật
    if (state.activeBuzzer) {
      buzzerOverlay.style.background = `linear-gradient(135deg, ${state.activeBuzzer.color}, #0284c7)`;
      buzzerText.textContent = `🔔 ${state.activeBuzzer.teamName.toUpperCase()} GIÀNH QUYỀN!`;
      buzzerOverlay.classList.add("active");
    } else {
      buzzerOverlay.classList.remove("active");
    }

    // 6. Cập nhật Gợi ý (Hints)
    if (state.activeHint) {
      hintTitle.textContent = state.activeHint.title;
      if (state.activeHint.type === "image") {
        hintBody.innerHTML = `
          ${state.activeHint.content ? `<div style="font-size: 1.15rem; margin-bottom: 12px; color: #0369a1; font-weight: 700;">${state.activeHint.content}</div>` : ""}
          <div style="display: flex; justify-content: center; align-items: center; padding: 6px;">
            <img src="${state.activeHint.imageUrl}" alt="Gợi ý hình ảnh" style="max-height: 400px; max-width: 95%; width: auto; border-radius: 16px; box-shadow: 0 10px 30px rgba(2, 132, 199, 0.3); border: 3px solid rgba(255,255,255,0.95);">
          </div>
        `;
      } else {
        hintBody.innerHTML = `<p style="font-size: 1.45rem; color: #0f172a; font-weight: 800; line-height: 1.5;">${state.activeHint.content}</p>`;
      }
      hintModal.classList.add("active");
    } else {
      hintModal.classList.remove("active");
    }

    // 7. Cập nhật Câu chuyện MC (Story)
    if (state.activeStory) {
      storyTitle.textContent = `📖 GÓC NHÌN LỊCH SỬ • ĐÁP ÁN: ${state.activeStory.answer}`;
      storyBody.innerHTML = `<p style="font-size: 1.25rem; line-height: 1.6; color: #0f172a; font-weight: 600;">${state.activeStory.content}</p>`;
      storyModal.classList.add("active");
    } else {
      storyModal.classList.remove("active");
    }

    // 8. Giải mã từ khóa chính NGỌN HẢI ĐĂNG
    if (state.isVerticalRevealed) {
      verticalBeacon.classList.add("active");
      verticalBanner.style.display = "block";
      verticalBanner.textContent = `⭐ TỪ KHÓA: ${window.GAME_DATA.verticalKeyword.word} ⭐`;
      if (!prevState || !prevState.isVerticalRevealed) {
        startConfetti();
        if (window.soundFX) window.soundFX.playVictory();
      }
    } else {
      verticalBeacon.classList.remove("active");
      verticalBanner.style.display = "none";
    }
  }

  // Lắng nghe cập nhật từ Admin
  sync.onMessage((msg) => {
    if (msg.type === "STATE_UPDATE" || msg.type === "RESET_GAME") {
      const prevState = state;
      state = msg.payload;
      render(prevState);
    } else if (msg.type === "PLAY_SOUND" && window.soundFX) {
      switch (msg.sound) {
        case "correct": window.soundFX.playCorrect(); break;
        case "wrong": window.soundFX.playWrong(); break;
        case "tick": window.soundFX.playTick(); break;
        case "timesup": window.soundFX.playTimesUp(); break;
        case "buzzer": window.soundFX.playBuzzer(); break;
        case "victory": window.soundFX.playVictory(); startConfetti(); break;
      }
    }
  });

  // Khởi động
  initBoard();
  render(null);

  // Pháo hoa Canvas Confetti
  function startConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#f59e0b", "#3b82f6", "#ef4444", "#10b981", "#fbbf24", "#ffffff"];

    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 4 + 2,
        speedX: Math.random() * 4 - 2,
        rotation: Math.random() * 360,
        spin: Math.random() * 8 - 4
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      frame++;
      if (frame < 350) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  }

  // Nhấn phím F để chuyển toàn màn hình (Fullscreen) tiện lợi
  window.addEventListener("keydown", (e) => {
    if (e.key === "f" || e.key === "F") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen();
      }
    }
  });
});
