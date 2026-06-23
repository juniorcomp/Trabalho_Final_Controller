let nivelSubdivisao = 0;
let corCarcaca; 
const PANEL_WIDTH = 480;


// malha carcaça
let malhaVertices = [
  // FRENTE
  [-50, -28,  15], // 0: Ombro Esq Ext
  [-25, -32,  15], // 1: Peito Esq 
  [ 25, -32,  15], // 2: Peito Dir 
  [ 50, -28,  15], // 3: Ombro Dir Ext
  [-65,  12,  15], // 4: Meio Pega Esq Ext 
  [-25,  38,  15], // 5: Barriga Esq 
  [ 25,  38,  15], // 6: Barriga Dir 
  [ 65,  12,  15], // 7: Meio Pega Dir Ext 
  [-85,  70,  15], // 8: Ponta Esq 
  [-35,  55,  15], // 9: Curva Interna Esq
  [ 35,  55,  15], // 10: Curva Interna Dir 
  [ 85,  70,  15], // 11: Ponta Dir 

  // COSTAS
  [-45, -23, -15], // 12: Ombro Esq Ext
  [-25, -27, -15], // 13: Costas Esq 
  [ 25, -27, -15], // 14: Costas Dir 
  [ 45, -23, -15], // 15: Ombro Dir Ext
  [-55,  12, -15], // 16: Meio Pega Esq Ext
  [-25,  38, -15], // 17: Fundo Barriga Esq
  [ 25,  38, -15], // 18: Fundo Barriga Dir 
  [ 55,  12, -15], // 19: Meio Pega Dir Ext
  [-75,  65, -15], // 20: Ponta Esq Fundo
  [-25,  50, -15], // 21: Curva Interna Esq Fundo
  [ 25,  50, -15], // 22: Curva Interna Dir Fundo
  [ 75,  65, -15]  // 23: Ponta Dir Fundo
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
  
  corCarcaca = color(245, 245, 250); 
  
  // Catmull-Clark 4 vezes direto no carregamento
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
  
  // Interpolador para deixar o movimento dos analógicos fluido  
  if (typeof window.smLx === 'undefined') {
    window.smLx = 0; window.smLy = 0; window.smRx = 0; window.smRy = 0;
  }
  window.smLx = lerp(window.smLx, gamepadState.lx, 0.3);
  window.smLy = lerp(window.smLy, gamepadState.ly, 0.3);
  window.smRx = lerp(window.smRx, gamepadState.rx, 0.3);
  window.smRy = lerp(window.smRy, gamepadState.ry, 0.3);

  // motor de animação na manutenção
  if (typeof window.animGatilhos === 'undefined') {
    window.animGatilhos = 0; window.animAnalogicos = 0; window.animBotoes = 0;
  }
  
  window.animGatilhos = lerp(window.animGatilhos, window.estadoManutencaoGatilhos ? 15 : 0, 0.1);
  window.animAnalogicos = lerp(window.animAnalogicos, window.estadoManutencaoAnalogicos ? 12 : 0, 0.1);
  window.animBotoes = lerp(window.animBotoes, window.estadoManutencaoBotoes ? 10 : 0, 0.1);


  // Iluminação de Estúdio Refinada
  ambientLight(100);
  directionalLight(200, 200, 200, 0, 0.5, -1);
  directionalLight(120, 120, 120, 0, -0.2, 1);
  directionalLight(180, 180, 180, 1, 0, 0);   
  directionalLight(180, 180, 180, -1, 0, 0);   
  pointLight(120, 120, 120, 0, -200, 200);

  push();
  scale(3.2);

  // CARCAÇA PRINCIPAL
  push();
  scale(1.02, 1.05, 1.08); 
  fill(corCarcaca); 
  specularMaterial(70); 
  shininess(25);        
  desenharMalhaCache(); 
  pop();

  // ANALÓGICO ESQ
  fill(25, 25, 28); ambientMaterial(25); specularMaterial(10); shininess(5); 
  push();
  translate(-28, -5, 17.5 + window.animAnalogicos); 
  scale(0.85); 
  rotateX(1.571); // 90 graus
  
  rotateX(-window.smLy * 0.4); 
  rotateZ(window.smLx * 0.4);
  
  push(); scale(1, 0.4, 1); sphere(7.5); pop();       
  push(); translate(0, -5, 0); cylinder(2.5, 7); pop(); 
  push(); translate(0, -8.5, 0); cylinder(6.5, 1.5); pop(); 
  pop();

  // D-PAD 
  push();
  translate(-14, 15.5, 17 + window.animBotoes); 
  
  let tiltX = (gamepadState.dpadUp ? 0.25 : 0) - (gamepadState.dpadDown ? 0.25 : 0);
  let tiltZ = (gamepadState.dpadLeft ? 0.25 : 0) - (gamepadState.dpadRight ? 0.25 : 0);
  let afundarDPad = (gamepadState.dpadUp || gamepadState.dpadDown || gamepadState.dpadLeft || gamepadState.dpadRight) ? -1.0 : 0;

  rotateX(PI / 16 + tiltX); 
  rotateY(0); 
  rotateZ(tiltZ);
  translate(0, 0, afundarDPad); 
  
  // Prato Base
  fill(35); specularMaterial(10); shininess(5);
  push(); rotateX(PI/2); cylinder(7.5, 3.5); pop();

  // boõtes em cruz
  fill(20); 
  let bw_dp = 3.8, bh_dp = 12.5, bd_dp = 3.5; 
  push(); translate(0, 0, 1.0); box(bw_dp, bh_dp, bd_dp); pop(); 
  push(); translate(0, 0, 1.0); box(bh_dp, bw_dp, bd_dp); pop(); 
  pop();

  // ANALÓGICO DIR
  fill(25, 25, 28); 
  push();
  translate(14, 14, 17.5 + window.animAnalogicos); 
  scale(0.85); 
  rotateX(1.571); 

  rotateX(-window.smRy * 0.4); 
  rotateZ(window.smRx * 0.4);
  
  push(); scale(1, 0.4, 1); sphere(7.5); pop();       
  push(); translate(0, -5, 0); cylinder(2.5, 7); pop(); 
  push(); translate(0, -8.5, 0); cylinder(6.5, 1.5); pop(); 
  pop();

  // BOTÕES AXYB
  push();
  translate(33, -3, 15.5 + window.animBotoes); 
  rotateX(PI / 42); rotateY(PI / 42); 

  let rb_act = 3.5, db_act = 7.0, ab_act = 1.2; 
  specularMaterial(255); shininess(100); 
  
  push(); fill(240, 200, 0); translate(0, -db_act, gamepadState.btnTriangle ? -0.5 : 0); rotateX(PI / 2); cylinder(rb_act, ab_act); pop(); 
  push(); fill(16, 124, 16); translate(0, db_act, gamepadState.btnCross ? -0.5 : 0); rotateX(PI / 2); cylinder(rb_act, ab_act); pop();  
  push(); fill(0, 100, 255); translate(-db_act, 0, gamepadState.btnSquare ? -0.5 : 0); rotateX(PI / 2); cylinder(rb_act, ab_act); pop(); 
  push(); fill(220, 20, 20); translate(db_act, 0, gamepadState.btnCircle ? -0.5 : 0); rotateX(PI / 2); cylinder(rb_act, ab_act); pop();  
  pop();

  //BOTÕES CENTRAIS
  let pressXbox = gamepadState.btnLogo ? 1.0 : 0; 
  let pressView = gamepadState.btnSelect ? 0.8 : 0;
  let pressMenu = gamepadState.btnStart ? 0.8 : 0;

  push();
  translate(0, -12, 13.5 + window.animBotoes); 
  rotateX(PI / 6);
  translate(0, 0, -pressXbox); 
  fill(20); specularMaterial(255); shininess(150);
  push(); rotateX(PI/2); cylinder(3, 1); pop();
  
  fill(255); emissiveMaterial(255);
  push(); translate(0, 0, 0.6); rotateX(PI/2); cylinder(3.5, 1); pop();
  pop();

  fill(20); specularMaterial(10); shininess(5);
  push(); translate(-8, -2, 15.5 + window.animBotoes); rotateX(PI / 8); translate(0, 0, -pressView); push(); rotateX(PI/2); cylinder(1.5, 1); pop(); pop(); 
  push(); translate( 8, -2, 15.5 + window.animBotoes); rotateX(PI / 8); translate(0, 0, -pressMenu); push(); rotateX(PI/2); cylinder(1.5, 1); pop(); pop(); 
  
  push(); translate(0, 8, 15.5 + window.animBotoes); rotateX(PI / 8); box(2.5, 2.5, 1); pop();

  // LB/RB
  fill(15, 15, 18); 
  specularMaterial(200, 200, 220); 
  shininess(80); 

  // Ponte central
  push(); translate(0, -25.5 - window.animGatilhos, 1.0); rotateX(1.4); box(20, 5, 8); pop();
  
  // LB
  push(); 
  translate(-22, -25.5 + (gamepadState.l1 ? 2.0 : 0) - window.animGatilhos, 1.0); 
  rotateX(1.4); 
  rotateY(-0.25); 
  box(20, 6, 12); 
  pop();
  
  // RB
  push(); 
  translate(22, -25.5 + (gamepadState.r1 ? 2.0 : 0) - window.animGatilhos, 1.0); 
  rotateX(1.4); 
  rotateY(0.25); 
  box(20, 6, 12); 
  pop();

  // LT/RT
  fill(20); specularMaterial(10); shininess(5);
  
  // LT
  push(); 
  translate(-24, -20.0 + (gamepadState.l2 ? 2.5 : 0) - window.animGatilhos, -3.0); 
  rotateX(0.5); 
  rotateY(-0.15); 
  translate(0, -2, -4); 
  box(16, 20, 14); 
  pop();
  
  // RT
  push(); 
  translate(24, -20.0 + (gamepadState.r2 ? 2.5 : 0) - window.animGatilhos, -3.0); 
  rotateX(0.5); 
  rotateY(0.15); 
  translate(0, -2, -4);
  box(16, 20, 14); 
  pop();
  
  pop();
}

// obtenção da malha na memória
function desenharMalhaCache() {
  beginShape(TRIANGLES);
  for (let i = 0; i < malhaFaces.length; i++) {
    let f = malhaFaces[i];
    let indicesTriangulos = [0, 1, 2, 0, 2, 3];
    for (let j = 0; j < 6; j++) {
      let idx = f[indicesTriangulos[j]];
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
    
    let eCount = vertexEdges[i].length;
    Rx /= eCount; Ry /= eCount; Rz /= eCount;

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