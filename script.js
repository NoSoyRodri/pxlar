document.addEventListener('DOMContentLoaded', () => {
  
const board = document.getElementById('board');
const colorPicker = document.getElementById('colorPicker');
const projectNameInput = document.getElementById('projectNameInput');
const boardSize = 80; 
let boardData = Array.from(Array(boardSize), () => new Array(boardSize).fill('#ffffff'));
let isPainting = false;


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
          ? "repeating-linear-gradient(45deg, #e0e0e0 0 10%, #f8f8f8 10% 20%)"
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
              <i class="bi bi-download resaltar" data-name="${project.name}" data-action="download"></i>
              <i class="bi bi-trash3-fill resaltar" data-name="${project.name}" data-action="delete"></i>
              <i class="bi bi-cloud-arrow-up-fill resaltar" data-name="${project.name}" data-action="load"></i>
 
 `
  projectsContainer.append(projectItem);
});
}

projectsBringer();

function loadProjectData(data) {
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      const color = data[row][col];
      const pixel = document.getElementById(`${row}-${col}`);
      if (pixel) {
        if (color === '#ff00ff') { 
          pixel.style.background = "repeating-linear-gradient(45deg, #e0e0e0 0 10%, #f8f8f8 10% 20%)";
        } else {
          pixel.style.background = color;
        }
      }
      
      boardData[row][col] = color;
    }
  }
}


const handleProjectActions = function() {
  document.querySelectorAll('[data-action]').forEach(icon => {
    icon.addEventListener('click', () => {
      const name = icon.dataset.name;
      const action = icon.dataset.action;

      if (action === 'delete') {
        if (confirm(`¿Eliminar el proyecto "${name}"?`)) {
          let projects = JSON.parse(localStorage.getItem('projects')) || [];
          projects = projects.filter(p => p.name !== name);
          localStorage.setItem('projects', JSON.stringify(projects));
          projectsBringer();
          handleProjectActions();
        }
      }

      if (action === 'download') {
  console.log(`Descargando ${name}`);

  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const project = projects.find(p => p.name === name);

  if (!project) {
    alert("No se encontró el proyecto para descargar.");
    return;
  }

  const datos = boardData;
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
   

  });
});


function paint(pixel, row, col) {
  const color = colorPicker.value;

  if (currentTool === 'pencil') {
    paintPixel(row, col, color);
  } else if (currentTool === 'brush') {
    paintArea(row, col, brushRadius, color);
  } else if (currentTool === 'eraser') {
    paintArea(row, col, brushRadius, '#ffffff'); 
  }else if (currentTool === 'removepx') {
  paintArea(row, col, brushRadius,'transparent');
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
      pixel.style.background = "repeating-linear-gradient(45deg, #e0e0e0 0 10%, #f8f8f8 10% 20%)";
      boardData[row][col] = '#ff00ff'; //!!!!!!!!////!!!!!!//////
      //recordar, importante esto es nuestra clave de color #transparente para el canvas//
    }else{
    pixel.style.background = color;
    boardData[row][col] = color;
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



});





