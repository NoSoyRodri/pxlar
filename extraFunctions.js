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

  updateClock(); // Actualiza inmediatamente

  // Calcula cuántos ms faltan para el próximo minuto
  const now = new Date();
  const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  setTimeout(() => {
    updateClock(); // Alineado con el cambio de minuto

    // Luego se actualiza cada 60 segundos exactos
    setInterval(updateClock, 60000);
  }, msUntilNextMinute);
}










