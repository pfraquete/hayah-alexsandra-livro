/**
 * Shipment Tracking Service
 * Integrates with Correios and other carriers for tracking updates
 */

export interface TrackingEvent {
  date: Date;
  location: string;
  status: string;
  description: string;
}

export interface TrackingResult {
  success: boolean;
  trackingCode: string;
  carrier: string;
  status: string;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
  error?: string;
}

// Carrier detection patterns
const CARRIER_PATTERNS: Record<string, RegExp> = {
  correios: /^[A-Z]{2}\d{9}[A-Z]{2}$/,
  jadlog: /^\d{14}$/,
  loggi: /^[A-Z0-9]{10,}$/,
};

/**
 * Detect carrier from tracking code format
 */
export function detectCarrier(trackingCode: string): string {
  for (const [carrier, pattern] of Object.entries(CARRIER_PATTERNS)) {
    if (pattern.test(trackingCode.toUpperCase())) {
      return carrier;
    }
  }
  return "unknown";
}

/**
 * Get tracking URL for a carrier
 */
export function getTrackingUrl(trackingCode: string, carrier?: string): string {
  const detectedCarrier = carrier || detectCarrier(trackingCode);

  const urls: Record<string, string> = {
    correios: `https://www.linkcorreios.com.br/?id=${trackingCode}`,
    jadlog: `https://www.jadlog.com.br/jadlog/tracking?cte=${trackingCode}`,
    loggi: `https://www.loggi.com/rastreio/${trackingCode}`,
    unknown: `https://www.google.com/search?q=rastrear+${trackingCode}`,
  };

  return urls[detectedCarrier] || urls.unknown;
}

/**
 * Fetch tracking information from Correios
 * Note: In production, use the official Correios API or a service like Melhor Envio
 */
export async function trackCorreios(trackingCode: string): Promise<TrackingResult> {
  // Simulated tracking for development
  // In production, integrate with Correios API or Melhor Envio
  console.log(`[Tracking] Fetching Correios tracking for: ${trackingCode}`);

  // Simulated response
  const simulatedEvents: TrackingEvent[] = [
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      location: "São Paulo - SP",
      status: "posted",
      description: "Objeto postado",
    },
    {
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      location: "São Paulo - SP",
      status: "in_transit",
      description: "Objeto em trânsito - por favor aguarde",
    },
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      location: "Centro de Distribuição - Destino",
      status: "in_transit",
      description: "Objeto em trânsito - por favor aguarde",
    },
  ];

  return {
    success: true,
    trackingCode,
    carrier: "correios",
    status: "in_transit",
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    events: simulatedEvents,
  };
}

/**
 * Main tracking function - routes to appropriate carrier
 */
export async function trackShipment(trackingCode: string): Promise<TrackingResult> {
  const carrier = detectCarrier(trackingCode);

  try {
    switch (carrier) {
      case "correios":
        return await trackCorreios(trackingCode);

      case "jadlog":
      case "loggi":
        // Simulated for other carriers
        return {
          success: true,
          trackingCode,
          carrier,
          status: "in_transit",
          events: [
            {
              date: new Date(),
              location: "Em trânsito",
              status: "in_transit",
              description: "Pacote em trânsito para o destino",
            },
          ],
        };

      default:
        return {
          success: false,
          trackingCode,
          carrier: "unknown",
          status: "unknown",
          events: [],
          error: "Transportadora não identificada",
        };
    }
  } catch (error) {
    console.error("[Tracking] Error:", error);
    return {
      success: false,
      trackingCode,
      carrier,
      status: "error",
      events: [],
      error: error instanceof Error ? error.message : "Erro ao rastrear",
    };
  }
}

/**
 * Map internal status to display status
 */
export function getStatusLabel(status: string): { label: string; color: string } {
  const statusMap: Record<string, { label: string; color: string }> = {
    posted: { label: "Postado", color: "#3b82f6" },
    in_transit: { label: "Em Trânsito", color: "#f59e0b" },
    out_for_delivery: { label: "Saiu para Entrega", color: "#8b5cf6" },
    delivered: { label: "Entregue", color: "#22c55e" },
    returned: { label: "Devolvido", color: "#ef4444" },
    error: { label: "Erro", color: "#ef4444" },
    unknown: { label: "Desconhecido", color: "#6b7280" },
  };

  return statusMap[status] || statusMap.unknown;
}
