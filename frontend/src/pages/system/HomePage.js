import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Tabs, Tab, ListGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/HomePage.css';
import api from "../../hooks/api.js";
import SafeTradingViewWidget from './components/SafeTradingViewWidget.js';
import LoadingSpinner from './components/LoadingSpinner.js';

function Home() {
  const [symbol, setSymbol] = useState('AAPL');
  const [exchange, setExchange] = useState('NASDAQ');
  const [activeTab, setActiveTab] = useState('chart');
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('stocks');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem('userID');
  const theme = 'light';

  // Categorias de ativos
  const assetCategories = {
    stocks: ['NASDAQ', 'NYSE', 'B3', 'TSE', 'LSE', 'FRA', 'SIX', 'ASX', 'NSE', 'HKEX'],
    forex: ['FX'],
    crypto: ['CRYPTO'],
    indices: ['INDICES'],
    etfs: ['ETF']
  };

  // Lista completa de ativos
  const allAssets = [
    // Ações
    { symbol: 'AAPL', exchange: 'NASDAQ', name: 'Apple Inc.', category: 'stocks' },
    { symbol: 'MSFT', exchange: 'NASDAQ', name: 'Microsoft Corporation', category: 'stocks' },
    { symbol: 'AMZN', exchange: 'NASDAQ', name: 'Amazon.com Inc.', category: 'stocks' },
    { symbol: 'GOOGL', exchange: 'NASDAQ', name: 'Alphabet Inc.', category: 'stocks' },
    { symbol: 'TSLA', exchange: 'NASDAQ', name: 'Tesla Inc.', category: 'stocks' },
    { symbol: 'PETR4', exchange: 'BMFBOVESPA', name: 'Petrobras', category: 'stocks' },
    { symbol: 'VALE3', exchange: 'BMFBOVESPA', name: 'Vale S.A.', category: 'stocks' },
    { symbol: 'ITUB4', exchange: 'BMFBOVESPA', name: 'Itaú Unibanco', category: 'stocks' },
    { symbol: 'BBDC4', exchange: 'BMFBOVESPA', name: 'Bradesco', category: 'stocks' },

    // Criptomoedas
    { symbol: 'BTCUSD', exchange: 'CRYPTO', name: 'Bitcoin', category: 'crypto' },
    { symbol: 'ETHUSD', exchange: 'CRYPTO', name: 'Ethereum', category: 'crypto' },
    { symbol: 'BNBUSD', exchange: 'CRYPTO', name: 'Binance Coin', category: 'crypto' },
    { symbol: 'SOLUSD', exchange: 'CRYPTO', name: 'Solana', category: 'crypto' },
    { symbol: 'XRPUSD', exchange: 'CRYPTO', name: 'Ripple', category: 'crypto' },

    // Forex
    { symbol: 'EURUSD', exchange: 'FX', name: 'Euro/Dollar', category: 'forex' },
    { symbol: 'GBPUSD', exchange: 'FX', name: 'Pound/Dollar', category: 'forex' },
    { symbol: 'USDJPY', exchange: 'FX', name: 'Dollar/Yen', category: 'forex' },

    // Índices
    { symbol: 'SPX', exchange: 'INDICES', name: 'S&P 500', category: 'indices' },
    { symbol: 'DJI', exchange: 'INDICES', name: 'Dow Jones', category: 'indices' },
    { symbol: 'IXIC', exchange: 'INDICES', name: 'NASDAQ Composite', category: 'indices' },
    { symbol: 'IBOV', exchange: 'INDICES', name: 'Ibovespa', category: 'indices' },

    // ETFs
    { symbol: 'SPY', exchange: 'ETF', name: 'SPDR S&P 500 ETF', category: 'etfs' },
    { symbol: 'IVVB', exchange: 'ETF', name: 'iShares S&P 500 ETF', category: 'etfs' },
    { symbol: 'BOVA', exchange: 'ETF', name: 'iShares Ibovespa ETF', category: 'etfs' }
  ];

  useEffect(() => {
    const handleFavoriteGet = async () => {
      try {
        const response = await api.get(`/get-symbols/${userId}`);
        return Array.isArray(response.data) ? response.data : [response.data] || [];
      } catch (error) {
        console.error(error);
        return [];
      }
    };

    const loadData = async () => {
      try {
        setIsLoading(true);
        const savedFavorites = await handleFavoriteGet();
        setFavorites(savedFavorites || []);
        setIsMounted(true);
      } catch (error) {
        setFavorites([]);
        setIsMounted(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

  class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error, info) {
      console.log('Erro capturado:', error, info);
    }

    render() {
      if (this.state.hasError) {
        return this.props.fallback || null;
      }
      return this.props.children;
    }
  }

  const getFullSymbol = () => {
    if (exchange === 'BMFBOVESPA') return `${exchange}:${symbol}`;
    if (exchange === 'CRYPTO') return `BINANCE:${symbol}`;
    if (exchange === 'FX') return `FX:${symbol}`;
    if (exchange === 'INDICES') {
      if (symbol === 'IBOV') return 'BMFBOVESPA:IBOV';
      return `${symbol}`;
    }
    if (exchange === 'ETF') {
      if (symbol === 'IVVB') return 'CBOE:IVVB';
      if (symbol === 'BOVA') return 'BMFBOVESPA:BOVA';
      if (symbol === 'SPY') return 'AMEX:SPY';
      return `${symbol}`;
    }
    return `${exchange}:${symbol}`;
  };

  const toggleFavorite = (asset) => {
    const isFavorite = favorites.some(fav => fav.symbol === asset.symbol && fav.exchange === asset.exchange);

    if (isFavorite) {
      // Remover favorito
      handleFavoriteDelete(asset);
      setFavorites(favorites.filter(fav => !(fav.symbol === asset.symbol && fav.exchange === asset.exchange)));
    } else {
      // Adicionar favorito
      handleFavoriteInsert(asset);
      setFavorites([...favorites, asset]);
    }
  };

  const isFavorite = (asset) => {
    return favorites.some(fav => fav.symbol === asset.symbol && fav.exchange === asset.exchange);
  };

  const selectAsset = (asset) => {
    setSymbol(asset.symbol);
    setExchange(asset.exchange);
    setSelectedCategory(asset.category);
  };

  // Filtra os ativos com base na pesquisa e categoria
  const filteredAssets = allAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = asset.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Cria símbolos para o TickerTape baseado nos favoritos
  const getFavoriteSymbolsForTicker = () => {
    if (!favorites || !Array.isArray(favorites)) return [];

    return favorites.map(fav => {
      if (!fav || !fav.symbol || !fav.exchange) return null;

      if (fav.exchange === 'B3') return { proName: `${fav.exchange}:${fav.symbol}.SA`, title: fav.name };
      if (fav.exchange === 'CRYPTO') return { proName: `BINANCE:${fav.symbol}`, title: fav.name };
      if (fav.exchange === 'FX') return { proName: `FX:${fav.symbol}`, title: fav.name };
      if (fav.exchange === 'INDICES') {
        if (fav.symbol === 'IBOV') return { proName: 'BMFBOVESPA:IBOV', title: fav.name };
        return { proName: fav.symbol, title: fav.name };
      }
      if (fav.exchange === 'ETF') {
        if (fav.symbol === 'IVVB11') return { proName: 'B3:IVVB11', title: fav.name };
        if (fav.symbol === 'BOVA11') return { proName: 'B3:BOVA11', title: fav.name };
        return { proName: `${fav.exchange}:${fav.symbol}`, title: fav.name };
      }
      return { proName: `${fav.exchange}:${fav.symbol}`, title: fav.name };
    });
  };

  const handleFavoriteInsert = async (asset) => {
    const { symbol, exchange, name, category } = asset;

    try {
      const response = await api.post('/insert-symbol', {
        userId, symbol, exchange, name, category
      });
      if (response.status === 200) {
        console.log('Símbolo salco em favoritos com sucesso');
      } else {
        console.error('Erro ao salvar o símbolo');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleFavoriteDelete = async (asset) => {
    const { symbol } = asset;

    try {
      const response = await api.delete('/delete-symbol', {
        data: { userId, symbol }
      });
      if (response.status === 200) {
        console.log('Símbolo removido dos favoritos com sucesso');
      } else {
        console.error('Erro ao remover o símbolo dos favoritos');
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={`app-container ${theme}`}>

      <Container fluid className="mt-3">
        {/* Ticker Tape com favoritos */}
        <Row>
          <Col>
            <div className="custom-ticker-tape">
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                isMounted && (
                  <SafeTradingViewWidget
                    widgetType="ticker"
                    colorTheme={theme}
                    symbols={getFavoriteSymbolsForTicker()}
                    showSymbolLogo={true}
                    locale="br"
                  />
                )
              )}
            </div>
          </Col>
        </Row>

        {/* Layout de 3 colunas */}
        <div className="three-column-layout">
          {/* Coluna 1: Categorias */}
          <div className="column">
            <h4>Categorias</h4>
            <ListGroup>
              {Object.keys(assetCategories).map(category => (
                <ListGroup.Item
                  key={category}
                  action
                  active={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className="asset-item"
                >
                  {category === 'stocks' && 'Ações'}
                  {category === 'forex' && 'Forex'}
                  {category === 'crypto' && 'Criptomoedas'}
                  {category === 'indices' && 'Índices'}
                  {category === 'etfs' && 'ETFs'}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>

          {/* Coluna 2: Lista de ativos */}
          <div className="column">
            <h4>Ativos</h4>
            <Form.Group controlId="formSearch" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Buscar ativos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>

            <div className="asset-list">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <div
                    key={`${asset.exchange}-${asset.symbol}`}
                    className={`asset-item ${symbol === asset.symbol && exchange === asset.exchange ? 'active' : ''}`}
                    onClick={() => selectAsset(asset)}
                  >
                    <div>
                      <strong>{asset.symbol}</strong> - {asset.name}
                    </div>
                    <button
                      className="star-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(asset);
                      }}
                    >
                      {isFavorite(asset) ? '★' : '☆'}
                    </button>
                  </div>
                ))
              ) : (
                <div>Nenhum ativo encontrado</div>
              )}
            </div>
          </div>

          {/* Coluna 3: Favoritos */}
          <div className="column">
            <h4>Favoritos</h4>
            <div className="favorites-list">
              {favorites.length > 0 ? (
                favorites.map((fav) => (
                  <div
                    key={`${fav.exchange}-${fav.symbol}`}
                    className={`favorite-item ${symbol === fav.symbol && exchange === fav.exchange ? 'active' : ''}`}
                    onClick={() => selectAsset(fav)}
                  >
                    <div>
                      <strong>{fav.symbol}</strong> - {fav.name}
                    </div>
                    <button
                      className="star-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(fav);
                      }}
                    >
                      ★
                    </button>
                  </div>
                ))
              ) : (
                <div>Nenhum favorito adicionado</div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="chart-container mt-4">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="chart" title="Gráfico Avançado" className="h-100 w-100">
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <ErrorBoundary fallback={<div>Widget temporariamente indisponível</div>}>
                  <SafeTradingViewWidget
                    widgetType="chart"
                    theme={theme}
                    symbol={getFullSymbol()}
                    interval={'1D'}
                    timezone="America/Sao_Paulo"
                    locale="br"
                    toolbar_bg="#f1f3f6"
                    enable_publishing={false}
                    hide_top_toolbar={false}
                    hide_side_toolbar={false}
                    allow_symbol_change={false}
                    details={true}
                    hotlist={true}
                    calendar={true}
                    width="100%"
                  />
                </ErrorBoundary>
              )}
            </Tab>
            <Tab eventKey="overview" title="Visão Geral">
              <div style={{ height: '600px' }}>
                <ErrorBoundary fallback={<div>Widget temporariamente indisponível</div>}>
                  <SafeTradingViewWidget
                    widgetType="overview"
                    theme={theme}
                    symbols={[[getFullSymbol()]]}
                    chartOnly={false}
                    width="100%"
                    height="100%"
                    locale="br"
                    colorTheme={theme}
                    gridLineColor="rgba(240, 243, 250, 0)"
                  />
                </ErrorBoundary>
              </div>

            </Tab>
          </Tabs>
        </div>
      </Container>
    </div>
  );
}

export default Home;