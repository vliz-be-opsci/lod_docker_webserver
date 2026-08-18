import fs from "fs";
import path from "path";
import { generateOpenApiSpec, generateApiDocsHtml, generateApiSampleResponses } from "../generator/openApiGenerator";

const testDir = path.resolve(process.cwd(), "scratch", "test-dist");
const baseUrl = "http://localhost:8080";

async function runTest() {
  const spec = generateOpenApiSpec(baseUrl);
  if (!spec.openapi || !spec.openapi.startsWith("3.") || !spec.paths["/api/v1/observations"]) {
    throw new Error("Invalid OpenAPI specification");
  }
  console.log("✓ Valid OpenAPI 3.0 specification generated");

  const html = generateApiDocsHtml(baseUrl);
  if (!html.includes("SwaggerUIBundle") && !html.includes("swagger-ui")) {
    throw new Error("Invalid API documentation HTML");
  }
  console.log("✓ Interactive Swagger documentation HTML generated");

  generateApiSampleResponses(testDir);
  const obsFile = path.join(testDir, "api", "v1", "observations");
  if (!fs.existsSync(obsFile)) {
    throw new Error(`API sample response not created at ${obsFile}`);
  }
  const content = JSON.parse(fs.readFileSync(obsFile, "utf-8"));
  if (!Array.isArray(content.data) || content.total === 0) {
    throw new Error("Invalid API response format");
  }
  console.log("✓ Sample API responses generated successfully");

  console.log("All OpenAPI tests passed!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
