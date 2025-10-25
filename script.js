import                      { 
              randomHexColor, paintRandomBoardWithPaint, animateBoardPainting,
              ejecutarSegunHora, startClock, enableGlobalDragAndDrop, cargarImagenAlBoard,
             
                                            } from './extraFunctions.js';
import { tapadoBoard, portada } from './lockedBoardData.js';

document.addEventListener('DOMContentLoaded', () => {
  
const board = document.getElementById('board');
const colorPicker = document.getElementById('colorPicker');
const projectNameInput = document.getElementById('projectNameInput');
const boardSize = 140; 
let boardData = Array.from(Array(boardSize), () => new Array(boardSize).fill('#ffffff'));
let isPainting = false;
const clockElement = document.getElementById('clock');
const cuadriculaBtn = document.querySelector('.cuadricula');
const UsefulTips = ["Use the mouse wheel to zoom in and out. Press Ctrl + Q to reset the zoom. Hold Shift and drag to move the canvas." ,

"Utiliza el pincel junto con"

]
//aca buscamos crear una funcion que mediante los cambios hechos por paint(), genere un historial de colores//
let recentColors = []; 
const maxRecentColors = 10; 


  
startClock(clockElement);

document.getElementById('imageUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    cargarImagenAlBoard(file);
  }
});


function addRecentColor(color) {
  // Si el color ya está en la lista, lo eliminamos para agregarlo al final
  const existingIndex = recentColors.indexOf(color);
  if (existingIndex !== -1) {
    recentColors.splice(existingIndex, 1);
  }

  // Agregar color al final
  recentColors.push(color);

  // Limitar a máximo 10
  if (recentColors.length > maxRecentColors) {
    recentColors.shift(); // elimina el más antiguo
  }

  // Actualizar la interfaz
  updateRecentColorsUI();
}

function updateRecentColorsUI() {
  const container = document.querySelector('.color-palete');
  container.innerHTML = ''; // Limpiar

  recentColors.forEach(color => {
    // const paletteTitle = document.createElement('h3');
    // paletteTitle.innerText="Recents";
    const colorDiv = document.createElement('div');
    colorDiv.classList.add('div-palete');
    colorDiv.style.background = color;
    // Opcional: permitir que el usuario haga clic para seleccionar ese color
    colorDiv.addEventListener('click', () => {
      colorPicker.value = color;
    });

    container.appendChild(colorDiv);
  });
}

document.getElementById('randomPaintBtn').addEventListener('click', () => {
  animateBoardPainting(boardSize, paint); // o paintRandomBoardWithPaint(boardSize, paint);
});

ejecutarSegunHora();
setInterval(ejecutarSegunHora, 60*1000);
let isAnimating = false;
//aca guardamos los datos que nos da la funcion paint, generando undo y redo//
function setupHistory(boardDataRef) {
  
  

  let history = [];
  let redoStack = [];

 
  function cloneBoard(board) {
    return board.map(row => [...row]);
  }

  function saveHistory() {
    if (isAnimating) return;
    history.push(cloneBoard(boardDataRef));
    redoStack = []; 
  }

 //////////////////////////////////////////////FUNCION LOCAL///////////////////////////////////////////
  function loadBoard(data) {
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      const color = data[row][col];
      boardDataRef[row][col] = color; 
      const pixel = document.getElementById(`${row}-${col}`);
      if (pixel) {
        pixel.style.background = color === '#ff00ff'
          ? "transparent"
          : color;
      }
    }
  }
}
  
  function undo() {
    if (history.length === 0) return;
    redoStack.push(cloneBoard(boardDataRef));
    const previous = history.pop();
    loadBoard(previous);
  }

  
  function redo() {
    if (redoStack.length === 0) return;
    history.push(cloneBoard(boardDataRef));
    const next = redoStack.pop();
    loadBoard(next);
  }

 
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
    } else if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') || 
               (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'y')) {
      e.preventDefault();
      redo();
    }
  });

  // Botones de la interfaz
  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('redoBtn').addEventListener('click', redo);

 
  return { saveHistory, undo, redo };
}


const historyManager = setupHistory(boardData);

historyManager.saveHistory();

function clearBoard() {
  
  historyManager.saveHistory();

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      boardData[row][col] = '#ffffff'; 
      const pixel = document.getElementById(`${row}-${col}`);
      if (pixel) {
        pixel.style.background = '#ffffff';
      }
    }
  }
  let inputName = document.getElementById('projectNameInput')
  inputName.value = " ";
}



