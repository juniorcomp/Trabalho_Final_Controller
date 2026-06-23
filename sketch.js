let nivelSubdivisao = 0;
let corCarcaca; // cor selecionada no HTML
const PANEL_WIDTH = 480;

// malha branca
let malhaVerticesBranca = [
  // FRENTE
  [-56, -28,  15], // 0: Ombro Esq Ext 
  [-26, -32,  15], // 1: Peito Esq 
  [ 26, -32,  15], // 2: Peito Dir 
  [ 56, -28,  15], // 3: Ombro Dir Ext 
  [-76,  10,  15], // 4: Meio Pega Esq 
  [-25,  15,  15], // 5: Barriga Esq 
  [ 25,  15,  15], // 6: Barriga Dir 
  [ 76,  10,  15], // 7: Meio Pega Dir 
  [-64,  95,   5], // 8: Ponta Esq 
  [-32,  48,  15], // 9: Curva Interna Esq
  [ 32,  48,  15], // 10: Curva Interna Dir
  [ 64,  95,   5], // 11: Ponta Dir 

  // COSTAS
  [-52, -23, -15], // 12: Ombro Esq Ext
  [-26, -27, -15], // 13: Costas Esq 
  [ 26, -27, -15], // 14: Costas Dir 
  [ 52, -23, -15], // 15: Ombro Dir Ext
  [-72,  10, -15], // 16: Meio Pega Esq Ext
  [-25,  40, -15], // 17: Fundo Barriga Esq
  [ 25,  40, -15], // 18: Fundo Barriga Dir
  [ 72,  10, -15], // 19: Meio Pega Dir Ext
  [-58,  90,  -5], // 20: Ponta Esq Fundo
  [-28,  42, -15], // 21: Curva Interna Esq Fundo
  [ 28,  42, -15], // 22: Curva Interna Dir Fundo
  [ 58,  90,  -5]  // 23: Ponta Dir Fundo
];

// malha preta 
let malhaVerticesPreta = [
  [-56, -28,  15], [-26, -32,  15], [ 26, -32,  15], [ 56, -28,  15], 
  [-76,  10,  15], [-25,  15,  15], [ 25,  15,  15], [ 76,  10,  15], 
  [-64,  95,   5], [-32,  48,  15], [ 32,  48,  15], [ 64,  95,   5], 

  [-52, -23, -15], [-26, -27, -15], [ 26, -27, -15], [ 52, -23, -15], 
  [-72,  10, -15], [-25,  15, -15], [ 25,  15, -15], [ 72,  10, -15], 
  [-58,  90,  -5], [-28,  42, -15], [ 28,  42, -15], [ 58,  90,  -5]
];

