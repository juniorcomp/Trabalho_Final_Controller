let nivelSubdivisao = 0;
let corJoyConEsq;
let corJoyConDir;
const PANEL_WIDTH = 480;

// malha carcaça
let malhaVertices = [
  //FRENTE
  [-15, -45,  6], // 0: Topo Esq Frente
  [ 15, -45,  6], // 1: Topo Dir Frente
  [-18, -25,  6], // 2: Ombro Esq Frente
  [ 18, -25,  6], // 3: Ombro Dir Frente
  [-18,  25,  6], // 4: Base Esq Frente
  [ 18,  25,  6], // 5: Base Dir Frente
  [-15,  45,  6], // 6: Fundo Esq Frente
  [ 15,  45,  6], // 7: Fundo Dir Frente

  //COSTAS
  [-15, -43, -6], // 8: Topo Esq Costas
  [ 15, -43, -6], // 9: Topo Dir Costas
  [-18, -25, -6], // 10: Ombro Esq Costas
  [ 18, -25, -6], // 11: Ombro Dir Costas
  [-18,  25, -6], // 12: Base Esq Costas
  [ 18,  25, -6], // 13: Base Dir Costas
  [-15,  43, -6], // 14: Fundo Esq Costas
  [ 15,  43, -6]  // 15: Fundo Dir Costas
];

let malhaFaces = [
  // Frente
  [0, 2, 3, 1], [2, 4, 5, 3], [4, 6, 7, 5],
  // Costas
  [9, 11, 10, 8], [11, 13, 12, 10], [13, 15, 14, 12],
  // Laterais e Curvas do Topo
  [0, 1, 9, 8], [1, 3, 11, 9], [3, 5, 13, 11], [5, 7, 15, 13],
  // Curvas da Base e Lateral Esquerda
  [7, 6, 14, 15], [6, 4, 12, 14], [4, 2, 10, 12], [2, 0, 8, 10]
];

let malhaNormais = [];

function setup() {
  let cnv = createCanvas(max(100, windowWidth - PANEL_WIDTH), windowHeight, WEBGL);
  cnv.position(0, 0);
  cnv.style('display', 'block');
  noStroke();
  
  // Cores Padrões
  corJoyConEsq = color(0, 190, 240);
  corJoyConDir = color(255, 50, 70);
  
  // Suavização em 4 Níveis de Catmull-Clark para arredondar a pílula
  for (let i = 0; i < 4; i++) {
    let resultado = subdividirCatmullClark(malhaVertices, malhaFaces);
    malhaVertices = resultado.vertices;
    malhaFaces = resultado.faces;
    nivelSubdivisao++;
  }
  
  atualizarNormais();

  // Separação das cores
  window.atualizarCorControle = function(corHex, side) {
    if (side === 'left') {
      corJoyConEsq = color(corHex);
    } else if (side === 'right') {
      corJoyConDir = color(corHex);
    } else {
      // Fallback caso a cor seja enviada sem um lado definido
      corJoyConEsq = color(corHex);
      corJoyConDir = color(corHex);
    }
  };
}


