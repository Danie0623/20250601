let video;
let handpose;
let predictions = [];

let num1 = 0;
let num2 = 0;
let answer = 0;
let score = 0;
let timer = 0;
let maxScore = 5; // 通關所需的分數
let gameOver = false;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, () => {
    console.log('模型已載入');
  });
  handpose.on('predict', (results) => {
    predictions = results;
  });

  generateQuestion();
  setInterval(() => {
    if (!gameOver) timer++;
  }, 1000);
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  drawKeypoints();

  fill(255);
  textSize(24);
  text(`題目：${num1} + ${num2}`, 20, 40);
  text(`分數：${score}/${maxScore}`, 20, 70);

  if (gameOver) {
    fill(0, 255, 0);
    textSize(32);
    text("恭喜通關！", width / 2 - 100, height / 2 - 20);
    text("比出 5 重新開始", width / 2 - 150, height / 2 + 20);

    if (predictions.length > 0) {
      let fingersUp = countFingers(predictions[0]);
      if (fingersUp === 5) {
        resetGame();
      }
    }
    return;
  }

  if (predictions.length > 0) {
    let fingersUp = countFingers(predictions[0]);

    fill(255, 0, 0);
    text(`目前比出：${fingersUp}`, 20, 100);

    if (fingersUp === answer && timer > 3) {
      score++;
      if (score >= maxScore) {
        gameOver = true;
      } else {
        generateQuestion();
      }
      timer = 0;
    }
  }
}

function generateQuestion() {
  num1 = floor(random(1, 6)); // 隨機生成 1 到 5 的數字
  num2 = floor(random(1, 6)); // 隨機生成 1 到 5 的數字
  answer = num1 + num2;

  // 確保答案在 1 到 5 的範圍內
  while (answer > 5) {
    num1 = floor(random(1, 6));
    num2 = floor(random(1, 6));
    answer = num1 + num2;
  }
}

function countFingers(hand) {
  let tips = [8, 12, 16, 20]; // index, middle, ring, pinky tips
  let base = [6, 10, 14, 18]; // 相對應手指的第二節

  let count = 0;
  for (let i = 0; i < tips.length; i++) {
    if (hand.landmarks[tips[i]][1] < hand.landmarks[base[i]][1]) {
      count++;
    }
  }

  // 判斷拇指是否打開（x 軸比 wrist 大）
  let thumbTip = hand.landmarks[4];
  let thumbBase = hand.landmarks[2];
  if (thumbTip[0] > thumbBase[0]) {
    count++;
  }

  return count;
}

function drawKeypoints() {
  for (let i = 0; i < predictions.length; i++) {
    const prediction = predictions[i];
    for (let j = 0; j < prediction.landmarks.length; j++) {
      const [x, y] = prediction.landmarks[j];
      fill(0, 255, 0);
      ellipse(x, y, 10, 10);
    }
  }
}

function resetGame() {
  score = 0;
  timer = 0;
  gameOver = false;
  generateQuestion();
}