let saldoInicial = 1000;
let rodadasTotais = 100;
let numeroJogadores = 1; // Inicialmente, há apenas um jogador
let saldosJogadores = []; // Array para armazenar os saldos dos jogadores
let lucrosMaquinas = []; // Array para armazenar os lucros das máquinas
let rodadasJogadas = 0;
let vitorias = 0;
let derrotas = 0;
let simulating = false;
let paused = false;
let valorAposta = 100;
let chanceVitoriaMaquina = 0.51;
let step = false;
let chartType = 'line';

document.addEventListener("DOMContentLoaded", function() {
    criarGrafico();
    document.querySelector("#startButton").addEventListener("click", iniciarSimulacao);
    document.querySelector("#pauseButton").addEventListener("click", pausarSimulacao);
    document.querySelector("#stepButton").addEventListener("click", proximaRodada);
    document.querySelector("#resetButton").addEventListener("click", resetarSimulacao);

    // Adicionando um evento de escuta para o campo de entrada de número de jogadores
    document.querySelector("#numeroJogadoresInput").addEventListener("change", function() {
        // Chama a função para atualizar as informações sempre que houver uma alteração no número de jogadores
        numeroJogadores = parseInt(document.getElementById("numeroJogadoresInput").value);
        resetarSimulacao();
    });

    document.getElementById("chartTypeToggle").addEventListener("change", function() {
        const toggleCheckbox = document.getElementById("chartTypeToggle");
        let isChecked = toggleCheckbox.checked;
        chartType = isChecked === true ? 'bar' : 'line';
    });

    if (window.chart) {
        window.chart.destroy();
    }
    criarGrafico();
});

function resetarSimulacao() {
    if (window.chart) {
        window.chart.destroy();
    }
    criarGrafico();
    resetInfo(false);
    updateInfo();
    const resetButton = document.getElementById("resetButton");
    resetButton.disabled = true; // Desabilita novamente o botão após o reset

    const pauseButton = document.getElementById("pauseButton");
    pauseButton.innerText = "Pausar Simulação";
    pauseButton.classList.remove("paused");
    pauseButton.disabled = true; // Desativar o botão
    step = false;
    paused = false;
}

function iniciarSimulacao(steparg) {
    if (steparg != true) steparg = false;
    if (paused && steparg == false) pausarSimulacao();
    updateButtons();
    resetInfo(true,steparg);
    saldoInicial = parseFloat(document.getElementById("saldoInicialInput").value);
    rodadasTotais = parseInt(document.getElementById("rodadasTotaisInput").value);
    valorAposta = parseFloat(document.getElementById("valorApostaInput").value);
    chanceVitoriaMaquina = parseFloat(document.getElementById("porcentagemMaquinaInput").value) / 100;

    // Inicializa os arrays de saldos dos jogadores e lucros das máquinas
    saldosJogadores = Array(numeroJogadores).fill(saldoInicial);
    lucrosMaquinas = Array(numeroJogadores).fill(0);

    if (!window.chart) {
        criarGrafico();
    } else {
        window.chart.destroy();
        criarGrafico();
    }
    updateInfo();
    atualizarGrafico();

    executarRodada();
}

function gerarCorAleatoria() {
    const r = Math.floor(Math.random() * 200) + 55; // Componente vermelho
    const g = Math.floor(Math.random() * 200) + 55; // Componente verde
    const b = Math.floor(Math.random() * 200) + 55; // Componente azul
    return `rgba(${r},${g},${b}, 1)`; // Retorna a cor no formato rgba
}


function criarGrafico() {
    if(numeroJogadores > 1) {
        _fill = false;
    } else {
        _fill = true;
    }
    var ctx = document.getElementById('myChart').getContext('2d');
    window.chart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: [],
            datasets: [{
                fill: _fill,
            }]
        },
        options: {
            pointStyle: false,
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            scales: {
                y: {
                    suggestedMin: -1000, 
                    suggestedMax: 1000,
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'gray'
                    }
                },
                x: {
                    min: 0,
                    max: rodadasTotais,
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'white',
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  enabled: true
                }
                
            }
        }
    });

    // Adiciona um conjunto de dados para cada jogador
    for (let i = 0; i < numeroJogadores; i++) {
        const corAleatoria = gerarCorAleatoria();
        window.chart.data.datasets.push({
            label: 'Saldo do Jogador ' + (i + 1),
            data: [],
            backgroundColor: corAleatoria.replace('1)', '0.2)'), // Define a cor de fundo com opacidade reduzida
            borderColor: corAleatoria,
            borderWidth: 2,
            point: false
        });
    }
}


function atualizarGrafico() {
    if (window.chart) {
        for (let i = 0; i < numeroJogadores; i++) {
            window.chart.data.datasets[i].data.push(saldosJogadores[i]);
        }
        window.chart.data.labels.push(rodadasJogadas);
        window.chart.update();
    }
}

