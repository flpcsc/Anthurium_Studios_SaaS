"use client";

import { Video } from "lucide-react";
import type { ReactNode } from "react";

export default function VideosPage(): ReactNode {
  return (
    <div className="placeholder-page">
      <div className="placeholder-content">
        <Video className="placeholder-icon" />
        <h2>Geracao de Videos</h2>
        <p>
          Esta secao estara disponivel na <strong>Fase 3</strong> do plano de desenvolvimento
          (Engine de Geracao de Video / Pooling).
        </p>
      </div>
    </div>
  );
}
