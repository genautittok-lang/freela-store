declare module "jsqr" {
  export type QRCode = {
    data: string;
    location: Record<string, unknown>;
  };
  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
  ): QRCode | null;
}

declare module "mammoth" {
  const mammoth: {
    extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
    convertToHtml: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  };
  export default mammoth;
}

declare module "sql-formatter" {
  export function format(sql: string, opts?: { language?: string }): string;
}

declare module "heic2any" {
  export default function heic2any(opts: {
    blob: Blob;
    toType?: string;
    quality?: number;
  }): Promise<Blob | Blob[]>;
}