document.getElementById('clearBtn').addEventListener('click', clearBoard);
//CREACION BOARD IMPORTANTE////////////////////////////////////////CREACION BOARD IMPORTANTE////////////////////////////////////////////////////////////////
board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
board.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
//ASIGNACION DE EVENTOS////////////////////////////////////////////ASIGNACION DE EVENTOS///////////////////////////////////////////////////////
for (let row = 0; row < boardSize; row++) {
  for (let col = 0; col < boardSize; col++) {
    const pixel = document.createElement('div');
    pixel.classList.add('pixel');
    pixel.id = `${row}-${col}`;

    pixel.addEventListener('mousedown', (e) => {
      e.preventDefault(); 
      if(e.shiftKey) return;
      if (!isPanning){
      isPainting = true;
      historyManager.saveHistory();
      paint(pixel, row, col);
    }
    });

   
    pixel.addEventListener('mouseover', (e) => {
  if (isPainting && !isPanning && !e.shiftKey) paint(pixel, row, col);
});
//ASIGNACION DE EVENTOS////////////////////////////////////////////ASIGNACION DE EVENTOS///////////////////////////////////////////////////////
    board.appendChild(pixel);
   
  }
}
//CREACION BOARD IMPORTANTE////////////////////////////////////////CREACION BOARD IMPORTANTE////////////////////////////////////////////////////////////////
const cuadricula = function (){
  cuadriculaBtn.addEventListener('click', ()=>{
  const pixeles = document.querySelectorAll('#board div');
pixeles.forEach(pixel => {
  
      pixel.classList.toggle('border');
    });
  });
}
  cuadricula();

const projectsBringer = function (){
  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const projectsContainer = document.querySelector('.projects-list');
  
   projectsContainer.innerHTML = '';
  projects.forEach((project, index) => {
    let projectItem = document.createElement('div');
    projectItem.classList.add('project-item')
    
 projectItem.innerHTML=`
 <i class="bi bi-image-fill"></i>
              <span class="project-span">${project.name}</span>
              <i class="bi bi-download resaltar" title="Download" data-name="${project.name}" data-action="download"></i>
              <i class="bi bi-trash3-fill resaltar" title="Delete" data-name="${project.name}" data-action="delete"></i>
              <i class="bi bi-cloud-arrow-up-fill resaltar" title="Load" data-name="${project.name}" data-action="load"></i>
             
 
 `
  projectsContainer.append(projectItem);
});
}

const cancelColorChangeButton = document.getElementById('cancelButton')
const colorChangeMenu = document.getElementById('colorChangerMenu')
const openMenuBtn = document.getElementById('openColorChangerBtn');
const applyBtn = document.getElementById('applyColorChangeBtn');
cancelColorChangeButton.addEventListener('click', ()=>{
colorChangeMenu.classList.toggle('hidden')
})

function colorChanger() {
  const toChangeInput = document.getElementById('colorToChangeInput');
  const newColorInput = document.getElementById('newColorInput');

  const colorToChange = toChangeInput.value;
  const newColor = newColorInput.value;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (boardData[row][col] === colorToChange) {
        paintPixel(row, col, newColor);
      }
    }
  }
  colorChangeMenu.classList.toggle('hidden')

  
}

openMenuBtn.addEventListener('click', ()=>{
  colorChangeMenu.classList.toggle('hidden')
})

applyBtn.addEventListener('click', colorChanger);


projectsBringer();

function loadProjectData(data) {
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      const color = data[row][col];
      const pixel = document.getElementById(`${row}-${col}`);
      if (pixel) {
        if (color === '#ff00ff') { 
          pixel.style.background = "transparent";
        } else {
          pixel.style.background = color;
        }
      }
      
      boardData[row][col] = color;
    }
  }
}

