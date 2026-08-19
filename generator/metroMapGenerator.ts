import { RESOURCES } from "./resources";
import { MetroMapGenerator } from "./metromap";

export function generateMetroMapHtml(baseUrl: string, entrypointUri: string = "/"): string {
  const generator = new MetroMapGenerator(RESOURCES, baseUrl);
  return generator.generateHtml(entrypointUri);
}