let malhaFaces = [
  [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [4, 8, 9, 5], [6, 10, 11, 7],
  [12, 13, 17, 16], [13, 14, 18, 17], [14, 15, 19, 18], [16, 17, 21, 20], [18, 19, 23, 22],
  [0, 1, 13, 12], [1, 2, 14, 13], [2, 3, 15, 14], 
  [15, 3, 7, 19], [19, 7, 11, 23], [11, 23, 22, 10], 
  [10, 22, 18, 6], [6, 18, 17, 5], [5, 17, 21, 9], 
  [9, 21, 20, 8], [8, 20, 16, 4], [4, 16, 12, 0]
];

let normaisBranca = [];
let normaisPreta = [];

function setup() {
  let cnv = createCanvas(max(100, windowWidth - PANEL_WIDTH), windowHeight, WEBGL);
  cnv.position(0, 0);
  cnv.style('display', 'block');
  noStroke();
  
  corCarcaca = color(245, 245, 250); 
  
  // Suavização Catmull-Clark ou seja 4 vezes direto no carregamento para as udas malhas
  for (let i = 0; i < 4; i++) {
    let resultadoBranca = subdividirCatmullClark(malhaVerticesBranca, malhaFaces);
    malhaVerticesBranca = resultadoBranca.vertices;
    
    let resultadoPreta = subdividirCatmullClark(malhaVerticesPreta, malhaFaces);
    malhaVerticesPreta = resultadoPreta.vertices;
    
    malhaFaces = resultadoBranca.faces; 
    nivelSubdivisao++;
  }
  
  atualizarNormaisDuplas();

  window.atualizarCorControle = function(corHex) {
    corCarcaca = color(corHex);
  };
}

function atualizarNormaisDuplas() {
  normaisBranca = calcularNormaisParaMalha(malhaVerticesBranca, malhaFaces);
  normaisPreta = calcularNormaisParaMalha(malhaVerticesPreta, malhaFaces);
}

function calcularNormaisParaMalha(vertices, faces) { // necessário para iluminação
  let normais = Array(vertices.length).fill().map(() => createVector(0, 0, 0));
  for (let i = 0; i < faces.length; i++) { // percorre a malha de vertices
    let f = faces[i]; 
    if (f.length >= 3) {  // produto vetorial
      let v0 = createVector(vertices[f[0]][0], vertices[f[0]][1], vertices[f[0]][2]);
      let v1 = createVector(vertices[f[1]][0], vertices[f[1]][1], vertices[f[1]][2]);
      let v2 = createVector(vertices[f[2]][0], vertices[f[2]][1], vertices[f[2]][2]);
      let n = p5.Vector.sub(v1, v0).cross(p5.Vector.sub(v2, v0)).normalize();
      for (let j = 0; j < f.length; j++) normais[f[j]].add(n); // suavização 
    }
  }
  for (let n of normais) n.normalize(); // normalização 
  return normais;
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
  
  if (typeof window.smLx === 'undefined') {
    window.smLx = 0; window.smLy = 0; window.smRx = 0; window.smRy = 0;
  }
  // Interpolador para deixar o movimento dos analógicos fluido
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
  ambientLight(150);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  directionalLight(140, 140, 150, -0.8, -0.2, -0.5);
  pointLight(255, 255, 255, 0, 0, 300);

  push();
  scale(3.2);

  //CARCAÇA BRANCA
  push();
  scale(0.92, 1.0, 1.05); 
  fill(corCarcaca); 
  specularMaterial(255); 
  shininess(90);
  desenharMalhaCache(malhaVerticesBranca, normaisBranca); 
  pop();

  //CARCAÇA PRETA
  push();
  translate(0, 19, 7.0); 
  rotateX(-0.05); 
  scale(0.87, 0.68, 0.35); 
  fill(25, 25, 30); specularMaterial(15); shininess(10);
  desenharMalhaCache(malhaVerticesPreta, normaisPreta); 
  pop();

  // TOUCHPAD
  push();
  translate(0, -15, 14.75); 
  rotateX(PI / 64); 

  let tpLargura = 32.5; 
  let tpAltura = 46; 
  let curvX = 0.002; 
  let curvY = 0.004; 

  fill(0, 20, 180); 
  ambientMaterial(0, 20, 180); 
  specularMaterial(50); noStroke(); 
  desenharContornoNeonParametrico(tpLargura, tpAltura, curvX, curvY, 0.50);
  pop();

  //ANALÓGICOS
  fill(25, 25, 30); ambientMaterial(25); specularMaterial(30); shininess(15); 
  
  // esquerdo
  push();
  translate(-13, 20, 17.0 + window.animAnalogicos); 
  scale(0.85);
  rotateX((PI / 2) - (gamepadState.ly * 0.4)); 
  rotateZ(gamepadState.lx * 0.4);
  
  push(); scale(1, 0.4, 1); sphere(7.5); pop();       
  push(); translate(0, -4, 0); cylinder(2.5, 6); pop(); 
  push(); translate(0, -7.5, 0); cylinder(6.5, 1.5); pop(); 
  pop();

  // direito
  push();
  translate(13, 20, 17.0 + window.animAnalogicos); 
  scale(0.85); 
  rotateX((PI / 2) - (gamepadState.ry * 0.4)); 
  rotateZ(gamepadState.rx * 0.4);
  
  push(); scale(1, 0.4, 1); sphere(7.5); pop();       
  push(); translate(0, -4, 0); cylinder(2.5, 6); pop(); 
  push(); translate(0, -7.5, 0); cylinder(6.5, 1.5); pop(); 
  pop();

 // D-PAD 
  push();
  translate(-32, 0, 14.5 + window.animBotoes); 
  rotateX(-PI / 32); rotateY(-PI / 24); 
  
  fill(245, 245, 250); specularMaterial(255); shininess(85);
  let bw_dp = 6.6, bh_dp = 7.8, bd_dp = 3.0, gap_dp = 5; 
  let girarX = 0.25;  
  let afundarZ = -0.6; 

  push(); translate(0, -gap_dp, 0); rotateZ(PI);       
  rotateX(0.15 + (gamepadState.dpadUp ? girarX : 0)); 
  translate(0, 0, gamepadState.dpadUp ? afundarZ : 0); 
  desenharSeta3D(bw_dp, bh_dp, bd_dp); pop(); 
  
  push(); translate(0, gap_dp, 0);  rotateZ(0);        
  rotateX(0.15 + (gamepadState.dpadDown ? girarX : 0)); 
  translate(0, 0, gamepadState.dpadDown ? afundarZ : 0); 
  desenharSeta3D(bw_dp, bh_dp, bd_dp); pop(); 
  
  push(); translate(-gap_dp, 0, 0); rotateZ(HALF_PI);  
  rotateX(0.15 + (gamepadState.dpadLeft ? girarX : 0)); 
  translate(0, 0, gamepadState.dpadLeft ? afundarZ : 0); 
  desenharSeta3D(bw_dp, bh_dp, bd_dp); pop(); 
  
  push(); translate(gap_dp, 0, 0);  rotateZ(-HALF_PI); 
  rotateX(0.15 + (gamepadState.dpadRight ? girarX : 0)); 
  translate(0, 0, gamepadState.dpadRight ? afundarZ : 0); 
  desenharSeta3D(bw_dp, bh_dp, bd_dp); pop(); 
  pop();

  // botões de ação 
  push();
  translate(32, 1.5, 14.5 + window.animBotoes); 
  fill(245, 245, 250); specularMaterial(255); shininess(150); 
  let rb_act = 3.5, db_act = 7.5, hb_act = 1.8; 
  
  push(); translate(0, -db_act, 0); rotateX(PI / 2); translate(0, gamepadState.btnTriangle ? 1.0 : 0, 0); cylinder(rb_act, hb_act); pop(); 
  push(); translate(0, db_act, 0);  rotateX(PI / 2); translate(0, gamepadState.btnCross ? 1.0 : 0, 0); cylinder(rb_act, hb_act); pop(); 
  push(); translate(-db_act, 0, 0); rotateX(PI / 2); translate(0, gamepadState.btnSquare ? 1.0 : 0, 0); cylinder(rb_act, hb_act); pop(); 
  push(); translate(db_act, 0, 0);  rotateX(PI / 2); translate(0, gamepadState.btnCircle ? 1.0 : 0, 0); cylinder(rb_act, hb_act); pop(); 
  pop();

  // L1
  push(); 
  translate(-38, -24.0 + (gamepadState.l1 ? 1.2 : 0) - window.animGatilhos, 5.0 - (gamepadState.l1 ? 0.5 : 0)); 
  rotateX(1.30);  
  rotateY(-0.20); 
  rotateZ(1.57); 
  scale(3, 0.6, 1.5); 
  cylinder(2, 25); 
  pop();
  // R1
  push(); 
  translate(38, -24.0 + (gamepadState.r1 ? 1.2 : 0) - window.animGatilhos, 5.0 - (gamepadState.r1 ? 0.5 : 0)); 
  rotateX(1.30); 
  rotateY(0.20);  
  rotateZ(1.57); 
  scale(3, 0.6, 1.5); 
  cylinder(2, 25); 
  pop();

  // L2
  fill(12, 12, 15); ambientMaterial(12); specularMaterial(40); shininess(20);
  
  push(); 
  translate(-37.5, -22.5 + (gamepadState.l2 * 1.5) - window.animGatilhos, -4.5 - (gamepadState.l2 * 0.5)); 
  rotateX(0.50); 
  rotateY(-0.20); 
  rotateZ(1.57); 
  scale(1, 1.4, 2.2); 
  cylinder(3.5, 12); 
  pop();
  // R2 
  push(); 
  translate(37.5, -22.5 + (gamepadState.r2 * 1.5) - window.animGatilhos, -4.5 - (gamepadState.r2 * 0.5)); 
  rotateX(0.50); 
  rotateY(0.20); 
  rotateZ(1.57); 
  scale(1, 1.4, 2.2); 
  cylinder(3.5, 12); 
  pop();

  pop();
}

// obtenção da malha na memória
function desenharMalhaCache(vertices, normais) {
  beginShape(TRIANGLES);
  for (let i = 0; i < malhaFaces.length; i++) {
    let f = malhaFaces[i]; let indices = [0, 1, 2, 0, 2, 3];
    for (let j = 0; j < 6; j++) {
      let idx = f[indices[j]];
      normal(normais[idx].x, normais[idx].y, normais[idx].z);
      vertex(vertices[idx][0], vertices[idx][1], vertices[idx][2]);
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
      let n = p5.Vector.sub(v1, v0).cross(p5.Vector.sub(v2, v0)).normalize();
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
          ex += facePoints[adjFaces[0]][0] + facePoints[adjFaces[1]][0]; ey += facePoints[adjFaces[0]][1] + facePoints[adjFaces[1]][1]; ez += facePoints[adjFaces[0]][2] + facePoints[adjFaces[1]][2];
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
    for (let fIdx of vertexFaces[i]) { 
      Fx += facePoints[fIdx][0]; Fy += facePoints[fIdx][1]; Fz += facePoints[fIdx][2]; 
    }
    Fx /= n; Fy /= n; Fz /= n;
    let Rx = 0, Ry = 0, Rz = 0;
    for (let eKey of vertexEdges[i]) {
      let pts = eKey.split("-").map(Number);
      Rx += (vertices[pts[0]][0] + vertices[pts[1]][0]) / 2; Ry += (vertices[pts[0]][1] + vertices[pts[1]][1]) / 2; Rz += (vertices[pts[0]][2] + vertices[pts[1]][2]) / 2;
    }
    Rx /= n; Ry /= n; Rz /= n;
    let vx = (Fx + 2 * Rx + (n - 3) * vertices[i][0]) / n; 
    let vy = (Fy + 2 * Ry + (n - 3) * vertices[i][1]) / n; 
    let vz = (Fz + 2 * Rz + (n - 3) * vertices[i][2]) / n;
    oldVertexNewPos.push([vx, vy, vz]);
  }
  let novosVertices = oldVertexNewPos.concat(facePoints), facePointOffset = vertices.length, edgeIndexMap = new Map();
  for (let [key, val] of edgePoints.entries()) { 
    edgeIndexMap.set(key, novosVertices.length); novosVertices.push(val); 
  }
  let novasFaces = [];
  for (let i = 0; i < faces.length; i++) {
    let f = faces[i], fpIdx = facePointOffset + i;
    for (let j = 0; j < f.length; j++) {
      let v1 = f[j], v2 = f[(j + 1) % f.length], v0 = f[(j - 1 + f.length) % f.length];
      let edge1Key = Math.min(v1, v2) + "-" + Math.max(v1, v2); let edge0Key = Math.min(v0, v1) + "-" + Math.max(v0, v1);
      novasFaces.push([v1, edgeIndexMap.get(edge1Key), fpIdx, edgeIndexMap.get(edge0Key)]);
    }
  }
  return { vertices: novosVertices, faces: novasFaces };
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }


// funcao touchpad
function desenharContornoNeonParametrico(w, h, a, b, espessura) {
  let w2 = w / 2; 
  let h2 = h / 2; 
  let r = 5.5; 
  let passo = 0.15; 
  let passoAngulo = 0.05; 
  let aberturaTopo = 16.0; 

  let colocarPontoSólido = (x, y) => {
    let z = -(a * x*x + b * y*y);
    let dobraZ = 0; 
    let curvaY = 0; 
    
    // inicio da curva
    let inicioDobra = -h2 * 0.2; 
    
    if (y < inicioDobra) {
      let tDobra = map(y, inicioDobra, -h2, 0, 1);
      
      // dobra z para a tampa na parte de tras
      dobraZ = -18.0 * (tDobra * tDobra); 
      
      // dpbra a cirva para baixo
      curvaY = 10.0 * (tDobra * tDobra); 
    }
    
    push(); translate(x, y + curvaY, z + dobraZ); sphere(espessura); pop();
  };
  // coloca a sequencia de pontos 
  for (let x = -w2 + r; x <= w2 - r; x += passo) 
    colocarPontoSólido(x, h2);
  for(let ang = 0; ang <= HALF_PI; ang += passoAngulo) 
    colocarPontoSólido(w2 - r + cos(ang)*r, h2 - r + sin(ang)*r); 
  for(let ang = HALF_PI; ang <= PI; ang += passoAngulo) 
    colocarPontoSólido(-w2 + r + cos(ang)*r, h2 - r + sin(ang)*r); 
  for (let y = h2 - r; y >= -h2 + r; y -= passo) {
    let t = map(y, h2 - r, -h2, 0, 1); let curvaLateral = aberturaTopo * (t * t); 
    colocarPontoSólido(w2 + curvaLateral, y); 
    colocarPontoSólido(-w2 - curvaLateral, y); 
  }
  let tTopo = map(-h2 + r, h2 - r, -h2, 0, 1); 
  let flareTopo = aberturaTopo * (tTopo * tTopo);
  let cxDireito = w2 + flareTopo - r; 
  let cxEsquerdo = -w2 - flareTopo + r; 
  let cyTopo = -h2 + r;
  for(let ang = 0; ang >= -HALF_PI; ang -= passoAngulo) 
    colocarPontoSólido(cxDireito + cos(ang)*r, cyTopo + sin(ang)*r);
  for(let ang = PI; ang <= PI + HALF_PI; ang += passoAngulo) 
    colocarPontoSólido(cxEsquerdo + cos(ang)*r, cyTopo + sin(ang)*r);
  for (let x = cxEsquerdo; x <= cxDireito; x += passo) 
    colocarPontoSólido(x, -h2);
}

// geometria do d pad
function desenharSeta3D(w, h, d) {
  let z = d / 2; let yBase = h / 2; 
  let yPonta = -h / 2; 
  let yCorte = 0; let x = w / 2;
  
  beginShape(TRIANGLES);
  normal(0, 0, 1); 
  vertex(-x, yBase, z); 
  vertex(x, yBase, z); 
  vertex(x, yCorte, z); 
  vertex(-x, yBase, z); 
  vertex(x, yCorte, z); 
  vertex(-x, yCorte, z); 
  vertex(-x, yCorte, z); 
  vertex(x, yCorte, z); 
  vertex(0, yPonta, z);
  normal(0, 0, -1); 
  vertex(-x, yBase, -z); 
  vertex(x, yCorte, -z); 
  vertex(x, yBase, -z); 
  vertex(-x, yBase, -z); 
  vertex(-x, yCorte, -z); 
  vertex(x, yCorte, -z); 
  vertex(-x, yCorte, -z); 
  vertex(0, yPonta, -z); 
  vertex(x, yCorte, -z);
  endShape();

  beginShape(QUADS);
  normal(1, 0, 0); 
  vertex(x, yBase, z); 
  vertex(x, yBase, -z); 
  vertex(x, yCorte, -z); 
  vertex(x, yCorte, z);
  normal(-1, 0, 0); 
  vertex(-x, yBase, z); 
  vertex(-x, yCorte, z); 
  vertex(-x, yCorte, -z); 
  vertex(-x, yBase, -z);
  let nTR = createVector(yBase, -x, 0).normalize(); 
  normal(nTR.x, nTR.y, 0); vertex(x, yCorte, z); 
  vertex(x, yCorte, -z); vertex(0, yPonta, -z); 
  vertex(0, yPonta, z);
  let nTL = createVector(-yBase, -x, 0).normalize(); 
  normal(nTL.x, nTL.y, 0); vertex(-x, yCorte, z); 
  vertex(0, yPonta, z); vertex(0, yPonta, -z); 
  vertex(-x, yCorte, -z);
  normal(0, 1, 0); 
  vertex(-x, yBase, z); 
  vertex(-x, yBase, -z); 
  vertex(x, yBase, -z); 
  vertex(x, yBase, z);
  endShape();
}

function windowResized() {
  resizeCanvas(max(100, windowWidth - PANEL_WIDTH), windowHeight);
}