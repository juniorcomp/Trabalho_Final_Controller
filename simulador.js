// ==========================================
// MOTOR DE SIMULAÇÃO (GAMEPAD API)
// ==========================================

const gamepadState = {
    connected: false,
    // Analógicos (-1.0 a 1.0)
    lx: 0, ly: 0, 
    rx: 0, ry: 0, 
    // Gatilhos (0.0 a 1.0)
    l2: 0, r2: 0, 
    // Botões (Boolean)
    btnCross: false, btnCircle: false, btnSquare: false, btnTriangle: false,
    l1: false, r1: false
};

// Evento: Controle Conectado
window.addEventListener("gamepadconnected", (e) => {
    console.log("🎮 Controle Conectado:", e.gamepad.id);
    gamepadState.connected = true;
    
    // Atualiza a UI do HTML
    const statusText = document.getElementById('gp-status');
    if(statusText) {
        statusText.innerText = "✅ Controle Sincronizado!";
        statusText.style.color = "#2a9d8f"; // Fica verde
    }
});

// Evento: Controle Desconectado
window.addEventListener("gamepaddisconnected", (e) => {
    console.log("❌ Controle Desconectado");
    gamepadState.connected = false;
    
    // Atualiza a UI do HTML
    const statusText = document.getElementById('gp-status');
    if(statusText) {
        statusText.innerText = "❌ Conexão Perdida";
        statusText.style.color = "#f33a6a"; // Volta a ficar vermelho
    }
});

// Função para ler o controle a cada frame do p5.js
function pollGamepads() {
    if (!gamepadState.connected) return;
    
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0]; // Pega o primeiro controle conectado
    
    if (!gp) return;

    // Lendo os Analógicos (Eixos 0, 1, 2, 3)
    gamepadState.lx = gp.axes[0] || 0;
    gamepadState.ly = gp.axes[1] || 0;
    gamepadState.rx = gp.axes[2] || 0;
    gamepadState.ry = gp.axes[3] || 0;

    // Lendo os Gatilhos L2 e R2 (Eixos 6 e 7 ou Botões analógicos)
    gamepadState.l2 = gp.buttons[6]?.value || 0;
    gamepadState.r2 = gp.buttons[7]?.value || 0;

    // Lendo o D-Pad (NOVO - Adicione estas 4 linhas)
    gamepadState.dpadUp = gp.buttons[12]?.pressed || false;
    gamepadState.dpadDown = gp.buttons[13]?.pressed || false;
    gamepadState.dpadLeft = gp.buttons[14]?.pressed || false;
    gamepadState.dpadRight = gp.buttons[15]?.pressed || false;

    // Lendo os Botões de Ação (Mapeamento Padrão)
    gamepadState.btnCross = gp.buttons[0]?.pressed || false;    // X / A
    gamepadState.btnCircle = gp.buttons[1]?.pressed || false;   // Círculo / B
    gamepadState.btnSquare = gp.buttons[2]?.pressed || false;   // Quadrado / X
    gamepadState.btnTriangle = gp.buttons[3]?.pressed || false; // Triângulo / Y

    // Lendo os Bumpers L1 e R1
    gamepadState.l1 = gp.buttons[4]?.pressed || false;
    gamepadState.r1 = gp.buttons[5]?.pressed || false;
}