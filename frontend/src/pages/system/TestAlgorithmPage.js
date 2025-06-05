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

    // Extração dos resultados
    const results = {
      totalNetProfit: parseFloat(extractValue('Total Net Profit:')?.replace(/[^\d.-]/g, '') || 0),
      grossProfit: parseFloat(extractValue('Gross Profit:')?.replace(/[^\d.-]/g, '') || 0),
      grossLoss: parseFloat(extractValue('Gross Loss:')?.replace(/[^\d.-]/g, '') || 0),
      profitFactor: parseFloat(extractValue('Profit Factor:') || 0),
      totalTrades: parseInt(extractValue('Total Trades:') || 0),
      profitTrades: parseInt(extractValue('Profit Trades (% of total):')?.match(/\d+/)?.[0] || 0),
      lossTrades: parseInt(extractValue('Loss Trades (% of total):')?.match(/\d+/)?.[0] || 0),
      averageProfitTrade: parseFloat(extractValue('Average profit trade:')?.replace(/[^\d.-]/g, '') || 0),
      averageLossTrade: parseFloat(extractValue('Average loss trade:')?.replace(/[^\d.-]/g, '') || 0),
      balanceDrawdownMaximal: {
        value: parseFloat(extractValue('Balance Drawdown Maximal:')?.match(/[\d.]+/)?.[0] || 0),
        percent: parseFloat(extractValue('Balance Drawdown Maximal:')?.match(/\(([\d.]+)%\)/)?.[1] || 0)
      },
      sharpeRatio: parseFloat(extractValue('Sharpe Ratio:') || 0)
    };

    // Extração das negociações
    const deals = [];
    const dealsTables = Array.from(doc.querySelectorAll('table'));
    const dealsTable = dealsTables.find(table => {
      const ths = Array.from(table.querySelectorAll('th'));
      return ths.some(th => th.textContent.includes('Deals'));
    });

    if (dealsTable) {
      // Pega todas as linhas exceto a primeira (cabeçalho)
      const dealRows = Array.from(dealsTable.querySelectorAll('tr')).slice(1);

      dealRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        // Verifica se é uma linha de dados (não é cabeçalho e tem conteúdo)
        if (cells.length >= 12 && !row.querySelector('th') && cells[0].textContent.trim() !== 'Time') {
          deals.push({
            time: cells[0].textContent.trim(),
            deal: cells[1].textContent.trim(),
            symbol: cells[2].textContent.trim(),
            type: cells[3].textContent.trim(),
            direction: cells[4].textContent.trim(),
            volume: cells[5].textContent.trim(),
            price: cells[6].textContent.trim(),
            order: cells[7].textContent.trim(),
            commission: cells[8].textContent.trim(),
            swap: cells[9].textContent.trim(),
            profit: parseFloat(cells[10].textContent.replace(/[^\d.-]/g, '') || 0),
            balance: cells[11].textContent.trim(),
            comment: cells[12]?.textContent.trim() || ''
          });
        }
      });
    }

    // Extração de imagens
    const images = Array.from(doc.querySelectorAll('img'))
    .filter(img => {
      const src = img.getAttribute('src') || '';
      return src.endsWith('.png'); // Filtra apenas imagens PNG (pode ajustar conforme necessário)
    })
    .map(img => ({
      src: img.getAttribute('src'),
      title: img.getAttribute('title') || img.getAttribute('alt') || '',
      alt: img.getAttribute('alt') || img.getAttribute('title') || ''
    }));

    return { settings, results, deals, images };
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
        { name: 'Negócios Lucrativos', value: reportData.results.profitTrades },
        { name: 'Negócios Perdedores', value: reportData.results.lossTrades }
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
                                <p>Lucro Líquido: ${reportData.results.totalNetProfit.toFixed(2)}</p>
                                <p>Lucro Bruto: ${reportData.results.grossProfit.toFixed(2)}</p>
                                <p>Perda Bruta: ${reportData.results.grossLoss.toFixed(2)}</p>
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
                <Card.Header>Distribuição de Negócios</Card.Header>
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
              <Card>
                <Card.Header>Métricas de Risco</Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.riskMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
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