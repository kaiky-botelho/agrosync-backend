const {
  atualizarMonitoramentoTalhoesAutomaticamente
} = require("../services/monitoramentoService");

let intervaloMonitoramento = null;

function iniciarMonitoramentoAutomatico() {
  if (intervaloMonitoramento) {
    return;
  }

  console.log("Monitoramento automático iniciado.");

  atualizarMonitoramentoTalhoesAutomaticamente().catch((error) => {
    console.error("Erro no monitoramento automático inicial:", error.message);
  });

  intervaloMonitoramento = setInterval(async () => {
    try {
      await atualizarMonitoramentoTalhoesAutomaticamente();
      console.log("Monitoramento automático executado.");
    } catch (error) {
      console.error("Erro no monitoramento automático:", error.message);
    }
  }, 60 * 1000);
}

module.exports = {
  iniciarMonitoramentoAutomatico
};