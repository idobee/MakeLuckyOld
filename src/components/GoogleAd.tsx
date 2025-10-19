import React, { useEffect } from 'react';

interface GoogleAdProps {
  client: string;
  slot: string;
  style?: React.CSSProperties;
  format?: string;
}

const GoogleAd: React.FC<GoogleAdProps> = ({ 
  client, 
  slot, 
  style = { display: 'block' }, 
  format = 'auto' 
}) => {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  // client나 slot ID가 없으면 광고를 렌더링하지 않음
  if (!client || !slot) {
    return <div style={{...style, backgroundColor: '#f0f0f0', textAlign: 'center', padding: '20px'}}>광고 ID가 설정되지 않았습니다.</div>;
  }

  return (
    <ins className="adsbygoogle"
         style={style}
         data-ad-client={client}
         data-ad-slot={slot}
         data-ad-format={format}
         data-full-width-responsive="true"></ins>
  );
};

export default GoogleAd;