
import {
  AdvancedRealTimeChart,
  SymbolOverview,
  TickerTape
} from 'react-ts-tradingview-widgets';
import React, { useState, useEffect } from 'react';

const SafeTradingViewWidget = ({ widgetType, ...props }) => {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div style={{ height: props.height || '400px' }}>Carregando...</div>;
  }

  if (hasError) {
    return <div style={{ height: props.height || '400px' }}>Widget indisponível</div>;
  }

  try {
    const Widget = {
      chart: AdvancedRealTimeChart,
      overview: SymbolOverview,
      ticker: TickerTape
    }[widgetType];

    if (!Widget) {
      return <div>Tipo de widget desconhecido: {widgetType}</div>;
    }

    return (
      <div style={{ width: '100%', height: '100%', minHeight: '100px' }}>
        <Widget 
          {...props} 
          container_id={`tradingview-${widgetType}-${Math.random().toString(36).substr(2, 9)}`}
          onError={() => setHasError(true)}
        />
      </div>
    );
  } catch (error) {
    console.error('Erro no widget TradingView:', error);
    return <div style={{ height: props.height || '400px' }}>Erro no widget</div>;
  }
};

export default SafeTradingViewWidget;