function draw() {
  if (window.compraConcluida && width !== windowWidth) {
    resizeCanvas(windowWidth, windowHeight);
  }

  background(45);
  orbitControl();
  
  // giro no estilo vitrine 
  if (window.compraConcluida) {
    rotateY(frameCount * 0.005); 
  }

  // simulador ativado
  if (typeof pollGamepads === 'function') pollGamepads();

  // motor de animação na manutenção
  if (typeof window.animGatilhos === 'undefined') {
    window.animGatilhos = 0; window.animAnalogicos = 0; window.animBotoes = 0;
  }
  
  window.animGatilhos = lerp(window.animGatilhos, window.estadoManutencaoGatilhos ? 18 : 0, 0.1);
  window.animAnalogicos = lerp(window.animAnalogicos, window.estadoManutencaoAnalogicos ? 12 : 0, 0.1);
  window.animBotoes = lerp(window.animBotoes, window.estadoManutencaoBotoes ? 10 : 0, 0.1);

  ambientLight(90);
  directionalLight(200, 200, 200, 0.3, 0.5, -1);
  directionalLight(120, 120, 120, -0.3, -0.5, 1);
  pointLight(130, 130, 130, 0, -100, 200);

  scale(2.5);
  let r_btn = 2.2, h_btn = 1.5;

  // JOY-CON ESQUERDO
  push();
  translate(-28, 0, 0);
  
  push(); fill(corJoyConEsq); specularMaterial(40); shininess(15); desenharMalhaCache(); pop();
  push(); fill(20, 20, 22); specularMaterial(50); shininess(40); translate(16, 0, 0); box(2.5, 66, 4); pop();
  
  fill(25, 25, 28); ambientMaterial(25); specularMaterial(20); shininess(10);

  // ANALÓGICO ESQUERDO 
  push();
  translate(0, -10, 12.0 + window.animAnalogicos); 
  scale(0.85);
  rotateX((PI / 2) - (gamepadState.ly * 0.4)); rotateZ(gamepadState.lx * 0.4);
  push(); scale(1, 0.4, 1); sphere(7.5); pop();       
  push(); translate(0, -4, 0); cylinder(2.5, 6); pop(); 
  push(); translate(0, -7.5, 0); cylinder(6.5, 1.5); pop(); 
  pop();

  // D-PAD
  push();
  translate(0, 14, 6.0 + window.animBotoes); 
  let gap = 5.8;
  push(); translate(0, -gap, gamepadState.dpadUp ? -1.0 : 0); rotateX(PI/2); cylinder(r_btn, h_btn); pop();
  push(); translate(0, gap, gamepadState.dpadDown ? -1.0 : 0); rotateX(PI/2); cylinder(r_btn, h_btn); pop();
  push(); translate(-gap, 0, gamepadState.dpadLeft ? -1.0 : 0); rotateX(PI/2); cylinder(r_btn, h_btn); pop();
  push(); translate(gap, 0, gamepadState.dpadRight ? -1.0 : 0); rotateX(PI/2); cylinder(r_btn, h_btn); pop();
  pop();

  push(); translate(6, -34, 6.2 + window.animBotoes); translate(0, 0, gamepadState.btnSelect ? -0.6 : 0); box(4.0, 1.2, 1.0); pop();
  push(); translate(5, 30, 6.2 + window.animBotoes); box(3.2, 3.2, 1.0); pop();

  // GATILHOS (L / ZL)
  push();
  translate(0, -41.0 + (gamepadState.l1 ? 1.2 : 0) - window.animGatilhos, 0 - (gamepadState.l1 ? 0.5 : 0)); 
  rotateX(1.80); rotateZ(1.57); scale(4, 0.6, 1.5); cylinder(1.5, 34); 
  pop();

  push();
  translate(0, -38.0 + (gamepadState.l2 * 1.5) - window.animGatilhos, -4.5 - (gamepadState.l2 * 0.5)); 
  push(); translate(0, 1, -2.5); rotateX(0.50); rotateZ(1.3); scale(1, 1.4, 2.2); cylinder(3, 14); pop();
  pop(); 

  pop(); 

  // JOY-CON DIREITO 
  push();
  translate(28, 0, 0);
  
  push(); fill(corJoyConDir); specularMaterial(40); shininess(15); desenharMalhaCache(); pop();
  push(); fill(20, 20, 22); specularMaterial(50); shininess(40); translate(-16, 0, 0); box(2.5, 66, 4); pop();
  
  fill(25, 25, 28); ambientMaterial(25); specularMaterial(20); shininess(10);

  // BOTÕES ABXY
  push();
  translate(0, -18, 6.0 + window.animBotoes);
  let gapR = 5.8;
  push(); translate(0, -gapR, gamepadState.btnTriangle ? -1.0 : 0); rotateX(PI/2); cylinder(r_btn, h_btn); pop();
  push(); translate(0, gapR, gamepadState.btnCross ? -1.0 : 0); rotateX(PI/2); cylinder(r_btn, h_btn); pop();
  push(); translate(-gapR, 0, gamepadState.btnSquare ? -1.0 : 0); rotateX(PI/2); cylinder(r_btn, h_btn); pop();
  push(); translate(gapR, 0, gamepadState.btnCircle ? -1.0 : 0); rotateX(PI/2); cylinder(r_btn, h_btn); pop();
  pop();

  // ANALÓGICO DIR
  push();
  translate(0, 10, 12.0 + window.animAnalogicos);
  scale(0.85); 
  rotateX((PI / 2) - (gamepadState.ry * 0.4)); rotateZ(gamepadState.rx * 0.4);
  push(); scale(1, 0.4, 1); sphere(7.5); pop();       
  push(); translate(0, -4, 0); cylinder(2.5, 6); pop(); 
  push(); translate(0, -7.5, 0); cylinder(6.5, 1.5); pop(); 
  pop();

  push(); translate(-6, -34, 6.2 + window.animBotoes); translate(0, 0, gamepadState.btnStart ? -0.6 : 0); box(4.0, 1.2, 1.0); box(1.2, 4.0, 1.0); pop();
  push(); translate(-5, 30, 6.2 + window.animBotoes); rotateX(PI/2); cylinder(2.2, 1.0); pop();

  //GATILHOS (R / ZR)
  push();
  translate(0, -41.0 + (gamepadState.r1 ? 1.2 : 0) - window.animGatilhos, 0 - (gamepadState.r1 ? 0.5 : 0)); 
  rotateX(1.80); rotateZ(1.57); scale(4, 0.6, 1.5); cylinder(1.5, 34); 
  pop();

  push();
  translate(0, -38.0 + (gamepadState.r2 * 1.5) - window.animGatilhos, -4.5 - (gamepadState.r2 * 0.5)); 
  push(); translate(0, 1, -2.5); rotateX(0.50); rotateZ(-1.3); scale(1, 1.4, 2.2); cylinder(3, 14); pop();
  pop(); 

  pop(); 
}

