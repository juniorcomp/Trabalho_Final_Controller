let nivelSubdivisao = 0;
let corCarcaca; 
const PANEL_WIDTH = 480;

// malha carcaça
let malhaVertices = [
  //FRENTE
  [-48, -26,  14], // 0: Ombro Esq Ext
  [-24, -28,  14], // 1: Peito Esq 
  [ 24, -28,  14], // 2: Peito Dir 
  [ 48, -26,  14], // 3: Ombro Dir Ext
  [-60,   8,  14], // 4: Meio Pega Esq Ext 
  [-22,  32,  14], // 5: Barriga Central Esq
  [ 22,  32,  14], // 6: Barriga Central Dir
  [ 60,   8,  14], // 7: Meio Pega Dir Ext 
  [-74,  58,  14], // 8: Ponta Curta Pegador Esq
  [-30,  46,  14], // 9: Curva Interna Esq
  [ 30,  46,  14], // 10: Curva Interna Dir 
  [ 74,  58,  14], // 11: Ponta Curta Pegador Dir 

  // COSTAS
  [-44, -22, -14], // 12: Ombro Esq Ext
  [-24, -25, -14], // 13: Costas Esq 
  [ 24, -25, -14], // 14: Costas Dir 
  [ 44, -22, -14], // 15: Ombro Dir Ext
  [-52,   8, -14], // 16: Meio Pega Esq Ext
  [-22,  32, -14], // 17: Fundo Barriga Esq
  [ 22,  32, -14], // 18: Fundo Barriga Dir 
  [ 52,   8, -14], // 19: Meio Pega Dir Ext
  [-66,  54, -14], // 20: Ponta Fundo Esq
  [-24,  42, -14], // 21: Curva Interna Fundo Esq
  [ 24,  42, -14], // 22: Curva Interna Fundo Dir
  [ 66,  54, -14]  // 23: Ponta Fundo Dir
];

