export function randomHexColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

let currentAnimationInterval = null;

export function animateBoardPainting(boardSize, paintFunc, speed = 1) {
  // Si ya hay animación, la detenemos
  if (currentAnimationInterval) {
    clearInterval(currentAnimationInterval);
    currentAnimationInterval = null;
    return false; // Devolvemos para marcar que la funcion termino
  }

  // Iniciamos animación
  currentAnimationInterval = setInterval(() => {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);
    const color = randomHexColor();
    paintFunc(document.getElementById(`${row}-${col}`), row, col, color);
  }, speed);

  return true; // Aca lo mismo pero indicando que la animacion esta en curso
}

export function paintRandomBoardWithPaint(boardSize, paintFunc) {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const color = randomHexColor();
      paintFunc(document.getElementById(`${row}-${col}`), row, col, color);
    }
  }
}


export function ejecutarSegunHora() {
  const heroDay = document.getElementById('hero-day');
  const reloj = document.getElementById('clock');
  const heroMessage = document.getElementById('hero-day-message');
  const ahora = new Date();
  const hora = ahora.getHours();

  if (hora >= 6 && hora < 12) {
   
   heroDay.style.backgroundImage = "url('dia.png')";
   reloj.style.color = "black";
   heroMessage.innerText= "Morning! Let's make something cool today!"
   
} else if (hora >= 12 && hora < 20) {
    heroDay.style.backgroundImage = "url('tarde.png')";
    reloj.style.color = "black";
    heroMessage.innerText= "Hope your afternoon’s going great!"
    heroMessage.style.left="-17%"
    heroMessage.style.width="250px"
    
  } else {

   heroDay.style.backgroundImage = "url('noche.png')";
   heroMessage.innerText= "Nighttime creativity hits different, right?"
  }
}


export function startClock(clockElement) {
  if (!clockElement) return;

  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    clockElement.textContent = formattedTime;
  }

  updateClock(); 

 
  const now = new Date();
  const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  setTimeout(() => {
    updateClock(); 


    setInterval(updateClock, 60000);
  }, msUntilNextMinute);
}

export function enableGlobalDragAndDrop() {
  let isDragging = false;
  let activeElement = null;
  let offsetX = 0;
  let offsetY = 0;

  document.addEventListener('mousedown', (e) => {
    const target = e.target.closest('.draggable');
    if (!target) return;

    isDragging = true;
    activeElement = target;

    
    const offsetLeft = activeElement.offsetLeft;
    const offsetTop = activeElement.offsetTop;

   
    offsetX = e.clientX - offsetLeft;
    offsetY = e.clientY - offsetTop;

    
    const computedStyle = window.getComputedStyle(activeElement);
    if (computedStyle.position !== 'absolute') {
      activeElement.style.position = 'absolute';
      activeElement.style.left = `${offsetLeft}px`;
      activeElement.style.top = `${offsetTop}px`;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeElement) return;

    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;

    activeElement.style.left = `${newX}px`;
    activeElement.style.top = `${newY}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    activeElement = null;
  });
}


export function cargarImagenAlBoard(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      const boardSize = 140;
      const canvas = document.createElement('canvas');
      canvas.width = boardSize;
      canvas.height = boardSize;
      const ctx = canvas.getContext('2d');

    
      ctx.drawImage(img, 0, 0, boardSize, boardSize);

      const imageData = ctx.getImageData(0, 0, boardSize, boardSize).data;

      for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
          const index = (row * boardSize + col) * 4;
          const r = imageData[index];
          const g = imageData[index + 1];
          const b = imageData[index + 2];
          const a = imageData[index + 3];

          let hexColor = rgbaToHex(r, g, b, a);

      
          window.paintPixel(row, col, hexColor);
        }
      }
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
}

function rgbaToHex(r, g, b, a) {
  if (a === 0) return 'transparent';

  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}