// obtenção da malha na memória
function desenharMalhaCache() {
  beginShape(TRIANGLES);
  for (let i = 0; i < malhaFaces.length; i++) {
    let f = malhaFaces[i];
    let indices = [0, 1, 2, 0, 2, 3];
    for (let j = 0; j < 6; j++) {
      let idx = f[indices[j]];
      normal(malhaNormais[idx].x, malhaNormais[idx].y, malhaNormais[idx].z);
      vertex(malhaVertices[idx][0], malhaVertices[idx][1], malhaVertices[idx][2]);
    }
  }
  endShape();
}
// atualiza a normal 
function atualizarNormais() {
  malhaNormais = Array(malhaVertices.length).fill().map(() => createVector(0, 0, 0));
  for (let i = 0; i < malhaFaces.length; i++) {
    let f = malhaFaces[i];
    if (f.length >= 3) {
      let v0 = createVector(malhaVertices[f[0]][0], malhaVertices[f[0]][1], malhaVertices[f[0]][2]);
      let v1 = createVector(malhaVertices[f[1]][0], malhaVertices[f[1]][1], malhaVertices[f[1]][2]);
      let v2 = createVector(malhaVertices[f[2]][0], malhaVertices[f[2]][1], malhaVertices[f[2]][2]);
      let n = p5.Vector.sub(v2, v0).cross(p5.Vector.sub(v1, v0)).normalize();
      for (let j = 0; j < f.length; j++) malhaNormais[f[j]].add(n);
    }
  }
  for (let n of malhaNormais) n.normalize();
}

