"use client";

import { Key } from "lucide-react";
import type { ReactNode } from "react";

export default function ApiKeysPage(): ReactNode {
  return (
    <div className="placeholder-page">
      <div className="placeholder-content">
        <Key className="placeholder-icon" />
        <h2>Chaves de API</h2>
        <p>
          Esta secao estara disponivel na <strong>Fase 2</strong> do plano de desenvolvimento
          (Gerenciamento de Chaves de API).
        </p>
      </div>
    </div>
  );
}
