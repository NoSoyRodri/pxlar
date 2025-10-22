import { randomHexColor, paintRandomBoardWithPaint, animateBoardPainting, ejecutarSegunHora, startClock, enableGlobalDragAndDrop} from './extraFunctions.js';

document.addEventListener('DOMContentLoaded', () => {
  
const board = document.getElementById('board');
const colorPicker = document.getElementById('colorPicker');
const projectNameInput = document.getElementById('projectNameInput');
const boardSize = 140; 
let boardData = Array.from(Array(boardSize), () => new Array(boardSize).fill('#ffffff'));
let isPainting = false;
const clockElement = document.getElementById('clock');
const cuadriculaBtn = document.querySelector('.cuadricula');

//aca buscamos crear una funcion que mediante los cambios hechos por paint(), genere un historial de colores//
let recentColors = []; 
const maxRecentColors = 10; 


  
startClock(clockElement);


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

//aca guardamos los datos que nos da la funcion paint, generando undo y redo//
function setupHistory(boardDataRef) {
  
  let history = [];
  let redoStack = [];

 
  function cloneBoard(board) {
    return board.map(row => [...row]);
  }

  function saveHistory() {
    history.push(cloneBoard(boardDataRef));
    redoStack = []; 
  }

 
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
      boardData[row][col] = '#ffffff'; // Limpia boardData
      const pixel = document.getElementById(`${row}-${col}`);
      if (pixel) {
        pixel.style.background = '#ffffff'; // Limpia el pixel visual
      }
    }
  }
  let inputName = document.getElementById('projectNameInput')
  inputName.value = " ";
}



document.getElementById('clearBtn').addEventListener('click', clearBoard);

board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
board.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;

for (let row = 0; row < boardSize; row++) {
  for (let col = 0; col < boardSize; col++) {
    const pixel = document.createElement('div');
    pixel.classList.add('pixel');
    pixel.id = `${row}-${col}`;

    pixel.addEventListener('mousedown', (e) => {
      e.preventDefault(); 
      isPainting = true;
      historyManager.saveHistory();
      paint(pixel, row, col);
    });

   
    pixel.addEventListener('mouseover', () => {
      if (isPainting) paint(pixel, row, col);
    });

    board.appendChild(pixel);
   
  }
}

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

const handleProjectActions = function() {
  document.querySelectorAll('[data-action]').forEach(icon => {
    icon.addEventListener('click', () => {
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

if(action === 'download-actual'){


console.log(`Descargando el lienzo actual`);
  

  let fileName = document.getElementById('filenameinput').value||"pxlar"
  let fileType = document.getElementById('file-type').value||"png"
  let fileSize = document.getElementById('image-size').value||"1400px";
  let pixelSize; 
  const datos = boardData;

  if(fileSize==="840px"){
    pixelSize = 6;
  }else if(fileSize==="1400px"){
    pixelSize = 10;
  }else if(fileSize==="2800px"){
    pixelSize= 20;
  }


  
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

  
  const imageUrl = canvas.toDataURL(`image/${fileType}`);

 
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `${fileName}.${fileType}`;
  link.click();

}
      if (action === 'load') {
        console.log(`Cargando ${name}`);
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        const project = projects.find(p => p.name === name);
        if (project) loadProjectData(project.data);
        projectNameInput.value=`${project.name}`;
      }
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

    if(currentTool !== 'picker'){
  //     board.classList.remove('eyedropper');
  // board.classList.add('crosshair');
    }
  });
});

document.getElementById('pickerBtn').addEventListener('click', () => {
  currentTool = 'picker';
  // let board = document.getElementById('board');
  // board.classList.remove('crosshair');
  // board.classList.add('eyedropper');

  
});
function pickColor(pixel) {
  if (!pixel) return;
  
  const bg = pixel.style.backgroundColor;

  // Evitar gradientes (como los de transparencia)
  if (bg.includes('gradient')) {
    alert('Este color no se puede seleccionar');
    return;
  }

  // Convertir de rgb() a formato hex
  const hex = rgbToHex(bg);
  colorPicker.value = hex;

  // board.classList.remove('eyedropper');
  // board.classList.add('crosshair');

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
  });
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

});