function executarRodada() {
    if (!simulating || (paused && step == false)) return;
    const resetButton = document.getElementById("resetButton");
    resetButton.disabled = false;
    const pauseButton = document.getElementById("pauseButton");
    pauseButton.disabled = false;
    const numeroJogadoresInput = document.getElementById("numeroJogadoresInput");
    numeroJogadoresInput.disabled = true;

    let jogadoresComSaldo = false;
    for (let i = 0; i < numeroJogadores; i++) {
        if (saldosJogadores[i] >= valorAposta) {
                jogadoresComSaldo = true;
                // Verificar se o jogador ganha ou perde na rodada
                if (Math.random() < chanceVitoriaMaquina) {
                    // Jogador perde
                    saldosJogadores[i] -= valorAposta;
                    lucrosMaquinas[i] += valorAposta;
                    derrotas++;
                } else {
                    // Jogador ganha
                    saldosJogadores[i] += valorAposta;
                    lucrosMaquinas[i] -= valorAposta;
                    vitorias++;
                }
            } else {
                console.log(`Jogador ${i+1} sem dinheiro para pagar a aposta`);
            }
        }

    // Atualizar o número de rodadas jogadas
    rodadasJogadas++;

    // Atualizar o gráfico com os novos saldos dos jogadores
    atualizarGrafico();
    updateInfo();

    // Verificar se o jogo acabou
    if (rodadasJogadas >= rodadasTotais || jogadoresComSaldo == false) {
        simulating = false;
        paused = false;
        console.log("O jogo acabou.");
        return;
    }
    
    // Aguardar 100ms antes de executar a próxima rodada
    if(step == true) {
        if (paused) {
            return;
        } else {
            return pausarSimulacao;   
        }
    } else {
        setTimeout(executarRodada, 100);
    }
}

function proximaRodada() {
    if (!simulating) {
            step = true;
            pausarSimulacao();
            paused = true;
            iniciarSimulacao(step);
        } else if (paused) {
        step = true;
        executarRodada();
    } else {
        executarRodada();
    }
}

function updateButtons() {
    const pauseButton = document.getElementById("pauseButton");
    if(paused) {
        pauseButton.innerText = "Despausar Simulação";
        pauseButton.classList.add("paused");
    }
    if(!paused) {
        pauseButton.innerText = "Pausar Simulação";
        pauseButton.classList.remove("paused");
    }
}

function pausarSimulacao() {
    const pauseButton = document.getElementById("pauseButton");
    if (!paused) {
        console.log("Simulação Pausada");
        pauseButton.innerText = "Despausar Simulação";
        pauseButton.classList.add("paused");
        return paused = true;
    } else {
        console.log("Simulação Despausada");
        pauseButton.innerText = "Pausar Simulação";
        pauseButton.classList.remove("paused");
        step = false;
        paused = false;
        return proximaRodada();
    }
}


function updateInfo() {
    const infoSaldoInicial = document.getElementById("infoTextCol1");
    const infoSaldoJogador = document.getElementById("infoTextCol2");
    const infoLucroJogador = document.getElementById("infoTextCol3");
    const infoLucroMaquina = document.getElementById("infoTextCol4");
    const infoRodadasApostadas = document.getElementById("infoTextCol5");
    const infoRodadasTotais = document.getElementById("infoTextCol6");
    const infoPorcentagemVitorias = document.getElementById("infoTextCol7");
    const infoPorcentagemDerrotas = document.getElementById("infoTextCol8");

    // Calcular saldo máximo do jogador e lucro mínimo da máquina
    let saldoMaximo = Math.max(...saldosJogadores);
    let lucroMinimo = Math.min(...lucrosMaquinas);

    // Calcular médias dos saldos dos jogadores e lucros das máquinas
    let saldoMedio = saldosJogadores.reduce((acc, curr) => acc + curr, 0) / numeroJogadores;
    let lucroMedio = lucrosMaquinas.reduce((acc, curr) => acc + curr, 0) / numeroJogadores;

    infoSaldoInicial.innerText = "Saldo Inicial do Jogador: " + saldoInicial;
    infoSaldoJogador.innerText = "Saldo Médio do Jogador: " + saldoMedio.toFixed(2);
    infoLucroJogador.innerText = "Lucro Mínimo da Máquina: " + lucroMinimo.toFixed(2);
    infoLucroMaquina.innerText = "Lucro Médio da Máquina: " + lucroMedio.toFixed(2);
    infoRodadasApostadas.innerText = "Rodadas Apostadas: " + rodadasJogadas;
    infoRodadasTotais.innerText = "Rodadas Totais: " + rodadasTotais;

    // Calcular e exibir a porcentagem de vitórias e derrotas
    const totalRodadas = vitorias + derrotas;
    const porcentagemVitorias = (vitorias / totalRodadas) * 100 || 0; // Evitar divisão por zero
    const porcentagemDerrotas = (derrotas / totalRodadas) * 100 || 0; // Evitar divisão por zero

    infoPorcentagemVitorias.innerText = "Porcentagem de Vitórias: " + porcentagemVitorias.toFixed(2) + "%";
    infoPorcentagemDerrotas.innerText = "Porcentagem de Derrotas: " + porcentagemDerrotas.toFixed(2) + "%";
}

function resetInfo(state, steparg) {
    rodadasJogadas = 0;
    vitorias = 0;
    derrotas = 0;
    simulating = state;
    paused = steparg;
    step = steparg;

    // Atualizar campos de entrada
    document.getElementById("saldoInicialInput").disabled = simulating;
    document.getElementById("porcentagemMaquinaInput").disabled = simulating;
    document.getElementById("rodadasTotaisInput").disabled = simulating;
    document.getElementById("valorApostaInput").disabled = simulating;
    document.getElementById("chartTypeToggle").disabled = simulating;
    document.getElementById("numeroJogadoresInput").disabled = simulating;
    updateInfo();
}