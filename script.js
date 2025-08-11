let board = document.getElementById("game-board");
let levelSelect = document.getElementById("level-select");
let resetBtn = document.getElementById("reset-btn");
let hintBtn = document.getElementById("hint-btn");
let editorBtn = document.getElementById("editor-btn");
let editorPanel = document.getElementById("editor-panel");
let moveCounter = document.getElementById("move-counter");
let winSound = document.getElementById("win-sound");

let currentLevel = 0;
let vehicles = [];
let moveCount = 0;
let editing = false;
let levels = [];

fetch("levels.json")
  .then(res => res.json())
  .then(data => {
    levels = data;
    loadLevel(currentLevel);
  });

function loadLevel(index) {
  board.innerHTML = "";
  vehicles = [];
  moveCount = 0;
  moveCounter.textContent = "步數：0";
  editing = false;
  editorPanel.style.display = "none";

  let level = levels[index];
  level.forEach(v => createVehicle(v));
}

function createVehicle({ id, x, y, length, dir, color, main }) {
  let div = document.createElement("div");
  div.className = "vehicle";
  div.textContent = id;
  div.style.background = color;
  div.dataset.id = id;
  div.dataset.length = length;
  div.dataset.dir = dir;
  div.dataset.main = main || false;

  div.style.width = dir === "horizontal" ? `${60 * length}px` : "60px";
  div.style.height = dir === "vertical" ? `${60 * length}px` : "60px";
  div.style.left = `${x * 60}px`;
  div.style.top = `${y * 60}px`;

  board.appendChild(div);
  vehicles.push(div);

  if (!editing) enableDrag(div);
}

function enableDrag(el) {
  let offsetX, offsetY, startX, startY;

  el.onmousedown = e => {
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    startX = parseInt(el.style.left);
    startY = parseInt(el.style.top);
    document.onmousemove = drag;
    document.onmouseup = drop;
  };

  function drag(e) {
    let dir = el.dataset.dir;
    if (dir === "horizontal") {
      let x = e.pageX - board.offsetLeft - offsetX;
      x = Math.round(x / 60) * 60;
      x = Math.max(0, Math.min(x, 360 - parseInt(el.style.width)));
      el.style.left = `${x}px`;
    } else {
      let y = e.pageY - board.offsetTop - offsetY;
      y = Math.round(y / 60) * 60;
      y = Math.max(0, Math.min(y, 360 - parseInt(el.style.height)));
      el.style.top = `${y}px`;
    }
  }

  function drop() {
    document.onmousemove = null;
    document.onmouseup = null;
    if (startX !== parseInt(el.style.left) || startY !== parseInt(el.style.top)) {
      moveCount++;
      moveCounter.textContent = `步數：${moveCount}`;
      checkWin();
    }
  }
}

function checkWin() {
  let main = vehicles.find(v => v.dataset.main === "true");
  if (parseInt(main.style.left) + parseInt(main.style.width) === 360) {
    winSound.play();
    alert("🎉 通關成功！");
  }
}

levelSelect.onchange = () => {
  currentLevel = parseInt(levelSelect.value);
  loadLevel(currentLevel);
};

resetBtn.onclick = () => loadLevel(currentLevel);

hintBtn.onclick = () => {
  alert("提示：將藍色車輛移到右邊出口！");
};

editorBtn.onclick = () => {
  editing = !editing;
  editorPanel.style.display = editing ? "block" : "none";
  board.innerHTML = "";
  vehicles = [];
  moveCounter.textContent = "編輯模式";
};

document.getElementById("add-vehicle").onclick = () => {
  let id = prompt("車輛 ID：");
  let x = parseInt(prompt("X 座標 (0-5)："));
  let y = parseInt(prompt("Y 座標 (0-5)："));
  let length = parseInt(prompt("長度 (2 或 3)："));
  let dir = prompt("方向 (horizontal 或 vertical)：");
  let color = prompt("顏色 (例如 #ff0000)：");
  let main = confirm("是否為主車輛？");

  createVehicle({ id, x, y, length, dir, color, main });
};

document.getElementById("save-level").onclick = () => {
  let newLevel = vehicles.map(v => ({
    id: v.dataset.id,
    x: parseInt(v.style.left) / 60,
    y: parseInt(v.style.top) / 60,
    length: parseInt(v.dataset.length),
    dir: v.dataset.dir,
    color: v.style.background,
    main: v.dataset.main === "true"
  }));
  console.log("儲存的關卡資料：", JSON.stringify(newLevel, null, 2));
  alert("✅ 關卡已儲存到 console！");
};

