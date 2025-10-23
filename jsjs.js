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

  if(fileType === 'txt' ){
    console.log(`Descargando el lienzo como texto`);

  // Convertir a JSON legible
  const textData = JSON.stringify(boardData);

  // Crear un Blob de texto
  const blob = new Blob([textData], { type: 'text/plain' });

  // Crear enlace de descarga
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.txt`;
  link.click();

  // Liberar memoria del objeto URL
  URL.revokeObjectURL(link.href);
  const cuadritos = document.getElementById('animation-div');

///////////////////////////////////////////////////////////
cuadritos.classList.remove('actuar');

// Forzar reflow para reiniciar la animación
void cuadritos.offsetWidth;

// Agregar clase para activar la animación
cuadritos.classList.add('actuar');

// Quitar la clase después de X ms (duración de la animación)
setTimeout(() => {
  cuadritos.classList.remove('actuar');
}, 3500);
 return;
  // si tu animación dura 2.5 segundos
}
  else{

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
/////////////////////////////////////////////////////////////////////
const cuadritos = document.getElementById('animation-div');

cuadritos.classList.remove('actuar');

// Forzar reflow para reiniciar la animación
void cuadritos.offsetWidth;

// Agregar clase para activar la animación
cuadritos.classList.add('actuar');

// Quitar la clase después de X ms (duración de la animación)
setTimeout(() => {
  cuadritos.classList.remove('actuar');
}, 3500); // si tu animación dura 2.5 segundos

  }
  
    }