enableGlobalDragAndDrop();
let ultimoHashGuardado = null; // global
 const handleProjectActions = function() {

document.querySelectorAll('[data-action]').forEach(icon => {
    const newIcon = icon.cloneNode(true);
    icon.parentNode.replaceChild(newIcon, icon);
  });



  document.querySelectorAll('[data-action]').forEach(icon => {
    icon.addEventListener('click', async() => {
      const name = icon.dataset.name;
      const action = icon.dataset.action;

      if (action === 'delete') {
       //dar feedback, recordar!
          let projects = JSON.parse(localStorage.getItem('projects')) || [];
          projects = projects.filter(p => p.name !== name);
          localStorage.setItem('projects', JSON.stringify(projects));
          projectsBringer();
          handleProjectActions();
        
      }

      if (action === 'download') {
  console.log(`Descargando ${name}`);

  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const project = projects.find(p => p.name === name);

  if (!project) {
    alert("No se encontró el proyecto para descargar.");
    return;
  }

  // const datos = boardData;
const datos = project.data;
  const pixelSize = 10; 

  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  
  canvas.width = datos[0].length * pixelSize;
  canvas.height = datos.length * pixelSize;

  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  
  for (let row = 0; row < datos.length; row++) {
  for (let col = 0; col < datos[row].length; col++) {
    const color = datos[row][col];

    if (color === '#ff00ff') {
      
      continue;
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
    }
  }
}

  
  const imageUrl = canvas.toDataURL('image/png');

 
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `${name}.png`;
  link.click();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////

// if(action === 'download-actual'){


// console.log(`Descargando el lienzo actual`);
  

//   let fileName = document.getElementById('filenameinput').value||"pxlar"
//   let fileType = document.getElementById('file-type').value||"png"
//   let fileSize = document.getElementById('image-size').value||"1400px";
//   let pixelSize; 
//   const datos = boardData;

//   if(fileSize==="840px"){
//     pixelSize = 6;
//   }else if(fileSize==="1400px"){
//     pixelSize = 10;
//   }else if(fileSize==="2800px"){
//     pixelSize= 20;
//   }

//   if(fileType === 'txt' ){
//     console.log(`Descargando el lienzo como texto`);

//   // Convertir a JSON legible
//   const textData = JSON.stringify(boardData);

//   // Crear un Blob de texto
//   const blob = new Blob([textData], { type: 'text/plain' });

//   // Crear enlace de descarga
//   const link = document.createElement('a');
//   link.href = URL.createObjectURL(blob);
//   link.download = `${fileName}.txt`;
//   link.click();

//   // Liberar memoria del objeto URL
//   URL.revokeObjectURL(link.href);
//   const cuadritos = document.getElementById('animation-div');

// ///////////////////////////////////////////////////////////
// cuadritos.classList.remove('actuar');

// // Forzar reflow para reiniciar la animación
// void cuadritos.offsetWidth;

// // Agregar clase para activar la animación
// cuadritos.classList.add('actuar');

// // Quitar la clase después de X ms (duración de la animación)
// setTimeout(() => {
//   cuadritos.classList.remove('actuar');
// }, 3500);
//  return;
//   // si tu animación dura 2.5 segundos
// }
//   else{

//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d');

  
//   canvas.width = datos[0].length * pixelSize;
//   canvas.height = datos.length * pixelSize;

  
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

  
//   for (let row = 0; row < datos.length; row++) {
//   for (let col = 0; col < datos[row].length; col++) {
//     const color = datos[row][col];

//     if (color === '#ff00ff') {
      
//       continue;
//     } else {
//       ctx.fillStyle = color;
//       ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
//     }
//   }
// }

  
//   const imageUrl = canvas.toDataURL(`image/${fileType}`);

 
//   const link = document.createElement('a');
//   link.href = imageUrl;
//   link.download = `${fileName}.${fileType}`;
//   link.click();
// /////////////////////////////////////////////////////////////////////
// const cuadritos = document.getElementById('animation-div');

// cuadritos.classList.remove('actuar');

// // Forzar reflow para reiniciar la animación
// void cuadritos.offsetWidth;

// // Agregar clase para activar la animación
// cuadritos.classList.add('actuar');

// // Quitar la clase después de X ms (duración de la animación)
// setTimeout(() => {
//   cuadritos.classList.remove('actuar');
// }, 3500); // si tu animación dura 2.5 segundos

//   }
  
//     }

if(action === 'download-actual') {
  console.log(`Descargando el lienzo actual`);

  let fileName = document.getElementById('filenameinput').value || "pxlar";
  let fileType = document.getElementById('file-type').value || "png";
  let fileSize = document.getElementById('image-size').value || "1400px";

  let pixelSize;
  if(fileSize === "840px") pixelSize = 6;
  else if(fileSize === "1400px") pixelSize = 10;
  else if(fileSize === "2800px") pixelSize = 20;

  // Por defecto usamos el board actual
  let datosParaDescargar = boardData;

  // Si se aplicó desordenarBoardAnimado y tenemos hash
  if (ultimoHashGuardado) {
    const registro = await obtenerBoardPorHashDB(ultimoHashGuardado);
    if (registro) {
      datosParaDescargar = registro;
      console.log("✅ Descargando usando hash restaurado");
    } else {
      console.log("⚠️ No se encontró hash, se descarga el board actual");
    }
  } else {
    console.log("No hay boardOriginal, se descarga el board actual");
  }

  // Descarga TXT
  if(fileType === 'txt') {
    const textData = JSON.stringify(datosParaDescargar);
    const blob = new Blob([textData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);

    // Animación opcional
    const cuadritos = document.getElementById('animation-div');
    cuadritos.classList.remove('actuar');
    void cuadritos.offsetWidth;
    cuadritos.classList.add('actuar');
    setTimeout(() => cuadritos.classList.remove('actuar'), 3500);

  } else {
    // Descarga imagen
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = datosParaDescargar[0].length * pixelSize;
    canvas.height = datosParaDescargar.length * pixelSize;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < datosParaDescargar.length; row++) {
      for (let col = 0; col < datosParaDescargar[row].length; col++) {
        const color = datosParaDescargar[row][col];
        if (color === '#ff00ff') continue;
        ctx.fillStyle = color;
        ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
      }
    }

    const imageUrl = canvas.toDataURL(`image/${fileType}`);
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${fileName}.${fileType}`;
    link.click();

    // Animación opcional
    const cuadritos = document.getElementById('animation-div');
    cuadritos.classList.remove('actuar');
    void cuadritos.offsetWidth;
    cuadritos.classList.add('actuar');
    setTimeout(() => cuadritos.classList.remove('actuar'), 3500);
  }
}

////////////////////////////////////////////////////////
      if (action === 'load') {
        console.log(`Cargando ${name}`);
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        const project = projects.find(p => p.name === name);
        if (project) loadProjectData(project.data);
        projectNameInput.value=`${project.name}`;
      }


      if (action === 'addComposition') {
        console.log(`Cargando ${name}`);
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        const project = projects.find(p => p.name === name);
        if (project) loadProjectData(project.data);
        projectNameInput.value=`${project.name}`;
      addProjectToComposition(project.data);}
    });
  });
};

handleProjectActions();



document.addEventListener('mouseup', () => {
  isPainting = false;
});


const toolButtons = document.querySelectorAll('.tool');
let currentTool = 'pencil';
const brushSizeInput = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');

let brushRadius = parseInt(brushSizeInput.value);

brushSizeInput.addEventListener('input', () => {
  brushRadius = parseInt(brushSizeInput.value);
  brushSizeValue.textContent = brushRadius;
});


toolButtons.forEach(btn => {
  btn.addEventListener('click', () => {
   
    toolButtons.forEach(b => b.classList.remove('active'));

   
    btn.classList.add('active');

    
    if (btn.id === 'pencilBtn') currentTool = 'pencil';
    if (btn.id === 'brushBtn') currentTool = 'brush';
    if (btn.id === 'eraserBtn') currentTool = 'eraser';
    if (btn.id === 'removePxBtn') currentTool = 'removepx';
    if (btn.id === 'pickerBtn') currentTool ='picker'


  });
});

document.getElementById('pickerBtn').addEventListener('click', () => {
  currentTool = 'picker';
  

  
});
function pickColor(pixel) {
  if (!pixel) return;
  
  const bg = pixel.style.backgroundColor;

  // Evitar gradientes (como los de transparencia)
  if (bg.includes('gradient')) {
    alert('Este color no se puede seleccionar');
    return;
  }


  const hex = rgbToHex(bg);
  colorPicker.value = hex;

  

  currentTool = 'pencil';

  toolButtons.forEach(b => b.classList.remove('active'));
  document.getElementById('pencilBtn').classList.add('active');
}

function rgbToHex(rgb) {
  if (!rgb) return '#ffffff';
  const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
  return result ? "#" + ((1 << 24) + (parseInt(result[1]) << 16) + (parseInt(result[2]) << 8) + parseInt(result[3])).toString(16).slice(1) : rgb;
}


function paint(pixel, row, col, customColor = null) {
  // const color = colorPicker.value;
   const color = customColor || colorPicker.value;

  if (currentTool === 'pencil') {
    paintPixel(row, col, color);
  } else if (currentTool === 'brush') {
    paintArea(row, col, brushRadius, color);
  } else if (currentTool === 'eraser') {
    paintArea(row, col, brushRadius, '#ffffff'); 
  }else if (currentTool === 'removepx') {
  paintArea(row, col, brushRadius,'transparent');
}else if (currentTool === 'picker') {
  pickColor(pixel);
}
}
function paintArea(row, col, radius, color) {
  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      paintPixel(row + i, col + j, color);
    }
  }
}

function paintPixel(row, col, color) {
  if (row < 0 || col < 0 || row >= boardSize || col >= boardSize) return;
  const pixel = document.getElementById(`${row}-${col}`);
  if (pixel) {
    if (color === 'transparent') {
      pixel.style.background = "transparent";
      boardData[row][col] = '#ff00ff'; //!!!!!!!!////!!!!!!//////
      //recordar, importante esto es nuestra clave de color #transparente para el canvas//
    }else{
    pixel.style.background = color;
    boardData[row][col] = color;
    addRecentColor(color);

  }
    
  }
}

window.paintPixel = paintPixel;

function removeBackground() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (boardData[row][col] === '#ffffff' || boardData[row][col] === 'rgb(255, 255, 255)') {
        paintPixel(row, col, 'transparent');
      }
    }
  }
  //aca se podria dar feedback de que el proceso fue exitoso
}

document.getElementById('removeBgBtn').addEventListener('click', removeBackground);


let projects = JSON.parse(localStorage.getItem('projects')) || [];

const guardar = function (){

  saveProjectBtn.addEventListener('click', () => {
    const projectName = projectNameInput.value.trim(); 
    const errorMessage = document.querySelector('.message-error')
    const succefulMessage = document.querySelector('.message-succefuly')
    errorMessage.classList.remove('visible');
    if (!projectName) {
      errorMessage.classList.add('visible');
      setTimeout(() => {
        errorMessage.classList.remove('visible');
      }, 1500);

      return;
    }
  
   
    const newProject = { 
    name: projectName, 
    data: JSON.parse(JSON.stringify(boardData)) 
  };
  
    
    const existingIndex = projects.findIndex(p => p.name === projectName);
  
    if (existingIndex !== -1) {
     
      projects[existingIndex] = newProject;
      
    } else {
      
      projects.push(newProject);
      
    }
  
    
    localStorage.setItem('projects', JSON.stringify(projects));
    projectsBringer();
    handleProjectActions();
   succefulMessage.classList.add('visible');
      setTimeout(() => {
        succefulMessage.classList.remove('visible');
      }, 1500);
  const cuadritosTop = document.getElementById('animation-div-top');
  
  cuadritosTop.classList.remove('actuarTop');
  
 
  void cuadritosTop.offsetWidth;
  

  cuadritosTop.classList.add('actuarTop');
  
 
  setTimeout(() => {
    cuadritosTop.classList.remove('actuarTop');
  }, 3500);
  });
  //////////////////////////////////////////////////////
}

guardar();


const secondaryHandlerEvents = function(){
  const showProjects = document.querySelector('.showProjectsBtn');
  showProjects.addEventListener('click',()=>{
    const projectsList = document.querySelector('.projects-list');
    projectsList.classList.toggle('toshow')

  })
}

secondaryHandlerEvents();

const clearPalette = document.getElementById('clearPalette')
clearPalette.addEventListener('click', ()=>{
const paletteContainer = document.querySelector('.color-palete')
paletteContainer.innerHTML= `
<div class="div-palete" style="background: #fff;"></div>
        <div class="div-palete" style="background:#fff;"></div>
        <div class="div-palete" style="background: #fff;"></div>
        <div class="div-palete" style="background: #fff;"></div>
        <div class="div-palete" style="background: #fff;"></div>
        <div class="div-palete" style="background: #fff;"></div>
        <div class="div-palete" style="background: #fff;"></div>
        <div class="div-palete" style="background: #fff;"></div>
        <div class="div-palete" style="background: #fff;"></div>
        <div class="div-palete" style="background: #fff;"></div>
`
})

const boardContainer = document.getElementById('board-container');
const tablero = document.getElementById('board');
let scale = 1;
let isPanning = false;
let startX, startY;
let translateX = 0;
let translateY = -40;

// Zoom con rueda del mouse
boardContainer.addEventListener('wheel', (e) => {
  e.preventDefault();

  const zoomSpeed = 0.1;
  if (e.deltaY < 0) {
    scale = Math.min(scale + zoomSpeed, 4);
  } else {
    scale = Math.max(scale - zoomSpeed, 0.3);
  }

  updateTransform();
});

// Pan solo si Shift está presionado y no hay .draggable activo
boardContainer.addEventListener('mousedown', (e) => {
  // Evitar pan si click en draggable
  if (e.target.closest('.draggable')) return;

  if (e.shiftKey) {
  
    isPanning = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    boardContainer.style.cursor = 'grabbing';
  }
});

boardContainer.addEventListener('mousemove', (e) => {
  if (!isPanning) return;

  translateX = e.clientX - startX;
  translateY = e.clientY - startY;
  updateTransform();
});

document.addEventListener('mouseup', () => {
  if (isPanning) {
    isPanning = false;
    boardContainer.style.cursor = 'default';
  }
});
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'q') {
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
  }
});

function updateTransform() {
  tablero.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

//EN ESTA FUNCION ESTABAMOS TENIENDO ERROR YA QUE SE REESCRIBIA EL BOARD
//LA REFERENCIA CAMBIABA Y NO ERA SINCRONA
//LA FUNCION LOADPROJECTDATA YA ACTUALIZA LOS DATOS DEL BOARD
// function cargarLienzoDesdeTexto(file) {
//   const reader = new FileReader();
//   reader.onload = function(e) {
//     const data = JSON.parse(e.target.result);
//     boardData = data; /////////////////////EN ESTA LINEA ESTABA EL ERROR
//     console.log("llego hasta cargar el boardData")
//     loadProjectData(data);
//     historyManager.saveHistory();
//   };
//   reader.readAsText(file);
// }

function cargarLienzoDesdeTexto(file) {
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);

      
      loadProjectData(data);
      // historyManager.saveHistory(); ESTABA REPETIDO BUG//

      console.log("Lienzo cargado desde texto y guardado en historial correctamente");
    } catch (err) {
      console.error(" Error al cargar archivo de texto:", err);
    }
  };

  reader.readAsText(file);
}

document.getElementById('loadTxtFile').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt';

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) cargarLienzoDesdeTexto(file);
  });

  input.click();
});

// function addProjectToComposition(projectData) {
//   if (!projectData) return;

//   const pixelSize = compositionCanvas.width / projectData.length; 
//   for (let row = 0; row < projectData.length; row++) {
//     for (let col = 0; col < projectData[row].length; col++) {
//       const color = projectData[row][col];
//       if (color !== '#ff00ff') { 
//         ctx.fillStyle = color;
//         ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
//       }
//     }
//   }
// }


// const compositionCanvas = document.getElementById('compositionCanvas');
//   const ctx = compositionCanvas.getContext('2d');

//   const addProjectBtn = document.getElementById('addProjectBtn');
//   const clearCompositionBtn = document.getElementById('clearCompositionBtn');
//   const exportCompositionBtn = document.getElementById('exportCompositionBtn');

 
//   addProjectBtn.addEventListener('click', () => {
//     console.log('Agregar proyecto');
//     ctx.fillStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},1)`;
//     ctx.fillRect(0, 0, compositionCanvas.width, compositionCanvas.height);
//   });


//   clearCompositionBtn.addEventListener('click', () => {
//     ctx.clearRect(0, 0, compositionCanvas.width, compositionCanvas.height);
//   });


//   exportCompositionBtn.addEventListener('click', () => {
//     const link = document.createElement('a');
//     link.href = compositionCanvas.toDataURL('image/png');
//     link.download = 'composition.png';
//     link.click();
//   });

//   function addProjectToComposition(projectData) {
//   if (!projectData || !projectData.length) return;

//   const canvas = compositionCanvas; 
//   const ctx = canvas.getContext('2d');

 
//   let pixelSize = 10; 
//   canvas.width = projectData[0].length * pixelSize;
//   canvas.height = projectData.length * pixelSize;

//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   for (let row = 0; row < projectData.length; row++) {
//     for (let col = 0; col < projectData[row].length; col++) {
//       const color = projectData[row][col];
//       if (color !== '#ff00ff') { 
//         ctx.fillStyle = color;
//         ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
//       }
//     }
//   }


//   canvas.style.width = `${canvas.width}px`;
//   canvas.style.height = `${canvas.height}px`;
// }

// Abrir la base de datos IndexedDB
// function abrirDB() {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open("HashesDB", 1);

//     request.onupgradeneeded = (event) => {
//       const db = event.target.result;
//       if (!db.objectStoreNames.contains("hashes")) {
//         const store = db.createObjectStore("hashes", { keyPath: "hashString" });
//         store.createIndex("hashString", "hashString", { unique: true });
//       }
//     };

//     request.onsuccess = (event) => resolve(event.target.result);
//     request.onerror = (event) => reject(event.target.error);
//   });
// }
// Lock: distorsionar y guardar hash + original

// function abrirDB() {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open("BoardsDB", 1);
//     request.onupgradeneeded = (event) => {
//       const db = event.target.result;
//       if (!db.objectStoreNames.contains("boards")) {
//         db.createObjectStore("boards", { keyPath: "seed" });
//       }
//     };
//     request.onsuccess = (event) => resolve(event.target.result);
//     request.onerror = (event) => reject(event.target.error);
//   });
// }

// // 2️⃣ Lock: guarda el board actual y pinta encima el board tapado
// async function lockBoard() {
//   try {
//     const db = await abrirDB();

//     // Guardar el board original
//     const originalBoard = JSON.parse(JSON.stringify(boardData));

//     // Generar seed aleatoria
//     const seed = Math.random().toString(36).substring(2, 10);

//     // Guardar en IndexedDB
//     const tx = db.transaction("boards", "readwrite");
//     const store = tx.objectStore("boards");
//     store.put({ seed, board: originalBoard });

//     tx.oncomplete = () => {
//       console.log("✅ Board guardado con seed:", seed);
//       alert("Board bloqueado. Tu seed es: " + seed);
//     };
//     tx.onerror = (event) => console.error("Error al guardar board:", event.target.error);

//     // Repintar tablero con el board tapado
//     loadProjectData(tapadoBoard);

//   } catch (err) {
//     console.error("Error en lockBoard:", err);
//   }
// }

// // 3️⃣ Unlock: pide seed, busca en DB y repinta el board original
// async function unlockBoard() {
//   const seed = prompt("Introduce la seed para desbloquear el board:");
//   if (!seed) return;

//   try {
//     const db = await abrirDB();
//     const tx = db.transaction("boards", "readonly");
//     const store = tx.objectStore("boards");
//     const request = store.get(seed);

//     request.onsuccess = (event) => {
//       const result = event.target.result;
//       if (result && result.board) {
//         loadProjectData(result.board);
//         alert("Board desbloqueado correctamente.");
//       } else {
//         alert("Seed no encontrada.");
//       }
//     };
//     request.onerror = (event) => console.error("Error al buscar la seed en DB:", event.target.error);
//   } catch (err) {
//     console.error(err);
//     alert("Error al acceder a la base de datos.");
//   }
// }


// -------------------------
// Generador de seed aleatoria
function generateSeed() {
  return Math.floor(Math.random() * 1_000_000); // número entero
}

// -------------------------
// PRNG determinista basado en seed
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// -------------------------
// Shuffle determinista de índices
function shuffleIndices(length, seed) {
  const rng = mulberry32(seed);
  const indices = Array.from({length}, (_, i) => i);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices;
}

// -------------------------
// Aplicar shuffle a board 2D
function applyShuffle(board, seed) {
  const flat = board.flat();
  const indices = shuffleIndices(flat.length, seed);
  const shuffled = indices.map(i => flat[i]);

  const newBoard = [];
  let k = 0;
  for (let r = 0; r < board.length; r++) {
    const row = [];
    for (let c = 0; c < board[r].length; c++) {
      row.push(shuffled[k++]);
    }
    newBoard.push(row);
  }

  return newBoard;
}

// -------------------------
// Deshacer shuffle (unlock)
function undoShuffle(shuffledBoard, seed) {
  const flat = shuffledBoard.flat();
  const indices = shuffleIndices(flat.length, seed);
  const originalFlat = [];

  for (let i = 0; i < indices.length; i++) {
    originalFlat[indices[i]] = flat[i];
  }

  const newBoard = [];
  let k = 0;
  for (let r = 0; r < shuffledBoard.length; r++) {
    const row = [];
    for (let c = 0; c < shuffledBoard[r].length; c++) {
      row.push(originalFlat[k++]);
    }
    newBoard.push(row);
  }

  return newBoard;
}

// -------------------------
// IndexedDB helpers
function abrirDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("LockedBoardsDB", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("boards")) {
        db.createObjectStore("boards", { keyPath: "seed" });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function saveBoardToDB(seed, board) {
  abrirDB().then(db => {
    const tx = db.transaction("boards", "readwrite");
    const store = tx.objectStore("boards");
    store.put({ seed, board });
  });
}

function getBoardFromDB(seed) {
  return new Promise(async (resolve, reject) => {
    const db = await abrirDB();
    const tx = db.transaction("boards", "readonly");
    const store = tx.objectStore("boards");
    const request = store.get(seed);
    request.onsuccess = () => resolve(request.result ? request.result.board : null);
    request.onerror = () => reject(request.error);
  });
}

// -------------------------
// Lock function
async function lockBoard() {
  const seed = generateSeed();

  // Guardamos el board original desordenado
  const shuffledBoard = applyShuffle(JSON.parse(JSON.stringify(boardData)), seed);
  await saveBoardToDB(seed, shuffledBoard);

  // Repintar tablero con desorden
  loadProjectData(shuffledBoard);

  // Mostrar seed al usuario
  prompt("¡Board bloqueado! Copia esta seed para desbloquear:", seed);
}

// -------------------------
// Unlock function
async function unlockBoard() {
  const seed = prompt("Introduce la seed para desbloquear:");
  if (!seed) return alert("Seed no válida");

  const shuffledBoard = await getBoardFromDB(Number(seed));
  if (!shuffledBoard) return alert("No se encontró board para esta seed");

  // Restaurar original usando la función inversa
  const originalBoard = undoShuffle(shuffledBoard, Number(seed));
  loadProjectData(originalBoard);

  alert("Board desbloqueado correctamente!");
}

// -------------------------


// Función simple para ajustar color al 90%


// Función auxiliar para esperar un tiempo




const downloadPanelLock= document.getElementById('downloadPanelLock');
const locki = document.querySelector('.locki');
const unlocki = document.querySelector('.unlocki')
downloadPanelLock.addEventListener('click',()=>{
  if(locki.classList.contains('lockvisible')){
 lockBoard();
locki.classList.remove('lockvisible')
locki.classList.add('lockhidden');
unlocki.classList.remove('lockhidden');
unlocki.classList.add('lockvisible');
  }else{
    unlockBoard();
    locki.classList.remove('lockhidden');
    locki.classList.add('lockvisible');
    unlocki.classList.remove('lockvisible');
    unlocki.classList.add('lockhidden');
  }
})

const restoreButton = document.getElementById('restorelock');
const disorderButton = document.getElementById('disorderlock')
restoreButton.addEventListener('click', ()=>{
  console.log("se restauro el elemento")
    unlocki.classList.remove('lockvisible');
    unlocki.classList.add('lockhidden');
    console.log("se oculto el icono")
    locki.classList.remove('lockhidden')
    locki.classList.add('lockvisible')

  unlockBoard();
})


disorderButton.addEventListener('click', ()=>{
 console.log("se desordeno el elemento")
    locki.classList.remove('lockvisible');
    locki.classList.add('lockhidden');
    console.log("se oculto el icono")
    unlocki.classList.remove('lockhidden')
    unlocki.classList.add('lockvisible')
  
  lockBoard();
})

function resetDB() {
  const request = indexedDB.deleteDatabase("HashesDB");

  request.onsuccess = () => {
    console.log("✅ Base de datos 'HashesDB' eliminada correctamente.");
  };

  request.onerror = (event) => {
    console.error("⚠️ Error al eliminar la base de datos:", event.target.error);
  };

  request.onblocked = () => {
    console.warn("⚠️ Eliminación bloqueada. Cierra otras pestañas que estén usando la DB.");
  };
}
// resetDB();
loadProjectData(portada);
});
