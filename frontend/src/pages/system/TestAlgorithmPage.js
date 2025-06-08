import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Tab, Tabs, Table } from 'react-bootstrap';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './css/TestAlgorithmPage.css';

const TestAlgorithmPage = () => {
  const [reportData, setReportData] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const parsedData = parseReport(content);
      setReportData(parsedData);
    };
    reader.readAsText(file);
  };

  const parseReport = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Função auxiliar para extrair valores das células
    const extractValue = (label) => {
      const elements = Array.from(doc.querySelectorAll('td'));
      const element = elements.find(el => el.textContent.includes(label));
      return element ? element.nextElementSibling.textContent.trim() : null;
    };

    // Extração dos dados principais
    const settings = {
      expert: extractValue('Expert:'),
      symbol: extractValue('Symbol:'),
      period: extractValue('Period:'),
      initialDeposit: extractValue('Initial Deposit:'),
      leverage: extractValue('Leverage:'),
      inputs: Array.from(doc.querySelectorAll('tr'))
        .filter(tr => {
          const firstTd = tr.querySelector('td');
          return firstTd && firstTd.textContent.trim() === 'Inputs:';
        })
        .flatMap(tr => {
          const inputTds = Array.from(tr.querySelectorAll('td')).slice(1);
          return inputTds.map(td => td.textContent.trim());
        })
        .filter(input => input)
    };

    // Extração das negociações
    const deals = [];
    const dealsTables = Array.from(doc.querySelectorAll('table'));
    const dealsTable = dealsTables.find(table => {
      const ths = Array.from(table.querySelectorAll('th'));
      return ths.some(th => th.textContent.includes('Deals'));
    });

    if (dealsTable) {
      const dealRows = Array.from(dealsTable.querySelectorAll('tr')).slice(1);
      let localEntryPrices;
      let calculatedProfits;
      let totalBalance = parseFloat(reportData?.settings.initialDeposit?.replace(/[^\d.-]/g, '') || 10000);

      dealRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 12 && !row.querySelector('th') && cells[0].textContent.trim() !== 'Time') {
          const symbol = cells[2].textContent.trim();
          const type = cells[3].textContent.trim();
          const direction = cells[4].textContent.trim();
          const price = parseFloat(cells[6].textContent.replace(/[^\d.-]/g, '') || 0);
          const volume = parseFloat(cells[5].textContent.replace(/[^\d.-]/g, '') || 0);

          calculatedProfits = parseFloat(cells[10].textContent.replace(/[^\d.-]/g, '') || 0);

          // Se for uma entrada (in), armazena o preço
          if (direction.toLowerCase() === 'in') {
            localEntryPrices = price;
          }
          // Se for uma saída (out), calcula o lucro com base no preço de entrada
          else if (direction.toLowerCase() === 'out') {
            const entryPrice = localEntryPrices;

            if (entryPrice !== undefined) {
              if (type.toLowerCase() === 'buy') {
                calculatedProfits = (price - entryPrice) * volume;
              } else if (type.toLowerCase() === 'sell') {
                calculatedProfits = (entryPrice - price) * volume;
              }

              totalBalance += calculatedProfits;

              localEntryPrices = undefined;
            }
          }

          deals.push({
            time: cells[0].textContent.trim(),
            deal: cells[1].textContent.trim(),
            symbol: symbol,
            type: type,
            direction: direction,
            volume: cells[5].textContent.trim(),
            price: cells[6].textContent.trim(),
            order: cells[7].textContent.trim(),
            commission: cells[8].textContent.trim(),
            swap: cells[9].textContent.trim(),
            profit: calculatedProfits,
            balance: totalBalance.toFixed(2),
            comment: cells[12]?.textContent.trim() || ''
          });
        }
      });
    }

    // Extração dos resultados
    // Filtrar negociações de entrada (in) e saída (out)
    const closedDeals = deals.filter(deal => deal.direction.toLowerCase() === 'out');

    // Calcular métricas básicas
    const profitTrades = closedDeals.filter(deal => deal.profit > 0);
    const lossTrades = closedDeals.filter(deal => deal.profit <= 0);

    const grossProfit = profitTrades.reduce((sum, trade) => sum + trade.profit, 0);
    const grossLoss = Math.abs(lossTrades.reduce((sum, trade) => sum + trade.profit, 0));

    // Extrair todos os saldos para calcular drawdown
    const balances = deals.map(deal => parseFloat(deal.balance));

    // Função para calcular drawdown máximo
    function calculateMaxDrawdown(balances) {
      let peak = balances[0];
      let maxDrawdownValue = 0;
      let maxDrawdownPercent = 0;

      for (const balance of balances) {
        if (balance > peak) peak = balance;
        const drawdownValue = peak - balance;
        const drawdownPercent = (drawdownValue / peak) * 100;

        if (drawdownValue > maxDrawdownValue) maxDrawdownValue = drawdownValue;
        if (drawdownPercent > maxDrawdownPercent) maxDrawdownPercent = drawdownPercent;
      }

      return {
        value: maxDrawdownValue,
        percent: maxDrawdownPercent
      };
    }

    // Calcular Sharpe Ratio (simplificado)
    function calculateSharpeRatio(trades, riskFreeRate = 0) {
      if (trades.length === 0) return 0;

      const returns = trades.map(t => t.profit);
      const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const stdDev = Math.sqrt(
        returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length
      );

      return stdDev !== 0 ? (meanReturn - riskFreeRate) / stdDev : 0;
    }

    // Construir o objeto results
    const results = {
      totalNetProfit: grossProfit - grossLoss,
      grossProfit: grossProfit,
      grossLoss: grossLoss,
      profitFactor: grossLoss !== 0 ? grossProfit / grossLoss : 0,
      totalTrades: closedDeals.length,
      profitTrades: profitTrades.length,
      lossTrades: lossTrades.length,
      averageProfitTrade: profitTrades.length > 0 ? grossProfit / profitTrades.length : 0,
      averageLossTrade: lossTrades.length > 0 ? grossLoss / lossTrades.length : 0,
      balanceDrawdownMaximal: calculateMaxDrawdown(balances),
      sharpeRatio: calculateSharpeRatio(closedDeals)
    };

    return { settings, results, deals };
  };

  // Preparar dados para os gráficos
  const prepareChartData = () => {
    if (!reportData) return {};

    return {
      performanceData: [
        { name: 'Lucro Bruto', value: reportData.results.grossProfit },
        { name: 'Perda Bruta', value: Math.abs(reportData.results.grossLoss) },
        { name: 'Lucro Líquido', value: reportData.results.totalNetProfit }
      ],
      tradesDistribution: [
        { name: 'Negociações Lucrativas', value: reportData.results.profitTrades },
        { name: 'Negociações Perdedoras', value: reportData.results.lossTrades }
      ],
      monthlyPerformance: generateMonthlyPerformance(reportData.deals),
      riskMetrics: [
        { name: 'Drawdown Máx.', value: reportData.results.balanceDrawdownMaximal.value },
        { name: 'Fator de Lucro', value: reportData.results.profitFactor },
        { name: 'Sharpe Ratio', value: reportData.results.sharpeRatio }
      ]
    };
  };

  const generateMonthlyPerformance = (deals) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      name: month,
      profit: Math.random() * 2000 - 500 // Exemplo - substituir por cálculo real
    }));
  };

  const chartData = prepareChartData();

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="mb-3 w-100 text-center">Testar Algoritmo</Card.Header>
            <Card.Body>
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Selecione o arquivo HTML para importar:</Form.Label>
                <Form.Control type="file" accept=".html,.htm" onChange={handleFileUpload} />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {reportData && (
        <>
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header>Resumo da Estratégia</Card.Header>
                <Card.Body>
                  <Tabs defaultActiveKey="settings" id="strategy-tabs">
                    <Tab eventKey="settings" title="Configurações">
                      <div className="mt-3">
                        <p><strong>Expert:</strong> {reportData.settings.expert}</p>
                        <p><strong>Símbolo:</strong> {reportData.settings.symbol}</p>
                        <p><strong>Período:</strong> {reportData.settings.period}</p>
                        <p><strong>Depósito Inicial:</strong> {reportData.settings.initialDeposit}</p>
                        <p><strong>Alavancagem:</strong> {reportData.settings.leverage}</p>
                        <div className="mt-4">
                          <h5>Parâmetros:</h5>
                          <ul>
                            {reportData.settings.inputs.map((input, i) => (
                              <li key={i}>{input}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Tab>
                    <Tab eventKey="results" title="Resultados">
                      <div className="mt-3">
                        <Row>
                          <Col md={6}>
                            <Card className="mb-3">
                              <Card.Body>
                                <h5>Desempenho</h5>
                                <p>Lucro Líquido: $ {reportData.results.totalNetProfit.toFixed(2)}</p>
                                <p>Lucro Bruto: $ {reportData.results.grossProfit.toFixed(2)}</p>
                                <p>Perda Bruta: $ {reportData.results.grossLoss.toFixed(2)}</p>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={6}>
                            <Card className="mb-3">
                              <Card.Body>
                                <h5>Risco</h5>
                                <p>Drawdown Máximo: {reportData.results.balanceDrawdownMaximal.value} ({reportData.results.balanceDrawdownMaximal.percent}%)</p>
                                <p>Fator de Lucro: {reportData.results.profitFactor.toFixed(2)}</p>
                                <p>Índice de Sharpe: {reportData.results.sharpeRatio.toFixed(2)}</p>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    </Tab>
                    <Tab eventKey="deals" title="Negociações">
                      <div className="mt-3">
                        <Table striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Data/Hora</th>
                              <th>Negócio</th>
                              <th>Símbolo</th>
                              <th>Tipo</th>
                              <th>Direção</th>
                              <th>Volume</th>
                              <th>Preço</th>
                              <th>Lucro</th>
                              <th>Saldo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.deals.map((deal, index) => (
                              <tr key={index}>
                                <td>{deal.time}</td>
                                <td>{deal.deal}</td>
                                <td>{deal.symbol}</td>
                                <td>{deal.type}</td>
                                <td>{deal.direction}</td>
                                <td>{deal.volume}</td>
                                <td>{deal.price}</td>
                                <td className={deal.profit >= 0 ? 'text-success' : 'text-danger'}>
                                  {deal.profit.toFixed(2)}
                                </td>
                                <td>{deal.balance}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>Distribuição de Negociações</Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.tradesDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#4CAF50" />
                        <Cell fill="#F44336" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>Performance</Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <Card className="h-100">
                <Card.Header>Evolução do Saldo</Card.Header>
                <Card.Body className='p-0' style={{ minHeight: '300px' }}>
                  <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={reportData.deals.filter(deal => deal.balance)}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="time"
                          axisLine={false}
                          tick={false}
                        />
                        <YAxis
                          domain={[
                            (dataMin) => Math.max(0, Math.floor(dataMin * 0.9)),
                            () => {
                              // Calcula o valor máximo dos dados e adiciona 1000
                              const balances = reportData.deals
                                .filter(deal => deal.balance)
                                .map(deal => deal.balance);
                              const maxBalance = Math.max(...balances);
                              return maxBalance + 1000;
                            }
                          ]}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip
                          formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Saldo']}
                          labelFormatter={() => ''}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="balance"
                          stroke="#4CAF50"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          name="Saldo da Conta"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </>
      )}
    </Container>
  );
};

export default TestAlgorithmPage;