// Logic Bàn Điều Khiển (Admin Dashboard / MC Operator)
// Điều phối toàn bộ diễn tiến trò chơi, tính điểm, âm thanh và đồng bộ sang màn hình Stage

document.addEventListener("DOMContentLoaded", () => {
  const sync = new GameSync(true);
  let state = sync.getInitialState();
  let timerInterval = null;

  // DOM Elements
  const rowsList = document.getElementById("admin-rows-list");
  const qMetaBadge = document.getElementById("admin-q-badge");
  const qMetaSource = document.getElementById("admin-q-source");
  const qFullText = document.getElementById("admin-q-text");
  const qAnsLetters = document.getElementById("admin-q-letters");
  const timerDigits = document.getElementById("admin-timer-digits");
  const prompterText = document.getElementById("admin-prompter-text");
  const teamsAdminContainer = document.getElementById("admin-teams-container");
  const btnAlignToggle = document.getElementById("btn-align-toggle");
  const btnMuteToggle = document.getElementById("btn-mute-toggle");

  // Timer Handlers
  function startTimer() {
    if (state.timer.isRunning) return;
    state.timer.isRunning = true;
    sync.saveState(state);

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (state.timer.remaining > 0) {
        state.timer.remaining--;
        if (state.timer.remaining <= 5 && state.timer.remaining > 0) {
          sync.sendMessage({ type: "PLAY_SOUND", sound: "tick" });
        }
        if (state.timer.remaining === 0) {
          state.timer.isRunning = false;
          clearInterval(timerInterval);
          sync.sendMessage({ type: "PLAY_SOUND", sound: "timesup" });
        }
        sync.saveState(state);
        updateTimerDisplay();
      } else {
        state.timer.isRunning = false;
        clearInterval(timerInterval);
        sync.saveState(state);
      }
    }, 1000);
  }

  function pauseTimer() {
    state.timer.isRunning = false;
    if (timerInterval) clearInterval(timerInterval);
    sync.saveState(state);
    updateTimerDisplay();
  }

  function resetTimer() {
    pauseTimer();
    state.timer.remaining = state.timer.duration || 15;
    sync.saveState(state);
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    if (timerDigits) {
      timerDigits.textContent = state.timer.remaining;
      timerDigits.style.color = state.timer.remaining <= 5 ? "var(--accent-red)" : "var(--accent-gold)";
    }
  }

  // Render danh sách 11 hàng bên cột trái
  function renderRowsList() {
    rowsList.innerHTML = "";
    if (!window.GAME_DATA) return;

    window.GAME_DATA.rows.forEach(row => {
      const isSelected = (state.selectedRow === row.id);
      const isOpened = state.openedRows.includes(row.id);
      const isKeyOpened = state.openedKeyLetters.includes(row.id);

      const item = document.createElement("div");
      item.className = `row-item ${isSelected ? "active" : ""} ${isOpened ? "opened" : ""}`;
      item.onclick = () => selectRow(row.id);

      // Định dạng hiển thị đáp án với chữ khóa in đậm gạch chân
      let formattedAns = "";
      for (let i = 0; i < row.length; i++) {
        if (i === row.keyIndex) {
          formattedAns += `<span class="key-char">${row.answer[i]}</span>`;
        } else {
          formattedAns += row.answer[i];
        }
      }

      item.innerHTML = `
        <div class="row-item-left">
          <div class="row-num-badge">${row.id}</div>
          <div>
            <div class="row-ans-preview">${formattedAns} (${row.length})</div>
            <div style="font-size: 0.75rem; color: #94a3b8;">${isOpened ? "✓ Đã mở" : (isKeyOpened ? "★ Chữ khóa" : "Chưa mở")}</div>
          </div>
        </div>
        <div class="row-item-actions">
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" title="Lật chữ khóa" onclick="event.stopPropagation(); toggleKeyLetter(${row.id})">★</button>
          <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem;" title="Lật hàng" onclick="event.stopPropagation(); toggleRowOpened(${row.id})">${isOpened ? "Úp" : "Lật"}</button>
        </div>
      `;
      rowsList.appendChild(item);
    });
  }

  // Chọn hàng để hỏi
  function selectRow(id) {
    state.selectedRow = id;
    resetTimer();
    sync.saveState(state);
    updateActiveQuestion();
    renderRowsList();
  }

  // Lật hoặc úp hàng
  window.toggleRowOpened = function(id) {
    if (state.openedRows.includes(id)) {
      state.openedRows = state.openedRows.filter(x => x !== id);
    } else {
      state.openedRows.push(id);
      sync.sendMessage({ type: "PLAY_SOUND", sound: "correct" });
    }
    sync.saveState(state);
    renderRowsList();
  };

  // Lật chữ khóa riêng lẻ
  window.toggleKeyLetter = function(id) {
    if (state.openedKeyLetters.includes(id)) {
      state.openedKeyLetters = state.openedKeyLetters.filter(x => x !== id);
    } else {
      state.openedKeyLetters.push(id);
      sync.sendMessage({ type: "PLAY_SOUND", sound: "correct" });
    }
    sync.saveState(state);
    renderRowsList();
  };

  // Cập nhật thẻ câu hỏi đang chọn
  function updateActiveQuestion() {
    if (!window.GAME_DATA) return;
    const row = window.GAME_DATA.rows.find(r => r.id === state.selectedRow);

    if (row) {
      qMetaBadge.textContent = `HÀNG ${row.id} • ${row.length} KÝ TỰ`;
      qMetaSource.textContent = `Nguồn: ${row.source}`;
      qFullText.textContent = row.question;

      // Đáp án có highlight chữ khóa
      let ansHtml = "";
      for (let i = 0; i < row.length; i++) {
        if (i === row.keyIndex) {
          ansHtml += `<span style="color: #fbbf24; background: rgba(245,158,11,0.25); padding: 2px 6px; border-radius: 4px; border: 1px solid #f59e0b;">${row.answer[i]}</span> `;
        } else {
          ansHtml += `${row.answer[i]} `;
        }
      }
      qAnsLetters.innerHTML = ansHtml;

      // Nhắc bài kịch bản MC
      prompterText.innerHTML = `
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">Kịch bản sau khi mở đáp án (${row.answer}):</div>
        <div>${row.mcStory}</div>
      `;
    } else {
      qMetaBadge.textContent = "CHƯA CHỌN CÂU";
      qMetaSource.textContent = "";
      qFullText.textContent = "Vui lòng chọn 1 hàng ngang trong danh sách bên trái để bắt đầu.";
      qAnsLetters.innerHTML = "—";
      prompterText.textContent = "Kịch bản MC sẽ xuất hiện tại đây sau khi chọn câu hỏi.";
    }
  }

  // Render quản lý điểm 4 đội
  function renderTeamsAdmin() {
    teamsAdminContainer.innerHTML = "";
    state.teams.forEach(team => {
      const card = document.createElement("div");
      card.className = "team-admin-card";
      card.style.borderLeft = `4px solid ${team.color}`;

      card.innerHTML = `
        <div class="team-admin-header">
          <div class="team-admin-name">
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${team.color};"></span>
            ${team.name} ${team.isFrozen ? "❄️ (Khóa " + team.frozenRoundsLeft + " lượt)" : ""}
          </div>
          <div class="team-admin-score">${team.score}đ</div>
        </div>
        <div class="score-btn-group">
          <button class="btn btn-success" onclick="modifyScore('${team.id}', 10)">+10đ</button>
          <button class="btn btn-primary" onclick="modifyScore('${team.id}', 5)">+5đ</button>
          <button class="btn btn-danger" onclick="modifyScore('${team.id}', -10)">-10đ</button>
          <button class="btn btn-secondary" onclick="toggleFreezeTeam('${team.id}')" title="Phạt đoán sai từ khóa">${team.isFrozen ? "Hủy phạt" : "❄️ Khóa"}</button>
        </div>
      `;
      teamsAdminContainer.appendChild(card);
    });
  }

  // Điều chỉnh điểm
  window.modifyScore = (teamId, delta) => {
    const t = state.teams.find(x => x.id === teamId);
    if (t) {
      t.score += delta;
      sync.saveState(state);
      renderTeamsAdmin();
    }
  };

  // Đóng băng hoặc mở khóa đội
  window.toggleFreezeTeam = (teamId) => {
    const t = state.teams.find(x => x.id === teamId);
    if (t) {
      t.isFrozen = !t.isFrozen;
      t.frozenRoundsLeft = t.isFrozen ? 2 : 0;
      sync.saveState(state);
      renderTeamsAdmin();
    }
  };

  // Chuông bấm (Buzzer)
  window.triggerBuzzer = function(teamId) {
    if (state.activeBuzzer) return; // Đã có đội bấm trước, khóa lại

    const t = state.teams.find(x => x.id === teamId);
    if (!t) return;
    if (t.isFrozen) {
      alert(`Đội ${t.name} đang bị phạt đóng băng, không được quyền bấm chuông!`);
      return;
    }

    state.activeBuzzer = {
      teamId: t.id,
      teamName: t.name,
      color: t.color,
      timestamp: Date.now()
    };
    sync.sendMessage({ type: "PLAY_SOUND", sound: "buzzer" });
    sync.saveState(state);
  };

  window.resetBuzzer = function() {
    state.activeBuzzer = null;
    sync.saveState(state);
  };

  // Phím tắt bàn phím
  window.addEventListener("keydown", (e) => {
    // Phím 1, 2, 3, 4 để bấm chuông 4 đội
    if (["1", "2", "3", "4"].includes(e.key) && !["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
      const idx = parseInt(e.key, 10) - 1;
      if (state.teams[idx]) {
        triggerBuzzer(state.teams[idx].id);
      }
    }
    // Phím Space để Tạm dừng / Bắt đầu đồng hồ
    if (e.code === "Space" && !["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
      e.preventDefault();
      if (state.timer.isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    }
  });

  // Gán sự kiện các nút điều khiển
  document.getElementById("btn-timer-start").onclick = startTimer;
  document.getElementById("btn-timer-pause").onclick = pauseTimer;
  document.getElementById("btn-timer-reset").onclick = resetTimer;

  // Lật đáp án hàng đang chọn
  document.getElementById("btn-reveal-current").onclick = () => {
    if (state.selectedRow) {
      toggleRowOpened(state.selectedRow);
    }
  };

  // Lật toàn bộ 11 hàng
  document.getElementById("btn-reveal-all").onclick = () => {
    if (confirm("Bạn có chắc muốn lật toàn bộ 11 hàng ngang?")) {
      state.openedRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      sync.sendMessage({ type: "PLAY_SOUND", sound: "correct" });
      sync.saveState(state);
      renderRowsList();
    }
  };

  // Giải mã từ khóa chính NGỌN HẢI ĐĂNG
  document.getElementById("btn-reveal-vertical").onclick = () => {
    if (confirm("Công bố giải mã TỪ KHÓA DỌC: NGỌN HẢI ĐĂNG?")) {
      state.isVerticalRevealed = true;
      state.openedRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      sync.sendMessage({ type: "PLAY_SOUND", sound: "victory" });
      sync.saveState(state);
      renderRowsList();
    }
  };

  // Mở chuông
  document.getElementById("btn-reset-buzzer").onclick = resetBuzzer;

  // Gợi ý 1 & 2
  document.getElementById("btn-hint-1").onclick = () => {
    const h = window.GAME_DATA.verticalKeyword.hints[0];
    state.activeHint = h;
    sync.saveState(state);
  };

  document.getElementById("btn-hint-2").onclick = () => {
    const h = window.GAME_DATA.verticalKeyword.hints[1];
    state.activeHint = h;
    sync.saveState(state);
  };

  document.getElementById("btn-close-hint").onclick = () => {
    state.activeHint = null;
    sync.saveState(state);
  };

  // Chiếu câu chuyện MC lên màn hình máy chiếu
  document.getElementById("btn-show-story-stage").onclick = () => {
    if (!state.selectedRow) return;
    const row = window.GAME_DATA.rows.find(r => r.id === state.selectedRow);
    if (row) {
      state.activeStory = {
        rowId: row.id,
        answer: row.answer,
        content: row.mcStory
      };
      sync.saveState(state);
    }
  };

  document.getElementById("btn-close-story-stage").onclick = () => {
    state.activeStory = null;
    sync.saveState(state);
  };

  // Các nút phát âm thanh thủ công
  document.getElementById("btn-snd-correct").onclick = () => sync.sendMessage({ type: "PLAY_SOUND", sound: "correct" });
  document.getElementById("btn-snd-wrong").onclick = () => sync.sendMessage({ type: "PLAY_SOUND", sound: "wrong" });
  document.getElementById("btn-snd-buzzer").onclick = () => sync.sendMessage({ type: "PLAY_SOUND", sound: "buzzer" });
  document.getElementById("btn-snd-victory").onclick = () => sync.sendMessage({ type: "PLAY_SOUND", sound: "victory" });

  // Nút mở tab Trình Chiếu Stage
  document.getElementById("btn-open-stage").onclick = () => {
    window.open("stage.html", "HaiHaStageWindow", "width=1280,height=720");
  };

  // Nút đổi chế độ căn thẳng hàng cột khóa
  btnAlignToggle.onclick = () => {
    state.alignmentMode = (state.alignmentMode === "column" ? "center" : "column");
    btnAlignToggle.textContent = (state.alignmentMode === "column" ? "Cột: Thẳng hàng" : "Cột: Căn giữa");
    sync.saveState(state);
  };

  // Nút tắt/bật âm thanh
  btnMuteToggle.onclick = () => {
    if (window.soundFX) {
      const isMuted = window.soundFX.toggleMute();
      btnMuteToggle.textContent = isMuted ? "🔇 Bật Âm" : "🔊 Tắt Âm";
    }
  };

  // Nút Reset Toàn Bộ Trận Đấu
  document.getElementById("btn-reset-game").onclick = () => {
    if (confirm("CẢNH BÁO: Bạn có chắc chắn muốn đặt lại toàn bộ điểm số và ô chữ từ đầu?")) {
      pauseTimer();
      state = sync.resetGame();
      updateTimerDisplay();
      updateActiveQuestion();
      renderRowsList();
      renderTeamsAdmin();
    }
  };

  // Khởi động
  updateTimerDisplay();
  updateActiveQuestion();
  renderRowsList();
  renderTeamsAdmin();
});