let malhaFaces = [
  [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [4, 8, 9, 5], [6, 10, 11, 7],
  [12, 13, 17, 16], [13, 14, 18, 17], [14, 15, 19, 18], [16, 17, 21, 20], [18, 19, 23, 22],
  [0, 1, 13, 12], [1, 2, 14, 13], [2, 3, 15, 14], 
  [15, 3, 7, 19], [19, 7, 11, 23], [11, 23, 22, 10], 
  [10, 22, 18, 6], [6, 18, 17, 5], [5, 17, 21, 9], 
  [9, 21, 20, 8], [8, 20, 16, 4], [4, 16, 12, 0]
];

let malhaNormais = [];

function setup() {
  let cnv = createCanvas(max(100, windowWidth - PANEL_WIDTH), windowHeight, WEBGL);
  cnv.position(0, 0);
  cnv.style('display', 'block');
  noStroke();
  
  // Cor padrão do Pro Controller: Cinza Translúcido Fumê escuro
  corCarcaca = color(36, 36, 42); 
  
  // Suavização Catmull-Clark
  for (let i = 0; i < 4; i++) {
    let resultado = subdividirCatmullClark(malhaVertices, malhaFaces);
    malhaVertices = resultado.vertices;
    malhaFaces = resultado.faces;
    nivelSubdivisao++;
  }
  
  atualizarNormais();

  window.atualizarCorControle = function(corHex) {
    corCarcaca = color(corHex);
  };
}

function windowResized() {
  resizeCanvas(max(100, windowWidth - PANEL_WIDTH), windowHeight);
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
  if (typeof pollGamepads === 'function') {
    pollGamepads();
  }
  // interpolador de animação
  if (typeof window.animGatilhos === 'undefined') {
    window.animGatilhos = 0; window.animAnalogicos = 0; window.animBotoes = 0;
  }
  
  window.animGatilhos = lerp(window.animGatilhos, window.estadoManutencaoGatilhos ? 15 : 0, 0.1);
  window.animAnalogicos = lerp(window.animAnalogicos, window.estadoManutencaoAnalogicos ? 12 : 0, 0.1);
  window.animBotoes = lerp(window.animBotoes, window.estadoManutencaoBotoes ? 10 : 0, 0.1);


  if (typeof window.smLx === 'undefined') {
    window.smLx = 0; window.smLy = 0; window.smRx = 0; window.smRy = 0;
  }
  window.smLx = lerp(window.smLx, gamepadState.lx, 0.3);
  window.smLy = lerp(window.smLy, gamepadState.ly, 0.3);
  window.smRx = lerp(window.smRx, gamepadState.rx, 0.3);
  window.smRy = lerp(window.smRy, gamepadState.ry, 0.3);

  // Iluminação
  ambientLight(90);
  directionalLight(180, 180, 180, 0, 0.5, -1);
  directionalLight(120, 120, 120, 0, -0.2, 1);
  pointLight(100, 100, 100, 0, -200, 200);

  push();
  scale(3.2);

  // CARCAÇA
  push();
  scale(1.02, 1.05, 1.08); 
  fill(corCarcaca); 
  specularMaterial(80); 
  shininess(30);        
  desenharMalhaCache(); 
  pop();

  // ANALÓGICO ESQ
  fill(20, 20, 22); ambientMaterial(20); specularMaterial(15); shininess(5);
  push();
  translate(-26, -4, 16 + window.animAnalogicos); 
  scale(0.85); 
  rotateX(1.571); 
  
  rotateX(-window.smLy * 0.4); 
  rotateZ(window.smLx * 0.4);
  
  push(); scale(1, 0.4, 1); sphere(7.5); pop();       
  push(); translate(0, -4, 0); cylinder(2.2, 6); pop(); 
  push(); translate(0, -7.0, 0); cylinder(6.8, 1.2); pop(); // Grip largo côncavo Pro
  pop();

  // D-PAD
  push();
  translate(-14, 14, 14.0 + window.animBotoes); 
  
  let tiltX = (gamepadState.dpadUp ? 0.22 : 0) - (gamepadState.dpadDown ? 0.22 : 0);
  let tiltZ = (gamepadState.dpadLeft ? 0.22 : 0) - (gamepadState.dpadRight ? 0.22 : 0);
  let pressDPad = (gamepadState.dpadUp || gamepadState.dpadDown || gamepadState.dpadLeft || gamepadState.dpadRight) ? -0.8 : 0;

  rotateX(PI / 24 + tiltX - 0.15); 
  rotateY(-0.1); 
  rotateZ(tiltZ);
  translate(0, 0, pressDPad);

  fill(30); specularMaterial(30); shininess(20);
  let bw_dp = 4.2, bh_dp = 13.5, bd_dp = 2.5;
  push(); translate(0, 0, 0.5); box(bw_dp, bh_dp, bd_dp); pop();
  push(); translate(0, 0, 0.5); box(bh_dp, bw_dp, bd_dp); pop();
  pop();

  // ANALÓGICO DIR
  fill(20, 20, 22);
  push();
  translate(14, 12, 16 + window.animAnalogicos); 
  scale(0.85); 
  rotateX(1.571); 
  rotateY(0.1); 

  rotateX(-window.smRy * 0.4); 
  rotateZ(window.smRx * 0.4);
  
  push(); scale(1, 0.4, 1); sphere(7.5); pop();       
  push(); translate(0, -4, 0); cylinder(2.2, 6); pop(); 
  push(); translate(0, -7.0, 0); cylinder(6.8, 1.2); pop(); 
  pop();

  // BOTÕES ABXY 
  push();
  translate(31, -2, 14.5 + window.animBotoes); 
  
  rotateY(0.08); 
  rotateX(0.15);

  let rb_act = 4.2, db_act = 7.8, ab_act = 1.4; 
  fill(35, 35, 38); specularMaterial(200); shininess(60); 
  
  push(); translate(0, -db_act, (gamepadState.btnTriangle ? -1.5 : 0) + 0.2); rotateX(PI / 2); cylinder(rb_act, ab_act); pop(); 
  push(); translate(0, db_act, (gamepadState.btnCross ? -1.5 : 0) - 0.2); rotateX(PI / 2); cylinder(rb_act, ab_act); pop();  
  push(); translate(-db_act, 0, (gamepadState.btnSquare ? -1.5 : 0) - 0.4); rotateX(PI / 2); cylinder(rb_act, ab_act); pop(); 
  push(); translate(db_act, 0, (gamepadState.btnCircle ? -1.5 : 0) + 0.5); rotateX(PI / 2); cylinder(rb_act, ab_act); pop();  
  pop();

  // BOTÕES GERAIS
  fill(20); specularMaterial(10);
  push(); translate(-9, -12, 13.8 + window.animBotoes); rotateX(0.2); box(3, 1, 1); pop();
  push(); translate(9, -12, 13.8 + window.animBotoes); rotateX(0.2); box(3, 1, 1); box(1, 3, 1); pop();
  push(); translate(-7, 1, 14.0 + window.animBotoes); rotateX(PI/12); box(2, 2, 0.8); pop();
  push(); translate(7, 1, 14.0 + window.animBotoes); rotateX(PI/12); rotateX(PI/2); cylinder(1.5, 0.8); pop();

  // BUMPERS L / R 
  fill(20, 20, 25); specularMaterial(120); shininess(40);
  
  // Bumper L
  push(); 
  translate(-24, -23.5 + (gamepadState.l1 ? 1.8 : 0) - window.animGatilhos, 1.0); 
  rotateX(1.35); rotateY(-0.15); 
  box(22, 5, 10); 
  pop();
  
  // Bumper R
  push(); 
  translate(24, -23.5 + (gamepadState.r1 ? 1.8 : 0) - window.animGatilhos, 1.0); 
  rotateX(1.35); rotateY(0.15); 
  box(22, 5, 10); 
  pop();

  // GATILHOS ZL / ZR
  
  // Gatilho ZL
  push(); 
  translate(-25, -18.5 + (gamepadState.l2 * 2.2) - window.animGatilhos, -3.0); 
  rotateX(0.45); rotateY(-0.10); 
  translate(0, -2, -4); 
  box(18, 16, 12); 
  pop();
  
  // Gatilho ZR
  push(); 
  translate(25, -18.5 + (gamepadState.r2 * 2.2) - window.animGatilhos, -3.0); 
  rotateX(0.45); rotateY(0.10); 
  translate(0, -2, -4);
  box(18, 16, 12); 
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

function windowResized() { resizeCanvas(windowWidth, windowHeight); }