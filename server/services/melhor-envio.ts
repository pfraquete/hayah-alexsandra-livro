import { z } from "zod";

const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const MELHOR_ENVIO_URL = process.env.MELHOR_ENVIO_URL || "https://sandbox.melhorenvio.com.br"; // Default to sandbox
const MELHOR_ENVIO_FROM_CEP = process.env.MELHOR_ENVIO_FROM_CEP;
const MELHOR_ENVIO_EMAIL = process.env.MELHOR_ENVIO_EMAIL; // Required for User-Agent

export interface ShippingItem {
    id: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    insurance_value: number;
    quantity: number;
}

export interface CalculateShippingParams {
    to_postal_code: string;
    items: ShippingItem[];
}

export interface ShippingOption {
    id: number;
    name: string;
    price: string;
    custom_price: string;
    discount: string;
    currency: string;
    delivery_time: number;
    delivery_range: {
        min: number;
        max: number;
    };
    custom_delivery_time: number;
    custom_delivery_range: {
        min: number;
        max: number;
    };
    packages: Array<{
        price: string;
        discount: string;
        format: string;
        dimensions: {
            height: number;
            width: number;
            length: number;
        };
        weight: string;
        insurance_value: string;
    }>;
    company: {
        id: number;
        name: string;
        picture: string;
    };
}

export async function calculateShipping(params: CalculateShippingParams): Promise<ShippingOption[]> {
    if (!MELHOR_ENVIO_TOKEN || !MELHOR_ENVIO_FROM_CEP) {
        console.warn("[Melhor Envio] Credentials not configured. Returning empty options.");
        return [];
    }

    try {
        const response = await fetch(`${MELHOR_ENVIO_URL}/api/v2/me/shipment/calculate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${MELHOR_ENVIO_TOKEN}`,
                "User-Agent": MELHOR_ENVIO_EMAIL || "contact@hayahlivros.com.br",
            },
            body: JSON.stringify({
                from: {
                    postal_code: MELHOR_ENVIO_FROM_CEP,
                },
                to: {
                    postal_code: params.to_postal_code,
                },
                products: params.items.map(item => ({
                    id: item.id,
                    width: item.width,
                    height: item.height,
                    length: item.length,
                    weight: item.weight,
                    insurance_value: item.insurance_value,
                    quantity: item.quantity,
                })),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("[Melhor Envio] API Error:", JSON.stringify(errorData, null, 2));
            throw new Error(`Melhor Envio API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Filter out options with error field if any (Melhor Envio sometimes returns errors inside the array)
        const validOptions = (Array.isArray(data) ? data : []).filter((opt: any) => !opt.error);

        return validOptions as ShippingOption[];
    } catch (error) {
        console.error("[Melhor Envio] Calculation error:", error);
        throw error;
    }
}
