const apiUrl = 'https://mindicador.cl/api/';
const amountEl = document.getElementById('amount');
const fromCurrencyEl = document.getElementById('fromCurrency');
const toCurrencyEl = document.getElementById('toCurrency');
const resultEl = document.getElementById('result');
const convertBtn = document.getElementById('convert');
const historyCanvas = document.getElementById('historyChart');

let historyChartInstance;

async function convertCurrency() {
  const amount = parseFloat(amountEl.value);
  const fromCurrency = fromCurrencyEl.value;
  const toCurrency = toCurrencyEl.value;
  if (isNaN(amount)) {
    alert('intente ingresar una cantidad valida');
    return;
  }
  try {
    const fromResponse = await fetch(`${apiUrl}${fromCurrency}`);
    const toResponse = await fetch(`${apiUrl}${toCurrency}`);
    const fromData = await fromResponse.json();
    const toData = await toResponse.json();
    if (!fromData.serie || !toData.serie) {
      alert('Una o ambas monedas no están disponibles en los datos.');
      return;
    }
    const fromValue = fromData.serie[0].valor;
    const toValue = toData.serie[0].valor;
    const conversionRate = fromValue / toValue;
    const convertedAmount = amount * conversionRate;
    resultEl.textContent = `${amount} ${fromCurrency.toUpperCase()} = ${convertedAmount.toFixed(2)} ${toCurrency.toUpperCase()}`;
    await fetchHistoricalData(toCurrency);
  } catch (error) {
    alert('Error al obtener los datos de la API.');
  }
}
async function fetchHistoricalData(currency) {
  try {
    const response = await fetch(`${apiUrl}${currency}`);
    const data = await response.json();


    const historicalRates = data.serie.slice(0, 10).reverse();

    const dates = historicalRates.map(entry => entry.fecha.split('T')[0]);
    const values = historicalRates.map(entry => entry.valor);

    updateHistoryChart(dates, values, currency.toUpperCase());
  } catch (error) {
    alert('Error al obtener los datos históricos');
  }
}
function updateHistoryChart(dates, values, currency) {
  if (historyChartInstance) {
    historyChartInstance.destroy();
  }
  historyChartInstance = new Chart(historyCanvas, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: `Últimos 10 días (${currency})`,
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}
convertBtn.addEventListener('click', convertCurrency);