function subdividirCatmullClark(vertices, faces) {
  let facePoints = [], edgePoints = new Map(), vertexFaces = Array(vertices.length).fill().map(() => []), vertexEdges = Array(vertices.length).fill().map(() => []);
  for (let i = 0; i < faces.length; i++) {
    let f = faces[i], cx = 0, cy = 0, cz = 0;
    for (let j = 0; j < f.length; j++) { cx += vertices[f[j]][0]; cy += vertices[f[j]][1]; cz += vertices[f[j]][2]; vertexFaces[f[j]].push(i); }
    facePoints.push([cx / f.length, cy / f.length, cz / f.length]);
  }
  for (let i = 0; i < faces.length; i++) {
    let f = faces[i];
    for (let j = 0; j < f.length; j++) {
      let v1 = f[j], v2 = f[(j + 1) % f.length], minV = Math.min(v1, v2), maxV = Math.max(v1, v2), edgeKey = minV + "-" + maxV;
      if (!edgePoints.has(edgeKey)) {
        let adjFaces = vertexFaces[minV].filter(id => vertexFaces[maxV].includes(id));
        let ex = vertices[v1][0] + vertices[v2][0], ey = vertices[v1][1] + vertices[v2][1], ez = vertices[v1][2] + vertices[v2][2];
        if (adjFaces.length === 2) {
          ex += facePoints[adjFaces[0]][0] + facePoints[adjFaces[1]][0];
          ey += facePoints[adjFaces[0]][1] + facePoints[adjFaces[1]][1];
          ez += facePoints[adjFaces[0]][2] + facePoints[adjFaces[1]][2];
          edgePoints.set(edgeKey, [ex / 4, ey / 4, ez / 4]);
        } else {
          edgePoints.set(edgeKey, [ex / 2, ey / 2, ez / 2]);
        }
        vertexEdges[minV].push(edgeKey); vertexEdges[maxV].push(edgeKey);
      }
    }
  }
  let oldVertexNewPos = [];
  for (let i = 0; i < vertices.length; i++) {
    let n = vertexFaces[i].length, Fx = 0, Fy = 0, Fz = 0;
    for (let fIdx of vertexFaces[i]) { Fx += facePoints[fIdx][0]; Fy += facePoints[fIdx][1]; Fz += facePoints[fIdx][2]; }
    Fx /= n; Fy /= n; Fz /= n;
    let Rx = 0, Ry = 0, Rz = 0;
    for (let eKey of vertexEdges[i]) {
      let pts = eKey.split("-").map(Number);
      Rx += (vertices[pts[0]][0] + vertices[pts[1]][0]) / 2;
      Ry += (vertices[pts[0]][1] + vertices[pts[1]][1]) / 2;
      Rz += (vertices[pts[0]][2] + vertices[pts[1]][2]) / 2;
    }
    Rx /= vertexEdges[i].length; Ry /= vertexEdges[i].length; Rz /= vertexEdges[i].length;
    let vx = (Fx + 2 * Rx + (n - 3) * vertices[i][0]) / n;
    let vy = (Fy + 2 * Ry + (n - 3) * vertices[i][1]) / n;
    let vz = (Fz + 2 * Rz + (n - 3) * vertices[i][2]) / n;
    oldVertexNewPos.push([vx, vy, vz]);
  }
  let novosVertices = oldVertexNewPos.concat(facePoints), facePointOffset = vertices.length, edgeIndexMap = new Map();
  for (let [key, val] of edgePoints.entries()) { edgeIndexMap.set(key, novosVertices.length); novosVertices.push(val); }
  let novasFaces = [];
  for (let i = 0; i < faces.length; i++) {
    let f = faces[i], fpIdx = facePointOffset + i;
    for (let j = 0; j < f.length; j++) {
      let v1 = f[j], v2 = f[(j + 1) % f.length], v0 = f[(j - 1 + f.length) % f.length];
      let edge1Key = Math.min(v1, v2) + "-" + Math.max(v1, v2);
      let edge0Key = Math.min(v0, v1) + "-" + Math.max(v0, v1);
      novasFaces.push([v1, edgeIndexMap.get(edge1Key), fpIdx, edgeIndexMap.get(edge0Key)]);
    }
  }
  return { vertices: novosVertices, faces: novasFaces };
}

function windowResized() { 
  let currentWidth = window.compraConcluida ? windowWidth : max(100, windowWidth - PANEL_WIDTH);
  resizeCanvas(currentWidth, windowHeight); 
}